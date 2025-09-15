import { createKysely } from "@vercel/postgres-kysely";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// 明确指定连接字符串，并根据环境选择合适的连接方式
export const db = createKysely<DB>({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL
});
