import { NextRequest, NextResponse } from 'next/server';
import { db } from '@saasfly/db';

/**
 * KIE AI Webhook 接收端点
 * 当图片生成完成时，KIE AI 会 POST 结果到这个端点
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== KIE Webhook 收到回调 ===');
    
    const body = await request.json();
    console.log('Webhook 数据:', JSON.stringify(body, null, 2));

    // KIE AI webhook 回调格式（根据文档）:
    // {
    //   "taskId": "task12345",
    //   "status": "SUCCESS",
    //   "response": {
    //     "resultUrls": ["https://example.com/image.png"]
    //   },
    //   "errorMessage": "",
    //   ...
    // }

    const { taskId, status, response, errorMessage } = body;

    if (!taskId) {
      console.error('缺少 taskId');
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
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

    if (status === 'SUCCESS') {
      const imageUrl = response?.resultUrls?.[0];
      if (imageUrl) {
        updateData.status = 'SUCCESS';
        updateData.imageUrl = imageUrl;
        updateData.completedAt = new Date();
        console.log(`✅ 任务成功，图片: ${imageUrl}`);
      } else {
        updateData.status = 'FAILED';
        updateData.errorMessage = 'No image URL in response';
        console.error('响应中没有图片 URL');
      }
    } else if (status === 'GENERATE_FAILED' || status === 'CREATE_TASK_FAILED') {
      updateData.status = 'FAILED';
      updateData.errorMessage = errorMessage || status;
      updateData.completedAt = new Date();
      console.error(`❌ 任务失败: ${errorMessage || status}`);
    } else if (status === 'GENERATING') {
      updateData.status = 'GENERATING';
      console.log('⏳ 任务生成中...');
    }

    await db
      .updateTable('ImageGenerationTask')
      .set(updateData)
      .where('taskId', '=', taskId)
      .execute();

    console.log(`=== 任务 ${taskId} 已更新 ===`);

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
