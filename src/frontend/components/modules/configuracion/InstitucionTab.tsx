// src/frontend/components/modules/configuracion/InstitucionTab.tsx
// Pestaña para configurar los datos institucionales que encabezan órdenes e informes
// Skill: react-modernization

'use client';

import { useState, useEffect } from 'react';
import { Button, Input, showToast } from '@/frontend/components/ui';
import { Building2, Save } from 'lucide-react';
import type { SystemConfig } from '@/types/config.types';

export interface InstitucionTabProps {
  initialInstitucion: SystemConfig['institucion'];
  onSave: (institucion: SystemConfig['institucion']) => void;
}

export function InstitucionTab({ initialInstitucion, onSave }: InstitucionTabProps) {
  const [data, setData] = useState(initialInstitucion);

  useEffect(() => {
    setData(initialInstitucion);
  }, [initialInstitucion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
    showToast.success('Datos institucionales guardados correctamente');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4 text-xs"
    >
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Membrete y Encabezado Institucional</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Estos datos se imprimen en la parte superior de las Fichas de Orden y los Informes Oficiales PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Input
            id="cfg-inst-nombre"
            label="Nombre de la Institución / Razón Social"
            value={data.nombre}
            onChange={(e) => setData({ ...data, nombre: e.target.value })}
          />
        </div>

        <div>
          <Input
            id="cfg-inst-subtitulo"
            label="Subtítulo o Tipo de Entidad"
            value={data.subtitulo}
            onChange={(e) => setData({ ...data, subtitulo: e.target.value })}
          />
        </div>

        <div>
          <Input
            id="cfg-inst-depto"
            label="Departamento o Unidad Responsable"
            value={data.departamento}
            onChange={(e) => setData({ ...data, departamento: e.target.value })}
          />
        </div>

        <div>
          <Input
            id="cfg-inst-ciudad"
            label="Sede / País"
            value={data.ciudad}
            onChange={(e) => setData({ ...data, ciudad: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
        <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
