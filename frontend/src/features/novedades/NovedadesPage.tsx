import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/auth.store';
import { enviarNovedad, exportarCsv, listarNovedades } from './novedades.api';
import { NuevaNovedadForm } from './NuevaNovedadForm';
import {
  ESTADOS_NOVEDAD,
  TIPOS_NOVEDAD,
  type EstadoNovedad,
  type FiltrosNovedad,
  type Novedad,
  type TipoNovedad,
} from '../../shared/types';

export function NovedadesPage() {
  const { user } = useAuth();
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [filtros, setFiltros] = useState<FiltrosNovedad>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setNovedades(await listarNovedades(filtros));
    } catch {
      setError('No se pudieron cargar las novedades.');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function handleEnviar(id: number) {
    try {
      await enviarNovedad(id);
      await cargar();
    } catch {
      setError('No se pudo enviar la novedad.');
    }
  }

  const esColaborador = user?.rol === 'COLABORADOR';
  const esRrhh = user?.rol === 'RRHH';

  return (
    <div className="container">
      <h1>Novedades</h1>

      {esColaborador && <NuevaNovedadForm onCreated={cargar} />}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <strong>Filtros</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
          <select
            value={filtros.tipo ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, tipo: (e.target.value || undefined) as TipoNovedad }))}
          >
            <option value="">Tipo (todos)</option>
            {TIPOS_NOVEDAD.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={filtros.estado ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, estado: (e.target.value || undefined) as EstadoNovedad }))}
          >
            <option value="">Estado (todos)</option>
            {ESTADOS_NOVEDAD.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filtros.desde ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value || undefined }))}
          />
          <input
            type="date"
            value={filtros.hasta ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value || undefined }))}
          />
        </div>
        {esRrhh && (
          <button
            className="secondary"
            style={{ marginTop: '0.75rem' }}
            onClick={() => exportarCsv(filtros.desde, filtros.hasta)}
          >
            Exportar CSV (Anexo E)
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Descripción</th>
              {esColaborador && <th>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {novedades.length === 0 && (
              <tr>
                <td colSpan={esColaborador ? 7 : 6}>Sin novedades.</td>
              </tr>
            )}
            {novedades.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.tipo}</td>
                <td>{n.estado}</td>
                <td>{n.fecha_inicio}</td>
                <td>{n.fecha_fin ?? '—'}</td>
                <td>{n.descripcion ?? '—'}</td>
                {esColaborador && (
                  <td>
                    {n.estado === 'BORRADOR' && (
                      <button onClick={() => handleEnviar(n.id)}>Enviar</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
