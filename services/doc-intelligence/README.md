# AI Document Intelligence API

> NestJS-powered REST API for document ingestion and AI-driven text analysis.  
> **Authentication: JWT Bearer Token**

---

## Table of Contents

- [Plan behavior](#plan-behavior)
  - [Synchronous mode](#synchronous-mode-free)
  - [Asynchronous mode](#asynchronous-mode-proultra)
- [Motivation](#motivation)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Overview](#api-overview)
  - [Authentication](#authentication)
  - [Upload](#upload)
  - [Get Job Result](#get-job-result)
  - [Rate Limiting](#rate-limiting)
  - [Constraints](#constraints)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [License](#license)

---

## Plan behavior

| Plan | Max Symbols | Mode        |
| ---- | ----------- | ----------- |
| free | 100k        | synchronous |
| pro  | 1M          | async job   |

### Synchronous mode (free)

File processed immediately. Response returned in real-time.

### Asynchronous mode (pro)

Large files processed via background job:

1. Upload file → get `jobId`
2. Poll `GET /jobs/:id`
3. Receive result once ready

More details in: `docs/architecture/asynchronous-processing.md`

## Motivation

Manual document review is slow and error‑prone. This API extracts text from common formats and runs AI analysis to
produce summaries, topics, keywords, sentiment, and actionable insights. It’s designed for SaaS monetization (API keys,
plans, quotas) and marketplace distribution (RapidAPI).

## Features

- File ingestion: **PDF, DOCX, TXT**
- Text extraction: `pdf-parse`, `mammoth`, `toString('utf-8')`
- AI analysis: summary, keywords, sentiment, topics, insights
- Auth: **JWT in httpOnly cookies** (from identity-service)
- Secure user identification: `userId` extracted from JWT payload server-side
- Plans & quotas: free / pro (extensible)
- Rate limiting: 5 requests/hour (upload), 100 requests/hour (get result)
- File size validation: max 5 MB per file
- Character limit: max 6000 characters per file
- Token revocation via Redis blacklist
- CORS with configurable origins
- Swagger docs with JWT support
- Production config
- PostgreSQL via Prisma ORM

## Architecture

```
├─ docs
├─ prisma/
│   ├─ prisma.service.ts
│   ├─ schema.prisma
│   └─ seed.ts
├─ src/
│   │
│   ├─ common/
│   │  ├─ constants/
│   │  │  └─ rate-limit.constants.ts
│   │  ├─ decorators/
│   │  │  └─ rate-limit.decorator.ts
│   │  ├─ filters/
│   │  │  └─ file-size-exception.filter.ts
│   │  ├─ guards/
│   │  │  ├─ rate-limit.guard.ts
│   │  │  └─ jwt.guard.ts
│   │  ├─ interfaces/
│   │  │  └─ rate-limit.interface.ts
│   │  └─ interceptors/
│   │     └─ log-time.interceptor.ts
│   │
│   ├─ modules/
│   │   ├─ apikey/
│   │   │  ├─ apikey.guard.ts
│   │   │  ├─ apikey.module.ts
│   │   │  └─ apikey.service.ts
│   │   │
│   │   ├─ auth/
│   │   │  ├─ auth.module.ts
│   │   │  └─ jwt.guard.ts
│   │   │
│   │   ├─ redis/
│   │   │  └─ redis.module.ts
│   │   ├─ jobs/
│   │   │   ├─ jobs.controller.ts
│   │   │   ├─ jobs.module.ts
│   │   │   ├─ jobs.processor.ts
│   │   │   └─ jobs.service.ts
│   │   │
│   │   ├─ llm/
│   │   │   ├─ llm.module.ts
│   │   │   └─ llm.service.ts
│   │   │
│   │   ├─ plans/
│   │   │   ├─ strategies/
│   │   │   │   ├─ base.plan-strategy.ts
│   │   │   │   ├─ free.strategy.ts
│   │   │   │   ├─ plan-strategy.factory.ts
│   │   │   │   ├─ plan-strategy.interface.ts
│   │   │   │   └─ pro.strategy.ts
│   │   │   ├─ plans.module.ts
│   │   │   └─ plans.service.ts
│   │   │
│   │   ├─ read/
│   │   │   ├─ strategies/
│   │   │   │   ├─ docx.strategy.ts
│   │   │   │   ├─ file-reader-factory.ts
│   │   │   │   └─ file-reader-strategy.interface.ts
│   │   │   │   ├─ pdf.strategy.ts
│   │   │   │   ├─ txt.strategy.ts
│   │   │   ├─ read.module.ts
│   │   │   └─ read.service.ts
│   │   │
│   │   ├─ text-processing/
│   │   │   ├─ text-processing.module.ts
│   │   │   └─ text-processing.service.ts
│   │   │
│   │   ├─ upload/
│   │   │   ├─ dto/
│   │   │   │   └─ upload-file.swagger.dto.ts
│   │   │   ├─ upload.controller.ts
│   │   │   ├─ upload.module.ts
│   │   │   └─ upload.service.ts
│   │   │
│   │   └─ usage/
│   │       ├─ dto/
│   │       │  ├─usage-check-result.dto.ts
│   │       │  ├─usage-limit-metric.dto.ts
│   │       │  └─usage-limit-stats.dto.ts
│   │       ├─ usage.module.ts
│   │       └─ usage.service.ts
│   │
│   ├─ main.ts
│   └─ app.module.ts

```

## Tech Stack

- **Language**: TypeScript
- **Framework**: NestJS
- **DB**: PostgreSQL via Prisma ORM
- **Cache**: Redis (ioredis)
- **Job Queue**: BullMQ
- **AI Provider**: Gemini
- **Auth**: JWT Bearer Token (httpOnly cookies)
- **Cookie Handling**: cookie-parser
- **Documentation**: Swagger/OpenAPI (`@nestjs/swagger`)
- **Validation**: Custom Pipes & Guards
- **Rate Limiting**: Custom Decorators & Guards with Redis

### Environment Variables

Create `.env` from `.env.example` and fill:

```
# App
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/DocSenseDb?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Auth (JWT)
JWT_SECRET='your-secret-key-from-identity-service'

# Rate Limits
UPLOAD_RATE_LIMIT=5
GET_RATE_LIMIT=100

# Providers (pick your stack)
GEMINI_API_KEY='your-gemini-api-key'

# Processing Config
CHUNK_SIZE=50000
MERGE_BATCH_SIZE=10
```

## Database

Prisma models (simplified):

```prisma
model Usage {
  id            Int      @id @default(autoincrement())
  userId        String
  plan          String
  totalSymbols  Int      @default(0)
  totalRequests Int      @default(0)
  periodStart   DateTime @default(now())
  createdAt     DateTime @default(now())

  @@unique([userId, plan])
}

model Plan {
  id            Int    @id @default(autoincrement())
  name          String @unique
  limitRequests Int
  limitSymbols  Int
}

model Job {
  id        String   @id
  userId    String
  plan      String
  status    String // pendign | processing | completed | failed
  result    Json?
  error     String?
  createdAd DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Migrations are stored under `prisma/migrations`. Use `npm prisma:migrate` to apply.

## API Overview

Open Swagger UI at `/docs` when the server is running.

### Authentication

- **Type**: JWT Bearer Token
- **Storage**: httpOnly cookie (`auth_token`)
- **Cookie sent automatically**: Browsers include cookies on cross-origin requests when frontend uses `credentials: 'include'`
- **Fallback**: `Authorization: Bearer <token>` header also supported
- **Token Source**: Obtained from identity-service login endpoint
- **Token Expiry**: 15 minutes
- **Revocation**: Tokens are checked against Redis blacklist
- **User identification**: `userId` extracted from JWT payload (`sub` claim) server-side

**Note**: Frontend clients should rely on httpOnly cookies. The server extracts `userId` from the JWT payload, so no separate user identifier needs to be sent by the client.

### Upload

- `POST /upload/file` — upload a document (PDF/DOCX/TXT)

### Get Job Result

- `GET /jobs/:id`

**Response (Processing):**

```json
{
  "status": "processing",
  "jobId": "123"
}
```

**Flow:**

Returns status from Redis if the job is still in progress.

Returns the final result from PostgreSQL once the job is completed.

### Rate Limiting

- **Upload file**: 5 requests per hour
- **Get job result**: 100 requests per hour
- **Response on limit exceed**: HTTP 429 (Too Many Requests)

### Constraints

- **File size**: Maximum 5 MB per file
- **File content**: Maximum 6000 characters per file
- **Monthly quota**: Based on user plan (100k, 1M, or 10M symbols)

```bash

# Get JWT token from identity-service (login endpoint)
# The token will be stored in an httpOnly cookie automatically

# Upload a PDF (browser sends cookie automatically with credentials: 'include')
DOC_ID=$(curl -s -X POST http://localhost:3002/upload/file \
  -H "plan: pro" \
  --cookie "auth_token=$TOKEN" \
  -F file=@./sample.pdf | jq -r '.jobId')

# Get job result
curl --cookie "auth_token=$TOKEN" \
  http://localhost:3002/jobs/$DOC_ID

# Note: When using browsers or frontend clients with credentials: 'include',
# cookies are sent automatically and no manual headers are needed.

```

## Project Structure

- `src/modules/*` — feature modules (upload, jobs, llm, ...)
- `src/common/*` — guards, interceptors, decorators, utils
- `prisma/*` — schema and migrations
- `docs/*` — extended documentation, ADRs, diagrams

## Development

```bash
npm lint
npm format
npm start:dev
npm prisma:studio   # DB GUI
```

Code style: ESLint + Prettier. Commit style: Conventional Commits.

## Testing

```bash
npm test
npm test:e2e
```

Use Jest + Supertest. Test fixtures include PDFs, DOCX, and TXT files.

## License

MIT
