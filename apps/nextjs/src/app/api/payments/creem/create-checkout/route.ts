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
    const creemApiKey = process.env.CREEM_SECRET_KEY;
    const environment = process.env.NEXT_PUBLIC_CREEM_ENVIRONMENT || 'test';

    if (!creemApiKey) {
      console.error('Creem API key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // 根据 Creem API 文档的正确参数格式
    const checkoutData = {
      product_id: productConfig.productId,
      units: 1, // 数量
      customer: {
        email: user.email,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?plan=${planId}&type=${productType}`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        plan_name: planName,
        product_type: productType,
        credits_amount: productConfig.credits.toString(),
      },
    };

    console.log('Creating Creem checkout with:', {
      product_id: productConfig.productId,
      environment,
      user_id: user.id,
      user_email: user.email,
    });

    // 调用 Creem API 创建结账会话
    // 根据官方文档：POST /v1/checkouts
    const apiUrl = environment === 'prod' 
      ? 'https://api.creem.io/v1/checkouts'
      : 'https://test-api.creem.io/v1/checkouts';

    const creemResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': creemApiKey,  // ✅ 使用 x-api-key 而不是 Authorization Bearer
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const responseText = await creemResponse.text();
    
    if (!creemResponse.ok) {
      console.error('Creem API error:', {
        status: creemResponse.status,
        statusText: creemResponse.statusText,
        body: responseText,
        url: apiUrl,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          details: responseText 
        },
        { status: creemResponse.status }
      );
    }

    const session = JSON.parse(responseText);

    console.log('Checkout session created:', {
      id: session.id,
      status: session.status,
      checkout_url: session.checkout_url,
    });

    return NextResponse.json({
      checkoutUrl: session.checkout_url,  // ✅ 根据文档是 checkout_url
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}