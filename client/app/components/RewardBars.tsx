import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RewardBars as RewardBarsType } from '../types/GameTypes';

interface Props {
  rewards: RewardBarsType;
}

export const RewardBars: React.FC<Props> = ({ rewards }) => (
  <View style={styles.container}>
    <View style={styles.bar}>
      <Text style={styles.blackSquare}>⬛ {rewards.black_square}</Text>
    </View>
    <View style={styles.bar}>
      <Text style={styles.orangeTriangle}>🔺 {rewards.orange_triangle}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  bar: {
    flex: 1,
    alignItems: 'center',
  },
  blackSquare: { color: '#000000', fontWeight: 'bold', fontSize: 18 },
  orangeTriangle: { color: '#FF8C00', fontWeight: 'bold', fontSize: 18 },
}); 