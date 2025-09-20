"use client";

import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";

export function SubscriptionForm(props: {
  hasSubscription: boolean;
  dict: Record<string, string>;
}) {
  // 暂时隐藏价格链接，测试阶段
  return null;
  
  // return (
  //   <Link href="/pricing" className={cn(buttonVariants())}>
  //     {props.hasSubscription
  //       ? props.dict.manage_subscription
  //       : props.dict.upgrade}
  //   </Link>
  // );
}
