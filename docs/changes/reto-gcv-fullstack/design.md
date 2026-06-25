# Design: reto-gcv-fullstack

## Technical Approach

Arquitectura modular NestJS con hexagonal liviana por módulo (`domain / application / infrastructure / presentation`). PostgreSQL como persistencia. Aislamiento multi-tenant mediante `filial_id` en todas las queries relevantes. RBAC aplicado con Guards + casos de uso. Workflow de estados controlado exclusivamente en backend mediante una política pura y testeable. Frontend React mínimo consumiendo la API REST. Entorno reproducible vía docker-compose.

---

## Architecture Decisions

| Decisión | Elección | Alternativas | Rationale |
|----------|----------|--------------|-----------|
| ORM | TypeORM | Prisma, Knex | Integración nativa NestJS, decorators type-safe, migrations incluidas sin dependencias extra |
| Multi-tenant | Discriminador de fila (`filial_id`) | Schema separado por tenant | Una sola DB; queries siempre scopiadas; suficiente para 2 filiales del reto |
| RBAC | Guard custom + claims JWT | CASL, roles library | Sin dependencias extra; 3 roles con reglas claras no justifican una lib |
| Workflow | `WorkflowPolicy` en `domain` (función pura) | FSM library, enum en DB | Portable y testeable sin infraestructura; regla de negocio, no artefacto técnico |
| Auditoría | `AuditoriaService.registrar()` llamado desde casos de uso | Interceptor HTTP, Event Bus | Control explícito sobre qué se audita y con qué contexto; sin magia frágil |
| Export CSV | Buffer en memoria → stream response | Disco + presigned URL | Archivos pequeños (filial + fechas); cero complejidad de storage |
| Frontend state | React Context + hooks | Redux, Zustand | YAGNI: 4 pantallas, flujo unidireccional, sin overhead |
| Passwords | bcrypt hash en seed | Plain text, external IdP | Simulado pero seguro; contraseñas no expuestas en token ni responses |

---

## Data Flow

```
┌────────────────── LOGIN ──────────────────────────────────────────┐
│ Client ──POST /auth/login──► AuthController ──► LoginUseCase      │
│                                                        │           │
│                                         UsersRepo.findByEmail()   │
│                                         bcrypt.compare()          │
│                                         JwtService.sign()         │
│ Client ◄──────────── { access_token: "eyJ..." } ─────────────────│
└───────────────────────────────────────────────────────────────────┘

┌────────────────── CREAR NOVEDAD ──────────────────────────────────┐
│ Client ──POST /novedades──────► JwtGuard ──► NovedadesController  │
│  [Bearer JWT]                                        │             │
│                                       CrearNovedadUseCase         │
│                                        ├── validate DTO           │
│                                        ├── NovedadesRepo.save()   │
│                                        └── AuditoriaService       │
│                                             .registrar(CREAR)     │
└───────────────────────────────────────────────────────────────────┘

┌────────────────── WORKFLOW ───────────────────────────────────────┐
│ Client ──POST /novedades/:id/[accion]──► JwtGuard ──► RbacGuard │
│  [Bearer JWT]                                        │             │
│                                        [Accion]UseCase            │
│                                         ├── NovedadesRepo.findOne │
│                                         ├── WorkflowPolicy        │
│                                         │   .validate(from → to)  │
│                                         ├── NovedadesRepo.update()│
│                                         └── AuditoriaService      │
│                                              .registrar(ACCION)   │
└───────────────────────────────────────────────────────────────────┘

┌────────────────── EXPORTAR ───────────────────────────────────────┐
│ Client ──GET /exportacion/csv──► JwtGuard ──► RbacGuard[RRHH]    │
│  [Bearer JWT]                                        │             │
│                                       ExportarCsvUseCase          │
│                                        ├── NovedadesRepo          │
│                                        │   .findAprobadas(        │
│                                        │    filial_id, fechas)    │
│                                        └── CsvBuilderService      │
│                                             .build() → Buffer     │
│ Client ◄─── CSV (text/csv; charset=utf-8) ────────────────────── │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Filial
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| nombre | varchar(150) | |
| codigo | varchar(20) | Único |

### Usuario
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| email | varchar(150) | Único |
| password_hash | varchar | bcrypt, mínimo cost 10 |
| nombre | varchar(150) | |
| rol | enum | `COLABORADOR` \| `SUPERVISOR` \| `RRHH` |
| filial_id | int FK | → Filial |
| supervisor_id | int FK nullable | → Usuario; Supervisor asignado (Anexo A) |

### Novedad
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| tipo | enum | `AUSENTISMO` \| `PERMISO` \| `HORAS_EXTRA` \| `SALUD` \| `ACTUALIZACION_DATOS` |
| estado | enum | `BORRADOR` \| `PENDIENTE` \| `APROBADA` \| `RECHAZADA` |
| fecha_inicio | date | |
| fecha_fin | date nullable | Null permitido; validación fin ≥ inicio se omite cuando es null |
| descripcion | text | |
| solicitante_id | int FK | → Usuario |
| filial_id | int FK | Desnormalizado — scoping rápido, siempre presente |
| aprobador_id | int FK nullable | → Usuario (Supervisor) |
| motivo_rechazo | text nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Auditoria
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int PK | |
| actor_id | int FK | → Usuario |
| actor_email | varchar | Desnormalizado para trazabilidad histórica |
| accion | enum | `CREAR` \| `ENVIAR` \| `APROBAR` \| `RECHAZAR` \| `EXPORTAR` |
| entidad | varchar(50) | `'novedad'` \| `'exportacion'` |
| entidad_id | varchar nullable | ID de la entidad afectada |
| filial_id | int FK | |
| detalle | jsonb nullable | Contexto adicional: motivo rechazo, IDs procesados en masivo, etc. |
| timestamp | timestamptz | `NOW()` — inmutable |

---

## API Contracts

| Método | Path | Auth | Rol mínimo | Descripción |
|--------|------|------|------------|-------------|
| POST | `/auth/login` | No | — | Login; retorna `{ access_token }` |
| POST | `/novedades` | JWT | COLABORADOR | Crear novedad (estado inicial: BORRADOR) |
| GET | `/novedades` | JWT | Todos | Listar, scoped por rol + filial; filtros: `tipo`, `estado`, `desde`, `hasta` (rango de fechas, Anexo C) |
| POST | `/novedades/:id/enviar` | JWT | COLABORADOR (owner) | `BORRADOR → PENDIENTE` |
| POST | `/novedades/:id/aprobar` | JWT | SUPERVISOR | `PENDIENTE → APROBADA` |
| POST | `/novedades/:id/rechazar` | JWT | SUPERVISOR | `PENDIENTE → RECHAZADA`; body: `{ motivo }` |
| POST | `/novedades/aprobar-masivo` | JWT | SUPERVISOR | Body: `{ ids: number[] }`; bulk approve |
| GET | `/auditoria` | JWT | RRHH | Filtros: `actor_id`, `accion`, `entidad`, `fecha_desde`, `fecha_hasta`; scoped por `filial_id` del token |
| GET | `/exportacion/csv` | JWT | RRHH | Query: `fecha_desde`, `fecha_hasta`; responde CSV Anexo E |

**Scoping de visibilidad por rol (GET /novedades):**
- `COLABORADOR`: `filial_id = me.filial_id AND solicitante_id = me.id`
- `SUPERVISOR` / `RRHH`: `filial_id = me.filial_id`

---

## File Changes

### Backend

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `backend/src/modules/auth/domain/jwt-payload.interface.ts` | Crear | Claims: `sub`, `email`, `rol`, `filial_id` |
| `backend/src/modules/auth/application/login.use-case.ts` | Crear | Valida credenciales, emite JWT |
| `backend/src/modules/auth/infrastructure/auth.repository.ts` | Crear | `findByEmail()` para login |
| `backend/src/modules/auth/presentation/auth.controller.ts` | Crear | `POST /auth/login` |
| `backend/src/modules/auth/presentation/login.dto.ts` | Crear | `email`, `password` con validación class-validator |
| `backend/src/modules/auth/presentation/jwt.guard.ts` | Crear | `AuthGuard('jwt')` — valida Bearer en cada request |
| `backend/src/modules/users/domain/user.entity.ts` | Crear | Entidad TypeORM Usuario |
| `backend/src/modules/users/infrastructure/users.repository.ts` | Crear | `findByEmail()`, `findById()` |
| `backend/src/modules/novedades/domain/novedad.entity.ts` | Crear | Entidad TypeORM Novedad |
| `backend/src/modules/novedades/domain/novedad-estado.enum.ts` | Crear | `BORRADOR / PENDIENTE / APROBADA / RECHAZADA` |
| `backend/src/modules/novedades/domain/workflow.policy.ts` | Crear | `validateTransition(from, to)` — función pura, lanza `InvalidTransitionException` |
| `backend/src/modules/novedades/application/crear-novedad.use-case.ts` | Crear | Crear en BORRADOR + auditar |
| `backend/src/modules/novedades/application/enviar-novedad.use-case.ts` | Crear | `BORRADOR→PENDIENTE` + auditar |
| `backend/src/modules/novedades/application/aprobar-novedad.use-case.ts` | Crear | `PENDIENTE→APROBADA` + auditar |
| `backend/src/modules/novedades/application/rechazar-novedad.use-case.ts` | Crear | `PENDIENTE→RECHAZADA` + auditar |
| `backend/src/modules/novedades/application/aprobar-masivo.use-case.ts` | Crear | Filtra IDs en PENDIENTE de la filial; ignora el resto; devuelve `{ procesados, ignorados }` |
| `backend/src/modules/novedades/application/listar-novedades.use-case.ts` | Crear | Scoped por rol + filial_id |
| `backend/src/modules/novedades/infrastructure/novedades.repository.ts` | Crear | Queries con `filial_id` siempre presente; scope por rol |
| `backend/src/modules/novedades/presentation/novedades.controller.ts` | Crear | Todos los endpoints de novedades |
| `backend/src/modules/novedades/presentation/crear-novedad.dto.ts` | Crear | Validación de entrada (tipo, fechas, descripción) |
| `backend/src/modules/novedades/presentation/filtros-novedad.dto.ts` | Crear | Query params opcionales para listado |
| `backend/src/modules/novedades/presentation/novedad-response.dto.ts` | Crear | Output seguro, sin datos sensibles |
| `backend/src/modules/novedades/presentation/rbac.guard.ts` | Crear | Decorator `@Roles(...) + RolesGuard` |
| `backend/src/modules/auditoria/domain/auditoria.entity.ts` | Crear | Entidad TypeORM Auditoria |
| `backend/src/modules/auditoria/domain/auditoria-accion.enum.ts` | Crear | `CREAR / ENVIAR / APROBAR / RECHAZAR / EXPORTAR` |
| `backend/src/modules/auditoria/application/auditoria.service.ts` | Crear | `registrar(actor, accion, entidad, entidad_id, filial_id, detalle?)` |
| `backend/src/modules/auditoria/infrastructure/auditoria.repository.ts` | Crear | `save()` + `findWithFilters()` |
| `backend/src/modules/auditoria/presentation/auditoria.controller.ts` | Crear | `GET /auditoria` con filtros |
| `backend/src/modules/auditoria/presentation/filtros-auditoria.dto.ts` | Crear | `actor_id`, `accion`, `entidad`, fechas |
| `backend/src/modules/exportacion/application/exportar-csv.use-case.ts` | Crear | Consulta aprobadas + delega a CsvBuilder + audita |
| `backend/src/modules/exportacion/infrastructure/csv-builder.service.ts` | Crear | Header exacto Anexo E: `filial_codigo;documento_solicitante;tipo_novedad;fecha_inicio;fecha_fin;estado;aprobado_por;fecha_aprobacion`; sep `;`; UTF-8 sin BOM |
| `backend/src/modules/exportacion/presentation/exportacion.controller.ts` | Crear | `GET /exportacion/csv` con query params de fechas |
| `backend/src/database/seed/seed.ts` | Crear | Filiales: Andinagas (`AND`), RetailVertice (`RET`). 6 usuarios del Anexo B. Password `Prueba2026*` con bcrypt cost ≥ 10 — nunca en texto plano |
| `backend/src/database/migrations/` | Crear | Migrations TypeORM: filiales, usuarios, novedades, auditoria |
| `backend/.env.example` | Crear | `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` |
| `backend/Dockerfile` | Crear | SHOULD (Pista B) — implementar al final si queda tiempo; no bloquea los MUST |

### Frontend

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `frontend/src/features/auth/LoginPage.tsx` | Crear | Formulario login con manejo de error |
| `frontend/src/features/auth/auth.api.ts` | Crear | `POST /auth/login` → token |
| `frontend/src/features/auth/useAuth.ts` | Crear | Hook: token, usuario decodificado, logout |
| `frontend/src/features/novedades/NovedadesPage.tsx` | Crear | Listado con filtros + botón nueva novedad |
| `frontend/src/features/novedades/NuevaNovedadForm.tsx` | Crear | Formulario tipo, fechas, descripción |
| `frontend/src/features/novedades/novedades.api.ts` | Crear | CRUD + `enviar()` |
| `frontend/src/features/aprobaciones/AprobacionesPage.tsx` | Crear | Bandeja supervisor, checkbox múltiple |
| `frontend/src/features/aprobaciones/aprobaciones.api.ts` | Crear | `aprobar()`, `rechazar()`, `aprobarMasivo()` |
| `frontend/src/shared/api-client.ts` | Crear | Instancia Axios + interceptor Bearer JWT |
| `frontend/src/shared/types.ts` | Crear | Interfaces: `Novedad`, `Usuario`, `Auditoria` |
| `frontend/src/shared/PrivateRoute.tsx` | Crear | Redirect a `/login` si sin token |

### Infra

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `docker-compose.yml` | Crear | Postgres 16 + backend NestJS |

---

## Testing Strategy

| Capa | Qué probar | Enfoque |
|------|------------|---------|
| Unit — `WorkflowPolicy` | Todas las transiciones válidas e inválidas (7 casos) | Jest puro, sin DB ni infraestructura |
| Unit — `ListarNovedadesUseCase` | Colaborador no ve novedades ajenas de su filial | Mock repository, inyección directa al use-case |
| Integration — Multi-tenant | Usuario filial A no obtiene datos de filial B | Jest + DB real de compose; dos usuarios en filiales distintas |
| Integration — RBAC intra-filial | Colaborador solo ve sus propias novedades (no las de otro Colaborador de misma filial) | Test con dos Colaboradores en misma filial |

```typescript
// workflow.policy.spec.ts — función pura, cero infraestructura
describe('WorkflowPolicy', () => {
  it('permite BORRADOR → PENDIENTE', () => {
    expect(() => validateTransition('BORRADOR', 'PENDIENTE')).not.toThrow();
  });
  it('rechaza BORRADOR → APROBADA (transición inválida)', () => {
    expect(() => validateTransition('BORRADOR', 'APROBADA'))
      .toThrow(InvalidTransitionException);
  });
});
```

---

## docker-compose Plan

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: reto_gcv
      POSTGRES_USER: reto
      POSTGRES_PASSWORD: reto_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U reto"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://reto:reto_pass@postgres:5432/reto_gcv
      JWT_SECRET: super_secret_reto
      JWT_EXPIRES_IN: 8h
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

> Frontend corre fuera del compose (`npm run dev`) para ciclo de desarrollo rápido sin rebuild de imagen.

> **Nota Pista B**: `docker-compose` para PostgreSQL es parte del entorno reproducible (MUST). El `Dockerfile` del backend es SHOULD — priorizá cerrar todos los MUST primero; el Dockerfile lo agregás al final si el tiempo alcanza.

---

## Supuestos de implementación

Decisiones tomadas cruzando los Anexos A, B, C y E del PDF del reto. Cada una debe poder defenderse en entrevista.

| Supuesto | Decisión | Fuente | Por qué |
|----------|----------|--------|---------|
| `TipoNovedad` enum | `AUSENTISMO`, `PERMISO`, `HORAS_EXTRA`, `SALUD`, `ACTUALIZACION_DATOS` | Anexo B | Enum garantiza integridad en DB; varchar libre acepta valores inválidos silenciosamente |
| CSV header | `filial_codigo;documento_solicitante;tipo_novedad;fecha_inicio;fecha_fin;estado;aprobado_por;fecha_aprobacion` (8 cols exactas; sin `id_novedad` ni `descripcion`) | Anexo E | El evaluador va a correr el export y comparar el header byte a byte; cualquier columna extra o faltante es error |
| `filial_codigo` en CSV | Código de filial (`AND`, `RET`), NO el nombre | Anexo E | El Anexo E especifica el código; el nombre podría cambiar, el código es el identificador estable |
| `documento_solicitante` en CSV | Email del solicitante | Anexo E | El Anexo E usa email como documento de identidad en el sistema |
| `aprobado_por` en CSV | Email del aprobador | Anexo E | Idem — email como identificador trazable |
| Filtro de exportación | Filtra por `fecha_inicio` de la novedad | Decisión de impl. | El reto pide "novedades de un período"; la fecha de inicio es cuándo ocurre el evento, no cuándo se aprobó |
| `GET /auditoria` | Restringido a `RRHH`; scopiado por `filial_id` del token | Decisión de impl. | RR.HH. es quien tiene interés operacional en el log; un Colaborador o Supervisor no debe ver la traza completa de la filial |
| Aprobación masiva | Filtra-y-saltea: solo procesa IDs en `PENDIENTE` de la misma filial; ignora el resto; devuelve `{ procesados, ignorados }` | Decisión de impl. | Reutilizar `AprobarNovedadUseCase` (que lanza excepción) haría fallar todo el batch si un ID ya fue aprobado — comportamiento no idempotente inaceptable en una operación masiva |
| `fecha_fin` nullable | Nullable en entidad y DB; validación fin ≥ inicio se omite cuando es `null` | Anexo A | Tipos como ACTUALIZACION_DATOS no tienen fecha de fin natural; forzar un valor sería inventar datos |
| Filiales seed | Andinagas (`AND`), RetailVertice (`RET`); 6 usuarios del Anexo B | Anexo B | Datos fijos del enunciado — no inventar |
| Password seed | `Prueba2026*` hasheada con bcrypt (cost ≥ 10); nunca en texto plano | Anexo B | El enunciado da la contraseña; "JWT simulado" no significa "sin seguridad en reposo" |
| `docker-compose` | Postgres siempre presente (MUST); `Dockerfile` backend es SHOULD — al final si queda tiempo | PDF reto | El reto evalúa que el entorno sea reproducible; el Dockerfile agrega valor pero no es bloqueante |
