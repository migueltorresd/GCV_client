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
    <div className="container" style={{ maxWidth: 420 }}>
      <h1>GCV · Novedades</h1>
      <form className="card" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
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
        <label style={{ display: 'block', marginTop: '0.75rem' }}>
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
        <button type="submit" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <details style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555' }}>
        <summary>Usuarios semilla (Anexo B)</summary>
        <p style={{ margin: '0.5rem 0' }}>Contraseña para todos: <code>Prueba2026*</code></p>
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
  );
}
