import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// 创建连接池
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL,
  max: 10,
});

// 使用标准的 Kysely PostgresDialect
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
});
