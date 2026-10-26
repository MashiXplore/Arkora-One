// src/frontend/components/modules/configuracion/ConfiguracionPage.tsx
// Módulo de Configuración del Sistema (Firmas de órdenes e informes, parámetros de exportación)
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Breadcrumbs, Tabs, Button, showToast } from '@/frontend/components/ui';
import { useConfig } from '@/frontend/hooks/useConfig';
import { FirmasOrdenesTab } from './FirmasOrdenesTab';
import { FirmasInformesTab } from './FirmasInformesTab';
import { InstitucionTab } from './InstitucionTab';
import {
  Settings,
  ShieldCheck,
  FileCheck2,
  Building2,
  RotateCcw,
} from 'lucide-react';

export function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('firmas_ordenes');
  const {
    config,
    updateFirmasOrdenes,
    updateFirmasInformes,
    updateConfig,
    resetToDefault,
  } = useConfig();

  const tabs = [
    {
      id: 'firmas_ordenes',
      label: 'Firmas: Órdenes de Servicio',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'firmas_informes',
      label: 'Firmas: Informes Técnicos',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      id: 'institucion',
      label: 'Membrete Institucional',
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  const handleReset = () => {
    resetToDefault();
    showToast.success('Valores de configuración restaurados a su estado predeterminado.');
  };

  return (
    <div className="space-y-3">
      {/* Fila superior compacta: Breadcrumbs + Acción de Reset */}
      <div className="flex flex-row items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Ajustes del Sistema' },
            { label: 'Configuración de Firmas y Documentos' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
            title="Restaurar firmas y parámetros por defecto"
          >
            Restaurar Predeterminados
          </Button>
        </div>
      </div>

      {/* Navegación por pestañas compacta */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenido según pestaña */}
      {activeTab === 'firmas_ordenes' && (
        <FirmasOrdenesTab
          initialFirmas={config.firmasOrdenes}
          onSave={(firmas) => updateFirmasOrdenes(firmas)}
        />
      )}

      {activeTab === 'firmas_informes' && (
        <FirmasInformesTab
          initialFirmas={config.firmasInformes}
          onSave={(firmas) => updateFirmasInformes(firmas)}
        />
      )}

      {activeTab === 'institucion' && (
        <InstitucionTab
          initialInstitucion={config.institucion}
          onSave={(inst) => updateConfig({ ...config, institucion: inst })}
        />
      )}
    </div>
  );
}
