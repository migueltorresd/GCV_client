import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './features/auth/auth.store';
import { PrivateRoute } from './shared/PrivateRoute';
import { LoginPage } from './features/auth/LoginPage';
import { NovedadesPage } from './features/novedades/NovedadesPage';
import { AprobacionesPage } from './features/aprobaciones/AprobacionesPage';
import { filialDesdeEmail } from './shared/filial';

function NavBar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const filial = filialDesdeEmail(user.email, user.filial_id);

  return (
    <header className="top">
      <div className="brand">
        <svg fill="currentColor">
          <use href="#hand" />
        </svg>
        [<span className="br">GCV</span>]
      </div>
      <div className="tenant" style={{ borderLeftColor: filial.color }}>
        <span className="tenant__label">Filial</span>
        <span className="tenant__name" style={{ color: filial.color }}>
          {filial.nombre}
        </span>
      </div>
      <nav className="topnav">
        <NavLink to="/novedades">Novedades</NavLink>
        {user.rol === 'SUPERVISOR' && <NavLink to="/aprobaciones">Aprobaciones</NavLink>}
      </nav>
      <div className="userbox">
        <div className="who">
          <b>{user.email}</b>
        </div>
        <span className="rolepill">{user.rol}</span>
        <button className="secondary btn--sm" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </header>
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
