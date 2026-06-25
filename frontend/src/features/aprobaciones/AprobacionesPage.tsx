import { useCallback, useEffect, useState } from 'react';
import { listarNovedades } from '../novedades/novedades.api';
import { aprobar, aprobarMasivo, rechazar } from './aprobaciones.api';
import type { AprobarMasivoResult, Novedad } from '../../shared/types';

export function AprobacionesPage() {
  const [pendientes, setPendientes] = useState<Novedad[]>([]);
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
  const [resultado, setResultado] = useState<AprobarMasivoResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // La bandeja del supervisor trabaja sobre novedades en PENDIENTE de su filial (scope backend).
      setPendientes(await listarNovedades({ estado: 'PENDIENTE' }));
      setSeleccion(new Set());
    } catch {
      setError('No se pudieron cargar las novedades pendientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function toggle(id: number) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodos() {
    setSeleccion((prev) =>
      prev.size === pendientes.length ? new Set() : new Set(pendientes.map((n) => n.id)),
    );
  }

  async function handleAprobarMasivo() {
    if (seleccion.size === 0) return;
    setError('');
    try {
      const res = await aprobarMasivo([...seleccion]);
      setResultado(res);
      await cargar();
    } catch {
      setError('No se pudo aprobar la selección.');
    }
  }

  async function handleAprobar(id: number) {
    try {
      await aprobar(id);
      await cargar();
    } catch {
      setError('No se pudo aprobar.');
    }
  }

  async function handleRechazar(id: number) {
    const motivo = window.prompt('Motivo de rechazo:');
    if (motivo === null) return;
    try {
      await rechazar(id, motivo);
      await cargar();
    } catch {
      setError('No se pudo rechazar.');
    }
  }

  return (
    <div className="container">
      <h1>Bandeja de aprobación</h1>

      {resultado && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          Aprobación masiva → procesadas: <strong>{resultado.procesados.length}</strong> · ignoradas:{' '}
          <strong>{resultado.ignorados.length}</strong>
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
        <button onClick={handleAprobarMasivo} disabled={seleccion.size === 0}>
          Aprobar seleccionadas ({seleccion.size})
        </button>
        <button className="secondary" onClick={cargar}>
          Refrescar
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={pendientes.length > 0 && seleccion.size === pendientes.length}
                  onChange={toggleTodos}
                />
              </th>
              <th>ID</th>
              <th>Tipo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendientes.length === 0 && (
              <tr>
                <td colSpan={7}>No hay novedades pendientes.</td>
              </tr>
            )}
            {pendientes.map((n) => (
              <tr key={n.id}>
                <td>
                  <input type="checkbox" checked={seleccion.has(n.id)} onChange={() => toggle(n.id)} />
                </td>
                <td>{n.id}</td>
                <td>{n.tipo}</td>
                <td>{n.fecha_inicio}</td>
                <td>{n.fecha_fin ?? '—'}</td>
                <td>{n.descripcion ?? '—'}</td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => handleAprobar(n.id)}>Aprobar</button>
                  <button className="secondary" onClick={() => handleRechazar(n.id)}>
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
