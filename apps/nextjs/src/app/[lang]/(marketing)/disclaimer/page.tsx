import type { Locale } from "~/config/i18n-config";
import Link from "next/link";

export default async function DisclaimerPage({ params: { lang } }: { params: { lang: Locale } }) {
  const isZh = lang === 'zh';
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">
        {isZh ? '产品声明' : 'Product Disclaimer'}
      </h1>

      {/* Independent Product Declaration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          {isZh ? '独立产品声明' : 'Independent Product Declaration'}
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {isZh 
              ? '本产品是一个独立开发和运营的AI图片转提示词生成工具。我们不隶属于、不由任何第三方AI服务提供商赞助或认可。'
              : 'This product is an independently developed and operated AI-powered image to prompt generation tool. We are not affiliated with, sponsored by, or endorsed by any third-party AI service providers.'
            }
          </p>
        </div>
      </section>

      {/* Third-party AI Services */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          {isZh ? '第三方AI服务使用声明' : 'Third-Party AI Services Disclosure'}
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {isZh 
              ? '本产品在其工作流程中使用了以下第三方AI服务和技术：'
              : 'This product utilizes the following third-party AI services and technologies in its workflow:'
            }
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>OpenAI GPT models (or other AI providers you use)</li>
            <li>Computer Vision APIs</li>
            <li>{isZh ? '其他AI图像分析服务' : 'Other AI image analysis services'}</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {isZh 
              ? '我们对这些第三方服务的使用遵循其各自的服务条款和隐私政策。本产品仅作为这些服务的集成工具，不对第三方服务的性能、可用性或结果负责。'
              : 'Our use of these third-party services is subject to their respective Terms of Service and Privacy Policies. This product serves solely as an integration tool for these services and is not responsible for their performance, availability, or results.'
            }
          </p>
        </div>
      </section>

      {/* Not Affiliated Statement */}
      <section className="mb-12 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h2 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-200">
          {isZh ? '重要提示' : 'Important Notice'}
        </h2>
        <p className="text-gray-800 dark:text-gray-200">
          {isZh 
            ? '本产品与OpenAI、Google、Anthropic或任何其他AI服务提供商没有官方关联。所有提及的商标和服务名称均为其各自所有者的财产。'
            : 'This product is not officially affiliated with OpenAI, Google, Anthropic, or any other AI service providers. All mentioned trademarks and service names are the property of their respective owners.'
          }
        </p>
      </section>

      {/* Liability Limitation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          {isZh ? '责任限制' : 'Limitation of Liability'}
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {isZh 
              ? '本产品提供的所有AI生成内容仅供参考。我们不保证生成结果的准确性、完整性或适用性。用户应自行判断和验证所有生成的内容。'
              : 'All AI-generated content provided by this product is for reference purposes only. We do not guarantee the accuracy, completeness, or suitability of generated results. Users should independently verify and validate all generated content.'
            }
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {isZh ? '联系我们' : 'Contact Us'}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {isZh 
            ? '如有任何疑问，请通过以下方式联系我们：'
            : 'If you have any questions, please contact us at:'
          }
        </p>
        <p className="text-purple-600 dark:text-purple-400 mt-2">
          support@yourdomain.com
        </p>
      </section>

      {/* Back Link */}
      <div className="mt-12 pt-8 border-t">
        <Link 
          href={`/${lang}`}
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          ← {isZh ? '返回首页' : 'Back to Home'}
        </Link>
      </div>
    </div>
  );
}