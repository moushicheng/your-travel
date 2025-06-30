import { Item } from '../domain/index';

// ItemService：物品相关逻辑
export class ItemService {
  // 查询背包物品
  getPlayerItems(playerId: number): Item[] {
    return [new Item(1, '树叶', '普通的树叶', '普通', 1, '普通物品')];
  }
  // 查询收集册
  getPlayerCollection(playerId: number): Item[] {
    return [];
  }
} 