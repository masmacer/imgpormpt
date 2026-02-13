import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { CreditsService } from '~/lib/credits-service';

// KIE AI API调用
async function generateImageWithKIE(params: {
  prompt: string;
  size: string;
  isEnhance: boolean;
  filesUrl?: string[];
}): Promise<any> {
  const apiToken = process.env.KIE_API_TOKEN;
  const apiUrl = process.env.KIE_API_URL || 'https://api.kie.ai/api/v1/gpt4o-image/generate';
  
  if (!apiToken) {
    throw new Error('KIE_API_TOKEN is not configured');
  }

  const requestBody = {
    prompt: params.prompt,
    size: params.size,
    isEnhance: params.isEnhance,
    filesUrl: params.filesUrl || [],
    // callBackUrl: 可选，如果需要回调
    uploadCn: false,
    enableFallback: true,
    fallbackModel: "FLUX_MAX"
  };

  console.log('=== 发送到 KIE AI 的请求 ===');
  console.log('Request URL:', apiUrl);
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('=== 收到 KIE AI 的响应 ===');
  console.log('Response status:', response.status);
  console.log('Response text:', responseText);

  if (!response.ok) {
    console.log('=== 请求失败 ===');
    console.log('Status:', response.status, response.statusText);
    throw new Error(`KIE AI API failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
  }

  const result = JSON.parse(responseText);
  return result;
}

function extractImageFromResult(result: any): { imageUrl: string; taskId: string; status: string } {
  console.log('Extracting image from result:', result);

  // KIE API 响应格式可能需要根据实际情况调整
  if (result.data) {
    return {
      imageUrl: result.data.imageUrl || result.data.url || '',
      taskId: result.data.taskId || result.data.id || '',
      status: result.data.status || 'completed'
    };
  }

  if (result.imageUrl) {
    return {
      imageUrl: result.imageUrl,
      taskId: result.taskId || '',
      status: result.status || 'completed'
    };
  }

  throw new Error('无法从API结果中提取图片信息');
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Text to Image API Started ===');
    
    // 检查用户认证
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 检查积分是否足够 (图片生成消耗更多积分)
    const creditCost = 5; // 图片生成消耗5个积分
    const hasCredits = await CreditsService.hasEnoughCredits(user.id, creditCost);
    if (!hasCredits) {
      const credits = await CreditsService.getUserCredits(user.id);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient credits',
          message: credits?.dailyLimit && credits.dailyLimit > 0
            ? `You have reached your daily limit. Image generation costs ${creditCost} credits. Upgrade to Pro for unlimited generations!`
            : `You need ${creditCost} credits to generate an image. Please upgrade your plan.`,
          credits: credits,
          requiredCredits: creditCost
        },
        { status: 402 }
      );
    }
    
    // 解析请求体
    const body = await request.json();
    const { 
      prompt, 
      size = '1:1', 
      isEnhance = false,
      referenceImageUrl = null
    } = body;

    console.log('Request params:', {
      prompt,
      size,
      isEnhance,
      referenceImageUrl
    });

    // 验证必填参数
    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Text prompt is required', success: false },
        { status: 400 }
      );
    }

    // 验证 prompt 长度
    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt is too long (max 2000 characters)', success: false },
        { status: 400 }
      );
    }

    console.log('=== Starting KIE AI API Call ===');
    console.log('=== 环境变量检查 ===');
    console.log('KIE_API_URL:', process.env.KIE_API_URL);
    console.log('KIE_API_TOKEN present:', !!process.env.KIE_API_TOKEN);
    console.log('KIE_API_TOKEN length:', process.env.KIE_API_TOKEN?.length);
    console.log('========================');

    // 准备 filesUrl 参数
    const filesUrl = referenceImageUrl ? [referenceImageUrl] : undefined;

    // 调用 KIE AI API 生成图片
    const apiResult = await generateImageWithKIE({
      prompt: prompt.trim(),
      size: size,
      isEnhance: isEnhance,
      filesUrl: filesUrl
    });

    const imageData = extractImageFromResult(apiResult);

    console.log('=== API Call Completed Successfully ===');
    console.log('Image URL:', imageData.imageUrl);
    console.log('Task ID:', imageData.taskId);

    // 消费积分
    const creditConsumed = await CreditsService.consumeCredits(
      user.id,
      'generate_image',
      creditCost,
      `Generated image: ${prompt.substring(0, 50)}...`
    );

    if (!creditConsumed) {
      console.warn('Failed to consume credits, but continuing with response');
    }

    // 获取更新后的积分信息
    const updatedCredits = await CreditsService.getUserCredits(user.id);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: imageData.imageUrl,
        taskId: imageData.taskId,
        status: imageData.status,
        prompt: prompt,
        size: size,
        isEnhance: isEnhance
      },
      credits: updatedCredits,
      creditsConsumed: creditCost
    });

  } catch (error) {
    console.error("=== Text to Image API error ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Full error object:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate image",
        success: false,
        debug: {
          errorType: typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Text to Image API is running',
    timestamp: new Date().toISOString()
  });
}
