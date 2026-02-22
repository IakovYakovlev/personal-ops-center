# ADR 0001: Глобальная JWT стратегия аутентификации

- **Статус:** Accepted
- **Дата:** 2026-02-22
- **Автор:** Iakov
- **Область (Scope):** Global (Identity Service, Doc Intelligence, Frontend)

## Контекст (Context)

Personal Ops Center состоит из нескольких микросервисов (Frontend на Next.js, Identity Service на NestJS, Doc Intelligence на NestJS, дополнительные сервисы на .NET), которые должны работать в едином экосистеме. Требуется безопасная, масштабируемая система аутентификации, которая позволяет:

1. **Пользователям безопасно войти** через Frontend и получить токены
2. **Фронтенду хранить токены** безопасно (localStorage + httpOnly cookie)
3. **Микросервисам не вызывать Identity Service** каждый раз для проверки токена (работает offline)
4. **Защищать от скомпрометированных токенов** через blacklist в Redis
5. **Разделять типы токенов** для разных операций (регистрация, сброс пароля, API доступ)

**Проблемы без правильной стратегии:**

- Каждый запрос требует проверки на Identity Service (узкое место)
- Невозможно анулировать токен после logout (пока не истечет TTL)
- Нет разделения между типами операций (токен для регистрации можно использовать как API токен)
- Уязвимость для token injection атак

## Варианты решения (Considered Options)

### Вариант 1: Session-based (traditional)

Хранение сессии на сервере с cookie ID.

**Плюсы:** Традиционно, сессии можно анулировать мгновенно  
**Минусы:** Не масштабируется, требует sticky sessions в load balancer, невозможно использовать с .NET services

### Вариант 2: JWT с проверкой на каждый раз

Каждый микросервис вызывает Identity Service для проверки токена.

**Плюсы:** Мгновенное анулирование при logout  
**Минусы:** Каждый запрос добавляет latency, Identity Service становится bottleneck

### Вариант 3: JWT self-contained с Redis blacklist (ВЫБРАН)

JWT токены подписаны Identity Service, микросервисы проверяют signature. Logout добавляет токен в Redis blacklist на время его TTL.

**Плюсы:**

- Масштабируемо (микросервисы не вызывают друг друга)
- Offline verification
- Работает с любыми языками (JWT standard)
- Все еще можно анулировать токен

**Минусы:**

- Небольшая задержка перед анулированием (Redis может быть недоступна)
- Нужно синхронизировать JWT_SECRET между сервисами

## Решение (Decision Outcome)

**Выбран Вариант 3: JWT с Redis blacklist.**

### Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js)                                          │
│  - Хранит: accessToken (httpOnly cookie)                    │
│  - Хранит: refreshToken (httpOnly cookie)                   │
│  - Отправляет: "Authorization: Bearer {accessToken}"        │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ↓
        ┌────────────────────────────────────┐
        │ Identity Service                   │ ← /auth/login
        │ - JWT signing                      │ ← /auth/register
        │ - Password hashing                 │ ← /auth/logout
        │ - Redis blacklist                  │ ← /auth/forgot-password
        │ - Reset token management           │ ← /auth/verify-reset
        └────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ↓            ↓            ↓
┌──────────┐ ┌──────────────┐ ┌──────────┐
│ Doc      │ │ Neural       │ │ Services │
│ Intel.   │ │ Assistant    │ │ (.NET)   │
│ - Verify │ │ - Verify     │ │ - Verify │
│   JWT    │ │   JWT        │ │   JWT    │
│ - Check  │ │ - Check      │ │ - Check  │
│   Redis  │ │   Redis      │ │   Redis  │
└──────────┘ └──────────────┘ └──────────┘
```

### JWT Токен Types

```typescript
// 1. Registration Token (для верификации email)
{
  email: "user@example.com",
  type: "register",  // ВАЖНО: type-specific
  iat: 1707552000,
  exp: 1707552900   // 15 минут
}

// 2. Reset Token (для сброса пароля)
{
  sub: "user_id_123",
  type: "reset",     // ВАЖНО: type-specific
  iat: 1707552000,
  exp: 1707552900   // 15 минут
}

// 3. Access Token (для API)
{
  sub: "user_id_123",           // User ID
  email: "user@example.com",
  type: "login",                // ВАЖНО: type-specific
  iat: 1707552000,
  exp: 1707552900              // 15 минут
}

// 4. Refresh Token (долгоживущий, в httpOnly cookie)
{
  sub: "user_id_123",
  type: "refresh",
  iat: 1707552000,
  exp: 1709144000             // 7 дней
}
```

### Схема аутентификации

1. **Login Flow:**

   ```
   User → POST /auth/login → Identity Service
   → Verify password (bcrypt)
   → Sign accessToken + refreshToken
   → Return tokens
   → Frontend хранит токены
   ```

2. **API Request:**

   ```
   Frontend → POST /upload/file
   → Header: "Authorization: Bearer {accessToken}"
   → Микросервис JwtGuard:
      - Извлекает токен
      - Проверяет signature (только JWT_SECRET нужен)
      - Проверяет type == "login"
      - Проверяет в Redis blacklist
      - Сохраняет user в request.user
   → Если OK → выполняет запрос
   → Если нет → 401 Unauthorized
   ```

3. **Logout Flow:**

   ```
   Frontend → POST /auth/logout
   → Backend добавляет accessToken в Redis blacklist
   → TTL = оставшееся время до exp
   → Frontend удаляет токены
   → Следующий запрос → JwtGuard найдет в blacklist → 401
   ```

4. **Token Refresh:**
   ```
   accessToken true истек или скоро истечет
   → Frontend отправляет refreshToken
   → Identity Service проверяет тип == "refresh"
   → Выдает новый accessToken
   → Frontend обновляет localStorage
   ```

### Реализация

#### Identity Service (NestJS)

```typescript
// Подписание токена
const accessToken = this.jwtService.sign(
  { sub: user.id, email: user.email, type: 'login' },
  { secret: process.env.JWT_SECRET, expiresIn: '15m' },
);

// Logout - добавление в blacklist
await this.redis.setex(`blacklist:${accessToken}`, ttl, '1');
```

#### Doc Intelligence (NestJS)

```typescript
// JwtGuard - проверка токена
const payload = this.jwtService.verify(token, {
  secret: process.env.JWT_SECRET, // Тот же secret!
});

if (payload.type !== 'login') throw new UnauthorizedException();

const isBlacklisted = await this.redis.get(`blacklist:${token}`);
if (isBlacklisted) throw new UnauthorizedException('Token revoked');
```

#### Frontend (Next.js)

```typescript
// Хранение токенов в httpOnly cookies
// accessToken и refreshToken хранятся как httpOnly cookies
// (автоматически в response headers через Set-Cookie)

// Отправка в каждом запросе
// Browser автоматически отправляет cookies с заголовком Authorization
// через механизм HttpOnly cookie
Authorization: `Bearer {accessToken}`; // Браузер автоматически добавляет
```

### Обоснование (Pros)

- ✅ **Масштабируемость:** Микросервисы работают offline, не зависят друг от друга
- ✅ **Производительность:** Нет network calls для верификации токена (только local signature check)
- ✅ **Стандарт:** JWT - industri standard, работает везде (NestJS, .NET, гибридные системы)
- ✅ **Безопасность типов:** Каждый тип токена использует только для своей операции
- ✅ **Контролируемое анулирование:** Redis blacklist позволяет logout работать немедленно
- ✅ **Refresh логика:** accessToken короткий (15 мин), но можно обновлять через refreshToken
- ✅ **Симметричный ключ:** Один JWT_SECRET для всей системы, просто скопировать env var

### Недостатки (Cons)

- ❌ **Зависимость Redis для logout:** Если Redis упал, blacklist не работает (но токен все еще истекает через 15 мин)
- ❌ **Синхронизация secret:** Нужно убедиться что JWT_SECRET одинаков везде (env переменные)
- ❌ **HTTP-only cookies уязвимы для CSRF:** Нужна CSRF защита (SameSite=Strict, CSRF tokens если требуется)
- ❌ **Token size:** JWT больше чем session ID (но не критично, ~500 bytes)

## Последствия (Consequences)

##Возвращать accessToken и refreshToken в Set-Cookie headers (httpOnly: true)

- Добавить Redis интеграцию для blacklist
- Проверить что JWT_SECRET в .env установлен
- Документировать token types
- Реализовать forgot-password с reset token и временным хранением в Redis

### Backend (Doc Intelligence, другие сервисы)

- Создать JwtGuard для проверки токенов
- Извлекать accessToken из httpOnly cookie (browser отправляет автоматически)
- Получить JWT_SECRET из env (ДОЛЖЕН БЫТЬ ИДЕНТИЧЕН Identity Service)
- Создать Redis connection для blacklist проверки
- Вернуть 401 если токен невалиден/заблокирован

### Frontend

- Хранить accessToken в httpOnly cookie (backend устанавливает через Set-Cookie)
- Хранить refreshToken в httpOnly cookie (backend устанавливает через Set-Cookie)
- Браузер автоматически отправляет cookies с Authorization header
- Обновлять токен если получена 401 и refreshToken существует
- Перенаправить на /login если refreshToken тоже истек
- Удалить оба токена при logout (backend вернет Set-Cookie с Max-Age=0) 401 и refreshToken существует
- Перенаправить на /login если refreshToken тоже истек
- Удалить оба токена при logout

### Database

- Users table уже есть в Identity Service
- Нужно убедиться что password хешируется bcrypt

### Infrastructure

- Redis ДОЛЖЕН быть доступен для всех сервисов (blacklist проверка)
- JWT_SECRET должен быть скопирован во все .env файлы
- HTTPS обязателен в production (иначе можно перехватить токен в пути)

## Связи (Links)

- **Заменяет:** API Key стратегию (было в Doc Intelligence раньше)
- **Ссылается на:**
  - [Identity Service Readme](../../services/identity-service/README.md) - JWT payload specification
  - [Doc Intelligence Readme](../../services/doc-intelligence/README.md) - JwtGuard implementation
  - [Frontend Readme](../../frontend/README.md) - Token storage strategy

## Примеры реального использования

### User Registration

```bash
POST /auth/register
Body: { email: "user@example.com", password: "123456" }
Response:
{
  "message": "Verification email sent"
}
# Email содержит link с registration token (type: 'register')
```

### Verify Email

```bash
GET /auth/verify-registration?token=eyJhbGc...
Response:
{
  "user": { "id": "123", "email": "user@example.com" },
  "accessToken": "eyJhbGc... (type: 'login')",
  "refreshToken": "eyJhbGc... (type: 'refresh')"
}
```

### Upload Document (с JWT)

```bash
POST /upload/file
Header: Authorization: Bearer eyJhbGc...
// JwtGuard проверяет:
// 1. Signature валидна
// 2. type == 'login'
// 3. Не в Redis blacklist
// 4. exp > now
// Если OK → request.user = { sub: "123", email: "..." }
```

### Logout

```bash
POST /auth/logout
Header: Authorization: Bearer eyJhbGc...
// Backend добавляет токен в Redis:
// redis.setex("blacklist:eyJhbGc...", 300, "1")
// Следующий запрос с этим токеном → 401
```

### Forgot Password

```bash
POST /auth/forgot-password
Body: { email: "user@example.com" }
Response: { message: "If email exists, reset link has been sent" }
// Backend:
// 1. Проверяет лимит (макс 3 запроса в час)
// 2. Генерирует reset token (type: 'reset', exp: 15 мин)
// 3. Хранит в Redis: reset-token:{user.id} = token
// 4. Отправляет email с ссылкой: /auth/verify-reset?token=...
```

### Verify Reset Password

```bash
GET /auth/verify-reset?token=eyJhbGc...
Response: { message: "New password sent to email" }
// Backend:
// 1. Проверяет token signature и type == 'reset'
// 2. Проверяет в Redis blacklist
// 3. Проверяет что это текущий валидный reset token для пользователя
// 4. Генерирует новый пароль и хеширует bcrypt
// 5. Обновляет passwordHash в БД
// 6. Отправляет новый пароль на email
// 7. Добавляет token в blacklist
// 8. Удаляет reset-token:{user.id} из Redis
```
