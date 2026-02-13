import { NextRequest, NextResponse } from 'next/server';
import { db } from '@saasfly/db';

/**
 * KIE AI Webhook 接收端点
 * 当图片生成完成时，KIE AI 会 POST 结果到这个端点
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n=== KIE Webhook 收到回调 ===');
    console.log('时间:', new Date().toISOString());
    
    const body = await request.json();
    console.log('=== 完整 Webhook 数据 ===');
    console.log(JSON.stringify(body, null, 2));

    // KIE AI 实际发送的数据格式可能是嵌套的
    // 尝试多种可能的路径获取 taskId
    let taskId = body.taskId || body.data?.taskId || body.task_id;
    let status = body.status || body.data?.status;
    let resultUrls = body.response?.resultUrls || body.data?.info?.result_urls || body.result_urls;
    let errorMessage = body.errorMessage || body.error_message || body.data?.errorMessage;

    console.log('=== 解析结果 ===');
    console.log('taskId:', taskId);
    console.log('status:', status);
    console.log('resultUrls:', resultUrls);

    if (!taskId) {
      console.error('❌ 无法从 webhook 数据中提取 taskId');
      console.error('请检查 KIE AI 实际发送的数据结构');
      // 返回 200 避免 KIE 重试，但记录错误
      return NextResponse.json({ 
        received: true, 
        warning: 'Could not extract taskId from webhook data' 
      });
    }

    console.log(`任务 ${taskId} 状态: ${status}`);

    // 查找对应的任务记录
    const task = await db
      .selectFrom('ImageGenerationTask')
      .where('taskId', '=', taskId)
      .selectAll()
      .executeTakeFirst();

    if (!task) {
      console.warn(`任务 ${taskId} 不存在于数据库中`);
      // 仍然返回 200，避免 KIE AI 重试
      return NextResponse.json({ received: true });
    }

    // 更新任务状态
    const updateData: any = {
      updatedAt: new Date(),
    };

    // 判断任务状态（支持多种格式）
    const isSuccess = status === 'SUCCESS' || status === 'success' || status === 'COMPLETED';
    const isFailed = status === 'GENERATE_FAILED' || status === 'CREATE_TASK_FAILED' || status === 'FAILED' || status === 'failed';
    const isGenerating = status === 'GENERATING' || status === 'generating' || status === 'PROCESSING';

    if (isSuccess) {
      const imageUrl = resultUrls?.[0];
      if (imageUrl) {
        updateData.status = 'SUCCESS';
        updateData.imageUrl = imageUrl;
        updateData.completedAt = new Date();
        console.log(`✅ 任务成功，图片: ${imageUrl}`);
      } else {
        updateData.status = 'FAILED';
        updateData.errorMessage = 'No image URL in response';
        console.error('❌ 响应中没有图片 URL');
      }
    } else if (isFailed) {
      updateData.status = 'FAILED';
      updateData.errorMessage = errorMessage || status;
      updateData.completedAt = new Date();
      console.error(`❌ 任务失败: ${errorMessage || status}`);
    } else if (isGenerating) {
      updateData.status = 'GENERATING';
      console.log('⏳ 任务生成中...');
    } else {
      console.log('⚠️ 未知状态:', status);
    }

    await db
      .updateTable('ImageGenerationTask')
      .set(updateData)
      .where('taskId', '=', taskId)
      .execute();

    console.log(`=== 任务 ${taskId} 已更新 ===`);
    console.log('更新后的状态:', updateData);
    console.log('=== Webhook 处理完成 ===\n');

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('=== Webhook 处理错误 ===');
    console.error(error);
    
    // 返回 200 避免 KIE AI 无限重试
    return NextResponse.json({ 
      received: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'KIE Webhook endpoint',
    status: 'ready'
  });
}
