import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSessions } from '../../../../../../scripts/cleanup-sessions';

// This API route can be called by Vercel Cron Jobs
export async function GET(request: NextRequest) {
  try {
    await cleanupExpiredSessions();
    return NextResponse.json({ 
      success: true, 
      message: 'Sessions cleaned up successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json({ 
      error: 'Cleanup failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}