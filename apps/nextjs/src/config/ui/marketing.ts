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
      {
        title: dict.marketing.main_nav_caricature,
        href: "/caricature-prompt",
      },
      {
        title: dict.marketing.main_nav_text_to_image,
        href: "/text-to-image",
      },
      {
        title: dict.marketing.main_nav_pricing,
        href: "/pricing",
      },
    ],
  };
};
