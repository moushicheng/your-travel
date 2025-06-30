import { Player, Location } from '../domain/index';

// LocationService：地点相关逻辑
export class LocationService {
  // 查询所有可前往地点
  getAvailableLocations(player: Player): Location[] {
    return [
      new Location(1, '森林', '郁郁葱葱的森林', 1, true),
      new Location(2, '海滩', '阳光明媚的海滩', 2, true)
    ];
  }
  // 解锁新地点
  unlockLocation(player: Player, locationId: number): Player {
    if (!player.unlockedLocations.includes(locationId)) {
      player.unlockedLocations.push(locationId);
    }
    return player;
  }
} 