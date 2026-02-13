import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { CreditsService } from '~/lib/credits-service';

// 上传文件到扣子
async function uploadFileToCoze(file: File): Promise<string> {
  const accessToken = process.env.COZE_ACCESS_TOKEN;
  const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
  
  if (!accessToken) {
    throw new Error('COZE_ACCESS_TOKEN is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  console.log('Uploading file to Coze:', file.name, file.size, file.type);

  const response = await fetch(`${baseUrl}/v1/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const responseText = await response.text();
  console.log('Upload response status:', response.status);
  console.log('Upload response text:', responseText);

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
  }

  const result = JSON.parse(responseText);
  
  if (result.code !== 0) {
    throw new Error(`File upload failed: ${result.msg}`);
  }

  return result.data.id;
}

// 调用扣子工作流
async function runCozeWorkflow(parameters: Record<string, any>): Promise<any> {
  const accessToken = process.env.COZE_ACCESS_TOKEN;
  const caricatureWorkflowId = process.env.COZE_CARICATURE_WORKFLOW_ID; // 新的工作流ID
  const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
  
  if (!accessToken) {
    throw new Error('COZE_ACCESS_TOKEN is not configured');
  }
  
  if (!caricatureWorkflowId) {
    throw new Error('COZE_CARICATURE_WORKFLOW_ID is not configured');
  }

  const requestBody = {
    workflow_id: caricatureWorkflowId,
    parameters: parameters
  };

  console.log('=== 发送到 Coze 的漫画提示词生成请求 ===');
  console.log('Request URL:', `${baseUrl}/v1/workflow/run`);
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${baseUrl}/v1/workflow/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log('=== 收到 Coze 的响应 ===');
  console.log('Response status:', response.status);
  console.log('Response text:', responseText);

  if (!response.ok) {
    console.log('=== 请求失败 ===');
    console.log('Status:', response.status, response.statusText);
    throw new Error(`Workflow run failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
  }

  const result = JSON.parse(responseText);
  
  if (result.code !== 0 && result.code !== undefined) {
    throw new Error(`Workflow execution failed: ${result.msg}`);
  }

  return result;
}

function extractPromptFromResult(result: any): string {
  console.log('Extracting prompt from result:', result);

  // 检查各种可能的结果格式
  if (result.data) {
    // 检查是否有status和result字段
    if (result.data.status === 'Success' && result.data.result) {
      if (typeof result.data.result === 'string') {
        return result.data.result;
      }
      if (result.data.result.output) {
        return result.data.result.output;
      }
    }

    // 检查是否直接是字符串
    if (typeof result.data === 'string') {
      return result.data;
    }

    // 检查是否有output字段
    if (result.data.output) {
      return result.data.output;
    }

    // 如果都没有，返回JSON字符串用于调试
    return `工作流执行成功，结果: ${JSON.stringify(result.data, null, 2)}`;
  }

  throw new Error('无法从工作流结果中提取提示词');
}

// 风格映射
function mapStyleToPromptType(style: string): string {
  const styleMap: Record<string, string> = {
    "Traditional Sketch": "sketch",
    "3D Cartoon": "3d_cartoon",
    "Pixar-style": "pixar"
  };
  
  return styleMap[style] || "sketch";
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Caricature Prompt API Started ===');
    
    // 检查用户认证
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 检查积分是否足够
    const hasCredits = await CreditsService.hasEnoughCredits(user.id, 1);
    if (!hasCredits) {
      const credits = await CreditsService.getUserCredits(user.id);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient credits',
          message: credits?.dailyLimit && credits.dailyLimit > 0
            ? `You have reached your daily limit of ${credits.dailyLimit} prompts. Upgrade to Pro for unlimited prompts!`
            : 'You have no credits remaining. Please upgrade your plan or wait for the next reset.',
          credits: credits
        },
        { status: 402 }
      );
    }
    
    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;
    let description: string = '';
    let style: string = 'Traditional Sketch';

    if (contentType.includes('application/json')) {
      // 处理 JSON 请求（纯文字描述）
      const body = await request.json();
      description = body.description || '';
      style = body.style || 'Traditional Sketch';

      console.log('Request params (JSON):', {
        description,
        style
      });

      if (!description.trim()) {
        return NextResponse.json(
          { error: 'Character description is required', success: false },
          { status: 400 }
        );
      }
    } else {
      // 处理表单数据（文件上传）
      const formData = await request.formData();
      file = formData.get('file') as File;
      style = formData.get('style') as string || 'Traditional Sketch';
      description = formData.get('description') as string || '';

      console.log('Request params (File):', {
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        style,
        description
      });

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided', success: false },
          { status: 400 }
        );
      }

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File must be an image', success: false },
          { status: 400 }
        );
      }

      // 验证文件大小 (限制为10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB', success: false },
          { status: 400 }
        );
      }
    }

    console.log('=== Starting Coze API Call ===');
    console.log('=== 环境变量检查 ===');
    console.log('COZE_API_BASE_URL:', process.env.COZE_API_BASE_URL);
    console.log('COZE_CARICATURE_WORKFLOW_ID:', process.env.COZE_CARICATURE_WORKFLOW_ID);
    console.log('COZE_ACCESS_TOKEN present:', !!process.env.COZE_ACCESS_TOKEN);
    console.log('========================');

    // 调用扣子API生成漫画提示词
    let workflowResult;
    
    if (file) {
      // 文件处理逻辑
      console.log('Processing image file:', file.name);
      const fileId = await uploadFileToCoze(file);
      console.log('File uploaded successfully, ID:', fileId);
      
      workflowResult = await runCozeWorkflow({
        image: `{"file_id":"${fileId}"}`,  // 文件ID用JSON字符串格式
        style: mapStyleToPromptType(style),
        input: description || 'Generate cartoon prompt from the uploaded image',
        language: 'en'
      });
    } else {
      // 纯文字描述
      workflowResult = await runCozeWorkflow({
        input: description,
        style: mapStyleToPromptType(style),
        language: 'en'
      });
    }

    const prompt = extractPromptFromResult(workflowResult);

    console.log('=== API Call Completed Successfully ===');
    console.log('Generated prompt length:', prompt?.length);

    // 消费积分
    const creditConsumed = await CreditsService.consumeCredits(
      user.id,
      'generate_caricature_prompt',
      1,
      `Generated caricature prompt using ${style}`
    );

    if (!creditConsumed) {
      console.warn('Failed to consume credits, but continuing with response');
    }

    // 获取更新后的积分信息
    const updatedCredits = await CreditsService.getUserCredits(user.id);

    return NextResponse.json({
      success: true,
      prompt: prompt,
      data: {
        description,
        style,
        hasImage: !!file
      },
      credits: updatedCredits
    });

  } catch (error) {
    console.error("=== Caricature Prompt API error ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Full error object:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate caricature prompt",
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
    message: 'Caricature Prompt API is running',
    timestamp: new Date().toISOString()
  });
}
