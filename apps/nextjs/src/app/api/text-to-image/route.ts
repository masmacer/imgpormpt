import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { CreditsService } from '~/lib/credits-service';
import { db } from '@saasfly/db';

// KIE AI API调用 - 创建生成任务（使用 Webhook）
async function createImageGenerationTask(params: {
  prompt: string;
  size: string;
  callBackUrl: string;
}): Promise<string> {
  const apiToken = process.env.KIE_API_TOKEN;
  const apiUrl = process.env.KIE_API_URL || 'https://api.kie.ai/api/v1/gpt4o-image/generate';
  
  if (!apiToken) {
    throw new Error('KIE_API_TOKEN is not configured');
  }

  const requestBody = {
    prompt: params.prompt,
    size: params.size,
    isEnhance: false,
    filesUrl: [],
    callBackUrl: params.callBackUrl, // Webhook 回调地址
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
  
  // KIE AI 返回格式: { code: 200, msg: "success", data: { taskId: "xxx" } }
  if (result.code !== 200 || !result.data?.taskId) {
    throw new Error(`Invalid response format: ${responseText}`);
  }

  console.log('=== 任务创建成功 ===');
  console.log('Task ID:', result.data.taskId);
  
  return result.data.taskId;
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
      size = '1:1'
    } = body;

    console.log('Request params:', {
      prompt,
      size
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

    // 步骤1: 调用 KIE AI API 创建生成任务（使用 Webhook）
    const callBackUrl = 'https://imagepromptgenerator.org/api/kie-webhook';
    const taskId = await createImageGenerationTask({
      prompt: prompt.trim(),
      size: size,
      callBackUrl: callBackUrl
    });

    console.log('=== 步骤1完成: 任务已创建 ===');
    console.log('Task ID:', taskId);
    console.log('Callback URL:', callBackUrl);

    // 步骤2: 保存任务到数据库
    await db
      .insertInto('ImageGenerationTask')
      .values({
        userId: user.id,
        taskId: taskId,
        prompt: prompt.trim(),
        size: size,
        status: 'PENDING',
      })
      .execute();

    console.log('=== 步骤2完成: 任务已保存到数据库 ===');

    // 步骤3: 消费积分
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

    console.log('=== 任务提交成功，等待 Webhook 回调 ===');

    // 立即返回 taskId，前端轮询状态
    return NextResponse.json({
      success: true,
      data: {
        taskId: taskId,
        status: 'PENDING',
        prompt: prompt,
        size: size,
        message: 'Image generation started, please wait...'
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
