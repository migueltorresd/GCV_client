import { useState, type FormEvent } from 'react';
import { crearNovedad } from './novedades.api';
import { TIPOS_NOVEDAD, type TipoNovedad } from '../../shared/types';

export function NuevaNovedadForm({ onCreated }: { onCreated: () => void }) {
  const [tipo, setTipo] = useState<TipoNovedad>('AUSENTISMO');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [adjunto, setAdjunto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Validación client-side (espejo de la del backend; la autoridad real es server-side).
    if (fechaFin && fechaFin < fechaInicio) {
      setError('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    setLoading(true);
    try {
      await crearNovedad({
        tipo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || null,
        descripcion: descripcion || undefined,
        adjunto: adjunto || undefined,
      });
      setFechaInicio('');
      setFechaFin('');
      setDescripcion('');
      setAdjunto('');
      onCreated();
    } catch {
      setError('No se pudo crear la novedad.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <span className="tag" style={{ color: 'var(--lime)', display: 'block', marginBottom: '1rem' }}>
        // NUEVA NOVEDAD
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoNovedad)}>
            {TIPOS_NOVEDAD.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <span />
        <label>
          Fecha inicio
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        </label>
        <label>
          Fecha fin (opcional)
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </label>
      </div>
      <label style={{ marginTop: '1rem' }}>
        Descripción
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
      </label>
      <label style={{ marginTop: '1rem' }}>
        Adjunto (opcional)
        <input type="file" onChange={(e) => setAdjunto(e.target.files?.[0]?.name ?? '')} />
      </label>
      <small className="mono">
        Solo se registra el nombre del archivo — el almacenamiento real está fuera de alcance.
      </small>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Guardando…' : 'Crear (BORRADOR)'}
      </button>
    </form>
  );
}
