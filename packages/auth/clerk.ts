// This file is deprecated - functionality moved to nextauth.ts
// Kept for backward compatibility during migration

import { getCurrentUser } from "./nextauth";

export async function getSessionUser() {
  return await getCurrentUser();
}
