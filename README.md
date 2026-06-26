# GCV_client

Cliente web del módulo de **Novedades + Aprobación** para Grupo Corporativo Vértice (GCV).
Reto técnico — Pista B (Desarrollador Fullstack).

> Backend en repo aparte: **GCV_api** (NestJS + PostgreSQL).

## Stack

- **React 18** + **Vite** + TypeScript (`strict: true`)
- **React Router** + **Axios** (interceptor Bearer JWT + manejo 401)
- Estado con **React Context + hooks** (sin Redux — YAGNI para 4 pantallas)
- **pnpm** (bloquea install scripts por seguridad)

## Arquitectura

Organización por **features**. La seguridad real vive en el backend: el front solo decodifica el
JWT para condicionar la UI, **nunca para autorizar**.

```
src/
├── features/{auth, novedades, aprobaciones}
└── shared/  (api-client, PrivateRoute, types)
```

## Requisitos

- Node.js 18+ · pnpm 10 (`corepack enable`)
- El backend **GCV_api** corriendo en `http://localhost:3000`

## Puesta en marcha

```bash
cd frontend
pnpm install
# crear frontend/.env  →  VITE_API_URL=http://localhost:3000
pnpm run dev          # http://localhost:5173
```

## Acceso de prueba

La pantalla de login lista los **usuarios semilla** (Anexo B). Password: **`Prueba2026*`**.

- **COLABORADOR** → crea novedades y ve solo las suyas.
- **SUPERVISOR** → bandeja de aprobación (individual + masiva, pestaña *Aprobaciones*).
- **RR.HH.** → ve las de su filial y exporta el CSV (Anexo E).

## Supuestos asumidos

- **JWT en `localStorage`** por simplicidad del reto (tradeoff XSS; en prod se evaluaría cookie httpOnly).
- El front **decodifica el JWT solo para UI** (rol, filial); la autoridad es el backend.
- **`PrivateRoute` con roles es UX, no seguridad** — esconder un link es comodidad; la regla la impone el servidor.
- La **auditoría no tiene pantalla** (el reto pide UI para login/alta/listado/bandeja, no para el log).

## Alcance (MoSCoW)

| | Vista | Estado |
|---|-------|--------|
| **Must** | Login, alta de novedad, listado con filtros, bandeja con selección múltiple | ✅ Cubierto |
| **Should** | Operación offline / PWA (RT-06) | ❌ No cubierto (fuera de las 16h) |
| **Won't** | Adjuntos reales, pantalla de auditoría | ❌ No cubierto (no es núcleo de Pista B) |

## Decisiones técnicas

- **Context + hooks, no Redux/Zustand**: 4 pantallas, flujo unidireccional. Meter una lib de estado sería YAGNI.
- **Axios con interceptor**: Bearer automático + redirección a `/login` ante 401.
- **Contrato compartido**: los tipos (`shared/types.ts`) reflejan el `design.md` del SDD; el front se construyó contra ese contrato antes de existir el backend, y la integración fue directa (sin drift).

## Tiempo invertido (frontend)

| Componente | Horas |
|------------|-------|
| Scaffold Vite + shared (api-client, router, types) | 1.0 |
| Auth (login, store, persistencia JWT) | 0.5 |
| Novedades (listado, filtros, alta, enviar, export) | 0.7 |
| Aprobaciones (bandeja, selección múltiple) | 0.3 |
| **Total frontend** | **~2.5h** |

> El detalle completo del backend y del proyecto está en el README de **GCV_api**.
