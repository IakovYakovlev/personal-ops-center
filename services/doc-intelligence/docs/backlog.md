# Backlog

Список задач, идей и улучшений для Doc Intelligence Service.

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
