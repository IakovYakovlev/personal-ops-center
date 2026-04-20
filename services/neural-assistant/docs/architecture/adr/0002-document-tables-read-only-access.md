/\*\*

- Document Tables Read-Only Access - Neural Assistant
-
- Architecture decisions:
- - Таблицы Document и DocumentChunk принадлежат сервису doc-intelligence
- - Neural-assistant не имеет прямого доступа к таблицам Document/DocumentChunk
- - Чтение документов в neural-assistant выполняется через API doc-intelligence
-
- Related docs:
- - services/doc-intelligence/prisma/schema.prisma
- - services/neural-assistant/prisma/schema.prisma
- - services/neural-assistant/src/documents/documents.service.ts
- - services/doc-intelligence/src/modules/documents/documents.controller.ts
    \*/

# ADR 0002: Read-only доступ neural-assistant к Document и DocumentChunk

- **Статус:** Accepted
- **Дата:** 2026-04-16
- **Автор:** Jakov
- **Область (Scope):** doc-intelligence + neural-assistant

## Контекст (Context)

В системе уже существуют таблицы `Document` и `DocumentChunk`, которые создаются и эволюционируют миграциями сервиса doc-intelligence. При этом neural-assistant должен читать данные из этих таблиц для своих сценариев (например, retrieval/поиск по чанкам).

Проблема: без формализации границ ответственности оба сервиса могут начать независимо менять одну и ту же схему, что приведет к конфликтам миграций, дрейфу схемы и рискам инцидентов в продакшене.

## Варианты решения (Considered Options)

1. **Вариант А:** Дублировать миграции `Document`/`DocumentChunk` в neural-assistant.
2. **Вариант Б:** Оставить владельцем схемы doc-intelligence, а в neural-assistant использовать эти модели только для чтения.
3. **Вариант В:** Запретить прямой доступ neural-assistant к БД и читать данные только через API doc-intelligence.

## Решение (Decision Outcome)

Выбран Вариант В.

- Владельцем таблиц `Document` и `DocumentChunk` является doc-intelligence.
- Все DDL-изменения (create/alter/drop/index) и миграции для этих таблиц выполняются только в doc-intelligence.
- В neural-assistant нет прямых запросов к таблицам `Document`/`DocumentChunk`.
- Доступ к документам из neural-assistant выполняется через API doc-intelligence (`/documents`) с передачей JWT.
- Таблицы `Chat` и `ChatList` являются ownership neural-assistant; миграции и операции записи по ним выполняются только из neural-assistant в отдельной БД `neural_assistant_db`.

### Обоснование (Pros)

- Сохраняется единый владелец схемы и источник истины по миграциям.
- Снижается риск конфликтов миграций между сервисами.
- Отсутствуют cross-service конфликты Prisma migrate.
- Архитектура ownership прозрачна: каждый сервис работает только со своей БД/схемой.

### Недостатки (Cons)

- Добавляется сетевой hop между neural-assistant и doc-intelligence.
- Необходимо поддерживать API-контракт между сервисами.
- При изменении схемы в doc-intelligence нужен контроль совместимости для neural-assistant.

## Последствия (Consequences)

- В doc-intelligence продолжают жить миграции для `Document`/`DocumentChunk`.
- В neural-assistant отсутствуют модели `Document`/`DocumentChunk` в миграционной схеме.
- В neural-assistant миграции для `Chat` и `ChatList` запускаются в штатном режиме в `neural_assistant_db`.
- Список документов в neural-assistant формируется через запрос в doc-intelligence API.
- Добавляется операционное правило: любые изменения структуры `Document`/`DocumentChunk` сопровождаются уведомлением команды neural-assistant и проверкой совместимости запросов.

## Связи (Links)

- Реализация (consumer): [services/neural-assistant/src/documents/documents.service.ts](services/neural-assistant/src/documents/documents.service.ts)
- Реализация (provider): [services/doc-intelligence/src/modules/documents/documents.controller.ts](services/doc-intelligence/src/modules/documents/documents.controller.ts)
- Заменяет: [нет]
