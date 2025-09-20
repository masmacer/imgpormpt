'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@saasfly/ui/card';
import { Button } from '@saasfly/ui/button';
import { History, Zap, Image, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CreditUsageRecord {
  id: string;
  action: string;
  creditsUsed: number;
  description?: string;
  createdAt: string;
}

interface CreditHistoryProps {
  className?: string;
  limit?: number;
}

export function CreditHistory({ className, limit = 20 }: CreditHistoryProps) {
  const [history, setHistory] = useState<CreditUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const fetchHistory = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/credits/history?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setHistory(data.history);
      setHasMore(data.pagination.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'generate_prompt':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'credit_added':
        return <Zap className="h-4 w-4 text-green-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'generate_prompt':
        return 'Generated Prompt';
      case 'credit_added':
        return 'Credits Added';
      default:
        return action.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Usage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Usage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => fetchHistory()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Usage History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No usage history yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start generating prompts to see your activity here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div key={record.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-0.5">
                  {getActionIcon(record.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {getActionLabel(record.action)}
                    </p>
                    <span className={`text-sm font-medium ${
                      record.creditsUsed > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {record.creditsUsed > 0 ? '-' : '+'}{Math.abs(record.creditsUsed)}
                    </span>
                  </div>
                  {record.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {record.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchHistory(history.length)}
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}