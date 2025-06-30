// Конфиг игровых механик
export const GAME_CONFIG = {
  BOARD_WIDTH: 7,
  BOARD_HEIGHT: 7,
  INITIAL_RESOURCES: {
    blue: 1000,
    red: 1000,
    gray: 1000,
  },
  INITIAL_REWARDS: {
    black_square: 0,
    orange_triangle: 0,
  },
  MISSION_REWARDS: {
    black_square: 1, // за каждое выполненное задание
    orange_triangle: 0, // пока не используется
  },
  GENERATOR_COST: (level: number) => level * 10, // 10, 20, 30
  GENERATOR_ELEMENT_PROBABILITIES: {
    1: [{ level: 1, chance: 1.0 }],
    2: [
      { level: 1, chance: 0.6 },
      { level: 2, chance: 0.4 },
    ],
    3: [
      { level: 1, chance: 0.1 },
      { level: 2, chance: 0.5 },
      { level: 3, chance: 0.4 },
    ],
  } as Record<number, { level: number; chance: number }[]>,
  RESOURCE_GENERATION_INTERVALS: [10, 20, 30, 40, 50, 0],
  RESOURCE_PER_ELEMENT: (level: number) => Math.floor((level * 3) / 2),
  MISSIONS: [
    // Простые задания - один элемент
    { id: 1, items: [{ type: 'element', level: 2, resourceType: 'blue' }] },
    { id: 2, items: [{ type: 'element', level: 4, resourceType: 'red' }] },
    { id: 3, items: [{ type: 'element', level: 3, resourceType: 'gray' }] },
    
    // Генераторы
    { id: 4, items: [{ type: 'generator', level: 1, resourceType: 'blue' }] },
    { id: 5, items: [{ type: 'generator', level: 2, resourceType: 'red' }] },
    { id: 6, items: [{ type: 'generator', level: 1, resourceType: 'gray' }] },
    
    // Два элемента одного цвета
    { id: 7, items: [
      { type: 'element', level: 1, resourceType: 'blue' },
      { type: 'element', level: 1, resourceType: 'blue' }
    ]},
    { id: 8, items: [
      { type: 'element', level: 2, resourceType: 'red' },
      { type: 'element', level: 2, resourceType: 'red' }
    ]},
    
    // Два элемента разных цветов
    { id: 9, items: [
      { type: 'element', level: 1, resourceType: 'blue' },
      { type: 'element', level: 1, resourceType: 'red' }
    ]},
    { id: 10, items: [
      { type: 'element', level: 2, resourceType: 'blue' },
      { type: 'element', level: 3, resourceType: 'gray' }
    ]},
    
    // Смешанные задания
    { id: 11, items: [
      { type: 'generator', level: 1, resourceType: 'blue' },
      { type: 'element', level: 2, resourceType: 'red' }
    ]},
    { id: 12, items: [
      { type: 'element', level: 3, resourceType: 'blue' },
      { type: 'generator', level: 2, resourceType: 'gray' },
      { type: 'element', level: 1, resourceType: 'red' }
    ]},
    
    // Сложные задания
    { id: 13, items: [
      { type: 'generator', level: 3, resourceType: 'blue' },
      { type: 'element', level: 4, resourceType: 'red' },
      { type: 'generator', level: 1, resourceType: 'gray' }
    ]},
    { id: 14, items: [
      { type: 'element', level: 5, resourceType: 'blue' },
      { type: 'element', level: 3, resourceType: 'red' },
      { type: 'generator', level: 2, resourceType: 'gray' },
      { type: 'element', level: 2, resourceType: 'blue' }
    ]},
  ],
}; 