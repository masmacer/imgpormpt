import type { NextRequest } from "next/server";
import {initTRPC, TRPCError} from "@trpc/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";

import { authOptions } from "@saasfly/auth/nextauth";

import { transformer } from "./transformer";

interface CreateContextOptions {
  req?: NextRequest;
  session?: any;
}

export const createTRPCContext = async (opts: {
  headers: Headers;
  session?: any;
}) => {
  const session = opts.session || await getServerSession(authOptions);
  return {
    userId: session?.user?.id,
    session,
    ...opts,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<TRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Make ctx.userId non-nullable in protected procedures
  return next({ ctx: { userId: ctx.userId } });
});

export const protectedProcedure = procedure.use(isAuthed);