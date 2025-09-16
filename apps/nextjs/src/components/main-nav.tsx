"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import * as Icons from "@saasfly/ui/icons";
import { DocumentGuide } from "~/components/document-guide";
import { MobileNav } from "~/components/mobile-nav";

import type { MainNavItem } from "~/types";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  params: {
    lang: string;
  };
  marketing?: Record<string, string | object>;
}

export function MainNav({ items, children, params: { lang }, marketing }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  const toggleMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  const handleMenuItemClick = () => {
    toggleMenu();
  };
  return (
    <div className="flex gap-6 md:gap-10">
      <div className="flex items-center">
        <Link href={`/${lang}`} className="hidden items-center space-x-2 md:flex">
          <Image
            src="/favicon.ico"
            alt="imageprompt"
            width={32}
            height={32}
            className="mr-2"
          />
          <div className="text-3xl">imageprompt</div>
        </Link>
      </div>

      <Link href={`/${lang}`} className="flex items-center space-x-2 md:hidden">
        <Image
          src="/favicon.ico"
          alt="imageprompt"
          width={24}
          height={24}
        />
        <span className="text-xl font-bold">imageprompt</span>
      </Link>

      <button
        className="flex items-center space-x-2 md:hidden ml-auto"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? <Icons.Close/> : <Icons.Menu/>}
      </button>
      {showMobileMenu && items && (
        <MobileNav items={items} menuItemClick={handleMenuItemClick}>
          {children}
        </MobileNav>
      )}
    </div>
  );
}
