import { prisma } from '../../infrastructure/db';

export class ItemDomainService {
  // 获取物品详情
  async getItemById(itemId: number) {
    return prisma.item.findUnique({ where: { id: itemId } });
  }

  // 查询所有物品定义
  async getAllItems() {
    return prisma.item.findMany();
  }

  // 可扩展：生成新物品、物品属性计算等
} 