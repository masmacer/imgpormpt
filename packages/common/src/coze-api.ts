import { cozeConfig } from "./config/coze";

// 文件上传响应类型
export interface FileUploadResponse {
  code: number;
  data: {
    id: string;
    bytes: number;
    file_name: string;
    created_at: number;
  };
  msg: string;
}

// 工作流运行响应类型
export interface WorkflowRunResponse {
  code: number;
  data: {
    execute_id: string;
    status: 'Running' | 'Success' | 'Failed';
    result?: {
      output: string;
    };
  };
  msg: string;
}

// 扣子API服务类
export class CozeApiService {
  private accessToken: string | undefined;
  private baseUrl: string;

  constructor() {
    this.accessToken = cozeConfig.accessToken;
    this.baseUrl = cozeConfig.apiBaseUrl;
  }

  /**
   * 上传文件到扣子
   * @param file 文件对象
   * @returns 上传结果
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    if (!this.accessToken) {
      throw new Error('Coze access token is not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading file:', file.name, file.size, file.type);

    const response = await fetch(`${this.baseUrl}${cozeConfig.uploadEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    console.log('Upload response status:', response.status);
    console.log('Upload response text:', responseText);

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse upload response: ${responseText}`);
    }
  }

  /**
   * 根据模型名称获取对应的promptType值
   * @param model 模型名称
   * @returns promptType值
   */
  private getPromptType(model: string): string {
    const modelMap: Record<string, string> = {
      'General Image Prompt': 'normal',
      'Flux': 'flux',
      'Stable Diffusion': 'stableDiffusion', 
      'Midjourney': 'midjourney'
    };
    
    return modelMap[model] || 'normal';
  }

  /**
   * 运行工作流（使用正确的参数格式）
   * @param fileId 文件ID
   * @param options 选项
   * @returns 工作流运行结果
   */
  async runWorkflowCorrect(
    fileId: string,
    options: {
      model?: string;
      language?: string;
      userQuery?: string;
    } = {}
  ): Promise<WorkflowRunResponse> {
    if (!this.accessToken) {
      throw new Error('Coze access token is not configured');
    }

    if (!cozeConfig.workflowId) {
      throw new Error('Coze workflow ID is not configured');
    }

    const promptType = this.getPromptType(options.model || 'General Image Prompt');
    
    const requestBody = {
      workflow_id: cozeConfig.workflowId,
      parameters: {
        img: fileId,  // 根据工作流界面，参数名是 img
        promptType: promptType,  // 根据模型选择对应的类型
        userQuery: options.userQuery || ''  // 可选的用户查询
      },
    };

    console.log('Running workflow (correct format) with:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${this.baseUrl}${cozeConfig.workflowEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Workflow (correct) response status:', response.status);
    console.log('Workflow (correct) response text:', responseText);

    if (!response.ok) {
      throw new Error(`Workflow run failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse workflow response: ${responseText}`);
    }
  }

  /**
   * 运行工作流（多种参数格式尝试）
   * @param fileId 文件ID
   * @returns 工作流运行结果
   */
  async runWorkflowMultiFormat(fileId: string): Promise<WorkflowRunResponse> {
    if (!this.accessToken) {
      throw new Error('Coze access token is not configured');
    }

    if (!cozeConfig.workflowId) {
      throw new Error('Coze workflow ID is not configured');
    }

    // 尝试多种参数格式
    const formats = [
      // 格式1: 直接传入文件ID
      {
        workflow_id: cozeConfig.workflowId,
        parameters: {
          "input": fileId
        }
      },
      // 格式2: 使用file对象
      {
        workflow_id: cozeConfig.workflowId,
        parameters: {
          "file": {
            "type": "file",
            "file_id": fileId
          }
        }
      },
      // 格式3: 使用image参数
      {
        workflow_id: cozeConfig.workflowId,
        parameters: {
          "image": {
            "type": "file", 
            "file_id": fileId
          }
        }
      }
    ];

    for (let i = 0; i < formats.length; i++) {
      try {
        console.log(`Trying workflow format ${i + 1}:`, JSON.stringify(formats[i], null, 2));

        const response = await fetch(`${this.baseUrl}${cozeConfig.workflowEndpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formats[i]),
        });

        const responseText = await response.text();
        console.log(`Format ${i + 1} response status:`, response.status);
        console.log(`Format ${i + 1} response text:`, responseText);

        if (response.ok) {
          try {
            const result = JSON.parse(responseText);
            if (result.code === 0 || result.code === undefined) {
              return result;
            }
          } catch (parseError) {
            console.log(`Format ${i + 1} parse error:`, parseError);
          }
        }

        if (i === formats.length - 1) {
          throw new Error(`All workflow formats failed. Last response: ${response.status} ${response.statusText}. Response: ${responseText}`);
        }

      } catch (error) {
        console.log(`Format ${i + 1} failed:`, error);
        if (i === formats.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All workflow formats failed');
  }

  /**
   * 运行工作流（简化版本）
   * @param fileId 文件ID
   * @returns 工作流运行结果
   */
  async runWorkflowSimple(fileId: string): Promise<WorkflowRunResponse> {
    if (!this.accessToken) {
      throw new Error('Coze access token is not configured');
    }

    if (!cozeConfig.workflowId) {
      throw new Error('Coze workflow ID is not configured');
    }

    // 尝试不同的参数格式
    const requestBody = {
      workflow_id: cozeConfig.workflowId,
      parameters: {
        "image": fileId,  // 尝试简单的参数名
      },
    };

    console.log('Running workflow (simple) with:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${this.baseUrl}${cozeConfig.workflowEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Workflow (simple) response status:', response.status);
    console.log('Workflow (simple) response text:', responseText);

    if (!response.ok) {
      throw new Error(`Workflow run failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse workflow response: ${responseText}`);
    }
  }

  /**
   * 运行工作流
   * @param fileId 文件ID
   * @param params 其他参数
   * @returns 工作流运行结果
   */
  async runWorkflow(
    fileId: string, 
    params: Record<string, any> = {}
  ): Promise<WorkflowRunResponse> {
    if (!this.accessToken) {
      throw new Error('Coze access token is not configured');
    }

    if (!cozeConfig.workflowId) {
      throw new Error('Coze workflow ID is not configured');
    }

    const requestBody = {
      workflow_id: cozeConfig.workflowId,
      parameters: {
        image_file_id: fileId,
        ...params,
      },
    };

    console.log('Running workflow with:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${this.baseUrl}${cozeConfig.workflowEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Workflow response status:', response.status);
    console.log('Workflow response text:', responseText);

    if (!response.ok) {
      throw new Error(`Workflow run failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse workflow response: ${responseText}`);
    }
  }

  /**
   * 完整的图片转提示词流程（使用正确的参数格式）
   * @param file 图片文件
   * @param options 选项
   * @returns 生成的提示词
   */
  async imageToPromptCorrect(
    file: File, 
    options: {
      model?: string;
      language?: string;
      userQuery?: string;
    } = {}
  ): Promise<string> {
    try {
      // 1. 上传文件
      const uploadResult = await this.uploadFile(file);
      
      if (uploadResult.code !== 0) {
        throw new Error(`File upload failed: ${uploadResult.msg}`);
      }

      const fileId = uploadResult.data.id;
      console.log('File uploaded successfully, ID:', fileId);

      // 2. 使用正确的参数格式调用工作流
      const workflowResult = await this.runWorkflowCorrect(fileId, options);

      if (workflowResult.code !== 0 && workflowResult.code !== undefined) {
        throw new Error(`Workflow execution failed: ${workflowResult.msg}`);
      }

      // 3. 返回结果
      if (workflowResult.data?.status === 'Success' && workflowResult.data.result) {
        return workflowResult.data.result.output;
      } else if (workflowResult.data?.status === 'Failed') {
        throw new Error('Workflow execution failed');
      } else {
        // 如果没有标准的status字段，尝试直接返回数据
        if (workflowResult.data && typeof workflowResult.data === 'string') {
          return workflowResult.data;
        }
        // 尝试返回完整的工作流结果用于调试
        console.log('Full workflow result:', workflowResult);
        throw new Error('Workflow is still running or status unknown');
      }

    } catch (error) {
      console.error('Image to prompt conversion failed:', error);
      throw error;
    }
  }

  /**
   * 完整的图片转提示词流程（多格式版本）
   * @param file 图片文件
   * @param options 选项
   * @returns 生成的提示词
   */
  async imageToPromptMultiFormat(
    file: File, 
    options: {
      model?: string;
      language?: string;
    } = {}
  ): Promise<string> {
    try {
      // 1. 上传文件
      const uploadResult = await this.uploadFile(file);
      
      if (uploadResult.code !== 0) {
        throw new Error(`File upload failed: ${uploadResult.msg}`);
      }

      const fileId = uploadResult.data.id;
      console.log('File uploaded successfully, ID:', fileId);

      // 2. 尝试多格式工作流调用
      const workflowResult = await this.runWorkflowMultiFormat(fileId);

      if (workflowResult.code !== 0 && workflowResult.code !== undefined) {
        throw new Error(`Workflow execution failed: ${workflowResult.msg}`);
      }

      // 3. 返回结果
      if (workflowResult.data?.status === 'Success' && workflowResult.data.result) {
        return workflowResult.data.result.output;
      } else if (workflowResult.data?.status === 'Failed') {
        throw new Error('Workflow execution failed');
      } else {
        // 如果没有标准的status字段，尝试直接返回数据
        if (workflowResult.data && typeof workflowResult.data === 'string') {
          return workflowResult.data;
        }
        throw new Error('Workflow is still running or status unknown');
      }

    } catch (error) {
      console.error('Image to prompt conversion failed:', error);
      throw error;
    }
  }

  /**
   * 完整的图片转提示词流程（备用版本）
   * @param file 图片文件
   * @param options 选项
   * @returns 生成的提示词
   */
  async imageToPromptAlternative(
    file: File, 
    options: {
      model?: string;
      language?: string;
    } = {}
  ): Promise<string> {
    try {
      // 1. 上传文件
      const uploadResult = await this.uploadFile(file);
      
      if (uploadResult.code !== 0) {
        throw new Error(`File upload failed: ${uploadResult.msg}`);
      }

      const fileId = uploadResult.data.id;

      // 2. 尝试简化的工作流调用
      const workflowResult = await this.runWorkflowSimple(fileId);

      if (workflowResult.code !== 0) {
        throw new Error(`Workflow execution failed: ${workflowResult.msg}`);
      }

      // 3. 返回结果
      if (workflowResult.data.status === 'Success' && workflowResult.data.result) {
        return workflowResult.data.result.output;
      } else if (workflowResult.data.status === 'Failed') {
        throw new Error('Workflow execution failed');
      } else {
        throw new Error('Workflow is still running or status unknown');
      }

    } catch (error) {
      console.error('Image to prompt conversion failed:', error);
      throw error;
    }
  }

  /**
   * 完整的图片转提示词流程
   * @param file 图片文件
   * @param options 选项
   * @returns 生成的提示词
   */
  async imageToPrompt(
    file: File, 
    options: {
      model?: string;
      language?: string;
    } = {}
  ): Promise<string> {
    try {
      // 1. 上传文件
      const uploadResult = await this.uploadFile(file);
      
      if (uploadResult.code !== 0) {
        throw new Error(`File upload failed: ${uploadResult.msg}`);
      }

      const fileId = uploadResult.data.id;

      // 2. 运行工作流
      const workflowResult = await this.runWorkflow(fileId, {
        model: options.model || 'General Image Prompt',
        language: options.language || 'en',
      });

      if (workflowResult.code !== 0) {
        throw new Error(`Workflow execution failed: ${workflowResult.msg}`);
      }

      // 3. 返回结果
      if (workflowResult.data.status === 'Success' && workflowResult.data.result) {
        return workflowResult.data.result.output;
      } else if (workflowResult.data.status === 'Failed') {
        throw new Error('Workflow execution failed');
      } else {
        throw new Error('Workflow is still running or status unknown');
      }

    } catch (error) {
      console.error('Image to prompt conversion failed:', error);
      throw error;
    }
  }
}

// 创建单例实例
export const cozeApiService = new CozeApiService();
