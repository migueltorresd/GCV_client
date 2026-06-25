# Tasks: reto-gcv-fullstack

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2000+ |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR (`size:exception`) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Entrega fullstack completa | Single PR | `size:exception` aprobado |

## Fase 1 — Base del proyecto (bootstrap)
- [x] 1.1 Crear `backend/package.json`, `backend/src/main.ts`, `backend/src/app.module.ts` y config NestJS.
- [x] 1.2 Crear `frontend/package.json`, `frontend/src/main.tsx`, `frontend/src/App.tsx` y base React. (Vite + TS strict; build verde)
- [x] 1.3 Crear `docker-compose.yml`, `backend/Dockerfile` y `backend/.env.example` para PostgreSQL + API.
- [x] 1.4 Configurar `backend/.eslintrc.js`, `backend/.prettierrc`, `backend/tsconfig.json` y scripts npm.

## Fase 2 — Persistencia y seed
- [x] 2.1 Crear `filial.entity.ts` y `user.entity.ts` en `backend/src/modules/users/domain/` con relación `filial_id` (+ `rol.enum.ts`, `supervisor_id`).
- [x] 2.2 Crear `novedad.entity.ts`, `novedad-estado.enum.ts`, `novedad-tipo.enum.ts`, `auditoria.entity.ts` y `auditoria-accion.enum.ts`.
- [x] 2.3 Configurar `data-source.ts` + wiring TypeORM en `AppModule`. DESVÍO: `synchronize` en dev (env `DB_SYNCHRONIZE`) en lugar de migrations — reproducibilidad inmediata; migrations quedarían para prod. Documentado como supuesto.
- [x] 2.4 Implementar `seed.ts` con 2 filiales + 6 usuarios del Anexo B, password `Prueba2026*` en bcrypt (cost 10). Verificado contra Postgres real.

## Fase 3 — Auth + contexto de seguridad
- [x] 3.1 Implementar `auth.controller.ts`, `login.dto.ts`, `login.use-case.ts` y `users.repository.ts` (en `UsersModule`) para `POST /auth/login`. Verificado: 200 + token, 401 inválido.
- [x] 3.2 Crear `jwt-payload.interface.ts`, `jwt.strategy.ts`, `jwt.guard.ts` y wiring de `AuthModule` (JwtModule + PassportModule). + `enableCors()` y `ValidationPipe` global en `main.ts`.
- [x] 3.3 Crear `current-user.decorator.ts` que expone `sub`, `email`, `rol`, `filial_id` desde el token.

## Fase 4 — RBAC + aislamiento multi-tenant
- [x] 4.1 Crear `roles.decorator.ts` y `roles.guard.ts`. DESVÍO: ubicados en `modules/auth/presentation/` (no en novedades) porque la autorización es compartida por novedades/auditoría/exportación. Guard = solo authz por rol (sin tocar DB).
- [x] 4.3 Regla Colaborador=`solicitante_id` + scope por `filial_id` definida como **política pura** `novedades/domain/visibilidad.policy.ts` (+ test 5/5 verde). Núcleo multi-tenant aislado y testeable.
- [x] 4.2 Scope aplicado en la query real: `novedades.repository.ts` consume `scopeVisibilidadNovedades` en `listar()`. Verificado E2E: filial 2 NO ve datos de filial 1. (auditoria.repository → Fase 7)

## Fase 5 — Módulo Novedades (CRUD)
- [x] 5.1 Crear `crear-novedad.dto.ts`, `filtros-novedad.dto.ts`, `novedad-response.dto.ts` y `novedades.controller.ts` (con `JwtGuard` + `RolesGuard`).
- [x] 5.2 Implementar `crear-novedad.use-case.ts`: estado inicial `BORRADOR`, `solicitante_id`/`filial_id` desde el token (no del cliente), validación fin ≥ inicio.
- [x] 5.3 Implementar `listar-novedades.use-case.ts` con scope de visibilidad + filtros `tipo`, `estado`, `desde`, `hasta`. Verificado E2E.

## Fase 6 — Workflow de estados
- [x] 6.1 Crear `workflow.policy.ts` (función pura + `puedeTransicionar`) e `invalid-transition.exception.ts`. Test 9/9 verde.
- [x] 6.2 Implementar `enviar-novedad.use-case.ts` y `POST :id/enviar` (BORRADOR→PENDIENTE, solo owner).
- [x] 6.3 Implementar `aprobar`/`rechazar` use-cases + endpoints (`@Roles(SUPERVISOR)`, scope por filial). Acciones devuelven 200.
- [x] 6.4 Implementar `aprobar-masivo.use-case.ts` con filter-and-skip → `{ procesados, ignorados }`. NO reutiliza el caso individual. Verificado E2E: ya-aprobada ignorada, no rompe el batch.

## Fase 7 — Auditoría
- [ ] 7.1 Crear `auditoria.service.ts` y `auditoria.repository.ts` con `registrar(actor, accion, entidad, entidad_id, filial_id, detalle?)` — `detalle` (JSONB) guarda contexto como motivo de rechazo o IDs procesados/ignorados en el masivo.
- [ ] 7.2 Invocar auditoría desde `crear-novedad`, `enviar`, `aprobar`, `rechazar` y `exportar-csv`.
- [ ] 7.3 Crear `auditoria.controller.ts` y `filtros-auditoria.dto.ts` para `GET /auditoria` restringido a rol `RRHH` (403 para los demás) y scopiado por `filial_id` del token.

## Fase 8 — Exportación CSV
- [ ] 8.1 Implementar `exportar-csv.use-case.ts` consultando aprobadas por `filial_id` y rango.
- [ ] 8.2 Crear `csv-builder.service.ts` con encabezado Anexo E, `;`, UTF-8 y `Content-Disposition`.

## Fase 9 — Frontend
- [x] 9.1 Crear `LoginPage.tsx`, `auth.api.ts`, `auth.store.tsx` y persistencia JWT en `localStorage`. (incluye decode de claims para UI + hint de usuarios semilla)
- [x] 9.2 Crear `frontend/src/shared/api-client.ts` y `frontend/src/shared/PrivateRoute.tsx` con interceptor Bearer + manejo de 401.
- [x] 9.3 Implementar `NovedadesPage.tsx`, `NuevaNovedadForm.tsx` y `novedades.api.ts` con filtros (`tipo`, `estado`, `desde`, `hasta`), alta, enviar y export CSV (RRHH).
- [x] 9.4 Implementar `AprobacionesPage.tsx` y `aprobaciones.api.ts` con checkboxes, aprobación masiva (`{ procesados, ignorados }`), aprobar y rechazar individual.

## Fase 10 — Pruebas
- [ ] 10.1 Crear `workflow.policy.spec.ts` con transiciones válidas e inválidas del spec `workflow-estados`.
- [ ] 10.2 Crear test integración multi-tenant para filial A/B sobre `GET /novedades`.
- [ ] 10.3 Crear test integración intra-filial donde un Colaborador no ve novedades de otro.
- [ ] 10.4 Opcional: agregar test de `aprobar-masivo` ignorando IDs ya aprobados.

## Fase 11 — README y documentación final
- [ ] 11.1 Redactar `README.md` con instalación, ejecución, decisiones, supuestos, MoSCoW y tiempo invertido.
