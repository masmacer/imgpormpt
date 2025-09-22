import type { Locale } from "~/config/i18n-config";
import { CreemPaymentButton } from "~/components/creem-payment-button";
import { CREEM_PRODUCTS } from "~/config/products";

export default async function PricingPage({ params: { lang } }: { params: { lang: Locale } }) {
  const isZh = lang === 'zh';
  
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          {isZh ? '价格方案' : 'Pricing Plans'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {isZh 
            ? '选择最适合您的AI图片转提示词生成方案。免费开始，按需升级。'
            : 'Choose the perfect plan for your AI-powered image to prompt generation needs. Start free and upgrade as you grow.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Free Plan */}
        <div className="rounded-xl border bg-white dark:bg-gray-900 p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{isZh ? '免费版' : 'Free'}</h2>
            <div className="text-4xl font-bold mb-1">$0</div>
            <p className="text-gray-500">{isZh ? '永久免费' : 'Forever'}</p>
          </div>
          <ul className="mb-8 space-y-3">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {isZh ? '每日10次生成' : '10 prompts per day'}
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {isZh ? '基础AI模型' : 'Basic AI models'}
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {isZh ? '标准支持' : 'Standard support'}
            </li>
          </ul>
          <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" disabled>
            {isZh ? '当前方案' : 'Current Plan'}
          </button>
        </div>

        {/* Credits Pack */}
        <div className="rounded-xl border bg-white dark:bg-gray-900 p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{isZh ? CREEM_PRODUCTS.CREDITS.nameZh : CREEM_PRODUCTS.CREDITS.name}</h2>
            <div className="text-4xl font-bold mb-1">${CREEM_PRODUCTS.CREDITS.price}</div>
            <p className="text-gray-500">{isZh ? '一次性购买' : 'One-time purchase'}</p>
          </div>
          <ul className="mb-8 space-y-3">
            {(isZh ? CREEM_PRODUCTS.CREDITS.featuresZh : CREEM_PRODUCTS.CREDITS.features).map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <CreemPaymentButton
            planId={CREEM_PRODUCTS.CREDITS.priceId}
            planName={CREEM_PRODUCTS.CREDITS.name}
            price={CREEM_PRODUCTS.CREDITS.price}
            productType="CREDITS"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {isZh ? '购买积分包' : 'Buy Credits Pack'}
          </CreemPaymentButton>
        </div>

        {/* Pro Subscription - Featured */}
        <div className="rounded-xl border-2 border-purple-500 bg-white dark:bg-gray-900 p-8 shadow-xl hover:shadow-2xl transition-shadow relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {isZh ? '最受欢迎' : 'Most Popular'}
            </span>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{isZh ? CREEM_PRODUCTS.SUBSCRIPTION.nameZh : CREEM_PRODUCTS.SUBSCRIPTION.name}</h2>
            <div className="text-4xl font-bold mb-1">${CREEM_PRODUCTS.SUBSCRIPTION.price}</div>
            <p className="text-gray-500">{isZh ? '每月' : 'per month'}</p>
          </div>
          <ul className="mb-8 space-y-3">
            {(isZh ? CREEM_PRODUCTS.SUBSCRIPTION.featuresZh : CREEM_PRODUCTS.SUBSCRIPTION.features).map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <CreemPaymentButton
            planId={CREEM_PRODUCTS.SUBSCRIPTION.priceId}
            planName={CREEM_PRODUCTS.SUBSCRIPTION.name}
            price={CREEM_PRODUCTS.SUBSCRIPTION.price}
            productType="SUBSCRIPTION"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            {isZh ? '升级到专业版' : 'Upgrade to Pro'}
          </CreemPaymentButton>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold mb-2">How does the AI image analysis work?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our advanced AI models analyze your images and generate detailed prompts that describe the content, style, and artistic elements.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What image formats are supported?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We support all major image formats including JPG, PNG, WebP, and GIF files up to 10MB in size.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Is there an API available?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, our Enterprise plan includes full API access for seamless integration with your existing workflows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}