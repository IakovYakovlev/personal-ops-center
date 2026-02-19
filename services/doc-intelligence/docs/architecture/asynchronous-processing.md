# Asynchronous Processing Architecture

This document describes how large documents are processed in the API, how chunking works, how retries are handled, and how asynchronous jobs ensure scalable and stable behavior for Pro/Ultra plans.

---

# 1. Overview

The API supports two processing modes:

| Plan  | Max Symbols | Processing Mode |
|-------|-------------|------------------|
| free  | 100,000     | synchronous      |
| pro   | 1,000,000   | asynchronous job |
| ultra | 10,000,000  | asynchronous job |

---

# 2. Why asynchronous mode is required

Large documents cannot be processed in a single LLM request:

- LLMs have limited context windows
- multiple chunk requests are needed
- final merge requires an additional LLM call
- processing can take 5–120 seconds

If the API attempted to return the result synchronously:

- browsers would time out
- Node.js request lifetime would exceed limits

Therefore Pro/Ultra require **background job processing**.

---

# 3. Chunking Pipeline

Large documents are split into fixed-size chunks.

Recommended chunk size: **50,000 symbols**

input text → chunk1, chunk2, chunk3, ...


Each chunk is processed independently by the LLM.

Example:

1. Split into 14 chunks
2. LLM is called 14 times
3. Each chunk produces a partial summary
4. All summaries are merged into a final summary

---

# 4. Retry Logic

Every LLM request has retry logic:

- errors 429 (rate limit)
- errors 500/503 (server issues)
- connection timeouts

Retry schedule:

1. retry after 1s
2. retry after 2s
3. retry after 4s
4. retry after 8s
5. retry after 15s

If all 5 retries fail:
- the chunk is moved to a *retry later* state
- worker retries it again after a delay (20–60s)
- if it still fails → job fails with error status

---

# 5. Final Merge

After all chunks succeed, a final LLM request is executed:

merge(summaries) → final_summary


The merge step:

- removes duplicated information
- creates a cohesive narrative
- improves readability
- ensures consistent structure

This step is mandatory for large documents.

---

# 6. Jobs

Every asynchronous task is stored in the database as a Job:

```prisma
model Job {
  id        String   @id @default(uuid())
  userId    String
  status    String
  progress  Int       @default(0)
  result    Json?
  error     String?
  createdAt DateTime @default(now())

  @@index([userId])
}
```


```md
# Processing Behavior

## Free Plan — Instant Response
- Up to **100,000 symbols**
- The API processes your document immediately
- Response is returned synchronously

Perfect for small/medium files.

---

## Pro & Ultra Plans — Background Processing
Large documents are handled asynchronously.

### How it works:

**Step 1 — Upload your file**
You receive:

```json
{
  "jobId": "uuid",
  "statusUrl": "/jobs/uuid"
}
Step 2 — Poll the status
Use the provided URL to check job progress.

Step 3 — Retrieve the result
When the job is ready, GET /jobs/{id} returns the complete analysis.

File Size Limits
Free: up to 100k symbols

Pro: up to 1M symbols

Ultra: up to 10M symbols

Documents above 50k symbols are automatically split internally and processed in multiple steps.

Security
Every user has access only to their own jobs.

If you request a job that doesn't belong to you, the API returns:

Copy code
403 Forbidden
This guarantees complete data isolation.

The `/jobs/{id}` endpoint does NOT consume usage limits.
It is only used to retrieve the result of a background job.

Usage limits apply exclusively to:
POST /upload/file


Results are stored for 24 hours (free plan) or 7–30 days (paid plans).
Jobs in processing state expire after 1 hour.
Once completed, results are stored in the database.
