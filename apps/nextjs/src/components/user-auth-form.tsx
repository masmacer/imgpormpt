"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

type Dictionary = Record<string, string>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict: Dictionary;
  disabled?: boolean;
}

export function UserAuthForm({
  className,
  lang,
  dict,
  disabled,
  ...props
}: UserAuthFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={() => {
          setIsGoogleLoading(true);
          signIn("google", {
            callbackUrl: searchParams?.get("from") ?? `/${lang}/dashboard`,
          }).catch((error) => {
            console.error("Google signIn error:", error);
          });
        }}
        disabled={isGoogleLoading || disabled}
      >
        {isGoogleLoading ? (
          <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.Google className="mr-2 h-4 w-4" />
        )}{" "}
        {dict.signin_google || "Sign in with Google"}
      </button>
    </div>
  );
}
