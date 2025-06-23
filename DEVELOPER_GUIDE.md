
---
# Machine-Readable Metadata (YAML)
project: Success Academy ChatGPT45
version: 1.0
date: 2025-04-17
services:
  web:
    framework: Next.js 15
    language: TypeScript
    folder: app/
  database:
    engine: PostgreSQL 15
    schema: database/schema.sql
  storage:
    type: local
    folder: uploads/
---

# Success Academy ChatGPT45 — Developer Guide

## 1. Project Overview
**Success Academy** is an online course platform that enables:
- **Instructors** to sign up, log in, create & manage courses, build curricula, upload lesson files, set pricing/visibility, preview & publish courses.
- **Students** to browse a catalog of published courses, purchase courses, and access only the courses they’ve bought.
- **Affiliate mechanics**: 95% direct‐sale revenue to instructors, 50/50 split on catalog sales, and 5% unilevel overrides up to 5 levels.

## 2. Goals & Requirements
1. **Auth**: Secure signup/login/logout with HTTP-only cookies.
2. **Course Builder**: Multi‐step UI (Details → Curriculum → Pricing → Review).
3. **Data Model**: Relational schema in PostgreSQL (instructors, courses, modules, lessons, media_files, purchases).
4. **APIs**: RESTful Next.js server routes under `/api/`.
5. **UI**: Next.js App Router (TSX + Tailwind CSS).
6. **Infra**: Docker Compose orchestrating web & Postgres.

## 3. Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript  
- **Styling**: Tailwind CSS  
- **Backend/API**: Next.js server routes (`app/api/.../route.ts`)  
- **Database**: PostgreSQL 15 (via `pg` client)  
- **Auth**: Cookie-based (HTTP-only)  
- **File Storage**: Local filesystem (`uploads/`)  
- **Containerization**: Docker & Docker Compose  
- **Dev Env**: WSL2 (Ubuntu), VS Code  

## 4. High-Level Architecture

```

┌─────────────┐
│   Browser   │
└─────┬───────┘
│ HTTP
▼
┌────────────────────────────────────┐
│        Next.js Web Service        │
│  (app/, Tailwind, TS, Server APIs)│
└─────────┬───────────┬──────────────┘
│           │
fetch │           │ DB connection (pg)
│           ▼
│    ┌───────────────────┐
│    │  PostgreSQL 15     │
│    │  (success\_academy) │
│    └───────────────────┘
│
▼
Local uploads/
(media files)

```

## 5. Directory Structure

```

.
├── Dockerfile
├── docker-compose.yml
├── database
│   ├── schema.sql        # CREATE TABLE definitions
│   └── seed.sql          # Optional seed data
├── app                   # Node / Next.js project root
│   ├── app               # Next.js App Router code
│   │   ├── api
│   │   │   ├── auth      # signup, login, logout
│   │   │   ├── courses   # CRUD & publish routes
│   │   │   ├── instructor# instructor-only routes
│   │   │   ├── student   # catalog & purchase
│   │   │   └── upload    # lesson file uploads
│   │   ├── create-course # UI to build a new course
│   │   ├── instructor
│   │   │   ├── courses   # “My Courses” page
│   │   │   └── preview   # Course preview before publish
│   │   ├── login         # login page
│   │   ├── signup        # signup page
│   │   ├── dashboard     # Auth guard & redirect
│   │   ├── student
│   │   │   └── catalog   # Student browsing UI
│   │   ├── layout.tsx    # root layout component
│   │   ├── page.tsx      # landing page
│   │   ├── globals.css   # base styles
│   │   └── favicon.ico
│   ├── public            # static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── …config files
├── uploads/              # lesson file storage (ignored by Git)
└── setup_structure.sh    # (optional) initial directory scaffolding

````

## 6. Data Model

| Table         | Columns                                                        |
| ------------- | -------------------------------------------------------------- |
| **instructors** | id (PK), name, email (unique), password_hash, created_at      |
| **students**    | id (PK), name, email (unique), created_at                    |
| **courses**     | id (PK), instructor_id (FK), title, description, category, price, visibility, published, created_at |
| **modules**     | id (PK), course_id (FK), title, position                     |
| **lessons**     | id (PK), module_id (FK), title, position                     |
| **media_files** | id (PK), lesson_id (FK), filename, mime_type, url            |
| **purchases**   | id (PK), student_id (FK), course_id (FK), purchased_at       |

## 7. API Endpoints Reference

### Authentication
| Method | Route                   | Request Body                   | Response                            |
| ------ | ----------------------- | ------------------------------ | ----------------------------------- |
| POST   | `/api/auth/signup`      | `{ name, email, password }`    | `{ success: true, instructorId }`   |
| POST   | `/api/auth/login`       | `{ email, password }`          | `Set-Cookie: instructor_id`         |
| POST   | `/api/auth/logout`      | _(none)_                       | Clears cookie                       |

### Courses
| Method | Route                          | Description                        |
| ------ | ------------------------------ | ---------------------------------- |
| POST   | `/api/courses`                 | Create draft course (FormData)     |
| GET    | `/api/courses/[id]`            | Fetch course + modules + lessons   |
| POST   | `/api/courses/[id]/publish`    | Mark course as published           |

### Instructor-Only
| Method | Route                                   | Description                          |
| ------ | --------------------------------------- | ------------------------------------ |
| GET    | `/api/instructor/courses`               | List instructor’s courses            |
| PATCH  | `/api/instructor/courses/[id]/edit`     | Edit course metadata                 |

### Student-Facing
| Method | Route                          | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/api/student/catalog`         | List all published courses           |
| POST   | `/api/student/purchase`        | Record student purchase              |

### File Upload
| Method | Route                    | Description                              |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | `/api/upload/lesson`     | Upload lesson media to `uploads/` folder |

---

## 8. Development Setup

1. **Clone repo**  
   ```bash
   git clone https://github.com/johnmilanoski/success-academy-chatgpt45.git
   cd success-academy-chatgpt45
````

2. **Run with Docker Compose**

   ```bash
   docker-compose up --build -d
   ```

3. **Access**

   * Web UI: `http://localhost:3000`
   * Database: `psql -h localhost -p 5432 -U postgres success_academy`

4. **Teardown & Rebuild**

   * Reset DB schema:

     ```bash
     docker-compose down
     docker volume rm success-academy_pgdata
     docker-compose up --build -d
     ```
   * Otherwise just restart web:

     ```bash
     docker-compose up --build -d web
     ```

---

> **Note for AI**:
>
> * The YAML metadata at the top is machine-readable.
> * Section headings follow Markdown conventions (`##`, `###`).
> * Tables and code fences clearly delineate data models and examples.

````

Once you’ve saved **DEVELOPER_GUIDE.md**, commit and push:

```bash
git add DEVELOPER_GUIDE.md
git commit -m "Add developer guide"
git push
````
