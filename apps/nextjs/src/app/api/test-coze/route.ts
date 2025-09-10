import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const cozeToken = process.env.COZE_ACCESS_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;
    
    if (!cozeToken) {
      return NextResponse.json({ error: "COZE_ACCESS_TOKEN not configured" }, { status: 500 });
    }
    
    if (!workflowId) {
      return NextResponse.json({ error: "COZE_WORKFLOW_ID not configured" }, { status: 500 });
    }

    // 展示我们尝试的所有参数格式
    const sampleFileId = "sample_file_id_123456";
    
    const parameterFormats = {
      "格式0 - 正确格式（根据工作流界面）": {
        workflow_id: workflowId,
        parameters: {
          img: sampleFileId,  // 图片参数
          promptType: "normal",  // normal, flux, stableDiffusion, midjourney
          userQuery: ""  // 可选的用户查询
        }
      },
      "格式1 - 原始格式": {
        workflow_id: workflowId,
        parameters: {
          image_file_id: sampleFileId,
          model: "General Image Prompt",
          language: "en"
        }
      },
      "格式2 - 简单格式": {
        workflow_id: workflowId,
        parameters: {
          image: sampleFileId
        }
      },
      "格式3 - 直接输入": {
        workflow_id: workflowId,
        parameters: {
          input: sampleFileId
        }
      },
      "格式4 - 文件对象": {
        workflow_id: workflowId,
        parameters: {
          file: {
            type: "file",
            file_id: sampleFileId
          }
        }
      },
      "格式5 - 图片对象": {
        workflow_id: workflowId,
        parameters: {
          image: {
            type: "file", 
            file_id: sampleFileId
          }
        }
      }
    };

    return NextResponse.json({
      success: true,
      message: "扣子工作流参数格式说明",
      configuration: {
        token_configured: !!cozeToken,
        workflow_id: workflowId,
        api_base_url: "https://api.coze.cn",
        upload_endpoint: "/v1/files/upload",
        workflow_endpoint: "/v1/workflows/run"
      },
      parameter_formats: parameterFormats,
      explanation: {
        "当前尝试顺序": [
          "1. 多格式尝试 (格式3, 4, 5)",
          "2. 简单格式 (格式2)", 
          "3. 原始格式 (格式1)"
        ],
        "参数说明": {
          "image_file_id": "最初使用的参数名",
          "image": "简化的参数名",
          "input": "通用的输入参数名",
          "file对象": "包含type和file_id的对象格式",
          "image对象": "专门用于图片的对象格式"
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testFormat, fileId = "test_file_id" } = await request.json();
    
    const cozeToken = process.env.COZE_ACCESS_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;
    
    if (!cozeToken || !workflowId) {
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
    }

    let requestBody: any;

    switch (testFormat) {
      case 0:
        requestBody = {
          workflow_id: workflowId,
          parameters: {
            img: fileId,
            promptType: "normal",
            userQuery: ""
          }
        };
        break;
      case 1:
        requestBody = {
          workflow_id: workflowId,
          parameters: {
            image_file_id: fileId,
            model: "General Image Prompt",
            language: "en"
          }
        };
        break;
      case 2:
        requestBody = {
          workflow_id: workflowId,
          parameters: {
            image: fileId
          }
        };
        break;
      case 3:
        requestBody = {
          workflow_id: workflowId,
          parameters: {
            input: fileId
          }
        };
        break;
      case 4:
        requestBody = {
          workflow_id: workflowId,
          parameters: {
            file: {
              type: "file",
              file_id: fileId
            }
          }
        };
        break;
      case 5:
        requestBody = {
          workflow_id: workflowId,
          parameters: {
            image: {
              type: "file", 
              file_id: fileId
            }
          }
        };
        break;
      default:
        return NextResponse.json({ error: "Invalid test format" }, { status: 400 });
    }

    console.log(`Testing format ${testFormat}:`, JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.coze.cn/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    return NextResponse.json({
      success: true,
      testFormat,
      request: requestBody,
      response: {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    }, { status: 500 });
  }
}
