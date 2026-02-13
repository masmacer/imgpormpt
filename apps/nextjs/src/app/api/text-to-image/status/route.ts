import { NextRequest, NextResponse } from 'next/server';

// 检查KIE AI任务状态
async function checkKIETaskStatus(taskId: string): Promise<any> {
  const apiToken = process.env.KIE_API_TOKEN;
  const statusUrl = process.env.KIE_STATUS_URL || `https://api.kie.ai/api/v1/gpt4o-image/status/${taskId}`;
  
  if (!apiToken) {
    throw new Error('KIE_API_TOKEN is not configured');
  }

  console.log('=== 检查 KIE AI 任务状态 ===');
  console.log('Task ID:', taskId);
  console.log('Status URL:', statusUrl);

  const response = await fetch(statusUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  const responseText = await response.text();
  console.log('=== 状态检查响应 ===');
  console.log('Response status:', response.status);
  console.log('Response text:', responseText);

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
  }

  const result = JSON.parse(responseText);
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('=== Checking Task Status ===');
    console.log('Task ID:', taskId);

    // 检查任务状态
    const statusResult = await checkKIETaskStatus(taskId);

    return NextResponse.json({
      success: true,
      data: {
        taskId: taskId,
        status: statusResult.status || statusResult.data?.status || 'unknown',
        imageUrl: statusResult.imageUrl || statusResult.data?.imageUrl || null,
        progress: statusResult.progress || statusResult.data?.progress || null,
        message: statusResult.message || statusResult.data?.message || null
      }
    });

  } catch (error) {
    console.error("=== Task Status Check Error ===");
    console.error("Error:", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to check task status",
        success: false
      },
      { status: 500 }
    );
  }
}
