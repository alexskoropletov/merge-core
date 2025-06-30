import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ResourceBars as ResourceBarsType } from '../types/GameTypes';

interface Props {
  resources: ResourceBarsType;
  animations?: { color: string; amount: number; key: string }[];
}

export const ResourceBars: React.FC<Props> = ({ resources, animations = [] }) => (
  <View style={styles.container}>
    <View style={styles.bar}>
      <Text style={styles.blue}>🔵 {resources.blue}</Text>
      {animations.filter(a => a.color === 'blue').map(a => (
        <Text key={a.key} style={styles.animText}>+{a.amount}</Text>
      ))}
    </View>
    <View style={styles.bar}>
      <Text style={styles.red}>🔴 {resources.red}</Text>
      {animations.filter(a => a.color === 'red').map(a => (
        <Text key={a.key} style={styles.animText}>+{a.amount}</Text>
      ))}
    </View>
    <View style={styles.bar}>
      <Text style={styles.gray}>⚪ {resources.gray}</Text>
      {animations.filter(a => a.color === 'gray').map(a => (
        <Text key={a.key} style={styles.animText}>+{a.amount}</Text>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  bar: {
    flex: 1,
    alignItems: 'center',
  },
  blue: { color: '#2196f3', fontWeight: 'bold', fontSize: 18 },
  red: { color: '#e53935', fontWeight: 'bold', fontSize: 18 },
  gray: { color: '#9e9e9e', fontWeight: 'bold', fontSize: 18 },
  animText: {
    position: 'absolute',
    top: -18,
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    paddingHorizontal: 6,
    zIndex: 10,
    alignSelf: 'center',
  },
}); 