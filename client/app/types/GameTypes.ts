export type ResourceType = 'blue' | 'red' | 'gray';

export type RewardType = 'black_square' | 'orange_triangle';

export interface ResourceBars {
  blue: number;
  red: number;
  gray: number;
}

export interface RewardBars {
  black_square: number;
  orange_triangle: number;
}

export type ItemType = 'generator' | 'element' | 'resource';

export interface Item {
  id: string;
  type: ItemType;
  level: number;
  resourceType?: ResourceType; // для генераторов и ресурсов
  addedAt?: number; // секунда появления (0-59)
}

export interface Cell {
  x: number;
  y: number;
  item: Item | null;
}

export type Board = Cell[][]; // 7x7 