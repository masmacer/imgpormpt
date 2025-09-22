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
   * 获取用户积分余额
   */
  static async getUserCredits(userId: string): Promise<CreditBalance | null> {
    try {
      // 获取用户积分信息
      let userCredits = await db
        .selectFrom("UserCredits")
        .selectAll()
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!userCredits) {
        // 如果用户没有积分记录，初始化
        console.log(`Initializing credits for new user: ${userId}`);
        await this.initializeUserCredits(userId);
        
        // 重新获取，如果还是失败就返回默认值
        userCredits = await db
          .selectFrom("UserCredits")
          .selectAll()
          .where("userId", "=", userId)
          .executeTakeFirst();
        
        if (!userCredits) {
          console.error(`Failed to initialize credits for user: ${userId}`);
          // 返回默认的积分信息而不是null
          return {
            totalCredits: 300,
            usedCredits: 0,
            availableCredits: 300,
            dailyLimit: 10,
            dailyUsed: 0,
            dailyRemaining: 10,
            planName: "Free Plan"
          };
        }
      }

      // 获取用户积分计划，默认为免费计划
      let planId = "free-plan";
      
      // 尝试从UserCredits表获取planId
      if (userCredits.planId) {
        planId = userCredits.planId;
      }
      
      // 获取计划的积分配置
      const creditPlan = await db
        .selectFrom("CreditPlans")
        .selectAll()
        .where("id", "=", planId)
        .executeTakeFirst();

      if (!creditPlan) {
        throw new Error(`Credit plan not found: ${planId}`);
      }

      // 计算今日已使用积分
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dailyUsage = await db
        .selectFrom("CreditUsage")
        .select((eb) => [eb.fn.sum("creditsUsed").as("total")])
        .where("userId", "=", userId)
        .where("createdAt", ">=", today)
        .executeTakeFirst();

      const dailyUsed = Number(dailyUsage?.total || 0);
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
   * 消费积分
   */
  static async consumeCredits(
    userId: string, 
    action: string, 
    creditsUsed: number = 1, 
    description?: string
  ): Promise<boolean> {
    try {
      // 检查是否有足够积分
      const hasCredits = await this.hasEnoughCredits(userId, creditsUsed);
      if (!hasCredits) {
        return false;
      }

      // 开始事务
      await db.transaction().execute(async (trx) => {
        // 更新用户积分
        await trx
          .updateTable("UserCredits")
          .set((eb) => ({
            usedCredits: eb("usedCredits", "+", creditsUsed),
            availableCredits: eb("availableCredits", "-", creditsUsed),
            updatedAt: new Date()
          }))
          .where("userId", "=", userId)
          .execute();

        // 记录使用历史
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

      return true;

    } catch (error) {
      console.error("Error consuming credits:", error);
      return false;
    }
  }

  /**
   * 添加积分
   */
  static async addCredits(userId: string, creditsToAdd: number, description?: string): Promise<boolean> {
    try {
      await db
        .updateTable("UserCredits")
        .set((eb) => ({
          totalCredits: eb("totalCredits", "+", creditsToAdd),
          availableCredits: eb("availableCredits", "+", creditsToAdd),
          updatedAt: new Date()
        }))
        .where("userId", "=", userId)
        .execute();

      // 记录积分添加历史
      await db
        .insertInto("CreditUsage")
        .values({
          id: randomUUID(),
          userId,
          action: "credit_added",
          creditsUsed: -creditsToAdd, // 负数表示添加
          description: description || "Credits added",
          createdAt: new Date()
        })
        .execute();

      return true;

    } catch (error) {
      console.error("Error adding credits:", error);
      return false;
    }
  }

  /**
   * 获取用户使用历史
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
   * 初始化用户积分
   */
  private static async initializeUserCredits(userId: string): Promise<void> {
    try {
      // 检查用户是否已有积分记录（避免重复创建）
      const existing = await db
        .selectFrom("UserCredits")
        .select(["id"])
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existing) {
        console.log(`User ${userId} already has credits record`);
        return;
      }

      // 验证用户是否存在
      const userExists = await db
        .selectFrom("User")
        .select(["id"])
        .where("id", "=", userId)
        .executeTakeFirst();

      if (!userExists) {
        console.error(`User ${userId} does not exist in User table`);
        throw new Error(`User ${userId} not found`);
      }

      // 默认使用免费计划
      const planId = "free-plan";
      
      // 获取计划的积分配置
      const creditPlan = await db
        .selectFrom("CreditPlans")
        .selectAll()
        .where("id", "=", planId)
        .executeTakeFirst();

      const initialCredits = creditPlan?.monthlyCredits || 300; // 默认300积分

      // 创建用户积分记录
      await db
        .insertInto("UserCredits")
        .values({
          id: randomUUID(),
          userId,
          totalCredits: initialCredits,
          usedCredits: 0,
          availableCredits: initialCredits,
          planId: planId,
          lastResetDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .execute();

      console.log(`Successfully initialized credits for user ${userId}`);

    } catch (error) {
      console.error(`Error initializing user credits for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 重置月度积分（用于定时任务）
   */
  static async resetMonthlyCredits(): Promise<void> {
    try {
      // 获取所有需要重置的用户
      const users = await db
        .selectFrom("UserCredits")
        .select(["userId"])
        .execute();

      for (const user of users) {
        await this.initializeUserCredits(user.userId);
      }

    } catch (error) {
      console.error("Error resetting monthly credits:", error);
      throw error;
    }
  }
}