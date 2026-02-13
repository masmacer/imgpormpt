import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { db } from '@saasfly/db';

/**
 * 查询图片生成任务状态
 * GET /api/text-to-image/status?taskId=xxx
 * 前端轮询此接口获取任务状态
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required', success: false },
        { status: 400 }
      );
    }

    console.log('=== 查询任务状态 ===');
    console.log('Task ID:', taskId);
    console.log('User ID:', user.id);

    // 从数据库查询任务状态
    const task = await db
      .selectFrom('ImageGenerationTask')
      .where('taskId', '=', taskId)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found', success: false },
        { status: 404 }
      );
    }

    console.log('任务状态:', task.status);
    console.log('图片 URL:', task.imageUrl);

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.taskId,
        status: task.status,
        imageUrl: task.imageUrl,
        errorMessage: task.errorMessage,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      },
    });

  } catch (error) {
    console.error('=== 查询任务状态失败 ===');
    console.error(error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get task status',
        success: false
      },
      { status: 500 }
    );
  }
}
