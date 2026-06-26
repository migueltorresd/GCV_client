// Tipos compartidos. Reflejan el contrato de design.md (API Contracts) y los Anexos A/B del reto.
// Si el backend cambia un campo, se cambia primero en design.md y luego acá.

export type Rol = 'COLABORADOR' | 'SUPERVISOR' | 'RRHH';

export type EstadoNovedad = 'BORRADOR' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

// Anexo A: CHECK (tipo IN (...)) — enum cerrado de 5 valores.
export type TipoNovedad =
  | 'AUSENTISMO'
  | 'PERMISO'
  | 'HORAS_EXTRA'
  | 'SALUD'
  | 'ACTUALIZACION_DATOS';

export const TIPOS_NOVEDAD: TipoNovedad[] = [
  'AUSENTISMO',
  'PERMISO',
  'HORAS_EXTRA',
  'SALUD',
  'ACTUALIZACION_DATOS',
];

export const ESTADOS_NOVEDAD: EstadoNovedad[] = [
  'BORRADOR',
  'PENDIENTE',
  'APROBADA',
  'RECHAZADA',
];

// Identidad decodificada del JWT (claims: sub, email, rol, filial_id).
// Solo para UI; la autorización real vive en el backend.
export interface AuthUser {
  sub: number;
  email: string;
  rol: Rol;
  filial_id: number;
}

// Forma de salida esperada de GET /novedades (novedad-response.dto del backend).
// Confirmar campos exactos del DTO con el backend antes de integrar.
export interface Novedad {
  id: number;
  tipo: TipoNovedad;
  estado: EstadoNovedad;
  fecha_inicio: string;
  fecha_fin: string | null;
  descripcion: string | null;
  adjunto?: string | null;
  solicitante_id: number;
  solicitante_email?: string;
  filial_id: number;
  aprobador_id?: number | null;
  motivo_rechazo?: string | null;
  created_at?: string;
}

export interface CrearNovedadInput {
  tipo: TipoNovedad;
  fecha_inicio: string;
  fecha_fin?: string | null;
  descripcion?: string;
  adjunto?: string;
}

export interface FiltrosNovedad {
  tipo?: TipoNovedad;
  estado?: EstadoNovedad;
  desde?: string;
  hasta?: string;
}

// Resultado de POST /novedades/aprobar-masivo (filter-and-skip).
export interface AprobarMasivoResult {
  procesados: number[];
  ignorados: number[];
}
