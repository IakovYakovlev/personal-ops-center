# ADR 0003: Стратегия управления состоянием на Frontend

- **Статус:** Accepted
- **Дата:** 2026-02-23
- **Автор:** Iakov
- **Область (Scope):** Global (Frontend)

## Контекст (Context)

Personal Ops Center планируется как платформа с множественными независимыми сервисами (Doc Intelligence, Email Assistant, Calendar Service, Task Manager и другие). Текущая реализация страницы Documents ([page.tsx](../../app/dashboard/documents/page.tsx)) показывает проблемы монолитного подхода:

1. **Смешение ответственности:** Компонент одновременно управляет UI, делает API вызовы, управляет polling логикой, обрабатывает валидацию
2. **Императивное управление состоянием:** Использование `useRef` для `setInterval` приводит к хрупкому коду с потенциальными утечками памяти
3. **Масштабируемость:** При добавлении 4+ сервисов нужна консистентная архитектура управления состоянием
4. **Дублирование логики:** Каждый новый сервис будет повторять паттерны API вызовов, кеширования, обработки ошибок

**Проблемы без правильной стратегии:**

- Каждый сервисный модуль будет иметь свою логику кеширования и синхронизации
- Сложность поддержки и онбординга новых разработчиков
- Невозможность переиспользовать логику между сервисами
- Prop drilling при передаче состояния между компонентами

## Варианты решения (Considered Options)

### Вариант 1: Redux Toolkit + RTK Query

Классический подход с централизованным store и встроенным data fetching.

**Плюсы:**

- Полноценная экосистема (DevTools, middleware, persistence)
- Централизованное управление всем состоянием
- Строгая структура (actions, reducers, slices)
- RTK Query решает кеширование и синхронизацию

**Минусы:**

- Большой boilerplate даже с Redux Toolkit
- Next.js App Router требует 'use client' для всех компонентов с Redux
- Избыточность для независимых сервисов (глобальный store для изолированных фич)
- Сложность настройки SSR с Redux
- Overengineering для текущего scope

### Вариант 2: Context API для всего

Использование React Context для управления всем состоянием.

**Плюсы:**

- Встроено в React, нет зависимостей
- Простая интеграция с Next.js App Router
- Понятная модель для небольших приложений

**Минусы:**

- Performance проблемы при частых обновлениях (каждое изменение ре-рендерит всех подписчиков)
- Нет встроенного решения для data fetching
- Нет DevTools
- Нужно вручную реализовывать кеширование, retry, polling
- Context hell при множественных сервисах

### Вариант 3: TanStack Query + Context API + Zustand (ВЫБРАН)

Гибридный подход с разделением типов состояния:

- **TanStack Query** для server state (данные с API)
- **Context API** для передачи зависимостей и локального UI state
- **Zustand** для глобальных настроек и cross-cutting concerns

**Плюсы:**

- Чёткое разделение server state vs client state
- TanStack Query автоматически решает кеширование, polling, retry, инвалидацию
- Zustand даёт глобальный state без boilerplate Redux
- Context используется только там, где нужно (DI, темы)
- Минимальный bundle size (~3KB для Zustand + 13KB для TanStack Query)
- Полная совместимость с Next.js App Router (Server Components friendly)
- Модульная архитектура: каждый сервис изолирован

**Минусы:**

- Три инструмента вместо одного (нужно понимать область применения каждого)
- Нет единого DevTools (хотя у каждого есть свои)

## Решение (Decision Outcome)

Выбран **Вариант 3: TanStack Query + Context API + Zustand**.

### Архитектура

```
┌─────────────────────────────────────────────┐
│           Application Layer                 │
├─────────────────────────────────────────────┤
│  Server State (TanStack Query)              │
│  - API calls, caching, polling              │
│  - hooks/useDocumentUpload.ts               │
│  - hooks/useJobPolling.ts                   │
│  - hooks/useEmailService.ts                 │
├─────────────────────────────────────────────┤
│  Global Client State (Zustand)              │
│  - User preferences                         │
│  - UI settings (theme, locale)              │
│  - Cross-service coordination               │
├─────────────────────────────────────────────┤
│  Local UI State (Context API)               │
│  - Component-specific state                 │
│  - Dependency injection                     │
│  - Feature-scoped providers                 │
└─────────────────────────────────────────────┘
```

### Структура файлов

```
frontend/
├── lib/
│   ├── api/
│   │   ├── client.ts                    # Axios/Fetch wrapper
│   │   ├── hooks/
│   │   │   ├── documents/
│   │   │   │   ├── useDocumentUpload.ts
│   │   │   │   ├── useJobPolling.ts
│   │   │   │   └── useDocumentList.ts
│   │   │   ├── email/
│   │   │   │   └── useEmailService.ts
│   │   │   └── calendar/
│   │   │       └── useCalendarService.ts
│   │   └── services/
│   │       ├── docService.ts           # API methods
│   │       ├── emailService.ts
│   │       └── calendarService.ts
│   ├── stores/
│   │   ├── preferences.ts              # Zustand store
│   │   └── uiState.ts                  # Zustand store
│   ├── contexts/
│   │   └── theme-context.tsx           # Context только для DI
│   └── providers/
│       └── query-provider.tsx          # TanStack Query setup
└── app/
    └── dashboard/
        └── documents/
            ├── page.tsx                 # Thin UI layer
            └── components/
                ├── upload-section.tsx
                ├── results-section.tsx
                └── processing-status.tsx
```

### Пример реализации

**TanStack Query для server state:**

```typescript
// lib/api/hooks/documents/useDocumentUpload.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { docService } from '@/lib/api/services/docService';

export function useDocumentUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, strategy }: { file: File; strategy: 'sync' | 'async' }) =>
      docService.uploadDocument(file, strategy),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// lib/api/hooks/documents/useJobPolling.ts
import { useQuery } from '@tanstack/react-query';
import { docService } from '@/lib/api/services/docService';

export function useJobPolling(jobId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => docService.getJobResult(jobId!),
    enabled: !!jobId && enabled,
    refetchInterval: (data) => {
      // Stop polling when complete or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2s
    },
    retry: 3,
  });
}
```

**Zustand для глобальных настроек:**

```typescript
// lib/stores/preferences.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  defaultStrategy: 'sync' | 'async';
  theme: 'light' | 'dark';
  setDefaultStrategy: (strategy: 'sync' | 'async') => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const usePreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      defaultStrategy: 'sync',
      theme: 'light',
      setDefaultStrategy: (strategy) => set({ defaultStrategy: strategy }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'user-preferences',
    },
  ),
);
```

**Упрощённый page.tsx:**

```typescript
// app/dashboard/documents/page.tsx
'use client';

import { useState } from 'react';
import { useDocumentUpload } from '@/lib/api/hooks/documents/useDocumentUpload';
import { useJobPolling } from '@/lib/api/hooks/documents/useJobPolling';
import { usePreferences } from '@/lib/stores/preferences';

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const { defaultStrategy } = usePreferences();
  const uploadMutation = useDocumentUpload();
  const jobPolling = useJobPolling(
    uploadMutation.data?.jobId,
    uploadMutation.data?.strategy === 'async'
  );

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate({ file, strategy: defaultStrategy });
    }
  };

  return (
    <div>
      <UploadDropzone onFileSelected={setFile} />
      <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
        {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
      </Button>
      {jobPolling.data && <ResultsSection data={jobPolling.data} />}
    </div>
  );
}
```

### Обоснование (Pros)

1. **Разделение ответственности**
   - Server state изолирован в TanStack Query hooks
   - UI логика остаётся в компонентах
   - Глобальные настройки в Zustand
2. **Автоматизация рутинных задач**
   - TanStack Query автоматически управляет кешированием, retry, polling
   - Zustand автоматически персистит настройки в localStorage
3. **Масштабируемость**
   - Каждый сервис (documents, email, calendar) имеет свой набор hooks
   - Hooks переиспользуются между компонентами
   - Добавление нового сервиса = добавление новой папки в `hooks/`
4. **Performance**
   - TanStack Query оптимизирует количество запросов (дедупликация, кеширование)
   - Zustand не вызывает лишних ре-рендеров (селекторы на уровне полей)
   - Context используется минимально (только для DI)
5. **Developer Experience**
   - Минимальный boilerplate
   - Отличная TypeScript интеграция
   - DevTools для отладки (React Query DevTools, Zustand DevTools)
   - Простой онбординг новых разработчиков
6. **Next.js App Router совместимость**
   - TanStack Query работает с Server Components (через hydration)
   - Zustand не требует Provider'ов
   - Context используется только где необходимо

### Недостатки (Cons)

1. **Множественные инструменты**
   - Нужно понимать, когда использовать TanStack Query, Zustand или Context
   - Риск неправильного выбора инструмента новичками
   - **Митигация:** Документация с decision tree и примерами
2. **Нет единого DevTools**
   - Три разных инструмента для отладки
   - **Митигация:** Каждый инструмент имеет свои встроенные DevTools
3. **Дополнительные зависимости**
   - +16KB к bundle size (TanStack Query + Zustand)
   - **Митигация:** Всё равно меньше, чем Redux + RTK Query (~30KB)

## Последствия (Consequences)

### Немедленные изменения

1. **Установка зависимостей**

   ```bash
   npm install @tanstack/react-query zustand
   npm install -D @tanstack/react-query-devtools
   ```

2. **Настройка TanStack Query Provider**
   - Создать `lib/providers/query-provider.tsx`
   - Обернуть root layout в QueryClientProvider

3. **Миграция существующего кода**
   - Рефакторинг `app/dashboard/documents/page.tsx`
   - Перенос API логики в `lib/api/hooks/documents/`
   - Удаление императивного управления polling через useRef

### Средне-срочные изменения

4. **Создание hooks для всех будущих сервисов**
   - Email service: `useEmailSend`, `useEmailList`, `useEmailSearch`
   - Calendar service: `useCalendarEvents`, `useCreateEvent`
   - Task manager: `useTaskList`, `useCreateTask`

5. **Настройка глобального Zustand store**
   - User preferences (theme, default strategies, language)
   - UI state (sidebar collapsed, active service)

### Долго-срочные изменения

6. **Оптимизация кеширования**
   - Настройка stale time и cache time для каждого query
   - Реализация optimistic updates для UX

7. **Документация паттернов**
   - Создать guidelines по выбору правильного инструмента
   - Примеры использования для каждого типа состояния

## Связи (Links)

- Связан с: [ADR 0001: Глобальная JWT стратегия](0001-global-auth-strategy.md) - TanStack Query будет использовать JWT для API запросов
- Связан с: [ADR 0002: Doc Intelligence Processing Strategy](0002-doc-intel-processing-strategy.md) - Hooks будут реализовывать sync/async стратегии

## Decision Tree для разработчиков

При добавлении нового состояния задайте себе вопросы:

```
Это данные с сервера (API)?
├── Да → TanStack Query
│   └── Создать hook в lib/api/hooks/{service}/
│
└── Нет → Это глобальное состояние?
    ├── Да → Это настройки пользователя или cross-cutting concern?
    │   ├── Да → Zustand
    │   │   └── Добавить в lib/stores/
    │   └── Нет → Нужно ли персистить?
    │       ├── Да → Zustand с persist middleware
    │       └── Нет → Может useState в родительском компоненте?
    │           ├── Да → useState
    │           └── Нет → Context API (редко)
    │
    └── Нет → Это локальное состояние компонента?
        └── Да → useState / useReducer
```

## Примеры использования

### Когда использовать TanStack Query:

- Загрузка списка документов
- Polling статуса job
- Загрузка пользовательского профиля
- Поиск в email

### Когда использовать Zustand:

- Тема приложения (light/dark)
- Язык интерфейса
- Default стратегия обработки (sync/async)
- Состояние sidebar (collapsed/expanded)
- Последний использованный сервис

### Когда использовать Context:

- Передача theme provider (если не используете shadcn/ui встроенный)
- i18n provider
- Feature flags provider
- Dependency injection (редко)

### Когда использовать useState:

- Состояние формы
- Открыт/закрыт модал
- Текущий выбранный файл
- Локальный UI state
