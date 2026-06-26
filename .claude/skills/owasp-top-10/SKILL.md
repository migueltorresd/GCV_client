---
name: owasp-top-10
description: "Trigger: security review, auth/JWT/RBAC, multi-tenant, input validation, secrets, OWASP, vulnerabilidades. Apply OWASP Top 10 (2021) defenses when reviewing or writing backend (NestJS) or frontend (React) code."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

# OWASP Top 10 — Defensas del proyecto

## Activation Contract

Aplicar al revisar o escribir código que toque: autenticación, autorización, acceso a datos, manejo de input, secretos, dependencias o cualquier endpoint expuesto.

## Hard Rules

- Las reglas de seguridad viven en el **backend**, nunca solo en la UI.
- Nunca confiar en el input del cliente: validar con DTOs (`class-validator`) + `whitelist`.
- Nunca construir SQL por concatenación: usar repositorio/`QueryBuilder` parametrizado.
- Nunca hardcodear secretos: leer de `env`; jamás commitear `.env`.
- Passwords solo como hash `bcrypt` (cost >= 10); nunca en el token ni en respuestas.
- Toda query scopeada por `filial_id` (+ `solicitante_id` para Colaborador).
- Los errores al cliente no filtran stack traces ni si un email/usuario existe.

## Decision Gates

| OWASP 2021 | Defensa en este stack |
|------------|-----------------------|
| A01 Broken Access Control | `JwtGuard` + `RolesGuard` + scoping multi-tenant en la query; ownership en use-case |
| A02 Cryptographic Failures | bcrypt (cost>=10); `JWT_SECRET` por env; sin secretos en repo |
| A03 Injection | TypeORM parametrizado; DTOs validados; sin string-concat de SQL |
| A04 Insecure Design | máquina de estados validada en server (`workflow.policy`) |
| A05 Security Misconfiguration | `ValidationPipe` whitelist+forbidNonWhitelisted; CORS restringido; sin trazas al cliente |
| A06 Vulnerable Components | pnpm (bloquea install scripts); `pnpm audit`; deps pineadas |
| A07 Auth Failures | validar JWT en endpoints; error de login genérico; expiración del token |
| A08 Integrity Failures | lockfile versionado; sin paquetes no confiables |
| A09 Logging Failures | `AuditoriaService` registra acciones críticas (actor/acción/entidad/timestamp/filial) |
| A10 SSRF | validar cualquier URL saliente; no fetch de URLs del cliente |

## Execution Steps

1. Identificar qué categorías toca el cambio (auth, datos, input, secretos, deps).
2. Recorrer cada categoría aplicable de la tabla y verificar la defensa.
3. Reportar cada hallazgo con su código `Axx` y la corrección concreta.
4. Para input nuevo: exigir DTO validado. Para query nueva: exigir scope por filial.

## Output Contract

Reportar hallazgos como: `[Axx] <problema> → <corrección>`. Si no hay hallazgos, declarar las categorías revisadas.

## References

- `references/referencias.md` — mapeo a archivos reales del backend que implementan cada defensa.
