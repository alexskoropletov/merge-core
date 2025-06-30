import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false, // Скрываем заголовок для игрового экрана
          animation: 'fade', // Плавная анимация переходов
        }}
      />
    </GestureHandlerRootView>
  );
}
