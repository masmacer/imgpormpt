// Creem 产品配置
export const CREEM_PRODUCTS = {
  CREDITS: {
    name: 'Credits Pack',
    nameZh: '积分包',
    description: 'Get 100 credits for AI generation',
    descriptionZh: '获得100积分用于AI生成',
    price: 9.90,
    currency: 'USD',
    credits: 100,
    type: 'one-time' as const,
    productId: process.env.CREEM_CREDITS_PRODUCT_ID || '',
    priceId: process.env.CREEM_CREDITS_PRICE_ID || '',
    features: [
      '100 credits',
      'No expiration date',
      'Use anytime',
      'Perfect for occasional use'
    ],
    featuresZh: [
      '100积分',
      '积分永不过期',
      '随时使用',
      '适合偶尔使用'
    ]
  },
  SUBSCRIPTION: {
    name: 'Pro Monthly',
    nameZh: '专业版月卡',
    description: '1,000 credits per month',
    descriptionZh: '每月1000积分',
    price: 19.90,
    currency: 'USD',
    credits: 1000,
    type: 'subscription' as const,
    productId: process.env.CREEM_SUBSCRIPTION_PRODUCT_ID || '',
    priceId: process.env.CREEM_SUBSCRIPTION_PRICE_ID || '',
    features: [
      '1,000 credits per month',
      'No daily limits',
      'Auto-renews monthly',
      'Best value for regular users'
    ],
    featuresZh: [
      '每月1000积分',
      '无每日限制',
      '每月自动续订',
      '高频使用最划算'
    ]
  }
} as const;

export type ProductType = keyof typeof CREEM_PRODUCTS;
export type ProductConfig = typeof CREEM_PRODUCTS[ProductType];

// 根据产品类型获取配置
export function getProductConfig(type: ProductType): ProductConfig {
  return CREEM_PRODUCTS[type];
}

// 根据价格ID查找产品类型
export function findProductByPriceId(priceId: string): { type: ProductType; config: ProductConfig } | null {
  for (const [type, config] of Object.entries(CREEM_PRODUCTS)) {
    if (config.priceId === priceId) {
      return { type: type as ProductType, config };
    }
  }
  return null;
}

// 积分计划映射
export const CREDIT_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Plan',
    nameZh: '免费计划',
    dailyCredits: 3,
    monthlyCredits: 90
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    nameZh: '专业计划',
    dailyCredits: 0, // 无每日限制
    monthlyCredits: 1000
  }
} as const;