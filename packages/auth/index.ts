import { getCurrentUser as getNextAuthUser } from "./nextauth";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

declare global {
  interface CustomJwtSessionClaims {
    user?: User & {
      id: string;
      isAdmin: boolean;
    }
  }
}

export const authOptions = {
  pages: {
    signIn: "/en/login",
  },
}

export async function getCurrentUser() {
  return await getNextAuthUser();
}

export async function getSessionUser() {
  return await getCurrentUser();
}
