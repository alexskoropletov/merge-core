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
    { type: 'generator' as const, level: 2, resourceType: 'blue' as const },
    { type: 'generator' as const, level: 2, resourceType: 'red' as const },
    { type: 'generator' as const, level: 2, resourceType: 'gray' as const },
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
  const [currentMission, setCurrentMission] = useState(GAME_CONFIG.MISSIONS[0]);
  const [showingMission, setShowingMission] = useState(false);
  const [completedMissionItems, setCompletedMissionItems] = useState<Set<string>>(new Set());
  const [rewards, setRewards] = useState<RewardBarsType>({ ...GAME_CONFIG.INITIAL_REWARDS });
  const [showingRewards, setShowingRewards] = useState(false);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [rewardAnimations, setRewardAnimations] = useState<{type: string, amount: number, key: string}[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    
    // Если координаты находятся в области ямы (ниже основной доски)
    if (cellY >= BOARD_HEIGHT - 1) {
      return { x: 0, y: BOARD_HEIGHT - 1 }; // Возвращаем координаты ямы
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
    
    // Если кликнули на яму (нижний ряд) - показываем задание или награды
    if (y === BOARD_HEIGHT - 1 && !item) {
      if (showingRewards) {
        // Если показываются награды, ничего не делаем
        return;
      }
      setShowingMission(true);
      setSelectedItem(null);
      return;
    }
    
    if (item) {
      setSelectedItem(item);
      setShowingMission(false);
      setShowingRewards(false);
    } else {
      setSelectedItem(null);
      setShowingMission(false);
      setShowingRewards(false);
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
      return;
    }
    const { x: fromX, y: fromY, item } = dragItem;
    const { x: toX, y: toY } = dragOverCell;

    // Если отпустили над той же ячейкой — ничего не делаем
    if (fromX === toX && fromY === toY) {
      setDragItem(null);
      setDragOverCell(null);
      return;
    }

    const target = board[toY][toX].item;

    // Если перетащили в яму (нижний ряд) - удаляем элемент
    if (toY === BOARD_HEIGHT - 1) {
      // Проверяем, не является ли это последним генератором
      if (isLastGenerator(item)) {
        // Показываем сообщение об ошибке
        setErrorMessage('❌ Нельзя выбрасывать последний генератор! Он нужен для создания элементов.');
        setShowingMission(false);
        setShowingRewards(false);
        setSelectedItem(null);
        
        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        
        setDragItem(null);
        setDragOverCell(null);
        return;
      }
      
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
      setDragOverCell(null);
      return;
    }

    // Если целевая ячейка пуста — просто перемещаем
    if (!target) {
      const newBoard = board.map(row => row.map(cell => ({ ...cell })));
      newBoard[fromY][fromX].item = null;
      newBoard[toY][toX].item = item;
      setBoard(newBoard);
      setDragItem(null);
      setDragOverCell(null);
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
        return;
      }
      
      // Проверяем максимальный уровень для генераторов (3)
      if (target.type === 'generator' && target.level >= 3) {
        // Генераторы максимального уровня не объединяются
        setDragItem(null);
        setDragOverCell(null);
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
      return;
    }

    // Если не подходит под условия объединения
    setDragItem(null);
    setDragOverCell(null);
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

  // Функция для подсчета генераторов на доске
  const countGenerators = () => {
    let count = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell.item && cell.item.type === 'generator') {
          count++;
        }
      });
    });
    return count;
  };

  // Функция для проверки, является ли генератор последним
  const isLastGenerator = (item: Item) => {
    if (item.type !== 'generator') return false;
    return countGenerators() === 1;
  };

  // Проверяем, выполнено ли задание
  const isMissionCompleted = getRemainingMissionItems().length === 0;

  // Выдаём награды за выполнение задания
  useEffect(() => {
    if (isMissionCompleted) {
      const missionRewards = GAME_CONFIG.MISSION_REWARDS.getRewards(currentMission.id);
      
      // Добавляем анимации наград
      const newRewardAnimations: {type: string, amount: number, key: string}[] = [];
      if (missionRewards.black_square > 0) {
        newRewardAnimations.push({
          type: 'black_square',
          amount: missionRewards.black_square,
          key: `black_square-${Date.now()}-1`
        });
      }
      if (missionRewards.orange_triangle > 0) {
        newRewardAnimations.push({
          type: 'orange_triangle',
          amount: missionRewards.orange_triangle,
          key: `orange_triangle-${Date.now()}-1`
        });
      }
      
      setRewardAnimations(prev => [...prev, ...newRewardAnimations]);
      
      // Удаляем анимации через 1.5 секунды
      setTimeout(() => {
        setRewardAnimations(prev => prev.filter(anim => !newRewardAnimations.some(na => na.key === anim.key)));
      }, 1500);
      
      // Обновляем награды
      setRewards(prev => ({
        black_square: prev.black_square + missionRewards.black_square,
        orange_triangle: prev.orange_triangle + missionRewards.orange_triangle,
      }));
      
      // Показываем награды и переходим к следующему заданию
      setShowingRewards(true);
      setShowingMission(false);
      
      // Через 3 секунды переходим к следующему заданию
      setTimeout(() => {
        const nextIndex = currentMissionIndex + 1;
        if (nextIndex < GAME_CONFIG.MISSIONS.length) {
          setCurrentMissionIndex(nextIndex);
          setCurrentMission(GAME_CONFIG.MISSIONS[nextIndex]);
          setCompletedMissionItems(new Set());
          setShowingRewards(false);
        } else {
          // Все задания выполнены
          setShowingRewards(false);
        }
      }, 3000);
    }
  }, [isMissionCompleted]);

  return (
    <View style={styles.container}>
      <ResourceBarsComponent resources={resources} animations={resourceAnimations} />
      <RewardBarsComponent rewards={rewards} animations={rewardAnimations} />
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
      <View style={{width: '90%', minHeight: 60, backgroundColor: '#f0f0f0', borderRadius: 12, marginTop: 12, justifyContent: 'center', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#bbb'}}>
        {errorMessage ? (
          <Text style={{color: 'red', fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>
            {errorMessage}
          </Text>
        ) : showingRewards ? (
          <>
            <Text style={{fontWeight: 'bold', fontSize: 16, color: 'green'}}>
              🎉 Задание #{currentMission.id} выполнено! 🎉
            </Text>
            <Text style={{marginTop: 8, marginBottom: 8}}>Полученные награды:</Text>
            {GAME_CONFIG.MISSION_REWARDS.getRewards(currentMission.id).black_square > 0 && (
              <Text style={{marginVertical: 2, color: '#333'}}>
                ⬛ Черные квадраты: +{GAME_CONFIG.MISSION_REWARDS.getRewards(currentMission.id).black_square}
              </Text>
            )}
            {GAME_CONFIG.MISSION_REWARDS.getRewards(currentMission.id).orange_triangle > 0 && (
              <Text style={{marginVertical: 2, color: '#FF8C00'}}>
                🔺 Оранжевые треугольники: +{GAME_CONFIG.MISSION_REWARDS.getRewards(currentMission.id).orange_triangle}
              </Text>
            )}
            <Text style={{marginTop: 8, fontSize: 12, color: '#666'}}>
              Следующее задание загружается...
            </Text>
          </>
        ) : showingMission ? (
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