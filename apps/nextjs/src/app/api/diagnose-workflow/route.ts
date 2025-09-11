import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log("=== Workflow Diagnosis API ===");
  
  try {
    const token = process.env.COZE_ACCESS_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
    
    if (!token || !workflowId) {
      return NextResponse.json({
        success: false,
        error: "Missing configuration"
      });
    }
    
    console.log("Checking workflow:", workflowId);
    
    // 1. 尝试获取特定工作流的详细信息
    const workflowResponse = await fetch(`${baseUrl}/v1/workflows/${workflowId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const workflowText = await workflowResponse.text();
    console.log("Workflow details response status:", workflowResponse.status);
    console.log("Workflow details response:", workflowText);
    
    let workflowDetails = null;
    if (workflowResponse.ok) {
      try {
        workflowDetails = JSON.parse(workflowText);
      } catch (e) {
        workflowDetails = { rawResponse: workflowText };
      }
    }
    
    // 2. 测试几种不同的参数格式
    const testParameters = [
      {
        name: "Original Format",
        parameters: {
          img: "test_file_id",
          promptType: "normal",
          userQuery: ""
        }
      },
      {
        name: "Alternative Format 1",
        parameters: {
          image_file_id: "test_file_id",
          model: "General Image Prompt",
          language: "en"
        }
      },
      {
        name: "Alternative Format 2", 
        parameters: {
          image: "test_file_id",
          prompt_type: "normal",
          language: "en"
        }
      },
      {
        name: "Simple Format",
        parameters: {
          file_id: "test_file_id"
        }
      }
    ];
    
    const testResults = [];
    
    for (const test of testParameters) {
      const requestBody = {
        workflow_id: workflowId,
        parameters: test.parameters
      };
      
      try {
        console.log(`Testing ${test.name}:`, JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${baseUrl}/v1/workflows/run`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const responseText = await response.text();
        console.log(`${test.name} response status:`, response.status);
        console.log(`${test.name} response:`, responseText.substring(0, 500));
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (e) {
          parsedResponse = { rawResponse: responseText };
        }
        
        testResults.push({
          name: test.name,
          status: response.status,
          success: response.ok,
          parameters: test.parameters,
          response: parsedResponse
        });
        
      } catch (error) {
        testResults.push({
          name: test.name,
          status: 'ERROR',
          success: false,
          parameters: test.parameters,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      config: {
        baseUrl,
        workflowId,
        tokenPreview: `${token.substring(0, 15)}...`
      },
      workflowDetails: {
        status: workflowResponse.status,
        exists: workflowResponse.ok,
        details: workflowDetails
      },
      parameterTests: testResults
    });
    
  } catch (error) {
    console.log("Workflow diagnosis error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
