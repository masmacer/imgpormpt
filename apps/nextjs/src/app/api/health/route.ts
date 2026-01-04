import { NextResponse } from 'next/server';
import { db } from '@saasfly/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 简单查询保持数据库连接活跃
    await db.selectFrom('User').select('id').limit(1).execute();
    
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}