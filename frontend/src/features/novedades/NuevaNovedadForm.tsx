import { useState, type FormEvent } from 'react';
import { crearNovedad } from './novedades.api';
import { TIPOS_NOVEDAD, type TipoNovedad } from '../../shared/types';

export function NuevaNovedadForm({ onCreated }: { onCreated: () => void }) {
  const [tipo, setTipo] = useState<TipoNovedad>('AUSENTISMO');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [descripcion, setDescripcion] = useState('');
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
      });
      setFechaInicio('');
      setFechaFin('');
      setDescripcion('');
      onCreated();
    } catch {
      setError('No se pudo crear la novedad.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <h3>Nueva novedad</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
      <label style={{ display: 'block', marginTop: '0.75rem' }}>
        Descripción
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading} style={{ marginTop: '0.75rem' }}>
        {loading ? 'Guardando…' : 'Crear (BORRADOR)'}
      </button>
    </form>
  );
}
