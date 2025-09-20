'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@saasfly/ui/card';
import { Progress } from '@saasfly/ui/progress';
import { Button } from '@saasfly/ui/button';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CreditBalance {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  planName: string;
}

interface CreditsDisplayProps {
  className?: string;
  showDetails?: boolean;
}

export function CreditsDisplay({ className, showDetails = true }: CreditsDisplayProps) {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/credits');
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view your credits');
          return;
        }
        throw new Error('Failed to fetch credits');
      }

      const data = await response.json();
      setCredits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          {error.includes('sign in') && (
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!credits) return null;

  const isDailyPlan = credits.dailyLimit > 0;
  const currentUsed = isDailyPlan ? credits.dailyUsed : credits.usedCredits;
  const currentLimit = isDailyPlan ? credits.dailyLimit : credits.totalCredits;
  const currentRemaining = isDailyPlan ? credits.dailyRemaining : credits.availableCredits;
  
  const usagePercentage = currentLimit > 0 ? (currentUsed / currentLimit) * 100 : 0;
  const isLowCredits = currentRemaining <= (currentLimit * 0.2); // 20% remaining
  const isOutOfCredits = currentRemaining <= 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Credits
          <span className="text-sm font-normal text-muted-foreground">
            ({credits.planName})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credits Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDailyPlan ? (
              <Clock className="h-4 w-4 text-blue-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {isDailyPlan ? 'Daily' : 'Total'} Credits
            </span>
          </div>
          <span className={`text-lg font-bold ${
            isOutOfCredits ? 'text-red-500' : 
            isLowCredits ? 'text-yellow-500' : 
            'text-green-500'
          }`}>
            {currentRemaining}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={usagePercentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentUsed} used</span>
            <span>{currentLimit} total</span>
          </div>
        </div>

        {/* Status Message */}
        {isOutOfCredits && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              No credits remaining
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              {isDailyPlan ? 'Credits will reset tomorrow' : 'Upgrade your plan for more credits'}
            </p>
          </div>
        )}

        {isLowCredits && !isOutOfCredits && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
              Running low on credits
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Consider upgrading for unlimited access
            </p>
          </div>
        )}

        {/* Details */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
            <div>
              <p className="text-muted-foreground">Plan</p>
              <p className="font-medium">{credits.planName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {isDailyPlan ? 'Daily Reset' : 'Total Used'}
              </p>
              <p className="font-medium">
                {isDailyPlan ? 'Every 24h' : `${credits.usedCredits}/${credits.totalCredits}`}
              </p>
            </div>
          </div>
        )}

        {/* Action Button - 暂时隐藏，测试阶段 */}
        {/* {(isLowCredits || isOutOfCredits) && credits.planName.toLowerCase().includes('free') && (
          <Button asChild className="w-full" size="sm">
            <Link href="/pricing">
              Upgrade Plan
            </Link>
          </Button>
        )} */}
      </CardContent>
    </Card>
  );
}