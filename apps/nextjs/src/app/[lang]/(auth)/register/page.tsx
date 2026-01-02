import { redirect } from "next/navigation";
import type { Locale } from "~/config/i18n-config";

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
};

export default async function RegisterPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  redirect(`/${lang}/login`);
}
