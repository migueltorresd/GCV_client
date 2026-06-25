import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './features/auth/auth.store';
import { PrivateRoute } from './shared/PrivateRoute';
import { LoginPage } from './features/auth/LoginPage';
import { NovedadesPage } from './features/novedades/NovedadesPage';
import { AprobacionesPage } from './features/aprobaciones/AprobacionesPage';

function NavBar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="nav">
      <NavLink to="/novedades">Novedades</NavLink>
      {user.rol === 'SUPERVISOR' && <NavLink to="/aprobaciones">Aprobaciones</NavLink>}
      <span className="spacer" />
      <span>
        {user.email} · <strong>{user.rol}</strong> · filial {user.filial_id}
      </span>
      <button className="secondary" onClick={logout}>
        Salir
      </button>
    </nav>
  );
}

export function App() {
  const { user } = useAuth();

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/novedades" replace /> : <LoginPage />} />
        <Route
          path="/novedades"
          element={
            <PrivateRoute>
              <NovedadesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/aprobaciones"
          element={
            <PrivateRoute roles={['SUPERVISOR']}>
              <AprobacionesPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? '/novedades' : '/login'} replace />} />
      </Routes>
    </>
  );
}
