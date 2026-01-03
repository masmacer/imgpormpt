import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@saasfly/auth';
import { CREEM_PRODUCTS, type ProductType } from '~/config/products';

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户（需要登录才能购买）
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { planId, planName, price, currency = 'USD', productType } = await request.json();

    // 验证必需的参数
    if (!planId || !planName || !price || !productType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 验证产品类型
    if (!CREEM_PRODUCTS[productType as ProductType]) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      );
    }

    const productConfig = CREEM_PRODUCTS[productType as ProductType];

    // 获取 Creem 配置
    const creemSecretKey = process.env.CREEM_SECRET_KEY;
    const environment = process.env.NEXT_PUBLIC_CREEM_ENVIRONMENT || 'sandbox';

    if (!creemSecretKey) {
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
      product_name: "Image to Prompt Generator",
      product_id: planId,  // 改为 product_id
      plan_name: planName,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?plan=${planId}&type=${productType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        plan_name: planName,
        product_type: productType,
        credits_amount: productConfig.credits,
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