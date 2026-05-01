# Backend Hexagonal Architecture Guideline

This backend uses a pragmatic hexagonal architecture around the Kotlin/Spring Boot package root:

`apps/backend/src/main/kotlin/de/pumpedfitness/dumbbell`

The goal is to keep business behavior in the application/domain core and keep transport, security, persistence, and framework details at the edges.

## Package Roles

### `domain`

Domain classes represent core business state and rules.

Current examples:

- `domain.model.User`
- `domain.model.workout.WorkoutTemplate`
- `domain.model.workout.WorkoutSession`
- `domain.model.workout.Exercise`
- workout enums under `domain.model.workout.enum`

Rules:

- Put stable business concepts here.
- Keep domain types free from web request/response DTOs.
- Do not inject Spring services into domain models.
- Prefer domain methods for behavior that belongs to the model itself.
- Current models use JPA annotations directly. Treat this as the current project compromise, not a reason to add web or controller concerns to domain.

### `application`

The application layer owns use cases and orchestration.

Current subpackages:

- `application.port.in`: inbound use case contracts used by controllers.
- `application.port.out`: outbound dependencies needed by use cases, currently Spring Data repository interfaces.
- `application.service`: service adapters implementing inbound ports.
- `application.dto`: DTOs returned from use cases.
- `application.mapper`: mapping between domain models and application DTOs.
- `application.exception`: application-level errors translated by infrastructure exception handlers.

Rules:

- Put business workflows in `application.service`.
- Services implement an interface from `application.port.in`.
- Services depend on outbound ports from `application.port.out`, not on controllers or web DTOs.
- Services may depend on domain models, application DTOs, mappers, and application exceptions.
- Do not put HTTP status handling, request validation annotations, route names, or response shapes in services.
- Keep authorization checks that protect business ownership in services, for example checking that a workout template belongs to the requesting user.

### `infrastructure`

Infrastructure contains adapters that talk to the outside world.

Current examples:

- `infrastructure.web.*.controller`: REST controllers.
- `infrastructure.web.*.dto.request`: request bodies and validation annotations.
- `infrastructure.web.*.dto.response`: API response models.
- `infrastructure.web.*.mapper`: application DTO to web response mapping.
- `infrastructure.web.user.exception.ApiExceptionHandler`: HTTP exception translation.

Rules:

- Controllers call inbound ports from `application.port.in`.
- Controllers should be thin: extract authenticated identity, validate request bodies, call a port, map the result to a response.
- Web DTOs stay in `infrastructure.web`; do not pass them into application services.
- Web mappers translate between application DTOs and HTTP response DTOs.
- API documentation annotations belong in infrastructure controllers and DTOs.

### `configuration`

Configuration wires framework behavior.

Current examples:

- `configuration.security.SecurityConfig`
- `configuration.security.JwtUtil`
- `configuration.security.filter.*`
- `configuration.openapi.OpenApiConfig`

Rules:

- Put Spring configuration, security filters, OpenAPI setup, and framework beans here.
- Configuration may reference application ports and infrastructure components as needed to wire Spring.
- Avoid adding business workflows here.

## Dependency Direction

Use this direction:

```text
infrastructure -> application -> domain
configuration  -> application/domain/infrastructure for wiring only
```

Allowed imports:

- `infrastructure.web.*` may import `application.port.in`, `application.dto`, and infrastructure DTOs/mappers.
- `application.service` may import `application.port.in`, `application.port.out`, `application.dto`, `application.mapper`, `application.exception`, and `domain`.
- `application.mapper` may import `application.dto` and `domain`.
- `application.port.out` may import `domain`.
- `domain` should not import `application` or `infrastructure`.

Avoid:

- Controllers importing repositories directly.
- Services importing web request/response DTOs.
- Domain models importing controllers, services, web DTOs, or security types.
- Infrastructure exception handlers leaking into application services.

## Current Persistence Convention

The repository interfaces currently live in `application.port.out` and extend Spring Data interfaces such as `JpaRepository` or `CrudRepository`.

This is a pragmatic shortcut in the current codebase. When adding small features, follow the existing convention for consistency:

```kotlin
interface WorkoutTemplateRepository : JpaRepository<WorkoutTemplate, UUID>
```

For larger refactors or new persistence-heavy areas, prefer the stricter hexagonal shape:

- Define a framework-free outbound port in `application.port.out`.
- Put the Spring Data repository and adapter implementation in an infrastructure persistence package.
- Keep Spring Data query methods and annotations outside the application core.

Do not mix both approaches within one aggregate unless there is a clear migration plan.

## Adding A Backend Feature

Use this sequence for new use cases:

1. Add or update domain models under `domain` if the business concept changes.
2. Add or update application DTOs under `application.dto`.
3. Add methods to the inbound port under `application.port.in`.
4. Add required outbound dependencies under `application.port.out`.
5. Implement the use case in `application.service`.
6. Add mapper methods in `application.mapper` for domain-to-application DTO conversion.
7. Add web request/response DTOs under `infrastructure.web.<feature>.dto`.
8. Add a thin controller under `infrastructure.web.<feature>.controller`.
9. Add a web mapper under `infrastructure.web.<feature>.mapper`.
10. Add focused tests under `src/test/kotlin`, usually starting with the application service.

## Service Rules

Application services should:

- Own transaction-sized workflows.
- Generate IDs and timestamps when creating domain objects, following the existing code style.
- Load aggregates through outbound ports.
- Enforce ownership and authorization rules that belong to the use case.
- Throw application exceptions such as `ResourceNotFoundException` or `UnauthorizedException`.
- Return application DTOs, not JPA entities or web responses.

Application services should not:

- Accept `@RequestBody` DTOs.
- Return `ResponseEntity`.
- Know endpoint paths or HTTP status codes.
- Contain OpenAPI annotations.

## Controller Rules

Controllers should:

- Use constructor injection.
- Depend on inbound ports, not concrete service adapters.
- Read `Principal` or request metadata only as transport concerns.
- Delegate business decisions to the application layer.
- Map application DTOs to response DTOs before returning.

Controllers should not:

- Call repositories.
- Build domain entities.
- Perform ownership checks that are also required outside HTTP.
- Hash passwords, generate business IDs, or manage persistence.

## DTO And Mapper Rules

Use three DTO boundaries:

- Web request DTOs: input validation and API contract only.
- Application DTOs: use case return/input data independent of HTTP.
- Web response DTOs: serialized API response shape.

Mapping flow:

```text
request DTO -> controller arguments -> inbound port -> service -> domain
domain -> application DTO -> web mapper -> response DTO
```

Keep mapping explicit. Avoid passing domain entities directly out through controllers.

## Exception Handling

Application code throws application exceptions from `application.exception`.

Infrastructure translates those exceptions to HTTP responses in `ApiExceptionHandler`.

Do not return HTTP status codes from application services. Add new application exceptions when a use case needs a reusable business error.

## Tests

Prefer application service tests for business behavior.

Current test style:

- JUnit 5.
- MockK for outbound ports.
- Fixture helpers under `src/test/kotlin/de/pumpedfitness/dumbbell/common`.
- Test classes mirror service names, for example `WorkoutTemplateServiceTest`.

When adding behavior:

- Test successful use cases.
- Test not-found and unauthorized paths.
- Verify repository interactions when the workflow depends on persistence behavior.
- Keep controller tests for HTTP-specific behavior only.

## Architecture Smell Checklist

Before finishing a backend change, check:

- Does a controller import `application.port.in` instead of a concrete service?
- Are request/response DTOs kept out of `application` and `domain`?
- Does the service return application DTOs?
- Are ownership checks in the service when they protect business data?
- Are persistence details limited to the existing repository convention or a dedicated infrastructure adapter?
- Are HTTP concerns limited to `infrastructure.web`?
- Are framework configuration details limited to `configuration`?
