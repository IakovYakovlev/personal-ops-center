# 🎨 Personal Ops Center - Frontend

Next.js 15 Dashboard для персональной ИИ-экосистемы. Единая точка управления документами, чатом с ИИ и аналитикой.

## 🚀 Быстрый старт

### Предварительно

- Node.js 18+
- npm или yarn
- Identity Service запущен на `http://localhost:3001`

### Установка

```bash
# Клонирование и установка
git clone <repo-url>
cd frontend
npm install

# Запуск в разработке
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
frontend/
├── app/
│   ├── (auth)/                 # Публичные страницы
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx        # Вход
│   │   └── register/
│   │       └── page.tsx        # Регистрация
│   │
│   ├── (dashboard)/            # Защищённые страницы
│   │   ├── layout.tsx          # Sidebar + Footer
│   │   ├── page.tsx            # Dashboard главная
│   │   ├── documents/
│   │   │   └── page.tsx        # Загрузка и управление
│   │   ├── chat/
│   │   │   └── page.tsx        # Neural Assistant
│   │   ├── analytics/
│   │   │   └── page.tsx        # Данные и инсайты
│   │   └── profile/
│   │       └── page.tsx        # Профиль пользователя
│   │
│   ├── api/
│   │   └── (API Routes для внутренних операций)
│   │
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # / → перенаправление
│   └── middleware.ts           # Проверка JWT перед доступом
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthProvider.tsx    # Context для сессии
│   │
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── documents/
│   │   ├── UploadZone.tsx      # Drag & Drop
│   │   ├── DocumentList.tsx
│   │   └── JobStatus.tsx       # Поллинг статуса
│   │
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   └── InputBox.tsx
│   │
│   └── ui/                     # ShadCN компоненты
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/
│   ├── api/
│   │   ├── client.ts           # Fetch wrapper с токенами
│   │   └── services/
│   │       ├── auth.ts         # Identity Service
│   │       ├── documents.ts    # Doc Intelligence
│   │       ├── chat.ts         # Neural Assistant
│   │       ├── data.ts         # Data Forge
│   │       ├── insights.ts     # Insight Aggregator
│   │       └── index.ts        # Экспорт всех
│   │
│   ├── hooks/
│   │   ├── useAuth.ts          # Получение пользователя
│   │   ├── useDocuments.ts     # CRUD документов
│   │   └── useChat.ts          # Отправка сообщений
│   │
│   ├── utils/
│   │   ├── cn.ts               # classnames утилита
│   │   ├── validators.ts       # Email, password валидация
│   │   └── constants.ts        # URL, timeout констант
│   │
│   └── context/
│       ├── AuthContext.tsx     # Глобальная сессия
│       └── ThemeContext.tsx    # Светлая/тёмная тема
│
├── public/
│   └── (иконки, логотипы)
│
├── styles/
│   └── globals.css             # Глобальные стили
│
├── .env.local                  # Локальные переменные
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🔐 Аутентификация

### Как работает

1. **Login/Register** → отправка на `/auth/login` в Identity Service
2. **Получение токенов** → `accessToken` (15 мин) + `refreshToken` (7 дней)
3. **Хранение** → localStorage (accessToken) + httpOnly cookie (refreshToken)
4. **Middleware** → проверяет токен перед каждым запросом к `/dashboard`
5. **404 → Login** → если токен истёк, редирект на `/login`

### Переменные окружения

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_ENV=development
```

## 🌍 API Клиент

### Базовое использование

```typescript
import { authService, docService, chatService } from '@/lib/api/services';

// Login
const { accessToken, refreshToken } = await authService.login(email, password);

// Загрузить документ
const { jobId } = await docService.uploadDocument(file);

// Отправить сообщение
const response = await chatService.sendMessage(docId, 'Что в документе?');
```

### Добавление нового сервиса

1. Создайте `lib/api/services/newService.ts`
2. Экспортируйте в `lib/api/services/index.ts`
3. Используйте везде

```typescript
// lib/api/services/newService.ts
import { apiClient } from '../client';

export const getData = (id: string) => apiClient.get(`/new-service/data/${id}`);
```

## 🧪 Разработка

### Запуск

```bash
npm run dev          # Разработка с hot reload
npm run build        # Production build
npm start            # Запуск production сборки
npm run lint         # ESLint проверка
npm run type-check   # TypeScript проверка
```

### Структура компонентов

```typescript
'use client'; // Если используются hooks (useState, useEffect)

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  const [state, setState] = useState('');

  return (
    <div>
      {/* Компонент */}
    </div>
  );
}
```

## 📦 Основные зависимости

- **Next.js 15** — Backend + Frontend (App Router)
- **React 19** — UI компоненты
- **TypeScript** — Type-safe разработка
- **Tailwind CSS** — Утилиты для стилизации
- **ShadCN UI** — Готовые компоненты
- **Axios** — HTTP клиент (опционально)
- **React Hook Form** — Управление формами
- **Zod** — Валидация данных
- **Framer Motion** — Анимации

## 🎯 Фичи по этапам

### ✅ Этап 1: Фундамент (неделя 2)

- [x] Auth система (Login/Register)
- [x] Защищённые роуты (Middleware)
- [ ] Базовый Dashboard
- [ ] Sidebar навигация

### 📋 Этап 2: Сервисы (недели 3-4)

- [ ] Drag-and-Drop загрузчик
- [ ] Статус задач (Job polling)
- [ ] Chat с Gemini
- [ ] RAG поиск в документах

### 🚀 Этап 3: Данные (недели 5-6)

- [ ] Analytics страница
- [ ] Экспорт отчётов
- [ ] Кэширование результатов

### 💎 Этап 4: Полировка (неделя 7)

- [ ] Тёмная тема
- [ ] Анимации
- [ ] Mobile responsive
- [ ] SEO оптимизация

## 🔗 Связанные проекты

- [Identity Service](../identity-service) — Аутентификация (NestJS)
- [Doc Intelligence](../doc-intelligence) — Обработка документов (NestJS)
- [Neural Assistant](../neural-assistant) — Чат с ИИ (NestJS)
- [Data Forge](../data-forge) — Обработка данных (.NET 9)
- [Insight Aggregator](../insight-aggregator) — Агрегация данных (.NET 9)

## 🐛 Troubleshooting

### "Cannot find module @/lib/api"

→ Проверьте `tsconfig.json` в `compilerOptions.paths`

### "Token expired, redirecting to login"

→ Нормально, `middleware.ts` обновляет refresh token автоматически

### "CORS error from Identity Service"

→ Убедитесь что Identity Service запущен на правильном хосте/порте

## 📞 Контакты и поддержка

Для вопросов по разработке → см. [ROADMAP.md](../ROADMAP.md)

---

**Статус:** Активная разработка (Неделя 2 из 7)  
**Последнее обновление:** 14.02.2026
