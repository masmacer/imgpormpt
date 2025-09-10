import { NextResponse } from "next/server";

export async function GET() {
  console.log('=== Environment Variables Check ===');
  
  const envVars = {
    COZE_ACCESS_TOKEN: process.env.COZE_ACCESS_TOKEN,
    COZE_WORKFLOW_ID: process.env.COZE_WORKFLOW_ID,
    COZE_API_BASE_URL: process.env.COZE_API_BASE_URL,
  };
  
  console.log('Environment variables:', {
    COZE_ACCESS_TOKEN: envVars.COZE_ACCESS_TOKEN ? `${envVars.COZE_ACCESS_TOKEN.substring(0, 10)}...` : 'NOT_SET',
    COZE_WORKFLOW_ID: envVars.COZE_WORKFLOW_ID || 'NOT_SET',
    COZE_API_BASE_URL: envVars.COZE_API_BASE_URL || 'NOT_SET',
  });

  return NextResponse.json({
    status: "Environment variables check",
    variables: {
      COZE_ACCESS_TOKEN: envVars.COZE_ACCESS_TOKEN ? {
        set: true,
        length: envVars.COZE_ACCESS_TOKEN.length,
        preview: `${envVars.COZE_ACCESS_TOKEN.substring(0, 10)}...`
      } : { set: false },
      COZE_WORKFLOW_ID: envVars.COZE_WORKFLOW_ID ? {
        set: true,
        value: envVars.COZE_WORKFLOW_ID
      } : { set: false },
      COZE_API_BASE_URL: envVars.COZE_API_BASE_URL ? {
        set: true,
        value: envVars.COZE_API_BASE_URL
      } : { set: false, default: "https://api.coze.cn" }
    }
  });
}
