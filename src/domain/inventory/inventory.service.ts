import { prisma } from '../../infrastructure/db';

export class InventoryDomainService {
  // 查询玩家背包所有物品
  async getPlayerInventory(playerId: number) {
    return prisma.playerItem.findMany({ where: { playerId }, include: { item: true } });
  }

  // 给玩家添加物品（背包叠加逻辑）
  async addItem(playerId: number, itemId: number, quantity: number = 1) {
    const existing = await prisma.playerItem.findFirst({ where: { playerId, itemId } });
    if (existing) {
      return prisma.playerItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      return prisma.playerItem.create({
        data: { playerId, itemId, quantity },
      });
    }
  }

  // 消耗玩家物品
  async consumeItem(playerId: number, itemId: number, quantity: number = 1) {
    const existing = await prisma.playerItem.findFirst({ where: { playerId, itemId } });
    if (!existing || existing.quantity < quantity) {
      throw new Error('物品数量不足');
    }
    if (existing.quantity === quantity) {
      return prisma.playerItem.delete({ where: { id: existing.id } });
    } else {
      return prisma.playerItem.update({
        where: { id: existing.id },
        data: { quantity: { decrement: quantity } },
      });
    }
  }

  // 检查玩家是否拥有某个物品
  async hasItem(playerId: number, itemId: number, quantity: number = 1): Promise<boolean> {
    const existing = await prisma.playerItem.findFirst({ where: { playerId, itemId } });
    return !!existing && existing.quantity >= quantity;
  }
} 