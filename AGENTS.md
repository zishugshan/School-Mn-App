# AGENTS.md — School Management System

## Stack

- **Backend**: Java 21, Spring Boot 3.2, Gradle, PostgreSQL, Flyway, JWT (jjwt 0.12.5)
- **Frontend**: Vite + React 18 + TypeScript, MUI 5, Chart.js, Axios
- **Infra**: Docker, Docker Compose, K8s, GitHub Actions

## Quick Start

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm install && npm run dev

# Full stack
docker compose up --build
```

## Backend commands

```bash
./gradlew bootJar        # build production jar
./gradlew test           # run tests (uses H2)
./gradlew bootRun        # dev server on :8080
```

Frontend proxies `/api/*` → `localhost:8080` via Vite config.

## Database

- Flyway migrations in `backend/src/main/resources/db/migration/`
- `V1__init_schema.sql` — full schema (42+ tables)
- `V2__sample_data.sql` — dev sample data (users pw: `password123`)
- `ddl-auto: validate` — Flyway owns the schema; never use `update`
- Local: `jdbc:postgresql://localhost:5432/school_mgmt`, user/pass `postgres/postgres`
- Tests use H2 in-memory

## Architecture

Package layout (`com.schoolmanagement`):

```
config/          OpenAPI, CORS, JPA auditing, file upload, mail
security/        JWT filter, auth provider, SecurityConfig, AuthController
entity/          39 JPA entities + 11 enums
repository/      39 Spring Data JPA repos
dto/             request/ (14) + response/ (14) DTOs
mapper/          6 MapStruct interfaces
service/         13 services (Student, Teacher, Attendance, Homework, Test, etc.)
controller/      30 REST controllers
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

## Security

- JWT in `Authorization: Bearer <token>` header
- Roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`
- Public endpoints: `/api/auth/**`, `/swagger-ui/**`, `/api-docs/**`, `/actuator/health`
- Write endpoints guarded with `@PreAuthorize`
- Refresh tokens in `refresh_tokens` table

## Frontend layout

```
src/
  api/           Axios instance + 12 API modules
  components/    common (DataTable, StatCard, SearchBar, etc.) + charts (4)
  context/       AuthContext with login/register/logout
  pages/         37 page components by domain
  types/         TypeScript interfaces matching backend DTOs
  hooks/         useApi custom hook
  utils/         constants, helpers
```

## Docker / K8s

- `docker-compose.yml` — PostgreSQL 16 + backend + frontend
- `k8s/` — StatefulSet for Postgres, Deployments for backend (2 replicas) + frontend (2 replicas), ConfigMap, Secrets, Ingress
- `.github/workflows/ci.yml` — build + test + docker build on push/PR
- `.github/workflows/deploy.yml` — manual deploy via `kubectl set image`

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
