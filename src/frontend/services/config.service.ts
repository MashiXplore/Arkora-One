// src/frontend/services/config.service.ts
// Servicio de configuración del sistema (firmas de órdenes e informes, parámetros institucionales)
// Skill: api-design-principles, react-modernization

import { DEFAULT_CONFIG, type SystemConfig, type FirmaConfig } from '@/types/config.types';

const STORAGE_KEY = 'arkora_system_config';

export const configService = {
  getConfig(): SystemConfig {
    if (typeof window === 'undefined') {
      return DEFAULT_CONFIG;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SystemConfig;
        return {
          firmasOrdenes: Array.isArray(parsed.firmasOrdenes) ? parsed.firmasOrdenes : DEFAULT_CONFIG.firmasOrdenes,
          firmasInformes: Array.isArray(parsed.firmasInformes) ? parsed.firmasInformes : DEFAULT_CONFIG.firmasInformes,
          institucion: parsed.institucion || DEFAULT_CONFIG.institucion,
        };
      }
    } catch {
      // Fallback a default
    }

    return DEFAULT_CONFIG;
  },

  saveConfig(newConfig: SystemConfig): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      window.dispatchEvent(new Event('arkora_config_updated'));
      return true;
    } catch {
      return false;
    }
  },

  resetConfig(): SystemConfig {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('arkora_config_updated'));
    }
    return DEFAULT_CONFIG;
  },
};
