import { NextRequest, NextResponse } from 'next/server';
import { CreditsService } from '~/lib/credits-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    
    console.log('Subscription webhook event:', event.type);

    switch (event.type) {
      case 'payment.completed':
      case 'checkout.session.completed':
        await handleSubscriptionUpgrade(event.data);
        break;
        
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Subscription webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpgrade(data: any) {
  try {
    const { customer_email, metadata } = data;
    const planId = metadata?.plan_id;

    // 根据计划分配积分
    let creditsToAdd = 0;
    let description = '';

    switch (planId) {
      case 'price_pro_monthly_19usd':
        creditsToAdd = 10000; // Pro 计划每月10000积分
        description = 'Pro plan activated - Monthly credits';
        break;
      case 'price_enterprise_monthly_99usd':
        creditsToAdd = 100000; // Enterprise 计划每月100000积分
        description = 'Enterprise plan activated - Monthly credits';
        break;
      default:
        console.log('Unknown plan for credit allocation:', planId);
        return;
    }

    // 这里需要根据email找到用户ID
    // 简化版本：假设我们可以从其他地方获取用户ID
    // 在实际应用中，你需要从数据库中查找用户
    const userId = await getUserIdByEmail(customer_email);
    
    if (userId && creditsToAdd > 0) {
      await CreditsService.addCredits(userId, creditsToAdd, description);
      console.log(`Added ${creditsToAdd} credits for user ${userId} (${customer_email})`);
    }

  } catch (error) {
    console.error('Error handling subscription upgrade:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(data: any) {
  // 处理新订阅创建
  await handleSubscriptionUpgrade(data);
}

async function handleSubscriptionCancelled(data: any) {
  try {
    const { customer_email } = data;
    
    // 可以选择将用户降级到免费计划的积分配额
    // 或者保持当前积分直到用完
    console.log(`Subscription cancelled for ${customer_email}`);
    
    // 示例：重置为免费计划积分
    const userId = await getUserIdByEmail(customer_email);
    if (userId) {
      // 可以选择是否立即重置积分或让其自然消耗
      console.log(`User ${userId} subscription cancelled`);
    }

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

// 辅助函数：根据邮箱获取用户ID
async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    // 这里需要查询数据库获取用户ID
    // 示例查询（需要根据你的数据库结构调整）
    const { db } = await import('@saasfly/db');
    
    const user = await db
      .selectFrom('User')
      .select(['id'])
      .where('email', '=', email)
      .executeTakeFirst();

    return user?.id || null;

  } catch (error) {
    console.error('Error getting user ID by email:', error);
    return null;
  }
}