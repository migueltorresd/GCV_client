# Proposal: reto-gcv-fullstack

## Intent
Resolver la Pista B (Desarrollador Fullstack) del reto técnico para GCV, construyendo una solución funcional, segura y priorizada para el flujo de novedades y aprobaciones. El foco principal es establecer una arquitectura sólida en backend (NestJS) con aislamiento multi-tenant por filial, RBAC estricto y un workflow de estados inmutable desde el cliente, consumido por un frontend en React pragmático y reproducible localmente.

## Scope

### In Scope
- Autenticación simulada con emisión y consumo de JWT (`sub`, `email`, `rol`, `filial_id`).
- RBAC por rol y aislamiento multi-tenant por `filial_id` aplicados de forma estricta en el backend.
- Registro, listado y filtros de novedades con validación server-side.
- Máquina de estados para workflow (BORRADOR → PENDIENTE → APROBADA | RECHAZADA) con transiciones controladas en backend y soporte de aprobación masiva.
- Auditoría centralizada de acciones críticas con endpoint filtrable.
- Exportación de novedades aprobadas a CSV (formato Anexo E, separador `;`, UTF-8).
- UI mínima en React (login, formulario, listado, bandeja de aprobación).
- Pruebas automatizadas de reglas críticas (transiciones de estado, aislamiento multi-tenant/RBAC).
- Entorno local reproducible vía docker-compose (backend + PostgreSQL).

### Out of Scope
- Operación offline / PWA.
- Notificaciones en tiempo real o por correo.
- Carga y almacenamiento real de archivos adjuntos.
- Mejoras estéticas avanzadas en UI que sacrifiquen tiempo de las reglas de negocio MUST.
- Registro de usuarios y filiales (se usa seed fijo).

## Capabilities

### New Capabilities
- `auth-jwt`: Login simulado con emisión y consumo de JWT (sub, email, rol, filial_id).
- `rbac-multitenant`: RBAC por rol con aislamiento por filial_id y restricción de propietario para Colaborador.
- `novedades-crud`: Registro, listado y filtros de novedades con validaciones server-side.
- `workflow-estados`: Máquina de estados BORRADOR→PENDIENTE→APROBADA|RECHAZADA con transiciones controladas en backend.
- `auditoria`: Registro centralizado de acciones críticas con endpoint filtrable.
- `exportacion-csv`: Exportación de novedades aprobadas en CSV formato Anexo E (separador `;`, UTF-8).
- `frontend-react`: UI mínima funcional: login, formulario, listado, bandeja de aprobación supervisor.

### Modified Capabilities
- None

## Approach
Desarrollar una arquitectura modular en NestJS (backend) usando una aproximación hexagonal liviana para segregar reglas de negocio de los controllers, respaldado por PostgreSQL. Las reglas de seguridad (RBAC, isolation tenant por discriminator `filial_id`) se resuelven centralizadas en backend. El Frontend (React) delegará validaciones core y se enfocará en el flujo transaccional y visualización. Todo el sistema estará contenido en un entorno `docker-compose` reproducible para revisión técnica.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/modules/auth` | New | Emisión de tokens y Guards de JWT. |
| `backend/src/modules/users` | New | Manejo de identidades semilla para auth. |
| `backend/src/modules/novedades` | New | Lógica core (CRUD, Workflow de estados, RBAC/Tenant scope). |
| `backend/src/modules/auditoria` | New | Servicio y endpoint de registro inmutable. |
| `backend/src/modules/exportacion` | New | Generación de archivo CSV según Anexo E. |
| `frontend/src/features/auth` | New | Flujo visual de autenticación y guardado token. |
| `frontend/src/features/novedades` | New | Formulario y listado con filtros. |
| `frontend/src/features/aprobaciones` | New | Bandeja para supervisor (masiva/individual). |
| `docker-compose.yml` | New | Infraestructura DB + Backend. |
| `docs/` | New | Artefactos del ciclo SDD. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Fuga de datos entre tenants (filiales) | Low | Aplicar discriminator `filial_id` a nivel capa de servicio y verificar con pruebas de integración/unitarias obligatorias. |
| Transiciones de estado inválidas desde cliente | Low | Rechazar explícitamente en el backend si el estado origen/destino no cumple la máquina, ignorando payloads maliciosos. |
| Formato de exportación incorrecto | Medium | Hardcodear mapeo exacto de columnas y encoding a UTF-8 con separador `;` para match exacto con Anexo E. |

## Rollback Plan
Dado que es un desarrollo greenfield para un reto técnico sin producción existente, el rollback equivale a desechar la rama principal o revertir commits específicos apoyándose en Git si alguna implementación (ej. RBAC o workflow) rompe los flujos pre-existentes de iteraciones previas de la prueba.

## Dependencies
- PostgreSQL (Dockerizado localmente).
- Repositorio semilla de usuarios/filiales (Anexo B).

## Success Criteria
- [ ] Backend prohíbe que usuarios vean datos de una filial ajena (Aislamiento Multi-Tenant garantizado).
- [ ] Backend rechaza transiciones de estado inválidas para las novedades.
- [ ] Generación exacta del archivo CSV según reglas de negocio.
- [ ] Mínimo 2 pruebas automatizadas completadas sobre reglas de acceso y máquina de estado.
- [ ] Sistema completamente reproducible con un simple comando local (`docker-compose up` y frontend command).