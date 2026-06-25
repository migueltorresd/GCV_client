import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKEN_KEY } from '../../shared/api-client';
import type { AuthUser } from '../../shared/types';

// Decodifica el payload del JWT SOLO para la UI (mostrar rol, condicionar vistas).
// No verifica la firma: esa validación es responsabilidad del backend.
function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json);
    return {
      sub: Number(claims.sub),
      email: claims.email,
      rol: claims.rol,
      filial_id: Number(claims.filial_id),
    };
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? decodeToken(token) : null;
  });

  // Sincroniza el estado si el token cambia en otra pestaña.
  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      setUser(token ? decodeToken(token) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setToken: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        setUser(decodeToken(token));
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
