// src/frontend/hooks/useConfig.ts
// Hook reactivo para acceder y modificar la configuración de firmas y parámetros
// Skill: react-modernization

'use client';

import { useState, useEffect, useCallback } from 'react';
import { configService } from '@/frontend/services/config.service';
import { DEFAULT_CONFIG, type SystemConfig, type FirmaConfig } from '@/types/config.types';

export function useConfig() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadCurrentConfig = useCallback(() => {
    const current = configService.getConfig();
    setConfig(current);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadCurrentConfig();

    const handleUpdate = () => {
      loadCurrentConfig();
    };

    window.addEventListener('arkora_config_updated', handleUpdate);
    return () => {
      window.removeEventListener('arkora_config_updated', handleUpdate);
    };
  }, [loadCurrentConfig]);

  const updateConfig = (newConfig: SystemConfig) => {
    const ok = configService.saveConfig(newConfig);
    if (ok) {
      setConfig(newConfig);
    }
    return ok;
  };

  const updateFirmasOrdenes = (firmas: FirmaConfig[]) => {
    const updated = { ...config, firmasOrdenes: firmas };
    return updateConfig(updated);
  };

  const updateFirmasInformes = (firmas: FirmaConfig[]) => {
    const updated = { ...config, firmasInformes: firmas };
    return updateConfig(updated);
  };

  const resetToDefault = () => {
    const resetVal = configService.resetConfig();
    setConfig(resetVal);
  };

  return {
    config,
    isLoaded,
    updateConfig,
    updateFirmasOrdenes,
    updateFirmasInformes,
    resetToDefault,
  };
}
