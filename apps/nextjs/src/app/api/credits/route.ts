import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { CreditsService } from '~/lib/credits-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await CreditsService.getUserCredits(user.id);
    if (!credits) {
      return NextResponse.json({ error: 'Failed to get credits' }, { status: 500 });
    }

    return NextResponse.json(credits);

  } catch (error) {
    console.error('Error getting user credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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