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
│   ├── (auth)/                       # 🔓 Публичные страницы (без JWT)
│   │   ├── layout.tsx                # Auth layout
│   │   ├── login/
│   │   │   └── page.tsx              # Вход в систему
│   │   ├── register/
│   │   │   └── page.tsx              # Регистрация
│   │   └── forgot-password/
│   │       └── page.tsx              # Восстановление пароля
│   │
│   ├── (dashboard)/                  # 🔐 Защищённые страницы (требуют JWT)
│   │   ├── layout.tsx                # Sidebar + Header + защита
│   │   ├── page.tsx                  # Dashboard главная (главный экран)
│   │   ├── documents/                # 📄 Управление документами (планируется)
│   │   ├── chat/                     # 💬 Neural Assistant чат (планируется)
│   │   ├── analytics/                # 📊 Analytics (планируется)
│   │   └── profile/                  # 👤 Профиль пользователя (планируется)
│   │
│   ├── actions/                      # 🔐 Server Actions (безопасные операции)
│   │   ├── auth.ts                   # Login / Logout
│   │   ├── register.ts               # Регистрация
│   │   └── forgot-password.ts        # Восстановление пароля
│   │
│   ├── globals.css                   # Глобальные стили Tailwind
│   ├── layout.tsx                    # Root layout (html, body)
│   └── page.tsx                      # / → редирект на /dashboard или /login
│
├── components/
│   ├── app-sidebar.tsx               # Sidebar в dashboard
│   ├── site-header.tsx               # Header в dashboard
│   ├── chart-area-interactive.tsx    # Интерактивный график
│   ├── data-table.tsx                # Таблица данных
│   ├── section-cards.tsx             # Карточки метрик
│   │
│   ├── login-form.tsx                # Форма входа с rate-limit обработкой
│   ├── register-form.tsx             # Форма регистрации
│   ├── forgot-password-form.tsx      # Форма восстановления пароля
│   ├── rate-limit-dialog.tsx         # Диалог ошибок rate-limit (HTTP 429)
│   │
│   ├── nav-main.tsx                  # Главная навигация
│   ├── nav-secondary.tsx             # Вспомогательная навигация
│   ├── nav-user.tsx                  # Меню пользователя (профиль, выход)
│   ├── nav-documents.tsx             # Навигация документов
│   │
│   └── ui/                           # 🎨 ShadCN компоненты (переиспользуемые)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── sidebar.tsx
│       ├── table.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── separator.tsx
│       ├── checkbox.tsx
│       └── ... (другие компоненты)
│
├── lib/
│   ├── auth.ts                       # Управление JWT токеном
│   │                                 # setAuthToken, getAuthToken, clearAuthToken
│   │
│   ├── api-client.ts                 # Fetch wrapper с обработкой ошибок
│   │                                 # RateLimitError для HTTP 429
│   │
│   ├── utils.ts                      # Утилиты (cn для classNames)
│   │
│   └── hooks/
│       └── use-mobile.ts             # Хук для определения мобильного устройства
│
├── public/                           # Статические файлы и ассеты
│
├── proxy.ts                          # 🔒 Next.js Proxy для защиты маршрутов
│                                     # Проверяет JWT перед доступом к защищённым page
│
├── .env.local                        # Переменные окружения (НЕ коммитить!)
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

### 📝 Пояснения по структуре

- **`(auth)` и `(dashboard)`** — Route Groups в Next.js
  - Скобки `()` НЕ влияют на URL
  - `/login` доступен из `app/(auth)/login/page.tsx`
  - Позволяют применять разные layouts для разных групп страниц

- **`proxy.ts`** — Middleware для защиты маршрутов
  - Проверяет наличие JWT токена в cookies
  - Без токена → редирект на `/login`
  - Публичные маршруты `/login`, `/register`, `/forgot-password` пропускаются

- **Server Actions** в `app/actions/`
  - Безопасное выполнение на сервере
  - Авто-[CSRF](https://nextjs.org/docs/app/building-your-application/security/forms-and-security) защита
  - Возвращают результаты вместо бросания ошибок

## 🔐 Аутентификация

### Как работает

1. **Login/Register** → отправка на `/auth/login` в Identity Service
2. **Получение токенов** → `accessToken` (15 мин)
3. **Хранение** → httpOnly cookie
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

- [v] Auth система (Login/Register)
- [v] Защищённые роуты (Middleware)
- [v] Базовый Dashboard
- [v] Sidebar навигация

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
