import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log("=== Debug Environment Variables ===");
  
  const envVars = {
    COZE_ACCESS_TOKEN: process.env.COZE_ACCESS_TOKEN,
    COZE_WORKFLOW_ID: process.env.COZE_WORKFLOW_ID,
    COZE_API_BASE_URL: process.env.COZE_API_BASE_URL,
  };
  
  console.log('Raw environment variables:', envVars);
  
  return NextResponse.json({
    status: "Debug Environment Variables",
    timestamp: new Date().toISOString(),
    variables: {
      COZE_ACCESS_TOKEN: {
        exists: !!envVars.COZE_ACCESS_TOKEN,
        preview: envVars.COZE_ACCESS_TOKEN ? `${envVars.COZE_ACCESS_TOKEN.substring(0, 15)}...` : 'NOT_SET',
        length: envVars.COZE_ACCESS_TOKEN?.length || 0
      },
      COZE_WORKFLOW_ID: {
        exists: !!envVars.COZE_WORKFLOW_ID,
        value: envVars.COZE_WORKFLOW_ID || 'NOT_SET'
      },
      COZE_API_BASE_URL: {
        exists: !!envVars.COZE_API_BASE_URL,
        value: envVars.COZE_API_BASE_URL || 'NOT_SET'
      }
    },
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('COZE'))
  });
}
