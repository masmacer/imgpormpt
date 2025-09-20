import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { planId, planName, price, currency = 'USD' } = await request.json();

    // 验证必需的参数
    if (!planId || !planName || !price) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 获取 Creem 配置
    const creemPublicKey = process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY;
    const creemSecretKey = process.env.CREEM_SECRET_KEY;
    const environment = process.env.NEXT_PUBLIC_CREEM_ENVIRONMENT || 'sandbox';

    if (!creemPublicKey || !creemSecretKey) {
      console.error('Creem credentials not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // 创建 Creem 结账会话的配置
    const checkoutData = {
      amount: price * 100, // Creem 通常使用分作为单位
      currency: currency,
      product_name: "Image to Prompt Generator", // 统一产品名
      price_id: planId, // 使用价格ID而不是产品ID
      plan_name: planName, // 套餐名称
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        plan_id: planId,
        plan_name: planName,
      },
    };

    // 调用 Creem API 创建结账会话
    // 注意: 这里需要根据 Creem 的实际 API 文档调整
    const creemResponse = await fetch(`https://api.creem.io/v1/checkout-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creemSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!creemResponse.ok) {
      const errorData = await creemResponse.text();
      console.error('Creem API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const session = await creemResponse.json();

    return NextResponse.json({
      checkoutUrl: session.url || session.checkout_url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}