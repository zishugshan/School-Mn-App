# AGENTS.md — School Management System

## Stack

- **Backend**: Java 21, Spring Boot 3.2, Gradle, PostgreSQL, Flyway, JWT (jjwt 0.12.5)
- **Frontend**: Vite + React 18 + TypeScript, MUI 5, Chart.js, Axios
- **Infra**: Docker, Docker Compose, K8s, GitHub Actions

## Quick Start

```bash
# Reset DB (first time or after schema changes)
docker exec -it school-postgres psql -U school_admin -d school_mgmt -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm install && npm run dev
```

## Backend commands

```bash
./gradlew bootJar        # build production jar
./gradlew test           # run tests (uses H2)
./gradlew bootRun        # dev server on :8080
```

Frontend proxies `/api/*` → `localhost:8080` via Vite config (dev only).

## Database

- Flyway migrations in `backend/src/main/resources/db/migration/`
- `V1__init_schema.sql` — full schema (42+ tables)
- `V2` through `V7` were **removed** (contained sample data, not suitable for production)
- `V11` seeds **classes 1-12** with sections A/B/C (previously only 11-12)
- `V14` — `schools` table
- `V15` — `contact_inquiries` table
- `V16` — seeds demo users (superadmin, teacher, student, parent) with password `password123`
- **Never** use `ddl-auto: update` — Flyway owns the schema
- Local: `jdbc:postgresql://localhost:5432/school_mgmt`, user/pass `school_admin`/`changeme`
- Docker PostgreSQL data is bind-mounted to `./data/postgres/` (gitignored)
- Tests use H2 in-memory

## Registration / Class Auto-Creation

- During registration, class field is **text input** (number or name like "LKG")
- Backend looks up class by `name` → then by `code ("CLS-" + input)` → auto-creates if neither matches
- Sections are auto-created per class if they don't exist
- `GET /api/classes` is **public** (no auth) so the registration page can fetch existing classes
- `ClassRepository.findByName(String)` added for name-based class lookup

## Architecture

Package layout (`com.schoolmanagement`):

```
config/          OpenAPI, CORS, JPA auditing, file upload, mail
security/        JWT filter, auth provider, SecurityConfig, AuthController
entity/          39 JPA entities + 11 enums
repository/      39 Spring Data JPA repos
dto/             request/ (14) + response/ (14) DTOs
mapper/          6 MapStruct interfaces
service/         14 services (Student, Teacher, Attendance, Homework, Test, BulkImport, etc.)
controller/      31 REST controllers
exception/       GlobalExceptionHandler + custom exceptions
```

Key entities: User (single table with `user_role` enum), Student, Teacher, Parent, Attendance, Homework, Test, Marks, Leaderboard, Notification, AuditLog.

Student identity: 6-char alphanumeric `student_code` (e.g. `A7K92P`), generated via `SecureRandom`, unique.

## APIs

- Base: `http://localhost:8080/api`
- Auth: `POST /auth/login` returns JWT + refresh token
- Swagger: `http://localhost:8080/swagger-ui.html`
- All endpoints return `ApiResponse<T>` wrapper `{ success, message, data, timestamp }`
- Pagination returns `PageResponse<T>` `{ content, page, size, totalElements, totalPages }`

## Bulk Import (CSV / Excel)

- Endpoints: `POST /api/import/students` and `POST /api/import/teachers`
- Auth: `SUPER_ADMIN` or `SCHOOL_ADMIN` only
- Accepts `.csv`, `.xlsx`, `.xls` (multipart/form-data, field name: `file`)
- Default password for imported users: `SCHOOL@2024`
- Supports flexible column headers (e.g. "First Name", "firstName", "first_name")
- **Student CSV columns**: First Name, Last Name, Email, Date of Birth, Gender, Class, Section, (Address, City, State, Pin Code optional)
- **Teacher CSV columns**: First Name, Last Name, Email, Date of Birth, Gender, Qualification, Address, Phone
- Class/Section are auto-created if they don't exist (same logic as registration)
- Returns success/error counts per row — duplicate emails are skipped with an error message
- Frontend: `/admin/import` page with drag-and-drop upload, type selector (Students/Teachers), template download, and results table

## Security

- JWT in `Authorization: Bearer <token>` header
- Roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`
- Public endpoints: `/api/auth/**`, `/swagger-ui/**`, `/api-docs/**`, `/actuator/health`, `/api/contact` (POST), `/api/classes`
- Write endpoints guarded with `@PreAuthorize`
- Refresh tokens in `refresh_tokens` table

## Frontend

- **Axios baseURL**: `import.meta.env.VITE_API_URL || '/api'` — set `VITE_API_URL` in Vercel env vars for production
- **ProfilePage**: Fetches student class/section from `GET /api/students/user/{userId}` (was hardcoded to "10-A")
- **Registration**: Class input is a number/name text field, not a dropdown — section is text
- **vite-env.d.ts**: Self-contained `ImportMeta` and `ImportMetaEnv` type declarations (no `vite/client` dependency)

## Frontend layout

```
src/
  api/           Axios instance + 14 API modules
  components/    common (DataTable, StatCard, SearchBar, etc.) + charts (4)
  context/       AuthContext with login/register/logout
  pages/         40+ page components by domain
  types/         TypeScript interfaces matching backend DTOs
  hooks/         useApi custom hook
  utils/         constants, helpers
```

## Docker / K8s / Deploy

- PostgreSQL 16 in Docker with bind mount `./data/postgres` (gitignored)
- `backend/Dockerfile` — multi-stage: `gradle:8.10-jdk21` build → `eclipse-temurin:21-jre-alpine` runtime
- `application-prod.properties` — uses `SPRING_DATASOURCE_*` env vars for Render
- Frontend deployed on **Vercel** with `VITE_API_URL` pointing to Render backend
- Flyway checksum validation — modifying existing migrations after they've run causes errors; drop/recreate schema instead

## Conventions

- **Never** use `spring.jpa.hibernate.ddl-auto=update` — Flyway manages schema
- Always return `ApiResponse` from controllers
- Use constructor injection (`@RequiredArgsConstructor`), never field injection
- Use MapStruct for entity→DTO mapping
- Lombok: `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` on entities
- Soft-delete users via `is_active = false` instead of deleting
- Custom exceptions: `ResourceNotFoundException` (404), `BadRequestException` (400), `DuplicateResourceException` (409), `UnauthorizedException` (401)
- All dates in ISO-8601 format, JPA `@CreationTimestamp` / `@UpdateTimestamp`
- Student codes are 6-char uppercase alphanumeric, immutable after creation
- In-app + email notifications for key events (homework, attendance, tests)
- Reports generated as PDF (iText) or Excel (Apache POI)

## Demo Data Generation

Run `python3 /tmp/gen_demo_data.py` to populate the database with demo data. Requires a running PostgreSQL container.

**What it generates**:
| Item | Count |
|---|---|
| Class-Subject links | 72 |
| Teacher-Subject assignments | 21 |
| Attendance records (5 days) | 370 |
| Tests (2–4 per class/section) | 105 |
| Marks | 218 |
| Exam schedules (Mid-Term + Final) | 120 |
| Homework assignments (2 per class) | 24 |
| Student goals (1 per student) | 74 |
