# AI Document Intelligence API

> NestJS-powered REST API for document ingestion and AI-driven text analysis.  
> **Authentication: API Key only**

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
  - [Auth](#auth)
  - [Upload](#upload)
  - [Get Job Result](#get-job-result)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [License](#license)

---

## Plan behavior

| Plan  | Max Symbols | Mode       |
|-------|-------------|------------|
| free  | 100k        | synchronous |
| pro   | 1M          | async job   |
| ultra | 10M         | async job   |

### Synchronous mode (free)
File processed immediately. Response returned in real-time.

### Asynchronous mode (pro/ultra)
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
- Auth: **API Keys**
- Plans & quotas: free / pro / ultra (extensible)
- **rate limiting**
- Swagger docs
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
│   │  ├─ decorators/
│   │  │  └─ api-key-swagger.decorator.ts
│   │  └─ decorators/
│   │     └─ log-time.interceptor.ts
│   │
│   ├─ modules/
│   │   ├─ apikey/
│   │   │  ├─ apikey.guard.ts
│   │   │  ├─ apikey.module.ts
│   │   │  └─ apikey.service.ts
│   │   │
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
│   │   │   │   ├─ pro.strategy.ts
│   │   │   │   └─ ultra.strategy.ts
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
- **DB**: PostgreSQL via Prisma ORM, 
-    "bullmq": "^5.64.1",
-    "ioredis": "^5.8.2",
-    "p-limit": "^7.2.0",
- **AI Providers**: Gemini
- **Auth**: API Key
- **Docs**: Swagger (`@nestjs/docs`)
- **Deploy**: 

### Environment Variables

Create `.env` from `.env.example` and fill:

```
# App
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/DocSenseDb?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Auth
X_API_KEY='e5da6e3c0eaa2e91b37b3f4f280d46368c96b0ad88c4124f27412fe81e5c4153'

# Providers (pick your stack)
GEMINI_API_KEY='AIzaSyDcBaBntJlhOC91yF0NJJpURgsAMwsRpDo'

# Rate limits (example)
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

### Auth

- `X_API_KEY` - only

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


```bash

# Upload a PDF
DOC_ID=$(curl -s -X POST http://localhost:3000/upload/file \
  -H "Authorization: X_API_KEY" \
  -H "string: userId"\
  -H "string: plan"\
  -F file=@./sample.pdf | jq -r '.id')

# Get extracted text
curl -H "Authorization: X_API_KEY" \
  http://localhost:3000/jobs/id

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

Use Jest + Supertest. Provide fixtures for PDFs/DOCX/TXT.

## License

MIT
