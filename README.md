# Personal Ops Center: Unified Fullstack AI Ecosystem

## 🎯 Общая цель проекта

Создать персональную инженерную экосистему из 5 микросервисов, объединенных единым Dashboard. Проект демонстрирует полный цикл разработки: от проектирования распределенных систем с JWT-авторизацией до интеграции прикладного ИИ (Gemini, RAG) и асинхронной обработки данных.

## 🏗 Архитектура системы

Система построена на гибридном стеке (NestJS + .NET 10), что позволяет использовать сильные стороны каждой платформы.

### 🧩 Микросервисы:

1.  **Identity Service (NestJS):** Центральный узел безопасности. Управляет пользователями и сессиями (JWT Access).
2.  **Doc Intelligence (NestJS):** Асинхронный движок для парсинга и ИИ-анализа документов (PDF/DOCX). Использует BullMQ и Redis.
3.  **Neural Assistant (NestJS):** Интеллектуальный чат-ассистент с реализацией RAG (Retrieval-Augmented Generation).
4.  **Data Forge (.NET 10):** Высокопроизводительный сервис для сложных вычислений и генерации отчетов.
5.  **Insight Aggregator (.NET 10):** Оркестратор для сбора и анализа данных из внешних API.

---

## 🛠 Технологический стек

- **Frontend:** Next.js 16 (App Router), TypeScript, TanStack Query.
- **UI/UX:** Tailwind CSS, ShadCN UI, Framer Motion (анимация ИИ-ответов).
- **Backend:** NestJS (Node.js) & ASP.NET Core 10 (.NET).
- **Storage:** PostgreSQL (Prisma/EF Core), Redis (Queuing & Caching).
- **AI:** Google Gemini Pro, LangChain.

---

## 📅 Статус проекта

- Текущая стадия: переход к реализации **Neural Assistant** (чат + стриминг ответов + RAG).
- Завершено: Foundation/Auth и интеграция Doc Intelligence в единую JWT-экосистему.
- Ближайшие шаги:
  - Запустить сервис `neural-assistant` и базовый чат-пайплайн с Gemini.
  - Реализовать retrieval-слой по обработанным документам.
  - Подготовить UI-чат в Dashboard со streaming-ответами.

- Полный и актуальный план ведется в [ROADMAP.md](ROADMAP.md)

---

## 📂 Структура проекта

```text
/personal-ops-center
  /frontend           # Next.js 16 Application
  /services
    /identity-service # NestJS + JWT Auth
    /doc-intelligence # NestJS + BullMQ + Redis (Ready-to-integrate)
    /neural-assistant # NestJS + Gemini AI
    /data-forge       # .NET 10 Core Engine
    /insight-aggregator # .NET 10 API Orchestrator
```

## 🚀 Как запустить (Development)

1. Backend (Identity Service):

```bash
cd services/identity-service
npm install
npx prisma migrate dev
npm run start:dev
```

2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

**Примечание:** Для работы сервисов требуется запущенный PostgreSQL и Redis.

## 📈 Метрики успеха (KPI)

1. Security: Ни один запрос к бэкендам не проходит без валидного JWT.

2. AI UX: Время отклика ИИ-ассистента визуально компенсировано стримингом или скелетонами.

3. Robustness: Корректная обработка файлов до 100MB через очереди BullMQ.

4. Professionalism: Код соответствует SOLID, DRY и чистой архитектуре.
