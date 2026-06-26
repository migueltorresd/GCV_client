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

  // Conteos derivados del array ya cargado (solo presentación, sin estado ni API extra).
  const cuenta = (e: EstadoNovedad) => novedades.filter((n) => n.estado === e).length;
  const cols = esColaborador ? 7 : 6;

  return (
    <div className="container">
      <div className="pagehead">
        <div>
          <span className="tag">MÓDULO // {esColaborador ? 'MIS NOVEDADES' : 'NOVEDADES'}</span>
          <h1>
            {esColaborador ? 'Mis ' : 'Novedades del '}
            <span className="hl">{esColaborador ? 'novedades' : 'equipo'}</span>
          </h1>
        </div>
        {esRrhh && (
          <button className="secondary" onClick={() => exportarCsv(filtros.desde, filtros.hasta)}>
            Exportar CSV (Anexo E) ↓
          </button>
        )}
      </div>

      <div className="statgrid">
        <div className="stat stat--pendiente">
          <svg className="smark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
            <use href="#hand" />
          </svg>
          <div className="num">{cuenta('PENDIENTE')}</div>
          <span className="lbl">Pendientes</span>
        </div>
        <div className="stat stat--aprobada">
          <svg className="smark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
            <use href="#hand" />
          </svg>
          <div className="num">{cuenta('APROBADA')}</div>
          <span className="lbl">Aprobadas</span>
        </div>
        <div className="stat stat--rechazada">
          <svg className="smark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
            <use href="#hand" />
          </svg>
          <div className="num">{cuenta('RECHAZADA')}</div>
          <span className="lbl">Rechazadas</span>
        </div>
        {esColaborador ? (
          <div className="stat stat--borrador">
            <svg className="smark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
              <use href="#hand" />
            </svg>
            <div className="num">{cuenta('BORRADOR')}</div>
            <span className="lbl">Borradores</span>
          </div>
        ) : (
          <div className="stat stat--total">
            <svg className="smark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
              <use href="#hand" />
            </svg>
            <div className="num">{novedades.length}</div>
            <span className="lbl">Total</span>
          </div>
        )}
      </div>

      {esColaborador && <NuevaNovedadForm onCreated={cargar} />}

      <div className="filters">
        <label>
          Tipo
          <select
            value={filtros.tipo ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, tipo: (e.target.value || undefined) as TipoNovedad }))}
          >
            <option value="">Todos</option>
            {TIPOS_NOVEDAD.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            value={filtros.estado ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, estado: (e.target.value || undefined) as EstadoNovedad }))}
          >
            <option value="">Todos</option>
            {ESTADOS_NOVEDAD.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha inicio
          <input
            type="date"
            value={filtros.desde ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value || undefined }))}
          />
        </label>
        <label>
          Fecha fin
          <input
            type="date"
            value={filtros.hasta ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value || undefined }))}
          />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
                <th scope="col">Inicio</th>
                <th scope="col">Fin</th>
                <th scope="col">Descripción</th>
                {esColaborador && <th scope="col">Acción</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} aria-hidden="true">
                    {Array.from({ length: cols }).map((__, j) => (
                      <td key={j}>
                        <div className="sk" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : novedades.length === 0 ? (
                <tr>
                  <td colSpan={cols}>
                    <div className="empty">
                      <svg className="em-mark" fill="currentColor" viewBox="0 0 64 64" aria-hidden="true">
                        <use href="#hand" />
                      </svg>
                      <h2>Sin novedades</h2>
                      <p>
                        {esColaborador
                          ? 'Todavía no creaste ninguna novedad. Empezá con el formulario de arriba.'
                          : 'No hay novedades con los filtros actuales.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                novedades.map((n) => (
                  <tr key={n.id} data-e={n.estado}>
                    <td className="mono">{n.id}</td>
                    <td>{n.tipo}</td>
                    <td>
                      <span className={`badge badge--${n.estado.toLowerCase()}`}>{n.estado}</span>
                    </td>
                    <td className="mono">{n.fecha_inicio}</td>
                    <td className="mono">{n.fecha_fin ?? '—'}</td>
                    <td className="trunc" title={n.descripcion ?? ''}>
                      {n.descripcion ?? '—'}
                    </td>
                    {esColaborador && (
                      <td>
                        {n.estado === 'BORRADOR' && (
                          <button
                            className="btn--sm"
                            onClick={() => handleEnviar(n.id)}
                            aria-label={`Enviar novedad ${n.id} a aprobación`}
                          >
                            Enviar →
                          </button>
                        )}
                      </td>
                    )}
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
