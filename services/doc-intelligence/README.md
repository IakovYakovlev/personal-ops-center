# Doc Intelligence Service

NestJS service for document ingestion and AI analysis in the Personal Ops Center ecosystem.

Current auth model: JWT from `identity-service` (Bearer token or `auth_token` cookie).

---

## What This Service Does

- Accepts document uploads (`.pdf`, `.docx`, `.txt`)
- Extracts text and validates content
- Runs AI analysis via Gemini (`gemini-2.5-flash-lite`)
- Supports plan-based processing:
  - `free`: synchronous response with analysis result
  - `pro`: asynchronous job (upload -> `jobId` -> polling)
- Tracks per-user usage and limits in PostgreSQL
- Uses Redis for rate limits, token blacklist checks, and temporary job state

---

## API

Swagger UI: `/docs`

### Authentication

- Header: `Authorization: Bearer <jwt>`
- Or cookie: `auth_token=<jwt>`
- `userId` is extracted server-side from JWT `sub`

### Endpoints

- `POST /upload/file`
  - Multipart field: `file`
  - Required header: `plan` (`free` or `pro`)
  - Protected by `JwtGuard` and `RateLimitGuard`

- `GET /jobs/:id`
  - Returns job status/result for the authenticated user
  - Protected by `JwtGuard` and `RateLimitGuard`

### Upload Constraints

- File types: `pdf`, `docx`, `txt`
- Max upload size: `5 MB`
- Max extracted text length: `6000` characters
- File type validation includes extension + magic bytes (for PDF/DOCX)

### Processing Modes

- `free` plan:
  - Processes text synchronously
  - Returns `summary`, `keywords`, `sentiment`, `main_topics`, `insights`

- `pro` plan:
  - Creates background BullMQ job
  - Returns `{ "jobId": "..." }` inside `result`
  - Poll with `GET /jobs/:id`

---

## Rate Limiting

Configured by env vars:

- `UPLOAD_RATE_LIMIT` (per hour, per user)
- `GET_RATE_LIMIT` (per hour, per user)

Defaults in code are `5` and `5` if env values are not provided.

---

## Environment Variables

Use `.env.Example` as template:

```env
# App
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Database / Redis
DATABASE_URL=postgresql://postgres:password@localhost:5432/DocSenseDb?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key

# AI
GEMINI_API_KEY=your-gemini-api-key

# Text processing
CHUNK_SIZE=50000
MERGE_BATCH_SIZE=10

# Rate limits
UPLOAD_RATE_LIMIT=5
GET_RATE_LIMIT=5
```

Notes:

- CORS uses `CORS_ORIGINS` (comma-separated).
- If `PORT` is not set, service falls back to `3002`.

---

## Local Development

From `services/doc-intelligence`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run start:dev
```

Useful scripts:

- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run deploy`

---

## Project Structure

```text
services/doc-intelligence
  docs/
  prisma/
    schema.prisma
    seed.ts
  src/
    common/
    modules/
      auth/
      jobs/
      llm/
      plans/
      read/
      redis/
      text-processing/
      upload/
      usage/
    app.module.ts
    main.ts
```

---

## Related Docs

- `docs/architecture/asynchronous-processing.md`
- `docs/backlog.md`
- `../../ROADMAP.md` (project-level roadmap)

---

## Current Caveats

- `PlanStrategyFactory` currently supports only `free` and `pro` for execution.
- `prisma/seed.ts` creates `free`, `pro`, and `ultra` plans with identical limits by default.

If `ultra` should be available via API, add strategy support in `src/modules/plans/plan-strategy.factory.ts` and a corresponding strategy implementation.
