import { PlayerDomainService } from '../domain/player/player.service';
import { TravelDomainService } from '../domain/travel/travel.service';
import { prisma } from '../infrastructure/db';

// TravelApplicationService：旅行相关逻辑
export class TravelApplicationService {
  private playerDomain = new PlayerDomainService();
  private travelDomain = new TravelDomainService();

  // 出门旅行
  async startTravel(playerId: number, locationId: number): Promise<{ success: boolean; message: string }> {
    const player = await this.playerDomain.findById(playerId);
    if (!player) return { success: false, message: '玩家不存在' };
    if (!this.travelDomain.canTravel({ energy: player.energy, mood: player.mood })) {
      return { success: false, message: '体力或心情不足，无法旅行' };
    }
    const cost = this.travelDomain.getTravelCost(locationId);
    await this.playerDomain.updateStatus(playerId, {
      isTraveling: true,
      currentLocation: locationId,
      travelStartTime: new Date(),
      energy: player.energy - cost.energy,
      mood: player.mood - cost.mood,
    });
    return { success: true, message: '旅行开始' };
  }

  // 回家结算
  async endTravel(playerId: number): Promise<{ success: boolean; message: string; rewards?: any[] }> {
    const player = await this.playerDomain.findById(playerId);
    if (!player || !player.isTraveling) return { success: false, message: '玩家未在旅行中' };
    // 计算奖励
    const rewardItemIds = this.travelDomain.calculateTravelRewards(player.currentLocation, player.level);
    const rewards = [];
    for (const itemId of rewardItemIds) {
      // 发放物品（背包叠加逻辑可扩展）
      await prisma.playerItem.create({
        data: { playerId, itemId, quantity: 1 },
      });
      const item = await prisma.item.findUnique({ where: { id: itemId } });
      if (item) rewards.push(item);
    }
    // 更新玩家状态
    await this.playerDomain.updateStatus(playerId, {
      isTraveling: false,
      travelStartTime: null,
    });
    return { success: true, message: '旅行结束，获得奖励', rewards };
  }

  // 查询旅行状态
  async getTravelStatus(playerId: number) {
    const player = await this.playerDomain.findById(playerId);
    if (!player) return { isTraveling: false };
    return {
      isTraveling: player.isTraveling,
      locationId: player.currentLocation,
      startTime: player.travelStartTime,
    };
  }
} 