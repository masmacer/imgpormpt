import { env } from "../env.mjs";

export const cozeConfig = {
  accessToken: env.COZE_ACCESS_TOKEN,
  workflowId: env.COZE_WORKFLOW_ID,
  apiBaseUrl: env.COZE_API_BASE_URL || 'https://api.coze.cn',
  uploadEndpoint: '/v1/files/upload',
  workflowEndpoint: '/v1/workflows/run',
} as const;

export type CozeConfig = typeof cozeConfig;
