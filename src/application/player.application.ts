import { Player } from '../domain/index';

// PlayerService：玩家相关逻辑
export class PlayerService {
  // 注册新玩家
  register(qqId: string, nickname: string): Player {
    return new Player(
      Date.now(),
      qqId,
      nickname,
      1, // level
      0, // exp
      100, // mood
      5, // energy
      1, // currentLocation
      false, // isTraveling
      null, // travelStartTime
      [1], // unlockedLocations
      new Date()
    );
  }
  // 查询玩家信息
  getPlayerById(id: number): Player | null {
    return null; // 示例，实际应查数据库
  }
} 