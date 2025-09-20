import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { CreditsService } from '~/lib/credits-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const history = await CreditsService.getUserUsageHistory(user.id, limit, offset);

    return NextResponse.json({
      history,
      pagination: {
        limit,
        offset,
        hasMore: history.length === limit
      }
    });

  } catch (error) {
    console.error('Error getting usage history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}