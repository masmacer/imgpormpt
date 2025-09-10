import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=== Token Test API ===");
  
  try {
    const token = process.env.COZE_ACCESS_TOKEN;
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.com';
    
    console.log("Token (first 10 chars):", token?.substring(0, 10));
    console.log("Base URL:", baseUrl);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: "No token found"
      });
    }
    
    // 测试一个简单的 API 调用 - 使用文件上传端点测试
    const response = await fetch(`${baseUrl}/v1/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: new FormData(), // 空的 FormData 只是为了测试认证
    });
    
    console.log("Test API response status:", response.status);
    const responseText = await response.text();
    console.log("Test API response:", responseText);
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText
    });
    
  } catch (error) {
    console.error("Token test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
