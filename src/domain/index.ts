// Trait（特性）
export class Trait {
  constructor(
    public id: number,
    public name: string,
    public description: string
  ) {}
}

// SpecialItem（特殊物品）
export class SpecialItem {
  constructor(
    public id: number,
    public name: string,
    public description: string
  ) {}
}

// PlayerTrait（玩家已获得特性）
export class PlayerTrait {
  constructor(
    public playerId: number,
    public traitId: number,
    public obtainedAt: Date
  ) {}
}

// PlayerSpecialItem（玩家已获得特殊物品）
export class PlayerSpecialItem {
  constructor(
    public playerId: number,
    public itemId: number,
    public quantity: number,
    public obtainedAt: Date
  ) {}
}

// Player（玩家）
export class Player {
  constructor(
    public id: number,
    public qqId: string,
    public nickname: string,
    public level: number,
    public exp: number,
    public mood: number,
    public energy: number,
    public currentLocation: number,
    public isTraveling: boolean,
    public travelStartTime: Date | null,
    public unlockedLocations: number[],
    public createdAt: Date
  ) {}
}

// Location（地点）
export class Location {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public unlockLevel: number,
    public isActive: boolean
  ) {}
}

// Item（物品）
export class Item {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public rarity: string,
    public locationId: number,
    public category: string
  ) {}
}

export * from './player/player.service';
export * from './travel/travel.service';
export * from './item/item.service';
export * from './inventory/inventory.service';
export * from './location/location.service';
export * from './travel/travel-record.service';
