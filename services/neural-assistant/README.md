# Neural Assistant Service

NestJS service for chat-based interaction with processed documents in the Personal Ops Center ecosystem.

Current status: initial scaffold created. The service purpose and development direction are defined, but the chat pipeline is still being implemented.

---

## What This Service Will Do

- Accept user chat messages for a selected document
- Validate JWT issued by `identity-service`
- Build conversational context from chat history
- Retrieve relevant document context from the processed data layer
- Send the final prompt to Gemini
- Stream the assistant response back to the frontend
- Persist chat sessions and chat messages

---

## Service Responsibility

`neural-assistant` does not ingest or parse files.

Its responsibility starts after the document has already been processed by `doc-intelligence`.

Separation of concerns:

- `doc-intelligence`: upload, parsing, extraction, preprocessing, analysis-ready document data
- `neural-assistant`: chat orchestration, history, retrieval, Gemini integration, response streaming

---

## Planned MVP Flow

1. User opens chat in the dashboard
2. User sees their previously uploaded documents
3. User selects one document
4. User sends a question
5. `neural-assistant` validates JWT and resolves user identity
6. Service loads recent chat history for the selected chat session
7. Service retrieves relevant context for the current document
8. Service sends prompt plus context to Gemini
9. Service streams the response back to the frontend
10. Service stores both user and assistant messages

---

## Planned Domain Model

### ChatSession

- `id`
- `userId`
- `documentId`
- `title`
- `createdAt`
- `updatedAt`

### ChatMessage

- `id`
- `chatSessionId`
- `role` (`user` or `assistant`)
- `content`
- `createdAt`

Relationship model:

- one document -> many chat sessions
- one chat session -> many chat messages

---

## Planned API Surface

These endpoints describe the intended MVP contract and are not fully implemented yet.

- `GET /documents`
  - returns documents available to the authenticated user for chat

- `POST /chat/stream`
  - accepts a user message and streams the assistant response

- `GET /chat/sessions/:id/messages`
  - returns saved chat history for a session

Swagger UI will be exposed under `/docs` during development.

---

## Environment Variables

Use `.env.Example` as the base template.

```env
# App
PORT=3003
NODE_ENV=production
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

Expected next additions as implementation progresses:

- `JWT_SECRET` or JWKS-related auth config
- Redis connection settings for blacklist checks
- Gemini API key
- database connection string for chat persistence
- service URLs for internal communication

---

## Local Development

From `services/neural-assistant`:

```bash
npm install
npm run start:dev
```

Useful scripts:

- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`

Default local port: `3003`

---

## Current Project Structure

```text
services/neural-assistant
	src/
		app.module.ts
		main.ts
	test/
	.env.Example
	package.json
```

Target structure will evolve as modules are added for:

- auth
- chat
- llm
- retrieval
- redis
- persistence

---

## Integration Notes

- Frontend will communicate with this service from the dashboard chat UI
- `identity-service` remains the single source of truth for JWT issuance
- `doc-intelligence` remains the source of processed document data
- Redis is expected to be used for JWT blacklist checks and possibly short-lived chat or stream state

---

## Near-Term Roadmap

1. Configure app bootstrap: config, CORS, Swagger, validation
2. Add JWT auth guard for protected routes
3. Add Redis-backed blacklist check for revoked tokens
4. Implement first test chat endpoint
5. Integrate Gemini
6. Add persistence for `ChatSession` and `ChatMessage`
7. Add retrieval flow over processed document context
