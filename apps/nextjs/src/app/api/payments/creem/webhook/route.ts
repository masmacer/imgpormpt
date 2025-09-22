import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { db } from '@saasfly/db';
import { CreditsService } from '~/lib/credits-service';
import { CREEM_PRODUCTS, findProductByPriceId } from '~/config/products';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature') || request.headers.get('x-creem-signature');
    
    // 验证 Webhook 签名
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Creem webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // 验证签名（根据 Creem 的文档调整）
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body, 'utf8')
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    
    console.log('Creem webhook event:', event.type);

    switch (event.type) {
      case 'payment.completed':
      case 'checkout.session.completed':
        await handlePaymentSuccess(event.data);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event.data);
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
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(data: any) {
  try {
    const { customer_email, metadata, amount, currency } = data;
    const userId = metadata?.user_id;
    const planId = metadata?.plan_id;
    const planName = metadata?.plan_name;
    const productType = metadata?.product_type;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');

    console.log('Payment successful:', {
      userId,
      email: customer_email,
      planId,
      planName,
      productType,
      creditsAmount,
      amount,
      currency,
    });

    if (!userId) {
      console.error('No user ID in payment metadata');
      return;
    }

    // 根据产品类型处理不同的业务逻辑
    if (productType === 'CREDITS') {
      // 次数卡：直接增加积分
      await CreditsService.addCredits(
        userId, 
        creditsAmount, 
        `Purchased credits pack: ${planName}`
      );
      
      console.log(`Added ${creditsAmount} credits to user ${userId}`);
      
    } else if (productType === 'SUBSCRIPTION') {
      // 月订阅：更新用户订阅状态并分配积分
      await updateUserSubscription(userId, planId);
      await CreditsService.addCredits(
        userId, 
        creditsAmount, 
        `Monthly subscription: ${planName}`
      );
      
      console.log(`Updated subscription and added ${creditsAmount} credits for user ${userId}`);
    }

    // 记录支付成功日志
    await logPaymentSuccess(userId, planId, planName, amount, currency, productType);

  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const { customer_email, metadata, failure_reason } = data;
    
    console.log('Payment failed:', {
      email: customer_email,
      reason: failure_reason,
      metadata,
    });

    // 处理支付失败的逻辑
    // 例如：发送失败通知邮件

  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(data: any) {
  try {
    const { customer_email, subscription_id, plan_id } = data;
    
    console.log('Subscription created:', {
      email: customer_email,
      subscriptionId: subscription_id,
      planId: plan_id,
    });

    // 处理订阅创建的逻辑

  } catch (error) {
    console.error('Error handling subscription creation:', error);
    throw error;
  }
}

async function handleSubscriptionCancelled(data: any) {
  try {
    const { customer_email, subscription_id } = data;
    
    console.log('Subscription cancelled:', {
      email: customer_email,
      subscriptionId: subscription_id,
    });

    // 处理订阅取消的逻辑
    // 例如：将用户降级到免费计划

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

// 更新用户订阅状态
async function updateUserSubscription(userId: string, planId: string) {
  try {
    // 查找用户
    const user = await db
      .selectFrom('User')
      .select(['id'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    // 更新或创建 Customer 记录
    const existingCustomer = await db
      .selectFrom('Customer')
      .select(['id'])
      .where('authUserId', '=', userId)
      .executeTakeFirst();

    if (existingCustomer) {
      // 更新现有客户
      await db
        .updateTable('Customer')
        .set({
          plan: 'PRO', // 专业版
          updatedAt: new Date(),
        })
        .where('authUserId', '=', userId)
        .execute();
    } else {
      // 创建新客户记录
      await db
        .insertInto('Customer')
        .values({
          authUserId: userId,
          plan: 'PRO',
        })
        .execute();
    }

    console.log(`Updated subscription for user ${userId} to PRO plan`);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

// 记录支付成功日志
async function logPaymentSuccess(
  userId: string,
  planId: string,
  planName: string,
  amount: number,
  currency: string,
  productType: string
) {
  try {
    // 记录到积分使用历史（负数表示充值）
    await db
      .insertInto('CreditUsage')
      .values({
        id: randomUUID(),
        userId,
        action: 'payment_success',
        creditsUsed: -Math.round(amount / 100), // 负数表示增加，这里简化为美分转美元
        description: `Payment successful: ${planName} (${productType})`,
        createdAt: new Date(),
      })
      .execute();

    console.log(`Logged payment success for user ${userId}: ${planName}`);
  } catch (error) {
    console.error('Error logging payment success:', error);
    // 不抛出错误，避免影响主要的支付处理流程
  }
}