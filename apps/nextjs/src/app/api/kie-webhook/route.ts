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

    // KIE AI 实际发送的数据格式（基于实际回调）：
    // { code: 200, data: { taskId: "xxx", info: { result_urls: [...] } }, msg: "..." }
    let taskId = body.taskId || body.data?.taskId || body.task_id;
    let resultUrls = body.response?.resultUrls || body.data?.info?.result_urls || body.result_urls;
    let errorMessage = body.errorMessage || body.error_message || body.data?.errorMessage || body.msg;
    
    // KIE 没有 status 字段，用 code 判断成功/失败
    let status;
    if (body.code === 200) {
      status = 'SUCCESS';
    } else if (body.code >= 400) {
      status = 'FAILED';
    } else if (body.status === 'GENERATING') {
      status = 'GENERATING';
    } else {
      // 兜底：有 code 200 就是成功
      status = body.code === 200 ? 'SUCCESS' : (body.status || 'UNKNOWN');
    }

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
    let task;
    try {
      console.log('查询条件 - taskId:', taskId);
      task = await db
        .selectFrom('ImageGenerationTask')
        .where('taskId', '=', taskId)
        .selectAll()
        .executeTakeFirst();
      
      console.log('查询结果:', task ? '找到任务' : '未找到任务');
      if (task) {
        console.log('任务详情:', { id: task.id, status: task.status, userId: task.userId });
      }
    } catch (error) {
      console.error('❌ 数据库查询失败，表可能不存在:', error);
      console.error('请在 Supabase 执行 create-image-task-table.sql');
      return NextResponse.json({ 
        received: true, 
        error: 'Database table not found. Please create ImageGenerationTask table first.' 
      });
    }

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

    try {
      const result = await db
        .updateTable('ImageGenerationTask')
        .set(updateData)
        .where('taskId', '=', taskId)
        .execute();

      console.log('=== 数据库更新执行完成 ===');
      console.log('更新结果:', result);
      console.log(`=== 任务 ${taskId} 已更新 ===`);
      console.log('更新后的状态:', updateData);
      console.log('=== Webhook 处理完成 ===\n');
    } catch (error) {
      console.error('❌ 数据库更新失败:', error);
      throw error;
    }

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
