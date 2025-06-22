# Success Academy Platform

## Project Overview
**Success Academy** is a Next.js‑based online course platform where instructors can:
- Sign up, log in, and create/manage courses  
- Build course curricula with modules, lessons, and file uploads  
- Set pricing & visibility (public vs. private)  
- Preview and publish courses  
- Earn revenue via direct affiliate links (95% for direct sales) and site catalog sales (50/50 split), with a 5% unilevel affiliate override  

Students can:
- Browse the catalog of published courses  
- Purchase courses  
- Access only the courses they’ve bought  

## Tech Stack
- **Frontend:** Next.js 15 (App Router) with React 19 & TypeScript  
- **Styling:** Tailwind CSS  
- **Backend/API:** Next.js Server Routes (App Router `route.ts`)  
- **Database:** PostgreSQL (via `pg` Node client)  
- **Auth:** Cookie‑based authentication (HTTP‑only cookie)  
- **Storage:** Local `uploads/` folder for lesson media  
- **Infrastructure:** Docker & Docker Compose for both web and DB services  
- **Dev Env:** WSL2 (Ubuntu) on Windows, VS Code  

## Architecture / Folder Structure
```
.
├── Dockerfile
├── docker-compose.yml
├── database
│   ├── schema.sql      # CREATE TABLE definitions
│   └── seed.sql        # Optional seed data
├── app                  # Next.js App Router code
│   ├── api
│   │   ├── auth         # signup, login, logout
│   │   ├── courses      # CRUD & publish routes
│   │   ├── instructor   # instructor‑only routes
│   │   ├── student      # catalog & purchase
│   │   └── upload       # lesson file uploads
│   ├── create-course    # UI to build a new course
│   ├── instructor
│   │   ├── courses      # “My Courses” page
│   │   └── preview      # Course preview before publish
│   ├── login
│   ├── signup
│   ├── dashboard        # Auth guard & redirect
│   ├── student
│   │   └── catalog      # Student browsing UI
│   ├── layout.tsx
│   └── globals.css
├── uploads/             # lesson file storage (ignored by Git)
└── setup_structure.sh   # (optional) initial directory scaffolding
```

## Development Setup & Docker

1. **Prerequisites**  
   - Docker Desktop (with WSL integration)  
   - VS Code (or your editor of choice)  

2. **Clone & configure**  
   ```bash
   git clone https://github.com/johnmilanoski/success-academy-chatgpt45.git
   cd success-academy-chatgpt45
   ```

3. **Build & run services**  
   ```bash
   docker-compose up --build -d
   ```
   - **Web**: http://localhost:3000  
   - **Postgres** (`success-academy-db` container):  
     - DB: `success_academy`  
     - User: `postgres` / `postgres`  

4. **Rebuild steps**  
   - If you change schema:  
     ```bash
     docker-compose down
     docker volume rm success-academy_pgdata
     docker-compose up --build -d
     ```
   - Otherwise:  
     ```bash
     docker-compose up --build -d web
     ```

5. **Stop services**  
   ```bash
   docker-compose down
   ```

## API Endpoints Reference

### Authentication
| Method | Route             | Body                          | Response                         |
| ------ | ----------------- | ----------------------------- | -------------------------------- |
| POST   | `/api/auth/signup`| `{ name, email, password }`   | `{ success: true, instructorId }`|
| POST   | `/api/auth/login` | `{ email, password }`         | `Set-Cookie: instructor_id`      |
| POST   | `/api/auth/logout`| _(no body)_                   | Clears cookie                    |

### Courses
| Method | Route                           | Body / Params             | Description                        |
| ------ | ------------------------------- | ------------------------- | ---------------------------------- |
| POST   | `/api/courses`                 | FormData (title,desc,…)    | Create draft course                |
| GET    | `/api/courses/[id]`            | URL param `id`             | Get course with modules & lessons  |
| POST   | `/api/courses/[id]/publish`    | URL param `id`             | Mark course `published = true`     |

### Instructor‑Only
| Method | Route                                           | Body / Params             | Description                               |
| ------ | ----------------------------------------------- | ------------------------- | -----------------------------------------  |
| GET    | `/api/instructor/courses`                       | _(cookie auth)_           | List all courses for logged‑in instructor |
| PATCH  | `/api/instructor/courses/[id]/edit`             | JSON (title,desc,…)       | Update course metadata                    |

### Student‑Facing
| Method | Route                         | Body / Params           | Description                     |
| ------ | ----------------------------- | ----------------------- | ------------------------------- |
| GET    | `/api/student/catalog`        | _(none)_                | List all published courses      |
| POST   | `/api/student/purchase`       | `{ studentId, courseId }` | Record a student purchase     |

### File Upload
| Method | Route                        | FormData fields per lesson | Description                |
| ------ | ---------------------------- | -------------------------- | -------------------------- |
| POST   | `/api/upload/lesson`         | `lessonFiles-<mi>-<li>`    | Save lesson media to `/uploads` |
