import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@saasfly/ui";

import { ModeToggle } from "~/components/mode-toggle";

function getCopyrightText(
  dict: Record<string, string | Record<string, string>>,
) {
  const currentYear = new Date().getFullYear();
  const copyrightTemplate = String(dict.copyright);
  return copyrightTemplate?.replace("${currentYear}", String(currentYear));
}

export function SiteFooter({
  className,
  params,
  dict,
}: {
  className?: string;
  params: {
    lang: string;
  };

  dict: Record<string, string | Record<string, string>>;
}) {
  return (
    <footer className={cn(className)}>
      <div className="container py-10">
        {/* Main footer content */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Left side - Brand and copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="text-xl font-bold">imageprompt</div>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              Transform your images into better AI prompts
            </p>
          </div>

          {/* Center - Navigation links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link 
              href={`/${params.lang}/about`} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </Link>
            <Link 
              href={`/${params.lang}/contact`} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              href={`/${params.lang}/terms`} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href={`/${params.lang}/privacy`} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href={`/${params.lang}/refund`} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Refund Policy
            </Link>
          </div>

          {/* Right side - Mode toggle */}
          <ModeToggle />
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            Copyright © {new Date().getFullYear()} imageprompt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
