import { prisma } from '../../infrastructure/db';

export interface TravelRecord {
  id: number;
  playerId: number;
  mapId: number;
  startLocationId: number;
  endLocationId: number;
  currentPathIndex: number;
  progress: number;
  startTime: Date;
  lastUpdateTime: Date;
  isActive: boolean;
  player?: any;
  map?: any;
}

export class TravelRecordDomainService {
  // 获取所有活跃的旅行记录
  async getActiveTravels(): Promise<TravelRecord[]> {
    return prisma.playerTravel.findMany({
      where: { isActive: true },
      include: {
        player: true,
        map: true,
      }
    });
  }

  // 获取旅行路径（返回地点ID数组，按顺序）
  async getTravelPath(travelId: number): Promise<number[]> {
    const pathRecords = await prisma.travelPath.findMany({
      where: { travelId },
      orderBy: { pathIndex: 'asc' },
    });
    return pathRecords.map(p => p.locationId);
  }

  // 更新旅行进度
  async updateProgress(travelId: number, progress: number): Promise<void> {
    await prisma.playerTravel.update({
      where: { id: travelId },
      data: {
        progress,
        lastUpdateTime: new Date(),
      }
    });
  }

  // 更新当前路径索引和进度
  async updateCurrentPathIndex(travelId: number, newIndex: number, progress: number, lastUpdateTime: Date): Promise<void> {
    await prisma.playerTravel.update({
      where: { id: travelId },
      data: {
        currentPathIndex: newIndex,
        progress,
        lastUpdateTime,
      }
    });
  }

  // 完成旅行
  async completeTravel(travelId: number): Promise<void> {
    await prisma.playerTravel.update({
      where: { id: travelId },
      data: { isActive: false }
    });
  }

  // 强制结束旅行
  async forceEndTravel(travelId: number): Promise<void> {
    await prisma.playerTravel.update({
      where: { id: travelId },
      data: { isActive: false }
    });
  }
} 