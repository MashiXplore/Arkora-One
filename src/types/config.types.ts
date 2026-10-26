// src/types/config.types.ts
// Tipos para configuración de firmas de órdenes e informes y datos institucionales

export interface FirmaConfig {
  id: string;
  cargo: string; // Ej: "Funcionario Solicitante", "Técnico Asignado", "Jefatura TI"
  nombre?: string; // Nombre específico o predeterminado
  aclaracion: string; // Ej: "Firma y Sello", "Firma y C.I."
  dependencia?: string; // Ej: "Unidad de Soporte TI"
  leyenda?: string; // Ej: "Visto Bueno y Aprobación"
}

export interface SystemConfig {
  firmasOrdenes: FirmaConfig[];
  firmasInformes: FirmaConfig[];
  institucion: {
    nombre: string;
    subtitulo: string;
    departamento: string;
    ciudad: string;
  };
}

export const DEFAULT_CONFIG: SystemConfig = {
  firmasOrdenes: [
    {
      id: 'ord-1',
      cargo: 'Funcionario Solicitante',
      nombre: '',
      aclaracion: 'Firma y C.I. del Custodio',
    },
    {
      id: 'ord-2',
      cargo: 'Técnico Responsable',
      nombre: '',
      aclaracion: 'Unidad de Soporte TI',
    },
    {
      id: 'ord-3',
      cargo: 'Jefatura de Agencia / Operaciones',
      nombre: '',
      aclaracion: 'Visto Bueno de Entrega',
    },
  ],
  firmasInformes: [
    {
      id: 'inf-1',
      cargo: 'Técnico Evaluador',
      nombre: '',
      aclaracion: 'Firma y Sello Profesional',
    },
    {
      id: 'inf-2',
      cargo: 'Jefatura de Sistemas e Infraestructura',
      nombre: '',
      aclaracion: 'Visto Bueno y Aprobación',
    },
    {
      id: 'inf-3',
      cargo: 'Gerencia Administrativa y Operativa',
      nombre: '',
      aclaracion: 'Revisión y Conformidad',
    },
    {
      id: 'inf-4',
      cargo: 'Autorización de Compra / Auditoría',
      nombre: '',
      aclaracion: 'Firma de Autorización',
    },
  ],
  institucion: {
    nombre: 'Diaconía FRIF - IFD',
    subtitulo: 'Entidad Financiera de Desarrollo',
    departamento: 'Departamento de Tecnologías de Información y Comunicaciones',
    ciudad: 'Bolivia',
  },
};
