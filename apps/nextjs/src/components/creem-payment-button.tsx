'use client';

import { useState } from 'react';
import { Button } from '@saasfly/ui/button';

interface CreemPaymentButtonProps {
  planName: string;
  price: number;
  planId: string;
  productType?: 'CREDITS' | 'SUBSCRIPTION';
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
  children: React.ReactNode;
}

export function CreemPaymentButton({
  planName,
  price,
  planId,
  productType = 'SUBSCRIPTION',
  onSuccess,
  onError,
  className,
  children,
}: CreemPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // 初始化 Creem 支付
      const response = await fetch('/api/payments/creem/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          planName,
          price,
          currency: 'USD',
          productType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      
      // 重定向到 Creem 结账页面
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Processing...' : children}
    </Button>
  );
}