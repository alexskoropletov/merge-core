import 'react-native-get-random-values';
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, Pressable } from 'react-native';
import { ResourceBars, Board, Item, RewardBars as RewardBarsType } from '../types/GameTypes';
import { GAME_CONFIG } from '../gameConfig';
import { ResourceBars as ResourceBarsComponent } from '../components/ResourceBars';
import { GameBoard } from '../components/GameBoard';
import { v4 as uuidv4 } from 'uuid';
import { RewardBars as RewardBarsComponent } from '../components/RewardBars';

// Альтернативная функция генерации ID на случай проблем с uuid
function generateId(): string {
  try {
    return uuidv4();
  } catch (error) {
    // Fallback: простая генерация ID
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

const BOARD_WIDTH = GAME_CONFIG.BOARD_WIDTH;
const BOARD_HEIGHT = GAME_CONFIG.BOARD_HEIGHT;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, (_, y) =>
    Array.from({ length: BOARD_WIDTH }, (_, x) => ({ x, y, item: null }))
  );
}

const getInitialBoard = (): Board => {
  const board: Board = Array(BOARD_HEIGHT).fill(null).map((_, y) =>
    Array(BOARD_WIDTH).fill(null).map((_, x) => ({ 
      x, 
      y, 
      item: null 
    }))
  );

  // Размещаем генераторы на стартовом поле
  const generators = [
    { type: 'generator' as const, level: 1, resourceType: 'blue' as const },
    { type: 'generator' as const, level: 2, resourceType: 'blue' as const },
    { type: 'generator' as const, level: 3, resourceType: 'blue' as const },
    { type: 'generator' as const, level: 1, resourceType: 'red' as const },
    { type: 'generator' as const, level: 2, resourceType: 'red' as const },
    { type: 'generator' as const, level: 3, resourceType: 'red' as const },
  ];

  generators.forEach((generator, index) => {
    const x = index % BOARD_WIDTH;
    const y = Math.floor(index / BOARD_WIDTH);
    if (y < BOARD_HEIGHT) {
      board[y][x].item = {
        id: generateId(),
        ...generator,
        addedAt: new Date().getSeconds(),
      };
    }
  });

  return board;
};

const initialResources: ResourceBars = { ...GAME_CONFIG.INITIAL_RESOURCES };

const getFirstEmptyCell = (board: Board): { x: number; y: number } | null => {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (!board[y][x].item) {
        return { x, y };
      }
    }
  }
  return null;
};

// Добавляю функцию поиска ближайшей свободной ячейки к (gx, gy)
function getNearestEmptyCell(board: Board, gx: number, gy: number): { x: number; y: number } | null {
  let minDist = Infinity;
  let nearest: { x: number; y: number } | null = null;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (!board[y][x].item) {
        const dist = Math.abs(gx - x) + Math.abs(gy - y);
        if (dist < minDist) {
          minDist = dist;
          nearest = { x, y };
        }
      }
    }
  }
  return nearest;
}

const getGeneratorCost = (generatorLevel: number): number => {
  return GAME_CONFIG.GENERATOR_COST(generatorLevel);
};

const getElementLevelByGenerator = (generatorLevel: number): number => {
  const random = Math.random();
  const probs = GAME_CONFIG.GENERATOR_ELEMENT_PROBABILITIES[generatorLevel];
  let acc = 0;
  for (const p of probs) {
    acc += p.chance;
    if (random < acc) return p.level;
  }
  return probs[probs.length - 1].level;
};

export const GameScreen: React.FC = () => {
  const [resources, setResources] = useState<ResourceBars>(initialResources);
  const [board, setBoard] = useState<Board>(getInitialBoard());
  const [dragItem, setDragItem] = useState<{ x: number; y: number; item: Item } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ x: number; y: number } | null>(null);
  const [boardLayout, setBoardLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const [resourceAnimations, setResourceAnimations] = useState<{color: string, amount: number, key: string, itemId?: string}[]>([]);
  const [activeResourceItemIds, setActiveResourceItemIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [pitItems, setPitItems] = useState<Item[]>([]);
  const [isDraggingToPit, setIsDraggingToPit] = useState(false);
  const [currentMission, setCurrentMission] = useState(GAME_CONFIG.MISSIONS[0]);
  const [showingMission, setShowingMission] = useState(false);
  const [completedMissionItems, setCompletedMissionItems] = useState<Set<string>>(new Set());
  const [rewards, setRewards] = useState<RewardBarsType>({ ...GAME_CONFIG.INITIAL_REWARDS });

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      const nowSec = new Date().getSeconds();
      const matchSeconds = GAME_CONFIG.RESOURCE_GENERATION_INTERVALS;
      const updatedResources = { ...resources };
      const newAnimations: {color: string, amount: number, key: string, itemId?: string}[] = [];
      const activeIds: string[] = [];
      board.flat().forEach(cell => {
        const item = cell.item;
        if (!item || item.addedAt === undefined || !item.resourceType || item.type !== 'element') return;
        let diff = nowSec - item.addedAt;
        if (diff < 0) diff += 60;
        if (matchSeconds.includes(diff)) {
          const add = GAME_CONFIG.RESOURCE_PER_ELEMENT(item.level);
          updatedResources[item.resourceType] += add;
          newAnimations.push({color: item.resourceType, amount: add, key: item.id + '-' + nowSec, itemId: item.id});
          activeIds.push(item.id);
        }
      });
      setActiveResourceItemIds(activeIds);
      if (newAnimations.length > 0) {
        setResourceAnimations(prev => [...prev, ...newAnimations]);
        setTimeout(() => {
          setResourceAnimations(prev => prev.filter(anim => !newAnimations.some(na => na.key === anim.key)));
        }, 1500);
      }
      setResources(updatedResources);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [board, resources]);

  // Функция для определения ячейки по координатам
  const getCellFromCoordinates = (absoluteX: number, absoluteY: number) => {
    if (!boardLayout) return null;
    
    const cellSize = boardLayout.width / BOARD_WIDTH;
    
    const relativeX = absoluteX - boardLayout.x;
    const relativeY = absoluteY - boardLayout.y;
    
    const cellX = Math.floor(relativeX / cellSize);
    const cellY = Math.floor(relativeY / cellSize);
    
    // Проверяем границы доски
    if (cellX >= 0 && cellX < BOARD_WIDTH && cellY >= 0 && cellY < BOARD_HEIGHT) {
      return { x: cellX, y: cellY };
    }
    
    return null;
  };

  // Обработчик измерения доски
  const handleBoardLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setBoardLayout({ x, y, width, height });
  };

  // Начало перетаскивания
  const handleDragStart = (x: number, y: number) => {
    const item = board[y][x].item;
    if (item) {
      setDragItem({ x, y, item });
      console.log(`Начало перетаскивания: ${item.type} уровня ${item.level}`);
    }
  };

  // Перемещение при перетаскивании
  const handleDragMove = (x: number, y: number, absoluteX: number, absoluteY: number) => {
    const targetCell = getCellFromCoordinates(absoluteX, absoluteY);
    if (targetCell) {
      setDragOverCell(targetCell);
    }
  };

  // Наведение на клетку (клик)
  const handleCellPress = (x: number, y: number) => {
    const cell = board[y][x];
    const item = cell.item;
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
    if (item && item.type === 'generator') {
      // Если генератор уже выбран — второй клик создаёт элемент
      if (selectedItem && selectedItem.id === item.id) {
        const color = item.resourceType || 'blue';
        const cost = getGeneratorCost(item.level);
        if (resources[color] < cost) {
          Alert.alert('Недостаточно ресурса', `Нужно ${cost} единиц ресурса.`);
          return;
        }
        const emptyCell = getNearestEmptyCell(board, x, y);
        if (!emptyCell) {
          Alert.alert('Нет места', 'Нет свободных клеток для генерации элемента.');
          return;
        }
        const newLevel = getElementLevelByGenerator(item.level);
        const newElement: Item = {
          id: generateId(),
          type: 'element',
          level: newLevel,
          resourceType: color,
          addedAt: new Date().getSeconds(),
        };
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        newBoard[emptyCell.y][emptyCell.x].item = newElement;
        setBoard(newBoard);
        setResources({ ...resources, [color]: resources[color] - cost });
      }
      // Первый клик только выделяет генератор (handled above)
      return;
    }
  };

  // Завершение перетаскивания
  const handleDrop = () => {
    if (!dragItem || !dragOverCell) {
      setDragItem(null);
      setDragOverCell(null);
      setIsDraggingToPit(false);
      return;
    }
    const { x: fromX, y: fromY, item } = dragItem;
    const { x: toX, y: toY } = dragOverCell;

    // Если отпустили над той же ячейкой — ничего не делаем
    if (fromX === toX && fromY === toY) {
      setDragItem(null);
      setDragOverCell(null);
      setIsDraggingToPit(false);
      return;
    }

    const target = board[toY][toX].item;

    // Если целевая ячейка пуста — просто перемещаем
    if (!target) {
      const newBoard = board.map(row => row.map(cell => ({ ...cell })));
      newBoard[fromY][fromX].item = null;
      newBoard[toY][toX].item = item;
      setBoard(newBoard);
      setDragItem(null);
      setDragOverCell(null);
      setIsDraggingToPit(false);
      return;
    }

    // --- Логика объединения ---
    // Обычное объединение: один тип, один уровень, один цвет
    if (
      target.type === item.type &&
      target.level === item.level &&
      target.resourceType === item.resourceType
    ) {
      // Особые правила для максимального уровня элементов (5)
      if (
        target.type === 'element' &&
        target.level === 5 &&
        target.resourceType === 'blue'
      ) {
        // Два синих элемента 5 уровня -> красный генератор 1 уровня
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        newBoard[fromY][fromX].item = null;
        newBoard[toY][toX].item = {
          id: generateId(),
          type: 'generator',
          level: 1,
          resourceType: 'red',
          addedAt: new Date().getSeconds(),
        };
        setBoard(newBoard);
        setDragItem(null);
        setDragOverCell(null);
        setIsDraggingToPit(false);
        return;
      }
      if (
        target.type === 'element' &&
        target.level === 5 &&
        target.resourceType === 'red'
      ) {
        // Два красных элемента 5 уровня -> серый генератор 1 уровня
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        newBoard[fromY][fromX].item = null;
        newBoard[toY][toX].item = {
          id: generateId(),
          type: 'generator',
          level: 1,
          resourceType: 'gray',
          addedAt: new Date().getSeconds(),
        };
        setBoard(newBoard);
        setDragItem(null);
        setDragOverCell(null);
        setIsDraggingToPit(false);
        return;
      }
      if (
        target.type === 'element' &&
        target.level === 5 &&
        target.resourceType === 'gray'
      ) {
        // Два серых элемента 5 уровня -> красный генератор 1 уровня
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        newBoard[fromY][fromX].item = null;
        newBoard[toY][toX].item = {
          id: generateId(),
          type: 'generator',
          level: 1,
          resourceType: 'red',
          addedAt: new Date().getSeconds(),
        };
        setBoard(newBoard);
        setDragItem(null);
        setDragOverCell(null);
        setIsDraggingToPit(false);
        return;
      }
      
      // Проверяем максимальный уровень для генераторов (3)
      if (target.type === 'generator' && target.level >= 3) {
        // Генераторы максимального уровня не объединяются
        setDragItem(null);
        setDragOverCell(null);
        setIsDraggingToPit(false);
        return;
      }
      
      // Обычное объединение: увеличиваем уровень
      const newBoard = board.map(row => row.map(cell => ({ ...cell })));
      newBoard[fromY][fromX].item = null;
      newBoard[toY][toX].item = {
        ...target,
        id: generateId(),
        level: target.level + 1,
        addedAt: new Date().getSeconds(),
      };
      setBoard(newBoard);
      setDragItem(null);
      setDragOverCell(null);
      setIsDraggingToPit(false);
      return;
    }

    // Если не подходит под условия объединения
    setDragItem(null);
    setDragOverCell(null);
    setIsDraggingToPit(false);
  };

  // Обработчик клика по яме для показа задания
  const handlePitClick = () => {
    setShowingMission(true);
    setSelectedItem(null);
  };

  // Обработчик касания ямы для перетаскивания
  const handlePitTouch = () => {
    if (!dragItem) return;
    
    const { x: fromX, y: fromY, item } = dragItem;
    
    // Удаляем элемент с поля и добавляем в яму
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[fromY][fromX].item = null;
    setBoard(newBoard);
    
    setPitItems(prev => [...prev, item]);
    
    // Проверяем, подходит ли элемент для текущего задания
    const missionItemKey = `${item.type}-${item.level}-${item.resourceType}`;
    const missionItemIndex = currentMission.items.findIndex(missionItem => 
      missionItem.type === item.type && 
      missionItem.level === item.level && 
      missionItem.resourceType === item.resourceType
    );
    
    if (missionItemIndex !== -1) {
      // Проверяем, не был ли уже этот тип элемента выполнен нужное количество раз
      const missionItem = currentMission.items[missionItemIndex];
      const requiredCount = currentMission.items.filter(mi => 
        mi.type === missionItem.type && 
        mi.level === missionItem.level && 
        mi.resourceType === missionItem.resourceType
      ).length;
      
      const completedCount = Array.from(completedMissionItems).filter(key => key === missionItemKey).length;
      
      if (completedCount < requiredCount) {
        setCompletedMissionItems(prev => new Set([...prev, `${missionItemKey}-${completedCount}`]));
      }
    }
    
    setDragItem(null);
    setIsDraggingToPit(false);
  };

  // Обработчик отпускания ямы
  const handlePitRelease = () => {
    setIsDraggingToPit(false);
  };

  // Получаем оставшиеся элементы задания
  const getRemainingMissionItems = () => {
    const completedCounts = new Map<string, number>();
    completedMissionItems.forEach(key => {
      const baseKey = key.split('-').slice(0, -1).join('-');
      completedCounts.set(baseKey, (completedCounts.get(baseKey) || 0) + 1);
    });
    
    return currentMission.items.filter(item => {
      const key = `${item.type}-${item.level}-${item.resourceType}`;
      const required = currentMission.items.filter(mi => 
        mi.type === item.type && 
        mi.level === item.level && 
        mi.resourceType === item.resourceType
      ).length;
      const completed = completedCounts.get(key) || 0;
      return completed < required;
    });
  };

  // Проверяем, выполнено ли задание
  const isMissionCompleted = getRemainingMissionItems().length === 0;

  // Выдаём награды за выполнение задания
  useEffect(() => {
    if (isMissionCompleted) {
      setRewards(prev => ({
        black_square: prev.black_square + GAME_CONFIG.MISSION_REWARDS.black_square,
        orange_triangle: prev.orange_triangle + GAME_CONFIG.MISSION_REWARDS.orange_triangle,
      }));
    }
  }, [isMissionCompleted]);

  return (
    <View style={styles.container}>
      <ResourceBarsComponent resources={resources} animations={resourceAnimations} />
      <RewardBarsComponent rewards={rewards} />
      <View onLayout={handleBoardLayout}>
        <GameBoard
          board={board}
          onCellPress={handleCellPress}
          onItemDragStart={handleDragStart}
          onItemDrop={handleDrop}
          onItemDragMove={handleDragMove}
          dragOverCell={dragOverCell}
          activeResourceItemIds={activeResourceItemIds}
          selectedItemId={selectedItem ? selectedItem.id : null}
        />
      </View>
      <Pressable 
        style={{
          width: '90%', 
          height: 120, 
          backgroundColor: isDraggingToPit ? '#616161' : '#424242', 
          borderRadius: 8, 
          marginTop: 12, 
          marginBottom: 12, 
          justifyContent: 'center', 
          alignItems: 'center',
          borderWidth: isDraggingToPit ? 2 : 0,
          borderColor: '#FFD600'
        }}
        onTouchStart={handlePitTouch}
        onTouchEnd={handlePitRelease}
        onPress={handlePitClick}
      >
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>Яма</Text>
        {pitItems.length > 0 && (
          <Text style={{color: 'white', fontSize: 14, marginTop: 8}}>Элементов: {pitItems.length}</Text>
        )}
      </Pressable>
      <View style={{width: '90%', minHeight: 60, backgroundColor: '#f0f0f0', borderRadius: 12, marginTop: 12, justifyContent: 'center', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#bbb'}}>
        {showingMission ? (
          <>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>
              Задание #{currentMission.id} {isMissionCompleted ? '✅' : ''}
            </Text>
            <Text style={{marginTop: 8, marginBottom: 8}}>Создайте:</Text>
            {getRemainingMissionItems().map((item, idx) => (
              <Text key={idx} style={{marginVertical: 2}}>
                {item.type === 'element' ? '🧩' : '⚙️'} {item.level} уровня {item.resourceType === 'blue' ? '🔵' : item.resourceType === 'red' ? '🔴' : '⚪'}
              </Text>
            ))}
            {isMissionCompleted && (
              <Text style={{color: 'green', fontWeight: 'bold', marginTop: 8}}>Задание выполнено!</Text>
            )}
          </>
        ) : selectedItem ? (
          <>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>
              {selectedItem.type === 'element' ? '🧩 Элемент' : selectedItem.type === 'generator' ? '⚙️ Генератор' : '💎 Ресурс'} ⭐ {selectedItem.level}
            </Text>
            {
              selectedItem.type === 'element' ?
              (<Text>Генерирует: 💰 {GAME_CONFIG.RESOURCE_PER_ELEMENT(selectedItem.level)} ресурса</Text>)
              :
              (<></>)
            }
            {selectedItem.type === 'generator' && (
              <View style={{marginTop: 6}}>
                <Text style={{fontWeight: 'bold'}}>Может создавать:</Text>
                {GAME_CONFIG.GENERATOR_ELEMENT_PROBABILITIES[selectedItem.level]?.map((prob, idx) => (
                  <Text key={idx}>
                    {selectedItem.resourceType === 'blue' ? '🔵' : selectedItem.resourceType === 'red' ? '🔴' : selectedItem.resourceType === 'gray' ? '⚪' : '-'} {prob.level} уровня — {Math.round(prob.chance * 100)}%
                  </Text>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={{color: '#888'}}>Кликните на объект для подробной информации</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
    justifyContent: 'flex-start',
    backgroundColor: '#fafafa',
    paddingTop: 32,
  },
}); 