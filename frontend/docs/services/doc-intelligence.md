# Frontend Architecture & UX Strategy

Презентационный слой приложения построен на **Next.js 16 (App Router)** с использованием **shadcn/ui** и **Tailwind CSS**. Интерфейс спроектирован как единый реактивный поток (Single Page Flow), минимизирующий когнитивную нагрузку на пользователя.

## 🏗 Интерфейсный пайплайн (User Flow)

Приложение реализует концепцию "Progressive Disclosure" (постепенное раскрытие функционала) с использованием **disabled состояния** вместо условного скрытия элементов:

### 1. Зона загрузки (Top: Dropzone)

- **Состояние по умолчанию**: Активная, остальные элементы видны но заблокированы.
- **Технология**: Кастомный Drag-and-Drop на базе `react-dropzone`.
- **Поведение**: При успешной валидации файла (тип, размер < 5MB) приложение разблокирует следующий этап.

### 2. Выбор стратегии (Middle: Strategy Selection)

Всегда видна на экране, но заблокирована до загрузки файла:

Подробное решение зафиксировано в ADR: [docs/architecture/adr/0002-doc-intel-processing-strategy.md](../architecture/adr/0002-doc-intel-processing-strategy.md)

- **⚡ Direct Scan (Synchronous)**: Прямой HTTP-запрос. Идеально для быстрой проверки.
- **⏳ Cloud Task (Asynchronous)**: Создание фоновой задачи (Job). Демонстрирует работу очередей и долгоживущих процессов.
  > Выбранная карточка подсвечивается (`ring-2 ring-primary`), фиксируя состояние в `useState`.
  > Когда файл загружен — карточки становятся интерактивными.

### 3. Действие (Action: The Button)

- **Универсальная кнопка**: Всегда видна, текст меняется в зависимости от выбора ("Instant Analyze" vs "Create Analysis Job").
- **Блокировка**: Кнопка неактивна, пока не выбраны файл и стратегия.
- **Преимущество подхода**: Пользователь видит полную форму с самого начала, не нужно ждать появления элементов.

---

## 🛠 Обработка состояний (Processing & Feedback)

Логика отображения меняется динамически в зависимости от выбранного режима:

### Режим: Synchronous

1. После клика область результата заменяется на **Skeleton Layout** (имитация будущих карточек Summary, Insights, Keywords).
2. При получении 200 OK данные мгновенно подменяют скелетоны.

### Режим: Asynchronous

Запускается интерактивный процесс мониторинга задачи:

1. **Stepper (Шагомер)**: Визуальная шкала прогресса:
   - `[✓] File Uploaded`
   - `[●] Processing Job #[ID]...` (вращающийся спиннер)
   - `[ ] Result Ready`
2. **Live Event Log**: Под кнопкой запуска разворачивается консоль с "псевдо-живыми" логами (на базе статусов из БД/Redis):

```bash
12:05:01: [System] Job dispatched to queue...
12:05:04: [Worker] Instance picked up the task. Starting text extraction...
12:05:08: [LLM] Request sent to OpenAI. Waiting for response...
12:05:12: [System] Analysis completed. Finalizing result...
```

## 📊 Демонстрация результата (Output Area)

Результат представлен в виде структурированного дашборда, а не простого текста:

- Summary Card: Краткая выжимка (3-4 предложения).

- Insights List: Ключевые выводы с иконками.

- Keyword Cloud: Группа Badge компонентов для быстрой оценки тематики.

- Technical View: Скрытый блок (Collapsible) с сырым JSON ответом для разработчиков.

## 🛡 Безопасность на фронтенде

### Многоуровневая валидация файлов

Валидация реализована в **трёх слоях** для максимальной надёжности и производительности:

#### 1️⃣ UploadDropzone (UX Layer)

**Первая линия защиты — немедленный фидбэк пользователю:**

- ✅ Проверка расширения (.pdf, .docx, .txt)
- ✅ Проверка размера (< 5MB)
- ✅ Alert с ошибкой при валидации

```typescript
// upload-dropzone.tsx
const validTypes = ['application/pdf', '...'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!validTypes.includes(file.type)) {
  alert('Only PDF, DOCX, and TXT files are supported');
  return;
}
if (file.size > maxSize) {
  alert('File size must be less than 5MB');
  return;
}
```

#### 2️⃣ handleUpload (Page Layer)

**Страховка перед отправкой — предотвращает ненужные запросы:**

- ✅ Проверка расширения (.pdf, .docx, .txt)
- ✅ Проверка размера (< 5MB)
- ✅ Не вызывает `docService.uploadDocument()` если валидация не прошла

```typescript
// page.tsx - handleUpload
const validateFile = (file: File): string | null => {
  const validTypes = ['application/pdf', '...'];
  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Only PDF, DOCX, and TXT are supported.';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File size exceeds 5MB limit.';
  }
  return null;
};
```

#### 3️⃣ uploadDocument (Service Layer)

**Финальная переделка перед fetch — экономит ресурсы:**

- ✅ Проверка расширения (.pdf, .docx, .txt)
- ✅ Проверка размера (< 5MB)
- ✅ На случай обхода фронт-валидации

```typescript
// docService.ts - uploadDocument
const validateFile = (file: File): void => {
  const validTypes = ['application/pdf', '...'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large');
  }
};
```

#### 4️⃣ NestJS Backend

**Серверная валидация — обязательная защита:**

- ✅ Проверка расширения и размера
- ✅ Проверка содержимого (6000 символов)
- ✅ Никогда не полагаться только на фронт

### Обработка ошибок валидации

- **UploadDropzone**: Alert сообщение
- **handleUpload**: Показать ошибку в ErrorCard
- **docService**: Throw exception, обработка в handleUpload

### Rate Limit Handling

При получении ошибки 429 фронтенд:

- Блокирует кнопку отправки
- Показывает ошибку в ErrorCard с информацией о лимите
