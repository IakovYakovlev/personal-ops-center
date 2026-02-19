# Система аутентификации

Система аутентификации с JWT, которая проверяет пользователя на каждый запрос к защищенным маршрутам.

## Как это работает

1. **Логин**: Пользователь вводит email и пароль на странице `/login`
2. **Получение JWT**: Сервер возвращает `accessToken` с временем жизни 15 минут
3. **Сохранение токена**: Токен сохраняется в httpOnly cookies (защищено от XSS)
4. **Проверка аутентификации**: Middleware проверяет токен на каждый запрос
5. **Редирект**: Если токена нет или он истек, пользователь перенаправляется на `/login`

## Структура файлов

```
lib/
  ├── auth.ts           # Утилиты для работы с JWT и cookies
  ├── api-client.ts     # Клиент для API запросов
app/
  ├── actions/
  │   └── auth.ts       # Server Actions для логина и логаута
  ├── login/
  │   └── page.tsx      # Страница логина
  └── page.tsx          # Главная страница (требует аутентификации)
components/
  └── login-form.tsx    # Компонент формы логина
middleware.ts          # Middleware для проверки аутентификации
```

## Публичные и защищенные маршруты

### Публичные маршруты (не требуют аутентификации)

- `/login` - Страница логина
- `/register` - Страница регистрации
- `/verify-registration` - Проверка регистрации
- `/forgot-password` - Восстановление пароля

### Защищенные маршруты

- `/` - Главная страница
- Все остальные маршруты

## Использование

### Логин

```typescript
import { loginAction } from '@/app/actions/auth';

// Server Action для логина
await loginAction(email, password, redirectTo);
```

### Логаут

```typescript
import { logoutAction } from '@/app/actions/auth';

// Server Action для логаута
<form action={logoutAction}>
  <button type="submit">Logout</button>
</form>
```

### Получение текущего пользователя

```typescript
import { getAuthToken } from '@/lib/auth';
import { getCurrentUser } from '@/lib/api-client';

const token = await getAuthToken();
const user = await getCurrentUser(token);
```

## Конфигурация

Отредактируйте `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Время жизни JWT

JWT действует **15 минут**. После истечения этого времени:

- Пользователь будет автоматически перенаправлен на `/login`
- Ему нужно будет заново ввести свои учетные данные

## Безопасность

- JWT хранится в **httpOnly cookies** (защищено от XSS атак)
- Cookies помечены как **secure** (требуют HTTPS в production)
- Middleware проверяет токен на сервере перед каждым запросом
- Cookies автоматически удаляются при логауте

## Обработка ошибок

Если JWT истек или невалиден:

1. Cookies автоматически удаляются
2. Пользователь перенаправляется на `/login?redirect=/previous-page`
3. После логина пользователь вернется на предыдущую страницу
