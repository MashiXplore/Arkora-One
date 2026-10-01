// src/frontend/components/layout/Navbar.tsx
// Componente de barra superior (Navbar) compacto con selector de Tema Claro/Oscuro
// Skill: react-modernization

'use client';

import { useState } from 'react';
import { Menu, LogOut, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useTheme } from '@/frontend/context/ThemeContext';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export function Navbar({ onOpenMobileSidebar }: NavbarProps) {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Iniciales para el Avatar
  const initials = session?.name
    ? session.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-5 flex items-center justify-between transition-colors duration-200 shrink-0">
      {/* Lado Izquierdo: Botón Menú Móvil & Identificador */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40">
            Diaconía FRIF
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Sistema Arkora TI
          </span>
        </div>
      </div>

      {/* Lado Derecho: Switch Tema Claro/Oscuro + Usuario & Menú desplegable */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle de Modo Claro / Modo Oscuro */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 group-hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 transition-transform duration-200 group-hover:-rotate-12" />
          )}
        </button>

        {/* Separador vertical */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Dropdown de Usuario */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {/* Badge de Rol */}
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {session?.role ?? 'ADMINISTRADOR'}
            </span>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
              {initials}
            </div>
          </button>

          {/* Menú desplegable */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-40 divide-y divide-slate-100 dark:divide-slate-800/80">
                {/* Info del usuario */}
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {session?.name ?? 'Administrador Diaconía'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {session?.email ?? 'admin@diaconia.org.bo'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Sesión Activa</span>
                  </div>
                </div>

                {/* Selección directa de Tema */}
                <div className="py-2 px-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tema visual
                  </span>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        if (theme !== 'light') toggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                        theme === 'light'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Claro</span>
                    </button>
                    <button
                      onClick={() => {
                        if (theme !== 'dark') toggleTheme();
                      }}
                      className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                        theme === 'dark'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Oscuro</span>
                    </button>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
