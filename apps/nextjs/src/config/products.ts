// Creem 产品配置
export const CREEM_PRODUCTS = {
  CREDITS: {
    name: 'Credits Pack',
    nameZh: '积分包',
    description: 'Get 100 credits to generate AI prompts',
    descriptionZh: '获得100积分用于生成AI提示词',
    price: 9.90,
    currency: 'USD',
    credits: 100,
    type: 'one-time' as const,
    productId: process.env.CREEM_CREDITS_PRODUCT_ID || '',
    priceId: process.env.CREEM_CREDITS_PRICE_ID || '',
    features: [
      '100 AI prompt generations',
      'No expiration date',
      'High-quality analysis',
      'Multi-language support'
    ],
    featuresZh: [
      '100次AI提示词生成',
      '积分永不过期',
      '高质量图片分析',
      '多语言支持'
    ]
  },
  SUBSCRIPTION: {
    name: 'Pro Monthly',
    nameZh: '专业版月卡',
    description: 'Unlimited generations for one month',
    descriptionZh: '一个月内无限制生成',
    price: 19.90,
    currency: 'USD',
    credits: 10000, // 给一个很大的数量作为"无限制"
    type: 'subscription' as const,
    productId: process.env.CREEM_SUBSCRIPTION_PRODUCT_ID || '',
    priceId: process.env.CREEM_SUBSCRIPTION_PRICE_ID || '',
    features: [
      'Unlimited AI prompt generations',
      'Priority processing',
      'Advanced image analysis',
      'API access',
      'Premium support'
    ],
    featuresZh: [
      '无限制AI提示词生成',
      '优先处理',
      '高级图片分析',
      'API访问权限',
      '专业技术支持'
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
    dailyCredits: 10,
    monthlyCredits: 300
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    nameZh: '专业计划',
    dailyCredits: 0, // 无每日限制
    monthlyCredits: 10000
  }
} as const;