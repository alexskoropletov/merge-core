import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';

export const TestDragComponent: React.FC = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      isDragging.value = true;
      console.log('Drag started');
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      console.log('Dragging:', event.translationX, event.translationY);
    },
    onEnd: () => {
      isDragging.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      console.log('Drag ended');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тест перетаскивания</Text>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.draggableItem, animatedStyle]}>
          <Text style={styles.itemText}>Перетащи меня</Text>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  draggableItem: {
    width: 100,
    height: 100,
    backgroundColor: '#2196f3',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 