# GCV_client

Cliente web del módulo de **Novedades + Aprobación** para Grupo Corporativo Vértice (GCV).
Reto técnico — Pista B (Desarrollador Fullstack).

> El backend vive en un repositorio aparte: **GCV_api** (NestJS + PostgreSQL).

## Stack

- **React 18** + **Vite** + TypeScript (`strict: true`)
- **React Router** + **Axios** (interceptor Bearer JWT)
- Estado con **React Context + hooks** (sin Redux — YAGNI para 4 pantallas)
- Gestor de paquetes: **pnpm** (bloquea install scripts por defecto → cadena de suministro más segura)

## Arquitectura

Organización por **features**; la seguridad real vive en el backend (el front solo decodifica
el JWT para condicionar la UI, nunca para autorizar).

```
frontend/src/
├── features/
│   ├── auth/         # LoginPage, auth.store (Context), auth.api
│   ├── novedades/    # listado + filtros, alta, export CSV (RRHH)
│   └── aprobaciones/ # bandeja del supervisor, aprobación masiva
├── shared/
│   ├── api-client.ts # Axios + interceptor Bearer + manejo 401
│   ├── PrivateRoute.tsx
│   └── types.ts      # tipos del contrato (alineados con el design)
└── App.tsx           # router + navegación por rol
```

## Requisitos

- Node.js 18+ (probado con 22)
- pnpm 10 (`npm install -g pnpm` o `corepack enable`)
- El backend **GCV_api** corriendo (por defecto en `http://localhost:3000`)

## Puesta en marcha

```bash
cd frontend

# 1. Instalar dependencias
pnpm install

# 2. Crear el archivo .env (ver abajo)

# 3. Arrancar en modo desarrollo
pnpm run dev   # http://localhost:5173
```

## Variables de entorno (`frontend/.env`)

```env
# URL base del backend (GCV_api). La usa el interceptor de Axios.
VITE_API_URL=http://localhost:3000
```

> El `.env` no se versiona.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Servidor de desarrollo (Vite) |
| `pnpm run build` | Build de producción a `dist/` |
| `pnpm run preview` | Sirve el build de producción |
| `pnpm run lint` | ESLint |

## Acceso de prueba

La pantalla de login incluye un desplegable con los **usuarios semilla** (Anexo B).
Contraseña compartida: **`Prueba2026*`**. Los roles condicionan las vistas:

- **COLABORADOR** → crea novedades y ve solo las suyas.
- **SUPERVISOR** → bandeja de aprobación (individual y masiva).
- **RRHH** → ve las de su filial y exporta el CSV (Anexo E).

## Decisiones técnicas (defendibles)

- **Context + hooks, no Redux/Zustand**: 4 pantallas con flujo unidireccional no justifican una librería de estado.
- **El front decodifica el JWT solo para UI**: condiciona vistas, pero la autorización real la aplica el backend en cada endpoint.
- **`PrivateRoute` con roles es UX, no seguridad**: esconder un link es comodidad; la regla la impone el servidor.

## Estado del alcance

- [x] **Fase 9** — Login, listado + filtros, alta, bandeja de aprobación masiva, export CSV (RRHH)
- [ ] Integración end-to-end con GCV_api (pendiente de las fases de backend)
- [ ] README final con supuestos, MoSCoW y tiempo invertido (Fase 11)
