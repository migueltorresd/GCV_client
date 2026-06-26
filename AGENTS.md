# AGENTS.md — Reto GCV

Entrypoint para agentes (IA) y desarrolladores que trabajen en este proyecto.

## Reglas del proyecto

- [Arquitectura y Principios](.claude/rules/arquitectura-y-principios.md) — hexagonal liviana, SOLID/KISS/YAGNI, backend-first, multi-tenant, convenciones (pnpm, commits en español sin coautor).

## Skills del proyecto

| Skill | Cuándo se activa |
|-------|------------------|
| [owasp-top-10](.claude/skills/owasp-top-10/SKILL.md) | Revisar/escribir código sensible: auth, JWT, RBAC, multi-tenant, validación, secretos, dependencias. |

## Estructura

- `backend/` → repo **GCV_api** (NestJS) — vive en su propio remoto, ignorado en GCV_client.
- `frontend/` → parte de **GCV_client** (React + Vite).
- `docs/changes/reto-gcv-fullstack/` → artefactos SDD (proposal, design, specs, tasks). El `design.md` es el contrato compartido front↔back.
