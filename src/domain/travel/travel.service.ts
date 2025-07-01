// 旅行领域服务：只封装旅行相关规则和算法，不操作其他聚合根，不依赖prisma

export class TravelDomainService {
  /**
   * 计算旅行奖励（示例：根据地点和玩家状态返回奖励物品ID列表）
   * @param locationId 地点ID
   * @param playerLevel 玩家等级
   * @returns 奖励物品ID数组
   */
  calculateTravelRewards(locationId: number, playerLevel: number): number[] {
    // 这里只做简单示例，实际可根据地点、等级、特性等复杂计算
    if (locationId === 1) {
      // 森林
      return [1]; // 假设1号物品
    } else if (locationId === 2) {
      // 海滩
      return [2];
    }
    return [1];
  }

  /**
   * 判断是否可以旅行（如体力、心情等）
   * @param playerStatus 玩家状态
   * @returns 是否可旅行
   */
  canTravel(playerStatus: { energy: number; mood: number }): boolean {
    return playerStatus.energy > 0 && playerStatus.mood > 0;
  }

  /**
   * 计算旅行消耗（如体力、心情）
   * @param locationId 地点ID
   * @returns 消耗对象
   */
  getTravelCost(locationId: number): { energy: number; mood: number } {
    // 示例：不同地点消耗不同
    if (locationId === 1) return { energy: 1, mood: 5 };
    if (locationId === 2) return { energy: 2, mood: 8 };
    return { energy: 1, mood: 5 };
  }

  /**
   * 计算旅行时长（可选）
   */
  getTravelDuration(locationId: number, playerLevel: number): number {
    // 示例：基础30分钟，等级越高越快
    let base = 30;
    if (locationId === 2) base = 40;
    return Math.max(10, base - playerLevel);
  }
}

export interface TravelReward {
  itemId: number;
  quantity: number;
  rarity: '普通' | '稀有' | '传说';
  description?: string;
} 