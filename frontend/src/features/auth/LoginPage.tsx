import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './auth.api';
import { useAuth } from './auth.store';
import axios from 'axios';

export function LoginPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await login(email, password);
      setToken(token);
      navigate('/novedades', { replace: true });
    } catch (err) {
      // No exponemos detalles internos: mensaje genérico para credenciales inválidas.
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Credenciales inválidas.');
      } else {
        setError('No se pudo iniciar sesión. Verificá que el backend esté arriba.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="login__brand">
        <div className="top">
          <svg fill="currentColor">
            <use href="#hand" />
          </svg>
          [GCV]
        </div>
        <div>
          <svg className="bigmark" fill="currentColor" viewBox="0 0 64 64">
            <use href="#hand" />
          </svg>
          <div className="big">
            Gestión
            <br />
            de novedades
          </div>
        </div>
        <div className="foot">
          Acceso interno // 3 roles
          <br />
          Colaborador · Supervisor · RR.HH.
        </div>
      </div>

      <div className="login__form">
        <div className="inner">
          <span className="eyebrow">// AUTENTICACIÓN</span>
          <h2>Ingresar</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Ingresando…' : 'Ingresar →'}
            </button>
          </form>

          <details className="seedbox">
            <summary>Usuarios semilla (Anexo B)</summary>
            <p>
              Contraseña para todos: <code>Prueba2026*</code>
            </p>
            <ul>
              <li>carla.colaborador@and.gcv.com — COLABORADOR / Andinagas</li>
              <li>sergio.super@and.gcv.com — SUPERVISOR / Andinagas</li>
              <li>rocio.rrhh@and.gcv.com — RRHH / Andinagas</li>
              <li>diego.colaborador@ret.gcv.com — COLABORADOR / RetailVertice</li>
              <li>sandra.super@ret.gcv.com — SUPERVISOR / RetailVertice</li>
              <li>raul.rrhh@ret.gcv.com — RRHH / RetailVertice</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
