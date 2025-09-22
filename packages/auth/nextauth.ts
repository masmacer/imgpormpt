import { getServerSession, NextAuthOptions, User } from "next-auth";
import { KyselyAdapter } from "@auth/kysely-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import crypto from "crypto";

import { MagicLinkEmail, resend, siteConfig } from "@saasfly/common";

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

import { db } from "./db";
import { db as mainDb } from "@saasfly/db";
import { env } from "./env.mjs";

type UserId = string;
type IsAdmin = boolean;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      isAdmin: IsAdmin;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    isAdmin: IsAdmin;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // 设置会话最大存活时间为30天（默认是30天）
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // 设置会话更新间隔为1天
    updateAge: 24 * 60 * 60, // 1 day
  },
  pages: {
    signIn: "/login",
    error: "/auth/error", 
  },

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  adapter: KyselyAdapter(db),

  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      httpOptions: { timeout: 15000 },
    }),
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        const user = await db
          .selectFrom("User")
          .select(["name", "emailVerified"])
          .where("email", "=", identifier)
          .executeTakeFirst();
        const userVerified = !!user?.emailVerified;
        const authSubject = userVerified
          ? `Sign-in link for ${(siteConfig as { name: string }).name}`
          : "Activate your account";

        try {
          await resend.emails.send({
            from: env.RESEND_FROM || "noreply@example.com",
            to: identifier,
            subject: authSubject,
            react: MagicLinkEmail({
              firstName: user?.name ?? "",
              actionUrl: url,
              mailType: userVerified ? "login" : "register",
              siteName: (siteConfig as { name: string }).name,
            }),
            // Set this to prevent Gmail from threading emails.
            // More info: https://resend.com/changelog/custom-email-headers
            headers: {
              "X-Entity-Ref-ID": new Date().getTime() + "",
            },
          });
        } catch (error) {
          console.log(error);
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 如果是相对路径，添加 baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 如果是同域名的绝对路径，直接返回
      else if (new URL(url).origin === baseUrl) return url;
      // 默认跳转到首页
      return baseUrl;
    },
    session({ token, session }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
          session.user.isAdmin = token.isAdmin as boolean;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      const email = token?.email ?? "";
      const dbUser = await db
        .selectFrom("User")
        .where("email", "=", email)
        .selectAll()
        .executeTakeFirst();
      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      // 检查并初始化用户积分（异步，不阻塞登录）
      if (dbUser.id) {
        // 使用异步方式初始化积分，避免阻塞登录流程
        setImmediate(async () => {
          try {
            const hasCredits = await mainDb
              .selectFrom("UserCredits")
              .select(["id"])
              .where("userId", "=", dbUser.id)
              .executeTakeFirst();

            if (!hasCredits) {
              console.log(`Auto-initializing credits for user: ${dbUser.id}`);
              
              const freePlan = await mainDb
                .selectFrom("CreditPlans")
                .selectAll()
                .where("id", "=", "free-plan")
                .executeTakeFirst();

              if (freePlan) {
                await mainDb
                  .insertInto("UserCredits")
                  .values({
                    id: crypto.randomUUID(),
                    userId: dbUser.id,
                    totalCredits: freePlan.monthlyCredits,
                    usedCredits: 0,
                    availableCredits: freePlan.monthlyCredits,
                    planId: "free-plan",
                    lastResetDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                  })
                  .execute();
                
                console.log(`Successfully auto-initialized credits for user: ${dbUser.id}`);
              }
            }
          } catch (error) {
            console.error(`Failed to auto-initialize credits for user ${dbUser.id}:`, error);
          }
        });
      }

      let isAdmin = false;
      if (env.ADMIN_EMAIL) {
        const adminEmails = env.ADMIN_EMAIL.split(",");
        if (email) {
          isAdmin = adminEmails.includes(email);
        }
      }
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        isAdmin: isAdmin,
      };
    },
  },
  debug: env.IS_DEBUG === "true",
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
