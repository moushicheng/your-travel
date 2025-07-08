import { PlayerDomainService } from '../domain/player/player.service';
import { TravelDomainService } from '../domain/travel/travel.service';
import { TravelRecordDomainService, TravelRecord } from '../domain/travel/travel-record.service';

export class TravelSchedulerApplicationService {
  private playerDomain = new PlayerDomainService();
  private travelDomain = new TravelDomainService();
  private travelRecordDomain = new TravelRecordDomainService();

  // 更新所有活跃的旅行（供BullMQ定时任务调用）
  async updateAllActiveTravels(): Promise<void> {
    const activeTravels = await this.travelRecordDomain.getActiveTravels();
    for (const travel of activeTravels) {
      await this.updatePlayerTravel(travel);
    }
  }

  // 更新单个玩家的旅行状态
  private async updatePlayerTravel(travel: TravelRecord): Promise<void> {
    const now = new Date();
    const timeDiff = (now.getTime() - travel.lastUpdateTime.getTime()) / 1000; // 秒数
    const path = await this.travelRecordDomain.getTravelPath(travel.id);
    const currentIndex = travel.currentPathIndex;
    const isLastLeg = currentIndex >= path.length - 1;
    if (isLastLeg) {
      await this.completeTravel(travel);
      return;
    }
    const fromLocationId = path[currentIndex];
    const toLocationId = path[currentIndex + 1];
    // 计算当前路段进度
    const progressIncrement = timeDiff * 0.01;
    let newProgress = travel.progress + progressIncrement;
    // 通过领域服务获取消耗
    const cost = this.travelDomain.getTravelCost(fromLocationId);
    let newEnergy = travel.player.energy - (cost.energy * timeDiff * 0.1);
    let newMood = travel.player.mood - (cost.mood * timeDiff * 0.1);
    // 检查体力/心情
    if (newEnergy <= 0 || newMood <= 0) {
      await this.forceReturnHome(travel);
      return;
    }
    // 到达下一个地点
    if (newProgress >= 1.0) {
      newProgress = 0;
      // 触发地点事件
      await this.triggerTravelEvent(travel, toLocationId);
      // 推进到下一个路段
      await this.travelRecordDomain.updateCurrentPathIndex(travel.id, currentIndex + 1, newProgress, now);
      // 更新玩家体力/心情
      await this.playerDomain.updateStatus(travel.playerId, {
        energy: Math.max(0, newEnergy),
        mood: Math.max(0, newMood),
        currentLocation: toLocationId,
      });
      // 检查是否到达终点
      if (currentIndex + 1 >= path.length - 1) {
        await this.completeTravel(travel);
      }
      return;
    }
    // 正常推进当前路段
    await this.travelRecordDomain.updateProgress(travel.id, newProgress);
    await this.playerDomain.updateStatus(travel.playerId, {
      energy: Math.max(0, newEnergy),
      mood: Math.max(0, newMood),
    });
  }

  // 完成旅行
  private async completeTravel(travel: TravelRecord): Promise<void> {
    await this.travelRecordDomain.completeTravel(travel.id);
    // 通过领域服务更新玩家状态
    await this.playerDomain.updateStatus(travel.playerId, {
      isTraveling: false,
      travelStartTime: null,
    });
    console.log(`玩家 ${travel.playerId} 完成旅行`);
  }

  // 强制回家
  private async forceReturnHome(travel: TravelRecord): Promise<void> {
    await this.travelRecordDomain.forceEndTravel(travel.id);
    await this.playerDomain.updateStatus(travel.playerId, {
      currentLocation: travel.startLocationId,
      isTraveling: false,
      travelStartTime: null,
      energy: 0,
      mood: 0,
    });
    console.log(`玩家 ${travel.playerId} 体力/心情耗尽，强制回家`);
  }

  // 触发旅行事件
  private async triggerTravelEvent(travel: TravelRecord, locationId: number): Promise<void> {
    const events = [
      '你遇到了一只可爱的小动物！',
      '你发现了一朵美丽的花！',
      '你听到远处传来美妙的鸟鸣声！',
      '你看到了一片美丽的风景！',
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    console.log(`玩家 ${travel.playerId} 到达地点${locationId} 事件: ${randomEvent}`);
    await this.playerDomain.updateStatus(travel.playerId, {
      mood: Math.min(100, travel.player.mood + 5),
    });
  }
} 