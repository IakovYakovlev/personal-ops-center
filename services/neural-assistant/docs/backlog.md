# Backlog

Список задач, идей и улучшений для Neural Assistant.

---

### [REFACTOR] Переместить запрос из `DocumentsService` в `doc-intelligence-client`

**Статус:** ⏳ Planned
**Приоритет:** Medium (3)

#### 📝 Суть (Контекст)

Сейчас HTTP-запрос к `doc-intelligence` выполняется напрямую внутри `DocumentsService` через `fetch`. Это смешивает доменную логику сервиса с интеграционным кодом и усложняет повторное использование/тестирование. Нужно вынести этот запрос в отдельный клиент `doc-intelligence-client` и оставить в `DocumentsService` только orchestration-логику.

#### 📍 Локация (Где менять)

- **Backend:** `services/neural-assistant/src/doc-intelligence-client/` (новый или существующий клиент).
- **Backend:** `services/neural-assistant/src/documents/documents.service.ts`.
- **Config:** проверка `DOC_INTELLIGENCE_API_URL` и обработка заголовка `authorization`.

#### 🛠 Что нужно сделать (Checklist)

- [ ] Создать/доработать `doc-intelligence-client` с методом получения документов пользователя.
- [ ] Перенести формирование URL (`/documents?userId=...`) и вызов `fetch` из `DocumentsService` в клиент.
- [ ] Перенести обработку ошибок интеграции (`BadGatewayException` с деталями ответа) в клиент или в единый слой адаптера.
- [ ] Обновить `DocumentsService`, чтобы он вызывал только клиент.
- [ ] Добавить/обновить unit-тесты для `DocumentsService` и клиента.

#### 🔗 Связи и Ресурсы

- **Текущая реализация:** `services/neural-assistant/src/documents/documents.service.ts`.
- **Комментарий:** Вынесение запроса в клиент упростит расширение интеграции и переиспользование в других сервисах.

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
