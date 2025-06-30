import { prisma } from '../../infrastructure/db';
import { Player } from '../index';

export class PlayerDomainService {
  // 注册新玩家
  async register(qqId: string, nickname: string): Promise<Player> {
    const player = await prisma.player.create({
      data: {
        qqId,
        nickname,
        level: 1,
        exp: 0,
        mood: 100,
        energy: 5,
        currentLocation: 1,
        isTraveling: false,
        travelStartTime: null,
        createdAt: new Date(),
      },
    });
    return player as Player;
  }

  // 通过ID查找玩家
  async findById(id: number): Promise<Player | null> {
    return (await prisma.player.findUnique({ where: { id } })) as Player | null;
  }

  // 通过QQ号查找玩家
  async findByQQId(qqId: string): Promise<Player | null> {
    return (await prisma.player.findUnique({ where: { qqId } })) as Player | null;
  }

  // 玩家升级
  async levelUp(playerId: number): Promise<Player | null> {
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { level: { increment: 1 } },
    });
    return player as Player;
  }

  // 更新玩家心情、体力等属性
  async updateStatus(playerId: number, data: Partial<Player>): Promise<Player | null> {
    const player = await prisma.player.update({
      where: { id: playerId },
      data,
    });
    return player as Player;
  }
} 