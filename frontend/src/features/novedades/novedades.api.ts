import { apiClient, TOKEN_KEY } from '../../shared/api-client';
import type { CrearNovedadInput, FiltrosNovedad, Novedad } from '../../shared/types';

// GET /novedades?tipo=&estado=&desde=&hasta= — scoped por rol + filial en el backend.
export async function listarNovedades(filtros: FiltrosNovedad = {}): Promise<Novedad[]> {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await apiClient.get<Novedad[]>('/novedades', { params });
  return data;
}

// POST /novedades — crea en estado BORRADOR (rol COLABORADOR).
export async function crearNovedad(input: CrearNovedadInput): Promise<Novedad> {
  const { data } = await apiClient.post<Novedad>('/novedades', input);
  return data;
}

// POST /novedades/:id/enviar — BORRADOR → PENDIENTE.
export async function enviarNovedad(id: number): Promise<void> {
  await apiClient.post(`/novedades/${id}/enviar`);
}

// GET /exportacion/csv — descarga el archivo plano del Anexo E (rol RRHH).
// Se hace fetch manual para preservar el header Content-Disposition y disparar la descarga.
export async function exportarCsv(desde?: string, hasta?: string): Promise<void> {
  const params = new URLSearchParams();
  if (desde) params.set('fecha_desde', desde);
  if (hasta) params.set('fecha_hasta', hasta);

  const token = localStorage.getItem(TOKEN_KEY) ?? '';
  const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseURL}/exportacion/csv?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('No se pudo exportar.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'novedades.csv';
  a.click();
  URL.revokeObjectURL(url);
}
