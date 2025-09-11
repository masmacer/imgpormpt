import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== 查询工作流信息 ===');
    
    const baseUrl = process.env.COZE_API_BASE_URL;
    const token = process.env.COZE_ACCESS_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;

    if (!token || !workflowId || !baseUrl) {
      return NextResponse.json({
        success: false,
        error: '缺少必要的配置信息',
        missing: {
          token: !token,
          workflowId: !workflowId,
          baseUrl: !baseUrl
        }
      }, { status: 400 });
    }

    console.log('查询工作流ID:', workflowId);
    console.log('使用端点:', baseUrl);

    // 1. 获取工作流详细信息
    const workflowInfoResponse = await fetch(`${baseUrl}/v1/workflows/${workflowId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const workflowInfoText = await workflowInfoResponse.text();
    console.log('工作流信息响应状态:', workflowInfoResponse.status);
    console.log('工作流信息响应内容:', workflowInfoText);

    let workflowInfo;
    try {
      workflowInfo = JSON.parse(workflowInfoText);
    } catch {
      workflowInfo = { rawResponse: workflowInfoText };
    }

    // 2. 获取工作流的运行历史（可能包含参数信息）
    const historyResponse = await fetch(`${baseUrl}/v1/workflows/${workflowId}/runs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const historyText = await historyResponse.text();
    console.log('运行历史响应状态:', historyResponse.status);
    console.log('运行历史响应内容:', historyText);

    let historyInfo;
    try {
      historyInfo = JSON.parse(historyText);
    } catch {
      historyInfo = { rawResponse: historyText };
    }

    // 3. 尝试获取工作流列表（包含当前工作流的信息）
    const listResponse = await fetch(`${baseUrl}/v1/workflows`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const listText = await listResponse.text();
    console.log('工作流列表响应状态:', listResponse.status);
    console.log('工作流列表响应内容:', listText);

    let listInfo;
    try {
      listInfo = JSON.parse(listText);
    } catch {
      listInfo = { rawResponse: listText };
    }

    // 4. 从列表中找到当前工作流
    let currentWorkflow = null;
    if (listInfo && listInfo.data && Array.isArray(listInfo.data)) {
      currentWorkflow = listInfo.data.find((workflow: any) => 
        workflow.workflow_id === workflowId || workflow.id === workflowId
      );
    }

    return NextResponse.json({
      success: true,
      workflowId,
      data: {
        workflowInfo: {
          status: workflowInfoResponse.status,
          success: workflowInfoResponse.ok,
          data: workflowInfo
        },
        runHistory: {
          status: historyResponse.status,
          success: historyResponse.ok,
          data: historyInfo
        },
        workflowList: {
          status: listResponse.status,
          success: listResponse.ok,
          data: listInfo,
          currentWorkflow
        }
      },
      analysis: {
        workflowExists: workflowInfoResponse.ok,
        hasRunHistory: historyResponse.ok,
        foundInList: !!currentWorkflow,
        possibleIssues: [
          !workflowInfoResponse.ok ? '无法获取工作流详细信息' : null,
          !historyResponse.ok ? '无法获取运行历史' : null,
          !currentWorkflow ? '在工作流列表中未找到该工作流' : null
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error('查询工作流信息失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    const baseUrl = process.env.COZE_API_BASE_URL;
    const token = process.env.COZE_ACCESS_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;

    if (action === 'test-minimal') {
      // 最小化测试 - 使用您提供的官方格式
      const testRequest = {
        workflow_id: workflowId,
        parameters: {
          "img": "test_file_id_123",
          "promptType": "stableDiffusion",
          "userQuery": "描述下这张图片"
        }
      };

      console.log('测试最小请求:', JSON.stringify(testRequest, null, 2));

      const response = await fetch(`${baseUrl}/v1/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest),
      });

      const responseText = await response.text();
      console.log('最小测试响应:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { rawResponse: responseText };
      }

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        request: testRequest,
        response: result
      });
    }

    return NextResponse.json({
      success: false,
      error: '未知的操作类型'
    }, { status: 400 });

  } catch (error) {
    console.error('POST请求失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
