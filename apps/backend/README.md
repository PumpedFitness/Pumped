# Dumbbell — Backend

The backend service for the Pumped Fitness application. Built with Kotlin and Spring Boot 4, it provides a REST API for
user management, exercise browsing, and workout tracking.

---

## Tech Stack

| Layer            | Technology                                  |
|------------------|---------------------------------------------|
| Language         | Kotlin 2.3 on JVM 24                        |
| Framework        | Spring Boot 4.0 (Spring MVC)                |
| ORM              | Spring Data JPA (Hibernate)                 |
| Database         | MariaDB                                     |
| Migrations       | Flyway                                      |
| Cache / Session  | Redis (JWT denylist)                        |
| Auth             | Spring Security + JJWT 0.12 (stateless JWT) |
| Password Hashing | bcrypt (`at.favre.lib:bcrypt`)              |
| Validation       | Jakarta Bean Validation                     |
| API Docs         | SpringDoc OpenAPI 2 (Swagger UI)            |
| Testing          | JUnit 5, MockK, Testcontainers              |

---

## Architecture

The project follows **Hexagonal Architecture** (Ports & Adapters). The goal is to keep the business logic completely
isolated from frameworks, databases, and HTTP concerns.

```
domain/          — JPA entities, pure data model, no business logic
application/
  dto/           — Internal data carriers between layers (no framework annotations)
  mapper/        — Domain model <-> application DTO
  port/
    in/          — Inbound interfaces (use-cases) consumed by the web layer
    out/         — Outbound interfaces (repositories) implemented by Spring Data
  service/       — Use-case implementations (adapters in)
  exception/     — Domain exceptions extending ApiException
infrastructure/
  web/           — HTTP adapters (controllers, request/response DTOs, web mappers)
  security/      — JwtUtil
configuration/
  security/      — Spring Security filter chain, JWT filters
  openapi/       — Swagger / OpenAPI config
```

### Key rules

- **Controllers** only know about web DTOs and service ports — never domain models directly.
- **Application DTOs** are plain `data class` objects with no framework or OpenAPI annotations. They are the currency
  passed between the service and web layers.
- **`@Schema` annotations** belong exclusively on web-layer request/response DTOs.
- **Domain models** (`domain/model/`) are JPA entities and are never exposed outside the application layer.
- **Services** depend on repository interfaces (`port/out/`), never on Spring Data directly.

### Request flow example (create workout template)

```
POST /workout-template  (X-API-Version: 1)
  → WorkoutTemplateController
  → CreateWorkoutTemplateRequest (validated by Bean Validation)
  → WorkoutTemplateServicePort.createTemplate(userId, name, description)
  → WorkoutTemplateServiceAdapter
  → WorkoutTemplateRepository.save(WorkoutTemplate)
  → WorkoutTemplateDtoMapper.toDto()
  → WorkoutTemplateMapper.toResponse()
  → WorkoutTemplateResponse (HTTP 200)
```

---

## API

### Versioning

Versioning is handled via Spring Framework 7's native API versioning support using a request header:

```
X-API-Version: 1
```

All endpoints require this header. Requests without it return `404`. Configured via:

```properties
spring.mvc.apiversion.use.header=X-API-Version
```

When a v2 is needed, a new controller is added with `version = "2"` only for the endpoints that changed. Unchanged
endpoints use `version = "1+"` (baseline) and serve both versions without duplication.

### Endpoints

#### User

| Method | Path             | Auth   | Description                   |
|--------|------------------|--------|-------------------------------|
| `POST` | `/user/register` | Public | Register a new account        |
| `POST` | `/user/login`    | Public | Authenticate, receive JWT     |
| `GET`  | `/user/me`       | JWT    | Get own profile               |
| `PUT`  | `/user/me`       | JWT    | Update own profile            |
| `POST` | `/user/logout`   | JWT    | Invalidate current token      |
| `POST` | `/user/refresh`  | JWT    | Issue new token, deny old one |

#### Exercise

| Method | Path             | Auth | Description          |
|--------|------------------|------|----------------------|
| `GET`  | `/exercise`      | JWT  | List all exercises   |
| `GET`  | `/exercise/{id}` | JWT  | Get exercise by UUID |

#### Workout Template

| Method   | Path                     | Auth | Description          |
|----------|--------------------------|------|----------------------|
| `GET`    | `/workout-template`      | JWT  | List own templates   |
| `GET`    | `/workout-template/{id}` | JWT  | Get template by UUID |
| `POST`   | `/workout-template`      | JWT  | Create template      |
| `PUT`    | `/workout-template/{id}` | JWT  | Update template      |
| `DELETE` | `/workout-template/{id}` | JWT  | Delete template      |

#### Workout Session

| Method   | Path                                 | Auth | Description             |
|----------|--------------------------------------|------|-------------------------|
| `GET`    | `/workout-session`                   | JWT  | List own sessions       |
| `GET`    | `/workout-session/{id}`              | JWT  | Get session by UUID     |
| `POST`   | `/workout-session`                   | JWT  | Start a session         |
| `PATCH`  | `/workout-session/{id}/finish`       | JWT  | Finish a session        |
| `DELETE` | `/workout-session/{id}`              | JWT  | Delete a session        |
| `GET`    | `/workout-session/{id}/sets`         | JWT  | List sets for a session |
| `POST`   | `/workout-session/{id}/sets`         | JWT  | Log a set               |
| `DELETE` | `/workout-session/{id}/sets/{setId}` | JWT  | Delete a set            |

### Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header obtained from `POST /user/login`.

JWT tokens are stateless and signed with HMAC-SHA. Logout and refresh are supported via a Redis-backed denylist —
invalidated tokens are stored in Redis with a TTL matching their remaining expiry time.

### Error responses

All errors follow a consistent shape:

```json
{
  "message": "...",
  "status": "400",
  "timestamp": "1714500000000"
}
```

| Status | Cause                                                        |
|--------|--------------------------------------------------------------|
| `400`  | Bean Validation failure — field errors joined into `message` |
| `403`  | Authenticated user does not own the requested resource       |
| `404`  | Resource not found                                           |
| `409`  | Username already taken                                       |

### Swagger UI

Available at `/swagger-ui.html` when the application is running.

---

## Security

### Ownership enforcement

Every resource is scoped to the authenticated user. The service layer verifies ownership on every read, write, and
delete:

- `WorkoutTemplate` — `template.userId` must match the JWT subject
- `WorkoutSession` — `session.userId` must match the JWT subject
- `WorkoutSessionSet` — ownership is verified via the parent session

A mismatch returns `403 Forbidden`.

### Filter chain

```
Request
  → JwtAuthFilter       — extracts userId from JWT subject, sets SecurityContext
  → JwtDenylistFilter   — rejects tokens present in Redis denylist
  → Controller
```

The `Principal` injected into protected controller methods has `.name` equal to the user's UUID string (not username),
because the JWT subject is set to `userId`.

---

## Database

Schema is managed by **Flyway**. Migrations live in:

```
src/main/resources/db/migration/
```

Named following the convention `V{timestamp}__{description}.sql`.

`spring.jpa.hibernate.ddl-auto=validate` — Hibernate only validates the schema against the entities on startup; it never
modifies the database.

---

## Testing Strategy

### Unit tests

All service adapters are unit tested with **MockK**. No Spring context is loaded — tests run in milliseconds.

```
src/test/kotlin/de/pumpedfitness/dumbbell/application/service/
  UserServiceTest.kt
  ExerciseServiceTest.kt
  WorkoutTemplateServiceTest.kt
  WorkoutSessionServiceTest.kt
  WorkoutSessionSetServiceTest.kt
```

Each test class is structured into nested classes per use-case group (e.g. `RegistrationTests`, `UpdateTemplateTests`).
Every test follows the Arrange / Act / Assert pattern with explicit comments.

### Test fixtures

Shared test data builders live in:

```
src/test/kotlin/de/pumpedfitness/dumbbell/common/
  UserTestFixtures.kt
  WorkoutTestFixtures.kt
  ExerciseTestFixtures.kt
```

Fixtures are implemented as `companion object` extension functions (`validTestData(...)`) with sensible defaults and
named override parameters, so tests only specify what is relevant to them.

### Integration tests

A Spring Boot context integration test (`DumbbellApplicationTests`) verifies the application context loads correctly. It
uses **Testcontainers** to spin up a real MariaDB instance.

```
src/test/kotlin/de/pumpedfitness/dumbbell/DumbbellApplicationTests.kt
```

### Running tests

```bash
./gradlew test
```

---

## Local Setup

### Prerequisites

- JDK 24
- Docker (for MariaDB and Redis via Testcontainers or local compose)

### Configuration

Copy the example environment and adjust as needed. The relevant properties in `application.properties`:

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/dumbbell
spring.datasource.username=admin
spring.datasource.password=admin
spring.data.redis.host=localhost
spring.data.redis.port=6379
jwt.secret=your-secret-key-at-least-256-bits
jwt.expiration=86400000
```

### Run

```bash
./gradlew bootRun
```

Or to run with Testcontainers managing the database automatically:

```bash
./gradlew bootTestRun
```
