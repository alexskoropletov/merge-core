# Merge Core - Client

React Native/Expo клиент для игры слияния (merge game).

## 🏗️ Архитектура

Проект использует **Expo Router** для навигации:

- `app/index.tsx` - главный экран игры (GameScreen)
- `app/_layout.tsx` - корневой layout с настройками навигации
- `app/test.tsx` - тестовая страница для проверки навигации

## 🎮 Игровая механика

- **Доска 7x7** с ячейками
- **Три типа ресурсов**: синий, красный, зеленый
- **Типы предметов**: генераторы, элементы, ресурсы
- **Слияние**: два одинаковых предмета → предмет следующего уровня
- **Особые правила**: 
  - 2 синих элемента 5 уровня → красный генератор 1 уровня
  - 2 красных элемента 5 уровня → синий генератор 1 уровня

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Запуск на Android
npm run android

# Запуск на iOS
npm run ios

# Запуск в браузере
npm run web
```

## 📁 Структура проекта

```
app/
├── _layout.tsx          # Корневой layout
├── index.tsx            # Главный экран игры
├── test.tsx             # Тестовая страница
├── components/          # React компоненты
│   ├── Cell.tsx         # Ячейка доски
│   ├── GameBoard.tsx    # Игровая доска
│   ├── ItemView.tsx     # Отображение предмета
│   └── ResourceBars.tsx # Панель ресурсов
├── screens/             # Экраны приложения
│   └── GameScreen.tsx   # Основной игровой экран
└── types/               # TypeScript типы
    └── GameTypes.ts     # Типы для игровой логики
```

## 🎯 Навигация

- `/` - главный экран игры
- `/test` - тестовая страница

## 🛠️ Технологии

- **Expo** - фреймворк для React Native
- **Expo Router** - навигация на основе файловой системы
- **TypeScript** - типизация
- **React Native** - мобильная разработка

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
