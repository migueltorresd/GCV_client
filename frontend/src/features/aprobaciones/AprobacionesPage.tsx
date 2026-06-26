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
      <div className="pagehead">
        <div>
          <span className="tag">MÓDULO // APROBACIÓN</span>
          <h1>
            Bandeja de <span className="hl">aprobación</span>
          </h1>
        </div>
        <button className="secondary" onClick={cargar}>
          Refrescar
        </button>
      </div>

      <div className="statgrid">
        <div className="stat stat--pendiente">
          <svg className="smark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
            <use href="#hand" />
          </svg>
          <div className="num">{pendientes.length}</div>
          <span className="lbl">Pendientes por aprobar</span>
        </div>
      </div>

      <div className="note">
        Solo se muestran novedades en estado <b>PENDIENTE</b>. Aprueba o rechaza por fila, o selecciona
        varias para una acción masiva.
      </div>

      {resultado && (
        <div className="note">
          Aprobación masiva → procesadas: <b>{resultado.procesados.length}</b> · ignoradas:{' '}
          <b>{resultado.ignorados.length}</b>
        </div>
      )}

      {seleccion.size > 0 && (
        <div className="bulkbar">
          <span className="count">{seleccion.size} seleccionada(s)</span>
          <button onClick={handleAprobarMasivo}>Aprobar seleccionadas</button>
          <button
            className="btn--sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => setSeleccion(new Set())}
          >
            Limpiar
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    checked={pendientes.length > 0 && seleccion.size === pendientes.length}
                    onChange={toggleTodos}
                    aria-label="Seleccionar todas las novedades"
                  />
                </th>
                <th scope="col">ID</th>
                <th scope="col">Tipo</th>
                <th scope="col">Inicio</th>
                <th scope="col">Fin</th>
                <th scope="col">Descripción</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} aria-hidden="true">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j}>
                        <div className="sk" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pendientes.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <svg className="em-mark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
                        <use href="#hand" />
                      </svg>
                      <h2>Bandeja al día</h2>
                      <p>No hay novedades pendientes por aprobar. Buen trabajo.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendientes.map((n) => (
                  <tr key={n.id} data-e={n.estado}>
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccion.has(n.id)}
                        onChange={() => toggle(n.id)}
                        aria-label={`Seleccionar novedad ${n.id}`}
                      />
                    </td>
                    <td className="mono">{n.id}</td>
                    <td>{n.tipo}</td>
                    <td className="mono">{n.fecha_inicio}</td>
                    <td className="mono">{n.fecha_fin ?? '—'}</td>
                    <td className="trunc" title={n.descripcion ?? ''}>
                      {n.descripcion ?? '—'}
                    </td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn--sm"
                        onClick={() => handleAprobar(n.id)}
                        aria-label={`Aprobar novedad ${n.id}`}
                      >
                        Aprobar
                      </button>
                      <button
                        className="danger btn--sm"
                        onClick={() => handleRechazar(n.id)}
                        aria-label={`Rechazar novedad ${n.id}`}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
