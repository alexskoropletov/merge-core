import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Board, Cell as CellType } from '../types/GameTypes';
import { Cell } from './Cell';

interface Props {
  board: Board;
  onCellPress?: (x: number, y: number) => void;
  onItemDragStart?: (x: number, y: number) => void;
  onItemDrop?: (x: number, y: number) => void;
  onItemDragMove?: (x: number, y: number, absoluteX: number, absoluteY: number) => void;
  dragOverCell?: { x: number; y: number } | null;
  activeResourceItemIds?: string[];
  selectedItemId?: string | null;
}

export const GameBoard: React.FC<Props> = ({ 
  board, 
  onCellPress, 
  onItemDragStart, 
  onItemDrop, 
  onItemDragMove,
  dragOverCell,
  activeResourceItemIds = [],
  selectedItemId = null,
}) => {
  return (
    <View style={styles.board}>
      {/* Основные ряды доски */}
      {board.slice(0, -1).map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((cell, x) => (
            <Cell
              key={x}
              item={cell.item}
              onPress={() => onCellPress && onCellPress(x, y)}
              onDragStart={() => onItemDragStart && onItemDragStart(x, y)}
              onDrop={() => onItemDrop && onItemDrop(x, y)}
              onDragMove={(absoluteX, absoluteY) => onItemDragMove && onItemDragMove(x, y, absoluteX, absoluteY)}
              isDragOver={!!(dragOverCell && dragOverCell.x === x && dragOverCell.y === y)}
              isResourceActive={cell.item ? activeResourceItemIds.includes(cell.item.id) : false}
              isSelected={cell.item ? cell.item.id === selectedItemId : false}
              isPitCell={false}
            />
          ))}
        </View>
      ))}
      
      {/* Яма как одна сплошная ячейка */}
      <View style={styles.pitRow}>
        <Cell
          item={null}
          onPress={() => onCellPress && onCellPress(0, board.length - 1)}
          onDragStart={() => onItemDragStart && onItemDragStart(0, board.length - 1)}
          onDrop={() => onItemDrop && onItemDrop(0, board.length - 1)}
          onDragMove={(absoluteX, absoluteY) => onItemDragMove && onItemDragMove(0, board.length - 1, absoluteX, absoluteY)}
          isDragOver={!!(dragOverCell && dragOverCell.y === board.length - 1)}
          isResourceActive={false}
          isSelected={false}
          isPitCell={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
  pitRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
}); 