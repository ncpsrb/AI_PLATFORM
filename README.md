# AI Agent Platform

A simple but production-ready AI agent platform built with FastAPI, PostgreSQL, SQLAlchemy, React, and TailwindCSS. The UI intentionally keeps a clean PocketBase-like admin feel with a left sidebar, compact forms, simple tables, and direct workflows.

## 1. Project folder structure

```text
.
├── app/
│   ├── api/
│   │   ├── router.py
│   │   └── routes/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── sql/
│   └── schema.sql
├── requirements.txt
└── README.md
```

## 2. PostgreSQL schema

The SQL schema lives in `sql/schema.sql` and includes:

- `users`
- `agents`
- `chats`
- `messages`
- `notifications`
- `usage_logs`

Every table includes `created_at` and `updated_at`, with foreign keys set for ownership, chat history, notifications, and monitoring records.

## 3. Backend implementation (FastAPI)

### Highlights

- JWT auth for users and admins
- Separate hidden admin login route: `/admin-login` on the frontend and `/api/auth/admin-login` on the backend
- Role-based route protection via dependency injection
- CRUD endpoints for users, agents, chats, notifications, and monitoring
- Service layer for auth, agents, chat flows, notifications, and usage logging
- Auto-seeded default admin user on startup:
  - Email: `admin@platform.local`
  - Password: `admin123`

### Run backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## 4. Frontend implementation (React)

### Highlights

- Vite + React + TypeScript
- TailwindCSS styling with a lightweight admin dashboard layout
- User login and hidden admin login pages
- Agent management and chat history UI
- Notification Agent inbox page
- Admin panel for user management, agent assignment, notification creation, prompts, and usage logs

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

## 5. API contract (endpoint list)

### Auth
- `POST /api/auth/login`
- `POST /api/auth/admin-login`
- `GET /api/auth/me`

### User agent workflows
- `GET /api/agents`
- `POST /api/agents`
- `GET /api/agents/{agent_id}`
- `PUT /api/agents/{agent_id}`
- `DELETE /api/agents/{agent_id}`
- `GET /api/agents/{agent_id}/chats`
- `POST /api/agents/{agent_id}/chats`
- `GET /api/chats/{chat_id}/messages`
- `POST /api/chats/{chat_id}/messages`
- `GET /api/notifications`
- `PATCH /api/notifications/{notification_id}`

### Admin workflows
- `GET /api/admin/users`
- `POST /api/admin/users`
- `DELETE /api/admin/users/{user_id}`
- `GET /api/admin/agents`
- `POST /api/admin/agents`
- `PUT /api/admin/agents/{agent_id}`
- `DELETE /api/admin/agents/{agent_id}`
- `GET /api/admin/notifications`
- `POST /api/admin/notifications`
- `GET /api/admin/prompts`
- `GET /api/admin/usage-logs`

## 6. Example request/response

### User login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "role": "user"
}
```

### Create agent

```http
POST /api/agents
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Research Agent",
  "description": "Internal knowledge helper",
  "source_type": "local",
  "source_reference": "./agents/research.py",
  "configuration": {
    "temperature": 0.2,
    "max_tokens": 512
  },
  "behavior_prompt": "Answer clearly and summarize next steps."
}
```

```json
{
  "id": 1,
  "owner_id": 2,
  "name": "Research Agent",
  "description": "Internal knowledge helper",
  "source_type": "local",
  "source_reference": "./agents/research.py",
  "configuration": {
    "temperature": 0.2,
    "max_tokens": 512
  },
  "behavior_prompt": "Answer clearly and summarize next steps.",
  "created_at": "2026-03-22T00:00:00Z",
  "updated_at": "2026-03-22T00:00:00Z"
}
```

### Send chat message

```http
POST /api/chats/1/messages
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "content": "Summarize today's sales blockers."
}
```

```json
[
  {
    "id": 10,
    "chat_id": 1,
    "user_id": 2,
    "role": "user",
    "content": "Summarize today's sales blockers.",
    "created_at": "2026-03-22T00:00:00Z",
    "updated_at": "2026-03-22T00:00:00Z"
  },
  {
    "id": 11,
    "chat_id": 1,
    "user_id": null,
    "role": "assistant",
    "content": "Local agent 'Research Agent' received: Summarize today's sales blockers...",
    "created_at": "2026-03-22T00:00:01Z",
    "updated_at": "2026-03-22T00:00:01Z"
  }
]
```
