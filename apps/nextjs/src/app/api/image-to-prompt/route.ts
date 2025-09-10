import { NextRequest, NextResponse } from "next/server";
import { cozeApiService } from "@saasfly/common";

export async function POST(request: NextRequest) {
  try {
    console.log('=== Image to Prompt API Started ===');
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const model = formData.get("model") as string || "General Image Prompt";
    const language = formData.get("language") as string || "en";

    console.log('Request params:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type,
      model, 
      language 
    });

    if (!file) {
      console.log('Error: No file provided');
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/bmp",
      "image/tiff"
    ];

    if (!allowedTypes.includes(file.type)) {
      console.log('Error: Invalid file type:', file.type);
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image file." },
        { status: 400 }
      );
    }

    // 验证文件大小 (512MB限制)
    const maxSize = 512 * 1024 * 1024; // 512MB
    if (file.size > maxSize) {
      console.log('Error: File too large:', file.size);
      return NextResponse.json(
        { error: "File too large. Maximum size is 512MB." },
        { status: 400 }
      );
    }

    console.log('=== Starting Coze API Call ===');

    // 调用扣子API生成提示词，使用正确的参数格式
    let prompt: string;
    let lastError: any = null;
    
    try {
      console.log('Trying correct format method...');
      prompt = await cozeApiService.imageToPromptCorrect(file, {
        model,
        language
      });
      console.log('Correct format method succeeded!');
    } catch (error) {
      console.log('Correct format method failed:', error);
      lastError = error;
      
      // 如果正确格式失败，尝试多格式方法
      try {
        console.log('Trying multi-format method...');
        prompt = await cozeApiService.imageToPromptMultiFormat(file, {
          model,
          language
        });
        console.log('Multi-format method succeeded!');
      } catch (multiError) {
        console.log('Multi-format method also failed:', multiError);
        lastError = multiError;
        
        // 如果多格式方法失败，尝试备用方法
        try {
          console.log('Trying alternative method...');
          prompt = await cozeApiService.imageToPromptAlternative(file, {
            model,
            language
          });
          console.log('Alternative method succeeded!');
        } catch (altError) {
          console.log('Alternative method also failed:', altError);
          lastError = altError;
          
          // 最后尝试原始方法
          console.log('Trying original method...');
          prompt = await cozeApiService.imageToPrompt(file, {
            model,
            language
          });
          console.log('Original method succeeded!');
        }
      }
    }

    console.log('=== API Call Completed Successfully ===');
    console.log('Generated prompt length:', prompt?.length);

    return NextResponse.json({
      success: true,
      data: {
        prompt,
        fileName: file.name,
        fileSize: file.size,
        model,
        language
      }
    });

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
  return NextResponse.json(
    { error: "Method not allowed. Use POST to upload images." },
    { status: 405 }
  );
}
