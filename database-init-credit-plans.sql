-- 初始化积分计划数据
-- 这个脚本需要在数据库中执行，确保基础的积分计划配置存在

-- 插入基础的积分计划
INSERT OR REPLACE INTO "CreditPlans" ("id", "planName", "dailyCredits", "monthlyCredits", "description", "createdAt", "updatedAt") VALUES
('free-plan', 'Free Plan', 10, 300, 'Free tier with daily limits', datetime('now'), datetime('now')),
('pro-plan', 'Pro Plan', 0, 10000, 'Professional tier with unlimited daily usage', datetime('now'), datetime('now')),
('credits-pack', 'Credits Pack', 0, 100, 'One-time purchase credits pack', datetime('now'), datetime('now'));

-- 验证插入结果
SELECT * FROM "CreditPlans";