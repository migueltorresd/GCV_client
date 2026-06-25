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
- [ ] 2.1 Crear `filial.entity.ts` y `user.entity.ts` en `backend/src/modules/users/domain/` con relación `filial_id`.
- [ ] 2.2 Crear `novedad.entity.ts`, `novedad-estado.enum.ts`, `auditoria.entity.ts` y `auditoria-accion.enum.ts`.
- [ ] 2.3 Configurar `backend/src/database/data-source.ts` y migrations iniciales en `backend/src/database/migrations/`.
- [ ] 2.4 Implementar `backend/src/database/seed/seed.ts` con 2 filiales y usuarios del Anexo B.

## Fase 3 — Auth + contexto de seguridad
- [ ] 3.1 Implementar `auth.controller.ts`, `login.dto.ts`, `login.use-case.ts` y `users.repository.ts` para `/auth/login`.
- [ ] 3.2 Crear `jwt-payload.interface.ts`, `jwt.strategy.ts`, `jwt.guard.ts` y wiring de `AuthModule`.
- [ ] 3.3 Crear `current-user.decorator.ts` y tipado request para exponer `sub`, `email`, `rol`, `filial_id`.

## Fase 4 — RBAC + aislamiento multi-tenant
- [ ] 4.1 Crear `roles.decorator.ts` y `rbac.guard.ts` en `backend/src/modules/novedades/presentation/`.
- [ ] 4.2 Aplicar scope por `filial_id` en `novedades.repository.ts` y `auditoria.repository.ts`.
- [ ] 4.3 Forzar regla Colaborador=`solicitante_id` propio en `listar-novedades.use-case.ts` y acciones por ID.

## Fase 5 — Módulo Novedades (CRUD)
- [ ] 5.1 Crear `crear-novedad.dto.ts`, `filtros-novedad.dto.ts`, `novedad-response.dto.ts` y `novedades.controller.ts`.
- [ ] 5.2 Implementar `crear-novedad.use-case.ts` con estado inicial `BORRADOR` y ownership del solicitante.
- [ ] 5.3 Implementar `listar-novedades.use-case.ts` y filtros `tipo`, `estado`, `desde`, `hasta` (rango de fechas, alineado al Anexo C).

## Fase 6 — Workflow de estados
- [ ] 6.1 Crear `workflow.policy.ts` e `invalid-transition.exception.ts` como regla pura de dominio.
- [ ] 6.2 Implementar `enviar-novedad.use-case.ts` y acción `:id/enviar` en `novedades.controller.ts`.
- [ ] 6.3 Implementar `aprobar-novedad.use-case.ts` y `rechazar-novedad.use-case.ts` con control Supervisor.
- [ ] 6.4 Implementar `aprobar-masivo.use-case.ts`: filtrar IDs en `PENDIENTE` de la filial del supervisor, ignorar el resto, devolver `{ procesados: number[], ignorados: number[] }`. NO reutilizar `AprobarNovedadUseCase` — ese lanza excepción en estado inválido, lo cual rompería el batch completo.

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
