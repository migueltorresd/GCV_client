# Arquitectura y Principios — Reto GCV

Reglas que toda sesión (humana o IA) debe respetar al trabajar en este proyecto.

## Arquitectura

- **Backend (GCV_api)**: NestJS modular + **hexagonal liviana por módulo**.
- **Frontend (GCV_client)**: React por **features** + `shared`.
- **Repos separados**: backend y frontend son repositorios distintos. El contrato compartido es `docs/changes/reto-gcv-fullstack/design.md` (API Contracts). Si cambia una ruta o un campo, se cambia primero en el design.

### Capas por módulo (backend)

| Capa | Contiene | NO contiene |
|------|----------|-------------|
| `domain` | entidades, enums, reglas puras (políticas), excepciones de negocio | NestJS HTTP, acceso a DB |
| `application` | casos de uso, orquestación | controllers, SQL |
| `infrastructure` | repositorios TypeORM, adaptadores | reglas de negocio |
| `presentation` | controllers, DTOs, guards, decorators | lógica de negocio |

## Principios (innegociables)

- **SOLID, Clean Code, KISS, YAGNI** y separación de responsabilidades.
- **Backend-first**: la seguridad y las reglas críticas viven en el servidor, **nunca solo en la UI**. El front puede esconder/filtrar, pero la autoridad es el backend.
- **Reglas de dominio puras y testeables**: la lógica crítica va en funciones puras (ej. `workflow.policy.ts`, `visibilidad.policy.ts`), no enterrada en queries ni controllers.
- **DTOs** para entrada (validación `class-validator`) y salida (sin exponer campos sensibles).
- **Sin lógica de negocio en controllers** — solo delegan a casos de uso.
- **Autorización ≠ scoping de datos**: el guard decide si entrás al endpoint (403); el scoping decide qué filas ves (filtra). No mezclar.
- **Multi-tenant**: `filial_id` en toda query relevante; restricción extra por `solicitante_id` para Colaborador.
- **Auditoría centralizada**: `AuditoriaService.registrar(...)` invocado desde casos de uso, nunca desde controllers.

## Convenciones

- **Gestor de paquetes: pnpm** (no npm). `package-lock.json` ignorado; `pnpm-lock.yaml` versionado. pnpm bloquea install scripts por seguridad.
- **Commits**: conventional, **en español**, **SIN coautor ni atribución de IA**. Un commit por fase cuando sea posible.
- **Sin sobreingeniería**: hexagonal completa solo donde vive el riesgo; el resto, módulos planos.
- **Toda decisión técnica importante se documenta** (tabla de Supuestos en `design.md`).
- **MUST antes que SHOULD/COULD** (MoSCoW del reto).

## Seguridad

Aplicar la skill `owasp-top-10` al revisar o escribir código sensible (auth, acceso a datos, validación, secretos).
