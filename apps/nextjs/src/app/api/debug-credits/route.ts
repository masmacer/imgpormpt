import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { db } from '@saasfly/db';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Debug API Called ===');
    
    // 1. 检查用户认证
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No user found',
        authenticated: false 
      });
    }
    
    // 2. 检查用户是否在数据库中存在
    const dbUser = await db
      .selectFrom('User')
      .select(['id', 'email', 'name'])
      .where('id', '=', user.id)
      .executeTakeFirst();
    
    console.log('Database user:', dbUser);
    
    // 3. 检查用户积分记录
    const userCredits = await db
      .selectFrom('UserCredits')
      .selectAll()
      .where('userId', '=', user.id)
      .executeTakeFirst();
    
    console.log('User credits record:', userCredits);
    
    // 4. 检查积分计划
    const creditPlans = await db
      .selectFrom('CreditPlans')
      .selectAll()
      .execute();
    
    console.log('Available credit plans:', creditPlans);
    
    return NextResponse.json({
      authenticated: true,
      user: user,
      dbUser: dbUser,
      userCredits: userCredits,
      creditPlans: creditPlans,
      userExists: !!dbUser,
      hasCreditsRecord: !!userCredits
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}