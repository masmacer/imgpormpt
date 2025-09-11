import { NextRequest, NextResponse } from 'next/server';

// 直接内联 Coze API 调用逻辑
async function uploadFileToCoze(file: File): Promise<string> {
  const accessToken = process.env.COZE_ACCESS_TOKEN;
  const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
  
  if (!accessToken) {
    throw new Error('COZE_ACCESS_TOKEN is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  console.log('Uploading file:', file.name, file.size, file.type);

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

async function runCozeWorkflow(parameters: Record<string, any>): Promise<any> {
  const accessToken = process.env.COZE_ACCESS_TOKEN;
  const workflowId = process.env.COZE_WORKFLOW_ID;
  const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
  
  if (!accessToken) {
    throw new Error('COZE_ACCESS_TOKEN is not configured');
  }
  
  if (!workflowId) {
    throw new Error('COZE_WORKFLOW_ID is not configured');
  }

  const requestBody = {
    workflow_id: workflowId,
    parameters: parameters
  };

  console.log('=== 发送到 Coze 的完整参数 ===');
  console.log('Request URL:', `${baseUrl}/v1/workflows/run`);
  console.log('Request Headers:', {
    'Authorization': `Bearer ${accessToken ? accessToken.substring(0, 20) + '...' : 'undefined'}`,
    'Content-Type': 'application/json'
  });
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  console.log('Parameters only:', JSON.stringify(parameters, null, 2));

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
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
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

// 模型名称映射
function mapModelToPromptType(model: string): string {
  const modelMap: Record<string, string> = {
    "General Image Prompt": "normal",
    "Flux": "flux",
    "Midjourney": "midjourney", 
    "Stable Diffusion": "stableDiffusion"
  };
  
  return modelMap[model] || "normal";
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Image to Prompt API Started (Inline) ===');
    
    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;
    let imageUrl: string | null = null;
    let model: string = 'General Image Prompt';
    let language: string = 'en';

    if (contentType.includes('application/json')) {
      // 处理 JSON 请求 (URL 形式)
      const body = await request.json();
      imageUrl = body.imageUrl;
      model = body.model || 'General Image Prompt';
      language = body.language || 'en';

      console.log('Request params (URL):', {
        imageUrl,
        model,
        language
      });

      if (!imageUrl) {
        return NextResponse.json(
          { error: 'No image URL provided', success: false },
          { status: 400 }
        );
      }

      // 验证URL格式
      try {
        new URL(imageUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid image URL', success: false },
          { status: 400 }
        );
      }
    } else {
      // 处理表单数据 (文件上传)
      const formData = await request.formData();
      file = formData.get('file') as File;
      model = formData.get('model') as string || 'General Image Prompt';
      language = formData.get('language') as string || 'en';

      console.log('Request params (File):', {
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        model,
        language
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
    console.log('COZE_WORKFLOW_ID:', process.env.COZE_WORKFLOW_ID);
    console.log('COZE_ACCESS_TOKEN present:', !!process.env.COZE_ACCESS_TOKEN);
    console.log('COZE_ACCESS_TOKEN length:', process.env.COZE_ACCESS_TOKEN?.length);
    console.log('========================');

    // 调用扣子API生成提示词
    let prompt: string;
    
    if (imageUrl) {
      // URL 处理逻辑
      console.log('Processing image URL:', imageUrl);
      const workflowResult = await runCozeWorkflow({
        img: imageUrl,  // URL直接传字符串
        promptType: mapModelToPromptType(model),
        userQuery: "描述一下图片"
      });
      prompt = extractPromptFromResult(workflowResult);
    } else if (file) {
      // 文件处理逻辑
      console.log('Processing image file:', file.name);
      const fileId = await uploadFileToCoze(file);
      console.log('File uploaded successfully, ID:', fileId);
      
      const workflowResult = await runCozeWorkflow({
        img: `{"file_id":"${fileId}"}`,  // 文件ID用JSON字符串格式
        promptType: mapModelToPromptType(model),
        userQuery: "描述一下图片"
      });
      prompt = extractPromptFromResult(workflowResult);
    } else {
      throw new Error('No file or URL provided');
    }

    console.log('=== API Call Completed Successfully ===');
    console.log('Generated prompt length:', prompt?.length);

    const responseData: any = {
      success: true,
      data: {
        prompt,
        model,
        language
      }
    };

    // 根据输入类型添加相应的信息
    if (file) {
      responseData.data.fileName = file.name;
      responseData.data.fileSize = file.size;
      responseData.data.inputType = 'file';
    } else if (imageUrl) {
      responseData.data.imageUrl = imageUrl;
      responseData.data.inputType = 'url';
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("=== Image to prompt API error ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Full error object:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate prompt",
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
    message: 'Image to Prompt API is running',
    timestamp: new Date().toISOString()
  });
}
