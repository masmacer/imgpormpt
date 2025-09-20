import { db } from "@saasfly/db";
import { getCurrentUser } from "@saasfly/auth";

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
      const userCredits = await db
        .selectFrom("UserCredits")
        .selectAll()
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!userCredits) {
        // 如果用户没有积分记录，初始化
        await this.initializeUserCredits(userId);
        return await this.getUserCredits(userId);
      }

      // 获取用户订阅计划
      const customer = await db
        .selectFrom("Customer")
        .select(["plan"])
        .where("authUserId", "=", userId)
        .executeTakeFirst();

      const planName = customer?.plan || "FREE";
      
      // 获取计划的积分配置
      const creditPlan = await db
        .selectFrom("CreditPlans")
        .selectAll()
        .where("id", "=", planName.toLowerCase())
        .executeTakeFirst();

      if (!creditPlan) {
        throw new Error(`Credit plan not found: ${planName}`);
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
            id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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
      // 获取用户订阅计划
      const customer = await db
        .selectFrom("Customer")
        .select(["plan"])
        .where("authUserId", "=", userId)
        .executeTakeFirst();

      const planName = customer?.plan || "FREE";
      
      // 获取计划的积分配置
      const creditPlan = await db
        .selectFrom("CreditPlans")
        .selectAll()
        .where("id", "=", planName.toLowerCase())
        .executeTakeFirst();

      const initialCredits = creditPlan?.monthlyCredits || 300; // 默认300积分

      // 创建用户积分记录
      await db
        .insertInto("UserCredits")
        .values({
          id: crypto.randomUUID(),
          userId,
          totalCredits: initialCredits,
          usedCredits: 0,
          availableCredits: initialCredits,
          lastResetDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .execute();

    } catch (error) {
      console.error("Error initializing user credits:", error);
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