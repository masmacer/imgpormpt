-- 积分配置表
CREATE TABLE IF NOT EXISTS "CreditPlans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planName" TEXT NOT NULL,
    "dailyCredits" INTEGER NOT NULL DEFAULT 0,
    "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 用户积分表
CREATE TABLE IF NOT EXISTS "UserCredits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "availableCredits" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId")
);

-- 积分使用记录表
CREATE TABLE IF NOT EXISTS "CreditUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL, -- 'generate_prompt', 'api_call', etc.
    "creditsUsed" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "metadata" JSON,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "UserCredits_userId_idx" ON "UserCredits"("userId");
CREATE INDEX IF NOT EXISTS "CreditUsage_userId_idx" ON "CreditUsage"("userId");
CREATE INDEX IF NOT EXISTS "CreditUsage_createdAt_idx" ON "CreditUsage"("createdAt");

-- 插入默认积分计划
INSERT OR REPLACE INTO "CreditPlans" ("id", "planName", "dailyCredits", "monthlyCredits") VALUES
('free', 'Free Plan', 10, 300),
('pro', 'Pro Plan', 0, 10000), -- 0 表示无每日限制
('enterprise', 'Enterprise Plan', 0, 100000);