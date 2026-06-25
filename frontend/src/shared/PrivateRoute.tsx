import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/auth.store';
import type { Rol } from './types';
import type { ReactNode } from 'react';

// Protege rutas: redirige a /login si no hay sesión.
// roles opcional: restringe la vista a ciertos roles (defensa en UI; el backend es la autoridad real).
export function PrivateRoute({ children, roles }: { children: ReactNode; roles?: Rol[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/novedades" replace />;
  }

  return <>{children}</>;
}
