import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Item } from '../types/GameTypes';
import { ItemView } from './ItemView';

interface Props {
  item: Item | null;
  onPress?: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  onDragMove?: (x: number, y: number) => void;
  isDragOver?: boolean;
  isResourceActive?: boolean;
  isSelected?: boolean;
  isPitCell?: boolean;
}

export const Cell: React.FC<Props> = ({ 
  item, 
  onPress, 
  onDragStart, 
  onDrop, 
  onDragMove, 
  isDragOver, 
  isResourceActive, 
  isSelected, 
  isPitCell
}) => {
  const handlePitPress = () => {
    if (onPress) {
      onPress();
    }
  };

  if (isPitCell && !item) {
    return (
      <Pressable 
        onPress={handlePitPress}
        style={[
          styles.cell, 
          styles.pitCell,
          isDragOver && styles.dragOver,
          { width: 280, height: 40 } // Ширина = 7 ячеек * 40px + отступы
        ]}
      >
        <Text style={styles.pitText}>Яма</Text>
      </Pressable>
    );
  }

  return (
    <View style={[
      styles.cell, 
      isDragOver && styles.dragOver, 
      isResourceActive && styles.resourceActive, 
      isSelected && styles.selected,
      isPitCell && styles.pitCell
    ]}>
      {item && (
        <ItemView 
          item={item} 
          onPress={onPress} 
          onDragStart={onDragStart} 
          onDrop={onDrop}
          onDragMove={onDragMove}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 1,
  },
  dragOver: {
    backgroundColor: '#e3f2fd',
  },
  resourceActive: {
    borderColor: '#FFD600',
    borderWidth: 3,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  selected: {
    borderColor: '#1976d2',
    borderWidth: 3,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  pitCell: {
    backgroundColor: '#424242',
    borderColor: '#666',
  },
  pitText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 