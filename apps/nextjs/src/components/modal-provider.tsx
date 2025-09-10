"use client";

import { SignInModal } from "~/components/sign-in-modal";
// import { SignInClerkModal } from "~/components/sign-in-modal-clerk"; // Removed Clerk modal
import { useMounted } from "~/hooks/use-mounted";

export const ModalProvider = ({ dict }: { dict: Record<string, string> }) => {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <>
      <SignInModal dict={dict} />
      {/* Clerk 相关代码已禁用，切换为 NextAuth-only */}
      {/* <SignInClerkModal dict={dict} /> */}
    </>
  );
};
