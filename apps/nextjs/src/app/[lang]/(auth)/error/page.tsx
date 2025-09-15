import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Authentication Error",
  description: "Authentication error occurred",
};

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An authentication error occurred.",
};

export default async function AuthErrorPage({
  params: { lang },
  searchParams,
}: {
  params: {
    lang: Locale;
  };
  searchParams: { error?: string };
}) {
  const dict = await getDictionary(lang);
  const error = searchParams.error || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href={`/${lang}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <Icons.ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <div className="h-6 w-6 text-red-600">⚠</div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
        </div>
        <Link
          href={`/${lang}/login`}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
