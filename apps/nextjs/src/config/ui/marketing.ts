import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import type { MarketingConfig } from "~/types";

export const getMarketingConfig = async ({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}): Promise<MarketingConfig> => {
  const dict = await getDictionary(lang);
  return {
    mainNav: [
      // 暂时隐藏价格入口，测试阶段
      // {
      //   title: dict.marketing.main_nav_pricing,
      //   href: "/pricing",
      // },
    ],
  };
};
