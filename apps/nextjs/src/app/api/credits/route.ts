import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { CreditsService } from '~/lib/credits-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('No user found in credits API');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Getting credits for user:', user.id);
    
    const credits = await CreditsService.getUserCredits(user.id);
    if (!credits) {
      console.error('Failed to get credits for user:', user.id);
      // 返回默认的积分信息而不是错误
      return NextResponse.json({
        totalCredits: 300,
        usedCredits: 0,
        availableCredits: 300,
        dailyLimit: 10,
        dailyUsed: 0,
        dailyRemaining: 10,
        planName: "Free Plan"
      });
    }

    console.log('Credits retrieved successfully:', credits);
    return NextResponse.json(credits);

  } catch (error) {
    console.error('Error getting user credits:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, creditsUsed = 1, description, metadata } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // 检查积分是否足够
    const hasCredits = await CreditsService.hasEnoughCredits(user.id, creditsUsed);
    if (!hasCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          message: 'You have reached your credit limit. Please upgrade your plan or wait for the next reset.'
        },
        { status: 402 } // Payment Required
      );
    }

    // 消费积分
    const success = await CreditsService.consumeCredits(
      user.id,
      action,
      creditsUsed,
      description
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to consume credits' },
        { status: 500 }
      );
    }

    // 返回更新后的积分信息
    const updatedCredits = await CreditsService.getUserCredits(user.id);

    return NextResponse.json({
      success: true,
      credits: updatedCredits
    });

  } catch (error) {
    console.error('Error consuming credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}