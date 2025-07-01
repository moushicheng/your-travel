import { PlayerDomainService } from '../domain/player/player.service';
import { TravelDomainService } from '../domain/travel/travel.service';
import { LocationDomainService } from '../domain/location/location.service';
import { InventoryDomainService } from '../domain/inventory/inventory.service';
import { prisma } from '../infrastructure/db';
import { TravelReward } from '../domain/travel/travel.service';

// TravelApplicationService：旅行相关逻辑
export class TravelApplicationService {
  private playerDomain = new PlayerDomainService();
  private travelDomain = new TravelDomainService();
  private locationDomain = new LocationDomainService();
  private inventoryDomain = new InventoryDomainService();

  // 自动旅行：玩家选择目的地，系统自动规划路线并沿途触发事件
  async autoTravel(playerId: number, destinationId: number): Promise<{ success: boolean; message: string; path?: any[]; events?: any[]; rewards?: any[] }> {
    const player = await this.playerDomain.findById(playerId);
    if (!player) return { success: false, message: '玩家不存在' };
    if (!this.travelDomain.canTravel({ energy: player.energy, mood: player.mood })) {
      return { success: false, message: '体力或心情不足，无法旅行' };
    }
    // 路径规划
    const path = await this.locationDomain.findShortestPath(player.currentLocation, destinationId);
    if (!path.length) return { success: false, message: '目的地不可达' };
    // 沿途事件与消耗
    let energy = player.energy;
    let mood = player.mood;
    const events = [];
    for (let i = 1; i < path.length; i++) {
      const fromId = path[i - 1];
      const toId = path[i];
      const edge = await prisma.edge.findFirst({ where: { fromId, toId, isActive: true } });
      if (!edge) return { success: false, message: '路径中断' };
      // 消耗体力、心情
      energy -= edge.distance;
      mood -= Math.ceil(edge.distance * (edge.eventRate || 0.1));
      // 事件触发（简化：按概率触发）
      if (Math.random() < edge.eventRate) {
        events.push({ fromId, toId, type: 'event', description: '你在路上遇到了一些有趣的事！' });
      }
      if (energy <= 0 || mood <= 0) {
        return { success: false, message: '途中体力或心情耗尽，旅行失败', path: path.slice(0, i + 1), events };
      }
    }
    // 到达终点，结算奖励
    // calculateTravelRewards 返回的是物品ID数组，需要转换为 TravelReward[]
    const rewardIds: number[] = this.travelDomain.calculateTravelRewards(destinationId, player.level);
    const rewards: TravelReward[] = rewardIds.map(id => ({
      itemId: id,
      quantity: 1,
      rarity: '普通',
    }));
    for (const reward of rewards) {
      await this.inventoryDomain.addItem(playerId, reward.itemId, reward.quantity);
    }
    // 更新玩家状态
    await this.playerDomain.updateStatus(playerId, {
      currentLocation: destinationId,
      energy,
      mood,
      isTraveling: false,
      travelStartTime: null,
    });
    return { success: true, message: '旅行完成', path, events, rewards };
  }

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
    const rewards: TravelReward[] = this.travelDomain.calculateTravelRewards(player.currentLocation, player.level);
    const rewardItems = [];
    for (const reward of rewards) {
      await this.inventoryDomain.addItem(playerId, reward.itemId, reward.quantity);
      rewardItems.push(reward);
    }
    // 更新玩家状态
    await this.playerDomain.updateStatus(playerId, {
      isTraveling: false,
      travelStartTime: null,
    });
    return { success: true, message: '旅行结束，获得奖励', rewards: rewardItems };
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