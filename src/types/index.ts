export type UserRole = 'operador' | 'empresa' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Operador {
  id: string;
  user_id: string;
  nombre_completo: string;
  rut: string;
  telefono: string;
  años_experiencia: number;
  avatar_url?: string;
  cv_url?: string;
  licencias: string[];
  equipos_operados: string[];
  certificaciones: string[];
  region: string;
  ciudad: string;
  disponible: boolean;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Empresa {
  id: string;
  user_id: string;
  nombre: string;
  rut: string;
  telefono: string;
  logo_url?: string;
  sitio_web?: string;
  descripcion?: string;
  region: string;
  ciudad: string;
  created_at: string;
  updated_at: string;
}

export interface Vacante {
  id: string;
  empresa_id: string;
  titulo: string;
  descripcion: string;
  equipo_requerido: string;
  licencias_requeridas: string[];
  certificaciones_requeridas: string[];
  experiencia_minima: number;
  region: string;
  ciudad: string;
  turno: 'mañana' | 'tarde' | 'noche' | 'rotativo';
  salario_min?: number;
  salario_max?: number;
  cantidad_vacantes: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
  empresa?: Empresa;
}

export interface Postulacion {
  id: string;
  vacante_id: string;
  operador_id: string;
  estado: 'pendiente' | 'visto' | 'aceptado' | 'rechazado';
  comentarios_empresa?: string;
  created_at: string;
  updated_at: string;
  vacante?: Vacante;
  operador?: Operador;
}

export interface SuscripcionEmpresa {
  id: string;
  empresa_id: string;
  plan_id: string;
  estado: 'activa' | 'cancelada' | 'vencida';
  fecha_inicio: string;
  fecha_fin: string;
  renovacion_automatica: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanSuscripcion {
  id: string;
  nombre: string;
  precio: number;
  vacantes_incluidas: number;
  caracteristicas: string[];
  activo: boolean;
}

export interface Pago {
  id: string;
  suscripcion_id: string;
  monto: number;
  moneda: string;
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  metodo_pago: string;
  referencia_externa?: string;
  created_at: string;
  updated_at: string;
}
