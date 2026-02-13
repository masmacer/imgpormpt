-- 创建 ImageTaskStatus 枚举
DO $$ BEGIN
    CREATE TYPE "ImageTaskStatus" AS ENUM ('PENDING', 'GENERATING', 'SUCCESS', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 创建 ImageGenerationTask 表
CREATE TABLE IF NOT EXISTS "ImageGenerationTask" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "status" "ImageTaskStatus" NOT NULL DEFAULT 'PENDING',
    "imageUrl" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ImageGenerationTask_pkey" PRIMARY KEY ("id")
);

-- 创建唯一约束
CREATE UNIQUE INDEX IF NOT EXISTS "ImageGenerationTask_taskId_key" ON "ImageGenerationTask"("taskId");

-- 创建索引
CREATE INDEX IF NOT EXISTS "ImageGenerationTask_userId_idx" ON "ImageGenerationTask"("userId");
CREATE INDEX IF NOT EXISTS "ImageGenerationTask_taskId_idx" ON "ImageGenerationTask"("taskId");
CREATE INDEX IF NOT EXISTS "ImageGenerationTask_status_idx" ON "ImageGenerationTask"("status");

-- 添加外键（如果需要）
-- 注意：Prisma relationMode = "prisma" 模式下不创建数据库级别的外键
-- 但如果你想要数据库强制约束，可以取消下面的注释：
-- ALTER TABLE "ImageGenerationTask" 
-- ADD CONSTRAINT "ImageGenerationTask_userId_fkey" 
-- FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
