import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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
    const planId = metadata?.plan_id;
    const planName = metadata?.plan_name;

    console.log('Payment successful:', {
      email: customer_email,
      planId,
      planName,
      amount,
      currency,
    });

    // 这里添加您的业务逻辑：
    // 1. 更新用户订阅状态
    // 2. 发送确认邮件
    // 3. 记录支付日志
    // 4. 激活用户的高级功能

    // 示例：更新数据库中的用户订阅
    // await updateUserSubscription(customer_email, planId);
    
    // 示例：发送确认邮件
    // await sendPaymentConfirmationEmail(customer_email, planName);

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