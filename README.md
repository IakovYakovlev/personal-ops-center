# Personal Ops Center: Unified Fullstack AI Ecosystem

## 🎯 Общая цель проекта

Создать персональную инженерную экосистему из 5 микросервисов, объединенных единым Dashboard. Проект демонстрирует полный цикл разработки: от проектирования распределенных систем с JWT-авторизацией до интеграции прикладного ИИ (Gemini, RAG) и асинхронной обработки данных.

## 🏗 Архитектура системы

Система построена на гибридном стеке (NestJS + .NET 10), что позволяет использовать сильные стороны каждой платформы.

### 🧩 Микросервисы:

1.  **Identity Service (NestJS):** Центральный узел безопасности. Управляет пользователями и сессиями (JWT Access/Refresh).
2.  **Doc Intelligence (NestJS):** Асинхронный движок для парсинга и ИИ-анализа документов (PDF/DOCX). Использует BullMQ и Redis.
3.  **Neural Assistant (NestJS):** Интеллектуальный чат-ассистент с реализацией RAG (Retrieval-Augmented Generation).
4.  **Data Forge (.NET 10):** Высокопроизводительный сервис для сложных вычислений и генерации отчетов.
5.  **Insight Aggregator (.NET 10):** Оркестратор для сбора и анализа данных из внешних API.

---

## 🛠 Технологический стек

- **Frontend:** Next.js 15 (App Router), TypeScript, React Query, Zustand.
- **UI/UX:** Tailwind CSS, ShadCN UI, Framer Motion (анимация ИИ-ответов).
- **Backend:** NestJS (Node.js) & ASP.NET Core 10 (.NET).
- **Storage:** PostgreSQL (Prisma/EF Core), Redis (Queuing & Caching).
- **AI:** Google Gemini Pro, LangChain.

---

## 📅 План реализации (Февраль — Март 2026)

### Спринт 1: Foundation & Auth (10.02 - 23.02) — **Текущий этап**

- [V] Разработка **Identity Service**: JWT, Bcrypt, Passport.js.
- [V] Создание **Next.js Dashboard Shell**: Middleware защита, Layout, Sidebar.
- [V] Реализация системы единого входа (SSO logic).

### Спринт 2: AI & Async Processing (24.02 - 09.03)

- [V] Интеграция готового сервиса **Doc Intelligence**: рефакторинг под JWT.
- [ ] Создание **Neural Assistant**: чат со стримингом ответов через Gemini API.
- [ ] Frontend: Интерфейс мониторинга фоновых задач (Jobs) и Drag-and-Drop загрузка.

### Спринт 3: High-Performance Services (10.03 - 31.03)

- [ ] Разработка сервисов на **.NET 10**.
- [ ] Настройка межсервисного взаимодействия и единого квотирования.
- [ ] Финальная полировка UX, темная тема, оптимизация Lighthouse.

---

## 📂 Структура проекта

```text
/personal-ops-center
  /frontend           # Next.js 15 Application
  /services
    /identity-service # NestJS + JWT Auth
    /doc-intelligence # NestJS + BullMQ + Redis (Ready-to-integrate)
    /neural-assistant # NestJS + Gemini AI
    /data-forge       # .NET 10 Core Engine
    /insight-aggregator # .NET 10 API Orchestrator
  docker-compose.yml  # PostgreSQL, Redis, PgAdmin
```

## 🚀 Как запустить (Development)

1. Инфраструктура:

```bash
docker-compose up -d
```

2. Backend (Identity Service):

```bash
cd services/identity-service
npm install
npx prisma migrate dev
npm run start:dev
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

## 📈 Метрики успеха (KPI)

1. Security: Ни один запрос к бэкендам не проходит без валидного JWT.

2. AI UX: Время отклика ИИ-ассистента визуально компенсировано стримингом или скелетонами.

3. Robustness: Корректная обработка файлов до 100MB через очереди BullMQ.

4. Professionalism: Код соответствует SOLID, DRY и чистой архитектуре.
