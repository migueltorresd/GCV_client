# GCV_client

Cliente web del módulo de **Novedades + Aprobación** para Grupo Corporativo Vértice (GCV).
Reto técnico — Pista B (Desarrollador Fullstack).

## Stack

- React 18 + Vite + TypeScript (modo `strict`)
- React Router + Axios
- Autenticación JWT simulada (claims: `sub`, `email`, `rol`, `filial_id`)

## Ejecución (frontend)

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Crear `frontend/.env` con la URL del backend:

```
VITE_API_URL=http://localhost:3000
```

> El README completo (instalación end-to-end, supuestos, MoSCoW y tiempo invertido)
> se redacta en la Fase 11 del plan de implementación.
