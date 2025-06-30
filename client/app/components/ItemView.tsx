import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Item } from '../types/GameTypes';

interface Props {
  item: Item;
  onPress?: () => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  onDragMove?: (x: number, y: number) => void;
}

const colorMap: Record<string, string> = {
  blue: '#2196f3',
  red: '#e53935',
  gray: '#9e9e9e',
};

export const ItemView: React.FC<Props> = ({ item, onPress, onDragStart, onDrop, onDragMove }) => {
  const color = colorMap[item.resourceType || 'blue'] || '#888';
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      isDragging.value = true;
      if (onDragStart) {
        runOnJS(onDragStart)();
      }
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      if (onDragMove) {
        runOnJS(onDragMove)(event.absoluteX, event.absoluteY);
      }
    },
    onEnd: () => {
      isDragging.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      if (onDrop) {
        runOnJS(onDrop)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: isDragging.value ? 1.1 : 1 },
      ],
      zIndex: isDragging.value ? 1000 : 1,
    };
  });

  const renderItem = () => {
    if (item.type === 'generator') {
      return (
        <View style={[styles.generator, { borderColor: color }]}> 
          <Text style={[styles.text, { color }]}>{item.level}</Text>
        </View>
      );
    }
    if (item.type === 'element') {
      return (
        <View style={[styles.element, { borderColor: color }]}> 
          <Text style={[styles.text, { color }]}>{item.level}</Text>
        </View>
      );
    }
    // ресурс — ромб
    return (
      <View style={[styles.resource, { borderColor: color }]}> 
        <Text style={[styles.text, { color }]}>{item.level}</Text>
      </View>
    );
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Pressable onPress={onPress}>
          {renderItem()}
        </Pressable>
      </Animated.View>
    </PanGestureHandler>
  );
};

const base = {
  width: 36,
  height: 36,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderWidth: 2,
  margin: 1,
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  generator: {
    ...base,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  element: {
    ...base,
    borderRadius: 18,
    backgroundColor: '#e3f2fd',
  },
  resource: {
    ...base,
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#fffde7',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 