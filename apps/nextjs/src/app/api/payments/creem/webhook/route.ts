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
    console.log('📝 Headers:', Object.fromEntries(request.headers.entries()));
    console.log('📦 Raw body:', body);
    
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
      console.error('Expected:', expectedSignature);
      console.error('Received:', signature);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    
    // 🔍 完整输出 webhook 数据
    console.log('📦 Full webhook event:', JSON.stringify(event, null, 2));
    console.log('📦 event.type:', event.type);
    console.log('📦 event.event:', event.event);
    console.log('📦 event.data:', JSON.stringify(event.data, null, 2));
    
    const eventType = event.type || event.event;
    
    if (!eventType) {
      console.error('❌ No event type found');
      return NextResponse.json({ error: 'No event type' }, { status: 400 });
    }

    console.log('Creem webhook event:', eventType);

    switch (eventType) {
      // ✅ 一次性支付完成 - 发放积分
      case 'checkout.completed':
        await handleCheckoutCompleted(event.data);
        break;
      
      // ✅ 订阅激活 - 首次订阅时发放积分
      case 'subscription.active':
        await handleSubscriptionActive(event.data);
        break;
      
      // ✅ 订阅续费成功 - 每月发放积分
      case 'subscription.paid':
        await handleSubscriptionPaid(event.data);
        break;
        
      // ✅ 订阅取消 - 标记订阅状态
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;
      
      // ✅ 订阅过期 - 降级到免费版
      case 'subscription.expired':
        await handleSubscriptionExpired(event.data);
        break;
      
      // ✅ 退款创建 - 扣除积分
      case 'refund.created':
        await handleRefundCreated(event.data);
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
    console.log('💳 Checkout completed, full data:', JSON.stringify(data, null, 2));
    
    const { customer, metadata, amount, currency } = data;
    const userId = metadata?.user_id;
    const productType = metadata?.product_type;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');
    const planName = metadata?.plan_name;

    console.log('Extracted values:', { userId, creditsAmount, productType, planName });

    if (!userId || !creditsAmount) {
      console.error('Missing required data:', { userId, creditsAmount });
      return;
    }

    // 发放积分
    await CreditsService.addCredits(
      userId, 
      creditsAmount, 
      `Purchased credits pack: ${planName}`
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
    
    const { customer, metadata, subscription } = data;
    const userId = metadata?.user_id;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');
    const planName = metadata?.plan_name;

    if (!userId || !creditsAmount) {
      console.error('Missing required data:', { userId, creditsAmount });
      return;
    }

    // 更新用户订阅状态
    await updateUserSubscription(userId, 'PRO');
    
    // 发放首月积分
    await CreditsService.addCredits(
      userId, 
      creditsAmount, 
      `Subscription activated: ${planName}`
    );
    
    console.log(`✅ Subscription activated for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription active:', error);
    throw error;
  }
}

// ✅ 处理订阅续费成功
async function handleSubscriptionPaid(data: any) {
  try {
    console.log('💰 Subscription paid');
    
    const { customer, metadata, subscription } = data;
    const userId = metadata?.user_id;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');
    const planName = metadata?.plan_name;

    if (!userId || !creditsAmount) {
      console.error('Missing required data:', { userId, creditsAmount });
      return;
    }

    // 发放每月积分
    await CreditsService.addCredits(
      userId, 
      creditsAmount, 
      `Monthly subscription renewal: ${planName}`
    );
    
    console.log(`✅ Monthly credits added for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription paid:', error);
    throw error;
  }
}

// ✅ 处理订阅取消
async function handleSubscriptionCanceled(data: any) {
  try {
    console.log('🚫 Subscription canceled');
    
    const { customer, metadata } = data;
    const userId = metadata?.user_id;

    if (!userId) {
      console.error('Missing user ID');
      return;
    }

    // 订阅取消时保持 PRO，等到过期时才降级
    // 不需要立即修改 plan，因为用户可以用到计费周期结束
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
    
    const { customer, metadata } = data;
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
    
    const { customer, metadata, amount } = data;
    const userId = metadata?.user_id;
    const creditsAmount = parseInt(metadata?.credits_amount || '0');

    if (!userId || !creditsAmount) {
      console.error('Missing required data:', { userId, creditsAmount });
      return;
    }

    // 扣除退款对应的积分 - 修正参数顺序
    await CreditsService.consumeCredits(
      userId,           // ✅ 用户ID
      'refund',         // ✅ action 类型
      creditsAmount,    // ✅ 积分数量
      `Refund processed` // ✅ 描述
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
    const existingCustomer = await db
      .selectFrom('Customer')
      .select(['id'])
      .where('authUserId', '=', userId)
      .executeTakeFirst();

    if (existingCustomer) {
      await db
        .updateTable('Customer')
        .set({
          plan,
          updatedAt: new Date(),
        })
        .where('authUserId', '=', userId)
        .execute();
    } else {
      await db
        .insertInto('Customer')
        .values({
          authUserId: userId,
          plan,
        })
        .execute();
    }

    console.log(`Updated user ${userId} to plan: ${plan}`);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}