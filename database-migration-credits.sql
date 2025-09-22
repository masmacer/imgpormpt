-- 执行数据库迁移，创建积分管理所需的表和索引
-- 这个脚本确保您的数据库包含所有必要的表结构

-- 创建积分计划表（如果不存在）
CREATE TABLE IF NOT EXISTS "CreditPlans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planName" TEXT NOT NULL UNIQUE,
    "dailyCredits" INTEGER NOT NULL DEFAULT 0,
    "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户积分表（如果不存在）
CREATE TABLE IF NOT EXISTS "UserCredits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "availableCredits" INTEGER NOT NULL DEFAULT 0,
    "planId" TEXT,
    "lastResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("planId") REFERENCES "CreditPlans"("id") ON DELETE SET NULL
);

-- 创建积分使用记录表（如果不存在）
CREATE TABLE IF NOT EXISTS "CreditUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS "UserCredits_userId_idx" ON "UserCredits"("userId");
CREATE INDEX IF NOT EXISTS "UserCredits_planId_idx" ON "UserCredits"("planId");
CREATE INDEX IF NOT EXISTS "CreditUsage_userId_idx" ON "CreditUsage"("userId");
CREATE INDEX IF NOT EXISTS "CreditUsage_createdAt_idx" ON "CreditUsage"("createdAt");
CREATE INDEX IF NOT EXISTS "CreditUsage_action_idx" ON "CreditUsage"("action");

-- 验证表是否创建成功
.tables

-- 显示表结构
.schema CreditPlans
.schema UserCredits  
.schema CreditUsage