import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log("=== List Workflows API ===");
  
  try {
    const token = process.env.COZE_ACCESS_TOKEN;
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: "No token found"
      });
    }
    
    console.log("Fetching workflows from:", baseUrl);
    
    // 尝试获取工作流列表
    const response = await fetch(`${baseUrl}/v1/workflows`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const responseText = await response.text();
    console.log("Workflows response status:", response.status);
    console.log("Workflows response:", responseText);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch workflows: ${response.status}`,
        response: responseText
      });
    }
    
    let workflows;
    try {
      workflows = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse workflows response",
        rawResponse: responseText
      });
    }
    
    return NextResponse.json({
      success: true,
      config: {
        baseUrl,
        tokenPreview: `${token.substring(0, 15)}...`
      },
      workflows: workflows,
      currentWorkflowId: process.env.COZE_WORKFLOW_ID
    });
    
  } catch (error) {
    console.log("List workflows error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
