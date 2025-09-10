import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { i18n } from "~/config/i18n-config";

export async function middleware(request: NextRequest) {
  // Check if i18n is needed
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = i18n.defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}${request.nextUrl.pathname}${request.nextUrl.search}`, request.url)
    );
  }

  // Check authentication for protected routes
  const isProtectedRoute = [
    "/dashboard",
    "/profile", 
    "/settings",
    "/admin",
  ].some(route => pathname.includes(route));

  if (isProtectedRoute) {
    const token = await getToken({ req: request });
    if (!token) {
      // Get the locale from the pathname
      const localeMatch = pathname.match(/^\/([^\/]+)/);
      const locale = localeMatch ? localeMatch[1] : i18n.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico|logo.svg).*)",
    // Optional: only run on root (/) URL
    // '/'
  ]
};
