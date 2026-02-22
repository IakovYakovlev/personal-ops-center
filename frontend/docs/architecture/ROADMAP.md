# 🗺️ Frontend Roadmap

Дорожная карта разработки Next.js frontend для Personal Ops Center.

---

## 📋 Фазы разработки

### **Фаза 1: Фундамент (Неделя 1-2) ✅ ГОТОВО**

#### Authentication & Security

- [x] Next.js 15 инициализация
- [x] App Router с Route Groups
- [x] Login страница с формой
- [x] Register страница с валидацией
- [x] Forgot Password страница
- [x] Server Actions для безопасности
- [x] Middleware для защиты маршрутов
- [x] JWT хранение (localStorage + httpOnly cookie)
- [x] Token refresh автоматически

#### Navigation & Layout

- [x] Root layout с html/body tags
- [x] Auth layout (без sidebar)
- [x] Dashboard layout (с sidebar)
- [x] ShadCN UI инсталляция и конфигурация
- [x] Sidebar компонент
- [x] Header компонент
- [x] Nav компоненты (main, secondary, user)

#### Components

- [x] Button компоненты
- [x] Input поля
- [x] Card компоненты
- [x] Dialog модалки
- [x] Dropdown меню
- [x] Badge компоненты
- [x] Avatar компоненты

---

### **Фаза 2: Document Management (Неделя 3-4) 🔄 НАЧИНАЕТСЯ**

#### Upload Interface

- [ ] Drag-and-Drop зона для файлов
- [ ] File size validation (5MB макс)
- [ ] Мультиплоад поддержка
- [ ] Progress bar для загрузки
- [ ] Error handling с красивыми сообщениями
- [ ] Успешная загрузка уведомление

#### Document List

- [ ] Documents страница (`/dashboard/documents`)
- [ ] Таблица с документами
- [ ] Пагинация (25 документов на странице)
- [ ] Сортировка по дате/размеру/статусу
- [ ] Фильтры (по типу файла, статусу)
- [ ] Delete документ (с подтверждением)
- [ ] View документ детали

#### Job Status

- [ ] Polling логика (каждые 2 сек)
- [ ] Status badge (pending, processing, completed, failed)
- [ ] Progress indicator для обработки
- [ ] Результаты отображение (текст, ключевые слова)
- [ ] Ошибки display с retry кнопкой

#### Rate Limiting Handling

- [ ] HTTP 429 перехват
- [ ] Rate limit dialog компонент
- [ ] Retry logic с exponential backoff
- [ ] User-friendly сообщение
- [ ] Оставшиеся лимиты display

---

### **Фаза 3: Neural Assistant - Chat (Неделя 5-6) 🔄 ПЛАНИРУЕТСЯ**

#### Chat Interface

- [ ] Chat страница (`/dashboard/chat/:docId`)
- [ ] Message список с разными стилями (user/assistant)
- [ ] Input field с formatting (Ctrl+Enter send)
- [ ] Typing indicator
- [ ] Code блоки в ответах
- [ ] Markdown рендеринг
- [ ] Link открытие в новом окне

#### Chat Features

- [ ] Conversation history загрузка
- [ ] Clear history кнопка
- [ ] Regenerate response
- [ ] Copy code button
- [ ] Message pinning
- [ ] Export conversation (PDF)

#### Streaming Responses

- [ ] Server-Sent Events обработка
- [ ] Real-time текст обновление
- [ ] Loading state с анимацией
- [ ] Stop generation кнопка

---

### **Фаза 4: Analytics Dashboard (Неделя 7-8) 🔄 ПЛАНИРУЕТСЯ**

#### Dashboard Main

- [ ] KPI cards (total documents, chats, cost)
- [ ] Recent activity список
- [ ] Quick actions (upload, new chat)
- [ ] Notifications bell
- [ ] Welcome message для новых юзеров

#### Analytics Page

- [ ] Document processing metrics
  - Total processed
  - Success rate
  - Average processing time
  - Total characters processed
- [ ] Chat usage metrics
  - Total conversations
  - Average response time
  - Most used document
- [ ] Cost breakdown
  - LLM tokens spent
  - API calls count
  - Estimated cost
- [ ] Charts (using Recharts)
  - Line chart - activity over time
  - Bar chart - documents by type
  - Pie chart - cost by service
  - Area chart - API calls per day

#### Export Features

- [ ] Export как PDF
- [ ] Export как CSV
- [ ] Date range picker для фильтров
- [ ] Compare периоды

---

### **Фаза 5: User Management (Неделя 9) 🔄 ПЛАНИРУЕТСЯ**

#### Profile Page

- [ ] User info display (email, name, plan)
- [ ] Edit profile form
- [ ] Change password form
- [ ] 2FA setup (если нужно)
- [ ] Connected devices list
- [ ] Active sessions

#### Settings

- [ ] Notifications preferences
- [ ] Theme selection (light/dark)
- [ ] Language choice
- [ ] API keys management
- [ ] Webhooks setup
- [ ] Data export/delete

#### Billing (если нужно)

- [ ] Current plan display
- [ ] Usage statistics
- [ ] Upgrade/downgrade button
- [ ] Billing history
- [ ] Invoice download

---

### **Фаза 6: Performance & Polish (Неделя 10) 🚀 ПЛАНИРУЕТСЯ**

#### Performance Optimizations

- [ ] Image optimization (next/image)
- [ ] Code splitting автоматически
- [ ] Bundle size < 100kb (gzip)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Lazy loading для компонентов
- [ ] Route prefetching

#### UI/UX Polish

- [ ] Dark mode полностью
- [ ] Skeleton loaders вместо spinners
- [ ] Toast уведомления вместо alerts
- [ ] Keyboard shortcuts help modal
- [ ] Better error messages
- [ ] Empty states картинки
- [ ] Loading states везде
- [ ] Hover/focus states оптимизация

#### Responsive Design

- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Tablet навигация (hamburger menu)
- [ ] Touch-friendly buttons (>48px)

#### Accessibility (A11y)

- [ ] ARIA labels везде
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader testing
- [ ] Color contrast ratio > 4.5:1
- [ ] Focus indicators видимы
- [ ] Semantic HTML структура

---

### **Фаза 7: Testing & Deployment (Неделя 11) 🚀 ПЛАНИРУЕТСЯ**

#### Testing

- [ ] Unit tests (Jest)
  - Utility functions
  - Custom hooks
  - API clients
- [ ] Integration tests (React Testing Library)
  - Forms тестирование
  - Navigation flow
  - API calls mocking
- [ ] E2E tests (Playwright)
  - Full user journey
  - Login/Register flow
  - Document upload
  - Chat interaction

#### CI/CD

- [ ] GitHub Actions для tests
- [ ] Automatic deploys на Vercel
- [ ] Preview URLs для PR
- [ ] Performance budgets
- [ ] Bundle analysis

#### Documentation

- [ ] Component library docs
- [ ] Contributing guide
- [ ] Setup guide
- [ ] API client docs
- [ ] Deployment guide

---

## 🎯 Current Sprint (Неделя 3-4)

**Фокус:** Document Management Interface

### Tasks

- [ ] **Upload Component**
  - React Dropzone интеграция
  - Drag-and-drop обработка
  - Multiple файлы support
  - File type validation
  - Size validation (5MB)
  - Loading progress bar

- [ ] **Document List**
  - API integration для получения документов
  - Table компонент с сортировкой
  - Pagination реализация
  - Delete с модальным подтверждением
  - Responsive таблица на мобилях

- [ ] **Job Polling**
  - useEffect с интервалом для polling
  - Exponential backoff для retry
  - Cancel polling при unmount
  - Status badge компонент
  - Result display форматирование

- [ ] **Rate Limiting**
  - HTTP 429 обработка
  - Dialog компонент для ошибки
  - Retry logic implementation
  - User notification

---

## 📊 Timeline

```
Фаза 1:  [████████████████████░░] ГОТОВО (Неделя 1-2)
Фаза 2:  [████░░░░░░░░░░░░░░░░░░] НАЧАЛО (Неделя 3-4)
Фаза 3:  [░░░░░░░░░░░░░░░░░░░░░░░] СЛОЖЕНО (Неделя 5-6)
Фаза 4:  [░░░░░░░░░░░░░░░░░░░░░░░] ПЛАНИРУЕТСЯ (Неделя 7-8)
Фаза 5:  [░░░░░░░░░░░░░░░░░░░░░░░] ПЛАНИРУЕТСЯ (Неделя 9)
Фаза 6:  [░░░░░░░░░░░░░░░░░░░░░░░] ПЛАНИРУЕТСЯ (Неделя 10)
Фаза 7:  [░░░░░░░░░░░░░░░░░░░░░░░] ПЛАНИРУЕТСЯ (Неделя 11)
```

**Прогноз завершения:** 30.03.2026

---

## 🔧 Технический стек

### Core

- **Next.js** 15 с App Router
- **React** 19
- **TypeScript** 5.x
- **Tailwind CSS** 4

### UI Components

- **ShadCN UI** (на базе Radix UI)
- **React Hook Form** для формовых сложных случаев
- **Zod** для валидации на клиенте
- **Recharts** для графиков
- **Framer Motion** для анимаций

### HTTP & Data

- **Fetch API** встроенный (не нужен axios)
- **Custom API client** с error handling
- **Server Actions** для безопасности

### Dev Tools

- **ESLint** + **Prettier**
- **Testing Library** (React)
- **Vitest** или **Jest**
- **Playwright** для E2E

---

## 🚀 Как начать

### 1. Клонируйте и установите

```bash
cd frontend
npm install
```

### 2. Создайте `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_IDENTITY_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

### 3. Запустите разработку

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### 4. Структура компонентов

```typescript
// components/MyComponent.tsx
'use client'; // если нужны hooks

import { FC } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
}

export const MyComponent: FC<MyComponentProps> = ({ className }) => {
  return (
    <div className={cn('p-4', className)}>
      Content
    </div>
  );
};
```

---

## 📝 Notes

- Все новые компоненты должны быть в `components/`
- UI компоненты - только в `components/ui/`
- API запросы - через `lib/api-client.ts`
- Типы - через TypeScript interfaces
- Стили - через Tailwind классы (не inline styles)

---

**Последнее обновление:** 22.02.2026  
**Версия:** 1.0  
**Ответственный:** Frontend Team
