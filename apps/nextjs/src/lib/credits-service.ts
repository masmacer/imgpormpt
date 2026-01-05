import { db } from "@saasfly/db";
import { getCurrentUser } from "@saasfly/auth";
import { randomUUID } from "crypto";

export interface CreditBalance {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  planName: string;
}

export interface CreditUsageRecord {
  id: string;
  action: string;
  creditsUsed: number;
  description?: string;
  createdAt: Date;
}

export class CreditsService {
  /**
   * 获取用户积分余额（优化版：使用缓存字段）
   */
  static async getUserCredits(userId: string): Promise<CreditBalance | null> {
    try {
      const userCredits = await db
        .selectFrom("UserCredits")
        .selectAll()
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!userCredits) {
        await this.initializeUserCredits(userId);
        return this.getUserCredits(userId);
      }

      const planId = userCredits.planId || "free-plan";
      const creditPlan = await db
        .selectFrom("CreditPlans")
        .selectAll()
        .where("id", "=", planId)
        .executeTakeFirst();

      if (!creditPlan) {
        throw new Error(`Credit plan not found: ${planId}`);
      }

      // ✅ 检查是否需要重置每日计数器
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastReset = new Date(userCredits.dailyResetDate);
      lastReset.setHours(0, 0, 0, 0);

      let dailyUsed = userCredits.dailyUsedCount;

      if (today > lastReset) {
        // 新的一天，重置计数器
        await db
          .updateTable("UserCredits")
          .set({
            dailyUsedCount: 0,
            dailyResetDate: today,
          })
          .where("userId", "=", userId)
          .execute();
        
        dailyUsed = 0;
        console.log(`✅ Daily counter reset for user ${userId}`);
      }

      // ✅ 直接使用缓存的每日使用量，无需查询 CreditUsage 表
      const dailyRemaining = creditPlan.dailyCredits > 0 
        ? Math.max(0, creditPlan.dailyCredits - dailyUsed)
        : userCredits.availableCredits;

      return {
        totalCredits: userCredits.totalCredits,
        usedCredits: userCredits.usedCredits,
        availableCredits: userCredits.availableCredits,
        dailyLimit: creditPlan.dailyCredits,
        dailyUsed,
        dailyRemaining,
        planName: creditPlan.planName
      };

    } catch (error) {
      console.error("Error getting user credits:", error);
      return null;
    }
  }

  /**
   * 检查用户是否有足够积分
   */
  static async hasEnoughCredits(userId: string, creditsNeeded: number = 1): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    if (!credits) return false;

    // 检查每日限制
    if (credits.dailyLimit > 0) {
      return credits.dailyRemaining >= creditsNeeded;
    }

    // 检查总积分
    return credits.availableCredits >= creditsNeeded;
  }

  /**
   * 消费积分（优化版：同时更新缓存）
   */
  static async consumeCredits(
    userId: string, 
    action: string, 
    creditsUsed: number = 1, 
    description?: string
  ): Promise<boolean> {
    try {
      const hasCredits = await this.hasEnoughCredits(userId, creditsUsed);
      if (!hasCredits) {
        console.log(`❌ Insufficient credits for user ${userId}`);
        return false;
      }

      await db.transaction().execute(async (trx) => {
        // ✅ 同时更新三个字段
        await trx
          .updateTable("UserCredits")
          .set((eb) => ({
            usedCredits: eb("usedCredits", "+", creditsUsed),
            availableCredits: eb("availableCredits", "-", creditsUsed),
            dailyUsedCount: eb("dailyUsedCount", "+", creditsUsed),  // ✅ 同步更新每日计数
            updatedAt: new Date()
          }))
          .where("userId", "=", userId)
          .execute();

        // 记录使用历史（仅用于展示）
        await trx
          .insertInto("CreditUsage")
          .values({
            id: randomUUID(),
            userId,
            action,
            creditsUsed,
            description,
            createdAt: new Date()
          })
          .execute();
      });

      console.log(`✅ Consumed ${creditsUsed} credits for user ${userId} (action: ${action})`);
      return true;

    } catch (error) {
      console.error("Error consuming credits:", error);
      return false;
    }
  }

  /**
   * 增加积分（支持自定义 action）
   */
  static async addCredits(
    userId: string, 
    creditsToAdd: number, 
    description?: string,
    action: string = 'credit_added'  // ✅ 支持自定义 action
  ): Promise<boolean> {
    try {
      await db.transaction().execute(async (trx) => {
        // 更新用户积分
        await trx
          .updateTable("UserCredits")
          .set((eb) => ({
            totalCredits: eb("totalCredits", "+", creditsToAdd),
            availableCredits: eb("availableCredits", "+", creditsToAdd),
            updatedAt: new Date()
          }))
          .where("userId", "=", userId)
          .execute();

        // 记录历史（负数表示增加）
        await trx
          .insertInto("CreditUsage")
          .values({
            id: randomUUID(),
            userId,
            action,  // ✅ 使用传入的 action
            creditsUsed: -creditsToAdd,  // 负数表示增加
            description,
            createdAt: new Date()
          })
          .execute();
      });

      console.log(`✅ Added ${creditsToAdd} credits to user ${userId}`);
      return true;

    } catch (error) {
      console.error("Error adding credits:", error);
      return false;
    }
  }

  /**
   * 获取用户使用历史（仅展示，不用于计算）
   */
  static async getUserUsageHistory(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<CreditUsageRecord[]> {
    try {
      const records = await db
        .selectFrom("CreditUsage")
        .selectAll()
        .where("userId", "=", userId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return records.map(record => ({
        id: record.id.toString(),
        action: record.action,
        creditsUsed: record.creditsUsed,
        description: record.description || undefined,
        createdAt: record.createdAt
      }));

    } catch (error) {
      console.error("Error getting usage history:", error);
      return [];
    }
  }

  /**
   * 获取当前用户积分
   */
  static async getCurrentUserCredits(): Promise<CreditBalance | null> {
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        return null;
      }
      return this.getUserCredits(user.id);
    } catch (error) {
      console.error("Error getting current user credits:", error);
      return null;
    }
  }

  /**
   * 初始化用户积分
   */
  private static async initializeUserCredits(userId: string): Promise<void> {
    try {
      const existing = await db
        .selectFrom("UserCredits")
        .select(["id"])
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existing) {
        console.log(`User ${userId} already has credits record`);
        return;
      }

      const userExists = await db
        .selectFrom("User")
        .select(["id"])
        .where("id", "=", userId)
        .executeTakeFirst();

      if (!userExists) {
        console.error(`User ${userId} does not exist in User table`);
        throw new Error(`User ${userId} not found`);
      }

      const planId = "free-plan";
      const creditPlan = await db
        .selectFrom("CreditPlans")
        .selectAll()
        .where("id", "=", planId)
        .executeTakeFirst();

      const initialCredits = creditPlan?.monthlyCredits || 300;

      // ✅ 包含新字段
      await db
        .insertInto("UserCredits")
        .values({
          id: randomUUID(),
          userId,
          totalCredits: initialCredits,
          usedCredits: 0,
          availableCredits: initialCredits,
          planId: planId,
          dailyUsedCount: 0,        // ✅ 初始化
          dailyResetDate: new Date(), // ✅ 初始化
          lastResetDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .execute();

      console.log(`✅ Successfully initialized credits for user ${userId}`);

    } catch (error) {
      console.error("Error initializing user credits:", error);
      throw error;
    }
  }
}