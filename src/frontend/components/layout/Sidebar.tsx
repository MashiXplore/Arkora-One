// src/frontend/components/layout/Sidebar.tsx
// Componente de navegación lateral (Sidebar) compacto y limpio
// Skill: react-modernization

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Laptop,
  ClipboardList,
  AlertTriangle,
  Wrench,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Usuarios y Roles',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Funcionarios',
    href: '/funcionarios',
    icon: UserCheck,
  },
  {
    label: 'Equipo',
    href: '/inventory',
    icon: Laptop,
  },
  {
    label: 'Asignaciones',
    href: '/assignments',
    icon: ClipboardList,
  },
  {
    label: 'Incidencias',
    href: '/incidents',
    icon: AlertTriangle,
  },
  {
    label: 'Órdenes de Servicio',
    href: '/work-orders',
    icon: Wrench,
  },
  {
    label: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-r border-slate-300 dark:border-slate-800/80 select-none transition-colors duration-200 relative">
      {/* Brand Header */}
      <div
        className={`flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } h-14 px-3 border-b border-slate-300 dark:border-slate-800/80 shrink-0 relative`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg shadow-sm shadow-blue-500/20 shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="font-bold text-base text-slate-900 dark:text-white leading-tight tracking-wide truncate">
                Arkora
              </span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
                Diaconía TI
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={`hidden md:flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isCollapsed
              ? 'absolute -right-3 top-4 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-md z-50'
              : 'w-6 h-6 bg-slate-100 dark:bg-slate-800/60'
          }`}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 text-xs font-medium transition-all duration-150 group relative ${
                isCollapsed
                  ? 'justify-center w-10 h-10 mx-auto rounded-xl px-0'
                  : 'px-3 py-2 rounded-xl'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {/* Tooltip visible solo cuando la barra está colapsada */}
              {isCollapsed && (
                <div className="fixed left-16 z-50 hidden group-hover:block px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-300 dark:border-slate-800/80 shrink-0">
        <div
          className={`flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-800 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col text-[11px] truncate leading-tight">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                Arkora TI
              </span>
              <span className="text-[10px] text-slate-400">v1.0 • Diaconía</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
