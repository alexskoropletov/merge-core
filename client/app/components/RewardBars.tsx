import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { RewardBars as RewardBarsType } from '../types/GameTypes';

interface Props {
  rewards: RewardBarsType;
  animations?: {type: string, amount: number, key: string}[];
}

export const RewardBars: React.FC<Props> = ({ rewards, animations = [] }) => {
  const blackSquareAnimations = animations.filter(anim => anim.type === 'black_square');
  const orangeTriangleAnimations = animations.filter(anim => anim.type === 'orange_triangle');

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Text style={styles.blackSquare}>⬛ {rewards.black_square}</Text>
        {blackSquareAnimations.map((anim, index) => (
          <Text
            key={anim.key}
            style={[
              styles.animationText,
              styles.blackSquareAnimation,
              {
                position: 'absolute',
                top: -20 - index * 20,
              }
            ]}
          >
            +{anim.amount}
          </Text>
        ))}
      </View>
      <View style={styles.bar}>
        <Text style={styles.orangeTriangle}>🔺 {rewards.orange_triangle}</Text>
        {orangeTriangleAnimations.map((anim, index) => (
          <Text
            key={anim.key}
            style={[
              styles.animationText,
              styles.orangeTriangleAnimation,
              {
                position: 'absolute',
                top: -20 - index * 20,
              }
            ]}
          >
            +{anim.amount}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  bar: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  blackSquare: { color: '#000000', fontWeight: 'bold', fontSize: 18 },
  orangeTriangle: { color: '#FF8C00', fontWeight: 'bold', fontSize: 18 },
  animationText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  blackSquareAnimation: {
    color: '#000000',
  },
  orangeTriangleAnimation: {
    color: '#FF8C00',
  },
}); 