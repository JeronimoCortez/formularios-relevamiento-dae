// types/index.ts

export type TipoGestion = "Estatal" | "Privada" ;

export type TipoFormulario = "primaria" | "secundaria" | "adultos";

export interface GradoData {
  matricula: number;
  notificadas: number;
  actaSupletoria: number;
  ausentes: number;
}

export interface SituacionesRiesgo {
  retosVirales: number;
  amenazas: number;
  conflictosPares: number;
  conflictividadDigital: number;
  otrosRiesgos: number;
  descripcion: string;
}

export interface VulneracionDerechos {
  detectados: "si" | "no";
  cantidadCasos: number;
  descripcion: string;
}

export interface FormDataPrimaria {
  tipoGestion: TipoGestion;
  sedeSupervisión: string;
  departamento: string;
  escuela: string;
  correoElectronico: string;
  grados: Record<string, GradoData>; // "1°", "2°", ..., "7°"
  situacionesRiesgo: SituacionesRiesgo;
  vulneracion: VulneracionDerechos;
}

export interface FormDataSecundaria {
  tipoGestion: TipoGestion;
  sedeSupervisión: string;
  departamento: string;
  escuela: string;
  grados: Record<string, GradoData>; // "1°", ..., "6°"
  situacionesRiesgo: SituacionesRiesgo;
  vulneracion: VulneracionDerechos;
}

export interface FormDataAdultos {
  tipoGestion: TipoGestion;
  sedeSupervisión: string;
  departamento: string;
  escuela: string;
  ciclos: Record<string, GradoData>; // "Ciclo Básico", "Ciclo Orientado"
  situacionesRiesgo: SituacionesRiesgo;
  vulneracion: VulneracionDerechos;
}

export interface ApiSubmitBody {
  tipo: TipoFormulario;
  data: FormDataPrimaria | FormDataSecundaria | FormDataAdultos;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const DEPARTAMENTOS_MENDOZA = [
  "Capital",
  "General Alvear",
  "Godoy Cruz",
  "Guaymallén",
  "Junín",
  "La Paz",
  "Las Heras",
  "Lavalle",
  "Luján de Cuyo",
  "Maipú",
  "Malargüe",
  "Rivadavia",
  "San Carlos",
  "San Martín",
  "San Rafael",
  "Santa Rosa",
  "Tunuyán",
  "Tupungato", 
] as const;

export type Departamento = (typeof DEPARTAMENTOS_MENDOZA)[number];

export const GRADOS_PRIMARIA = ["1°", "2°", "3°", "4°", "5°", "6°", "7°"] as const;
export const GRADOS_SECUNDARIA = ["1°", "2°", "3°", "4°", "5°", "6°"] as const;
export const CICLOS_ADULTOS = ["Ciclo Básico", "Ciclo Orientado"] as const;
