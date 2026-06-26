# Referencias — dónde vive cada defensa

Archivos del backend (GCV_api, bajo `backend/`) que implementan las defensas OWASP de este proyecto.

| Defensa | Archivo |
|---------|---------|
| A01 Access Control — guard de rol | `backend/src/modules/auth/presentation/roles.guard.ts` |
| A01 — scoping multi-tenant (regla pura) | `backend/src/modules/novedades/domain/visibilidad.policy.ts` |
| A01 — scope aplicado en query | `backend/src/modules/novedades/infrastructure/novedades.repository.ts` |
| A02 Crypto — hash de password | `backend/src/modules/auth/application/login.use-case.ts` (bcrypt) |
| A02 — secreto JWT por env | `backend/src/modules/auth/auth.module.ts` |
| A03 Injection / A05 Misconfig — validación global | `backend/src/main.ts` (`ValidationPipe` whitelist) |
| A03 — DTOs de entrada | `backend/src/modules/novedades/presentation/*.dto.ts` |
| A04 Insecure Design — máquina de estados | `backend/src/modules/novedades/domain/workflow.policy.ts` |
| A05 — CORS | `backend/src/main.ts` (`enableCors`) |
| A07 Auth — estrategia/guard JWT | `backend/src/modules/auth/infrastructure/jwt.strategy.ts`, `jwt.guard.ts` |
| A07 — error de login genérico | `backend/src/modules/auth/application/login.use-case.ts` |
| A09 Logging — auditoría centralizada | `backend/src/modules/auditoria/application/auditoria.service.ts` |

## Contexto del reto

- Enunciado y RT-01..RT-10: el PDF del reto (no versionado).
- Anexo D (code review Pista A) ilustra los anti-patrones que estas defensas evitan: identidad desde header no verificado, SQL injection, falta de scope por filial, N+1, exposición de datos sin DTO.
