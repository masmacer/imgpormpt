-- 在 Supabase SQL Editor 中运行这个脚本
-- 创建积分管理所需的表

-- 1. 创建积分计划表
CREATE TABLE IF NOT EXISTS "CreditPlans" (
  "id" TEXT DEFAULT gen_random_uuid() PRIMARY KEY,
  "planName" TEXT UNIQUE NOT NULL,
  "monthlyCredits" INTEGER NOT NULL,
  "dailyCredits" INTEGER NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. 创建用户积分表
CREATE TABLE IF NOT EXISTS "UserCredits" (
  "id" TEXT DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "totalCredits" INTEGER DEFAULT 0 NOT NULL,
  "usedCredits" INTEGER DEFAULT 0 NOT NULL,
  "availableCredits" INTEGER DEFAULT 0 NOT NULL,
  "planId" TEXT,
  "lastResetDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "UserCredits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserCredits_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CreditPlans"("id") ON DELETE SET NULL
);

-- 3. 创建积分使用记录表
CREATE TABLE IF NOT EXISTS "CreditUsage" (
  "id" TEXT DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "creditsUsed" INTEGER NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "CreditUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS "UserCredits_userId_idx" ON "UserCredits"("userId");
CREATE INDEX IF NOT EXISTS "CreditUsage_userId_idx" ON "CreditUsage"("userId");
CREATE INDEX IF NOT EXISTS "CreditUsage_createdAt_idx" ON "CreditUsage"("createdAt");

-- 5. 插入基础积分计划数据
INSERT INTO "CreditPlans" ("id", "planName", "dailyCredits", "monthlyCredits", "description") VALUES
('free-plan', 'Free Plan', 10, 300, 'Free tier with daily limits'),
('pro-plan', 'Pro Plan', 0, 10000, 'Professional tier with unlimited daily usage'),
('credits-pack', 'Credits Pack', 0, 100, 'One-time purchase credits pack')
ON CONFLICT ("planName") DO NOTHING;

-- 验证创建结果
SELECT 'Tables created successfully' as status;
SELECT * FROM "CreditPlans";