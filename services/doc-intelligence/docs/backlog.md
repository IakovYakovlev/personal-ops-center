# Backlog

Список задач, идей и улучшений для Doc Intelligence Service.

---

### [MARKETING/UX] Конверсионная воронка: Переход с FREE (Static) на PRO (RAG Chat)

**Статус:** ⏳ Planned
**Приоритет:** High (2)

#### 📝 Суть (Контекст)

Сейчас `FREE` план работает синхронно и выдает статический JSON-анализ (summary, keywords и т.д.) без сохранения в БД. Это лишает пользователя возможности взаимодействовать с документом. Нам нужно внедрить визуальный "тизер" чата, который будет предлагать переход на `PRO` план для активации `Neural Assistant` (RAG).

#### 📍 Локация (Где менять)

- **Frontend:** `frontend/src/components/analysis/ResultView.tsx` (или аналогичный компонент выдачи результата), `frontend/src/components/chat/ChatPreview.tsx`.
- **Backend:** `services/doc-intelligence/src/modules/plans/` (логика проверки прав на чат).
- **Инфра:** Лимиты в `usage.service.ts`.

#### 🛠 Что нужно сделать (Checklist)

- [ ] **UI:** Добавить неактивное (disabled) окно чата под результатами статического анализа для `FREE` пользователей.
- [ ] **UX:** Разместить Overlay или Banner на окне чата с текстом: _"Хотите задать вопросы этому документу? Активируйте PRO для запуска Neural Assistant"_.
- [ ] **Logic:** Реализовать кнопку "Upgrade to PRO", которая ведет на страницу выбора тарифа или имитирует покупку.
- [ ] **Backend:** Убедиться, что эндпоинты `neural-assistant` возвращают `403 Forbidden` для пользователей с `FREE` планом, если они пытаются обращаться к чату напрямую.

#### 🔗 Связи и Ресурсы

- **Документация:** См. раздел `Processing Modes` в `README.md`.
- **Связанный этап:** Неделя 4 (Neural Assistant) в `../../../ROADMAP.md`.
- **Комментарий:** Посмотреть реализацию `PlanStrategyFactory` в `doc-intelligence`, чтобы корректно разделять доступ к методам чата.

---

### [Reliability] Retry с exponential backoff для Gemini API

**Статус:** 🧊 Backlog  
**Приоритет:** High

#### 📝 Суть (Контекст)

Gemini API иногда возвращает HTTP 503 "Service Unavailable" при перегрузке (особенно на free tier).

**Проблема:**

- Пользователь видит ошибку анализа
- Job помечается как failed
- Нет автоматического повтора

**Решение:**

- Добавить retry логику с exponential backoff (1s, 2s, 4s, ...)
- Максимум 3 попытки
- Логирование каждой попытки
- Пробросить ошибку если все попытки исчерпаны

**Ожидаемый результат:** Временные 503 ошибки будут обработаны автоматически, пользователь получит результат вместо ошибки.

#### 📍 Локация (Где менять)

- **Backend:** `src/modules/llm/llm.service.ts` (метод `request`)
- **Логирование:** Использовать существующий `Logger`
- **Типы:** Возможно понадобится `RetryableError` в common/

#### 🛠 Что нужно сделать (Checklist)

- [ ] Добавить retry логику в `LlmService.request()` с exponential backoff
- [ ] Обработать 503 ошибки специально (остальные выбросить сразу)
- [ ] Логировать каждую попытку retry: попытка N из M, delay перед следующей
- [ ] Написать unit тесты для retry behavior (успех с 2й попытки, все 3 неудачны и т.д.)
- [ ] Протестировать локально (можно мокировать Gemini API через jest)
- [ ] Добавить комментарий в коде с объяснением exponential backoff стратегии

#### 🔗 Связи и Ресурсы

- **Google Gemini API docs:** https://ai.google.dev/docs
- **Retry pattern:** https://en.wikipedia.org/wiki/Exponential_backoff
- **Связано:** Job processing, async strategies, error handling
- **Пример кода:** Exponential backoff реализован в identity-service/src/auth/ для refresh token

---
