import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log('=== Simple Coze Test Started ===');
    
    const { fileId = "test_file_id" } = await request.json();
    
    const cozeToken = process.env.COZE_ACCESS_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;
    
    console.log('Configuration check:', {
      hasToken: !!cozeToken,
      tokenLength: cozeToken?.length,
      workflowId,
      fileId
    });
    
    if (!cozeToken || !workflowId) {
      return NextResponse.json({ 
        error: "Configuration missing",
        hasToken: !!cozeToken,
        hasWorkflowId: !!workflowId
      }, { status: 500 });
    }

    // 测试正确格式
    const requestBody = {
      workflow_id: workflowId,
      parameters: {
        img: fileId,
        promptType: "normal",
        userQuery: ""
      }
    };

    console.log('Sending request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.coze.cn/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    let parsedResponse: any = null;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Failed to parse response as JSON:', parseError);
    }

    return NextResponse.json({
      success: response.ok,
      request: requestBody,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        parsed: parsedResponse
      }
    });

  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with { fileId: 'your_file_id' } to test workflow",
    example: {
      method: "POST",
      body: { fileId: "test_file_id" }
    }
  });
}
