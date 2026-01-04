import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { db } from '@saasfly/db';
import { CreditsService } from '~/lib/credits-service';
import { CREEM_PRODUCTS, findProductByPriceId } from '~/config/products';

// 强制动态渲染
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature') || request.headers.get('x-creem-signature');
    
    console.log('🔔 Webhook received');
    
    // 验证 Webhook 签名
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Creem webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body, 'utf8')
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    
    // ✅ Creem 使用 eventType 和 object 字段
    const eventType = event.eventType;
    const data = event.object;
    
    console.log('📦 Event type:', eventType);
    console.log('📦 Event data:', JSON.stringify(data, null, 2));
    
    if (!eventType) {
      console.error('❌ No event type found');
      return NextResponse.json({ error: 'No event type' }, { status: 400 });
    }

    console.log('Creem webhook event:', eventType);

    switch (eventType) {
      // ✅ 一次性支付完成 - 发放积分
      case 'checkout.completed':
        await handleCheckoutCompleted(data);
        break;
      
      // ✅ 订阅激活 - 首次订阅时发放积分
      case 'subscription.active':
        await handleSubscriptionActive(data);
        break;
      
      // ✅ 订阅续费成功 - 每月发放积分
      case 'subscription.paid':
        await handleSubscriptionPaid(data);
        break;
        
      // ✅ 订阅取消 - 标记订阅状态
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data);
        break;
      
      // ✅ 订阅过期 - 降级到免费版
      case 'subscription.expired':
        await handleSubscriptionExpired(data);
        break;
      
      // ✅ 退款创建 - 扣除积分
      case 'refund.created':
        await handleRefundCreated(data);
        break;
      
      // ⚠️ 其他事件仅记录日志
      case 'dispute.created':
      case 'subscription.update':
      case 'subscription.trialing':
      case 'subscription.paused':
        console.log(`Event logged but not processed: ${eventType}`);
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
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

// ✅ 处理一次性购买完成（积分包）
async function handleCheckoutCompleted(data: any) {
  try {
    console.log('💳 Checkout completed');
    
    const { metadata, order } = data;
    const productType = metadata?.product_type;
    
    // ⚠️ 订阅类型跳过（由 subscription.paid 处理）
    if (productType === 'SUBSCRIPTION' || order?.type === 'subscription') {
      console.log('⏭️  Skipping checkout.completed for subscription');
      return;
    }

    const userId = metadata?.user_id;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');
    const planName = metadata?.plan_name;

    if (!userId || !creditsAmount) {
      console.error('Missing required data:', { userId, creditsAmount });
      return;
    }

    // 🔍 防重复：检查 10 分钟内是否已发放
    const checkoutId = data.id;
    const recentCredits = await db
      .selectFrom('CreditUsage')  // ✅ 改为 CreditUsage
      .select(['id'])
      .where('userId', '=', userId)
      .where('description', 'like', `%${checkoutId}%`)
      .where('createdAt', '>', new Date(Date.now() - 10 * 60 * 1000))
      .executeTakeFirst();

    if (recentCredits) {
      console.log(`⏭️  Credits already added for checkout ${checkoutId}, skipping`);
      return;
    }

    // 只为一次性购买发放积分
    await CreditsService.addCredits(
      userId, 
      creditsAmount, 
      `Purchased credits pack: ${planName} (Checkout: ${checkoutId})`
    );
    
    console.log(`✅ Added ${creditsAmount} credits to user ${userId}`);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}

// ✅ 处理订阅激活（首次订阅）
async function handleSubscriptionActive(data: any) {
  try {
    console.log('📅 Subscription activated');
    
    const { metadata, subscription, id } = data;
    const userId = metadata?.user_id;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');
    const planName = metadata?.plan_name;
    const subscriptionId = subscription?.id || id;

    console.log('Subscription activation details:', { userId, creditsAmount, planName, subscriptionId });

    if (!userId) {
      console.error('Missing user ID');
      return;
    }

    // 🔑 只更新订阅状态，不发放积分（由 subscription.paid 发放）
    await updateUserSubscription(userId, 'PRO');
    
    console.log(`✅ User ${userId} upgraded to PRO, waiting for payment confirmation`);

  } catch (error) {
    console.error('Error handling subscription active:', error);
    throw error;
  }
}

// ✅ 处理订阅支付成功（首次 + 续费统一处理）
async function handleSubscriptionPaid(data: any) {
  try {
    console.log('💰 Subscription paid');
    
    const { metadata, subscription, id } = data;
    const userId = metadata?.user_id;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');
    const planName = metadata?.plan_name;
    const subscriptionId = subscription?.id || id;

    console.log('Payment details:', { userId, creditsAmount, planName, subscriptionId });

    if (!userId || !creditsAmount) {
      console.error('Missing required data:', { userId, creditsAmount });
      return;
    }

    // 🔍 防重复：检查是否已经发放过积分
    const existingCredit = await db
      .selectFrom('CreditUsage')
      .select(['id', 'description', 'createdAt'])
      .where('userId', '=', userId)
      .where('action', '=', 'purchase')  // ✅ 只查 purchase 类型
      .where('description', 'like', `%${subscriptionId}%`)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    if (existingCredit) {
      const timeDiff = Date.now() - existingCredit.createdAt.getTime();
      // 如果 10 分钟内已发放，跳过
      if (timeDiff < 10 * 60 * 1000) {
        console.log(`⏭️  Credits already added for subscription ${subscriptionId} at ${existingCredit.createdAt}, skipping`);
        return;
      }
    }

    // 确保用户是 PRO 状态
    await updateUserSubscription(userId, 'PRO');

    // 发放积分
    await CreditsService.addCredits(
      userId, 
      creditsAmount, 
      `Subscription payment: ${planName} (Sub: ${subscriptionId})`
    );
    
    console.log(`✅ Added ${creditsAmount} credits to user ${userId} for subscription ${subscriptionId}`);

  } catch (error) {
    console.error('Error handling subscription paid:', error);
    throw error;
  }
}

// ✅ 处理订阅取消
async function handleSubscriptionCanceled(data: any) {
  try {
    console.log('🚫 Subscription canceled');
    
    const { metadata } = data;
    const userId = metadata?.user_id;

    if (!userId) {
      console.error('Missing user ID');
      return;
    }

    console.log(`✅ Subscription canceled for user ${userId}, will expire at billing period end`);

  } catch (error) {
    console.error('Error handling subscription canceled:', error);
    throw error;
  }
}

// ✅ 处理订阅过期
async function handleSubscriptionExpired(data: any) {
  try {
    console.log('⏰ Subscription expired');
    
    const { metadata } = data;
    const userId = metadata?.user_id;

    if (!userId) {
      console.error('Missing user ID');
      return;
    }

    // 降级到免费版
    await updateUserSubscription(userId, 'FREE');
    
    console.log(`✅ User ${userId} downgraded to FREE plan`);

  } catch (error) {
    console.error('Error handling subscription expired:', error);
    throw error;
  }
}

// ✅ 处理退款
async function handleRefundCreated(data: any) {
  try {
    console.log('💸 Refund created');
    
    const { metadata } = data;
    const userId = metadata?.user_id;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');

    if (!userId || !creditsAmount) {
      console.error('Missing required data:', { userId, creditsAmount });
      return;
    }

    // 扣除退款对应的积分
    await CreditsService.consumeCredits(
      userId,
      'refund',
      creditsAmount,
      `Refund processed`
    );
    
    console.log(`✅ Deducted ${creditsAmount} credits from user ${userId} due to refund`);

  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

// 更新用户订阅状态
async function updateUserSubscription(userId: string, plan: 'FREE' | 'PRO' | 'BUSINESS') {
  try {
    console.log(`🔄 Updating subscription for user ${userId} to ${plan}`);
    
    // 确定对应的 planId
    const planId = plan === 'PRO' ? 'pro-plan' : plan === 'BUSINESS' ? 'business-plan' : 'free-plan';
    
    const existingCustomer = await db
      .selectFrom('Customer')
      .select(['id', 'plan'])
      .where('authUserId', '=', userId)
      .executeTakeFirst();

    if (existingCustomer) {
      console.log(`Found existing customer, current plan: ${existingCustomer.plan}`);
      
      await db
        .updateTable('Customer')
        .set({
          plan,
          updatedAt: new Date(),
        })
        .where('authUserId', '=', userId)
        .execute();
        
      console.log(`✅ Updated Customer table: ${userId} from ${existingCustomer.plan} to ${plan}`);
    } else {
      console.log(`No existing customer found, creating new record`);
      
      await db
        .insertInto('Customer')
        .values({
          authUserId: userId,
          plan,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();
        
      console.log(`✅ Created new Customer record for user ${userId} with plan ${plan}`);
    }

    // 🔑 同时更新 UserCredits 表的 planId（关键！）
    const existingUserCredits = await db
      .selectFrom('UserCredits')
      .select(['id', 'planId'])
      .where('userId', '=', userId)
      .executeTakeFirst();

    if (existingUserCredits) {
      console.log(`Found existing UserCredits, current planId: ${existingUserCredits.planId}`);
      
      await db
        .updateTable('UserCredits')
        .set({
          planId,
          updatedAt: new Date(),
        })
        .where('userId', '=', userId)
        .execute();
        
      console.log(`✅ Updated UserCredits table: ${userId} planId from ${existingUserCredits.planId} to ${planId}`);
    } else {
      console.log(`⚠️  No UserCredits record found for user ${userId}, skipping planId update`);
    }

  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}