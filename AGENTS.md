# Reglas de Arquitectura y Desarrollo para Arkora
# Sistema de Gestión de Equipos TI - Diaconía

## 🛠️ Skills Activas del Repositorio (antigravity-skills)
- **nextjs-app-router-patterns**: Usar App Router, Server Components y Route Handlers.
- **typescript-pro**: TypeScript estricto, sin `any`, tipos compartidos en `src/types/`.
- **api-design-principles**: REST unificado con versión `/api/v1/`, respuesta estándar con `success/data/error`.
- **security-auditor**: Contraseñas con bcryptjs, sesiones con jose/JWT, middleware de rutas protegidas.
- **react-modernization**: TanStack Query para datos, React Hook Form para formularios, hooks personalizados.

---

## 1. Separación de Capas (OBLIGATORIO)

### Frontend (`src/frontend/`)
- Los componentes React NUNCA hacen fetch directo a la API ni importan Prisma.
- Todas las llamadas HTTP van a través de `src/frontend/services/`.
- La lógica de estado/caché se encapsula en `src/frontend/hooks/` (TanStack Query).

### Backend (`src/backend/`)
- Los Route Handlers de Next.js (`src/app/api/v1/`) llaman a `src/backend/services/`.
- Los services llaman a `src/backend/repositories/` (que usa Prisma).
- NUNCA hacer queries de Prisma directamente en Route Handlers o servicios frontend.

---

## 2. Estructura de Archivos por Módulo (OBLIGATORIO)

Cada módulo en `src/frontend/components/modules/[modulo]/` DEBE dividirse en:
```
[Modulo]Page.tsx         → Vista contenedora principal (solo ensambla)
[Modulo]Metrics.tsx      → Tarjetas de métricas del módulo
[Modulo]Table.tsx        → Tabla con datos del módulo
[Modulo]CreateModal.tsx  → Formulario de creación
[Modulo]EditModal.tsx    → Formulario de edición
[Modulo]Filters.tsx      → Barra de filtros específica del módulo (si aplica)
```
**PROHIBIDO** tener toda la lógica de un módulo en un solo archivo.

---

## 3. Respuesta Estándar de API (OBLIGATORIO)

Todos los endpoints en `/api/v1/` deben responder con:
```ts
// Éxito con lista
{ success: true, data: T[], pagination: PaginationMeta, message: string }

// Éxito con objeto
{ success: true, data: T, message: string }

// Error
{ success: false, error: { code: string, message: string } }
```

---

## 4. Validación de Datos (OBLIGATORIO)

- TODO payload entrante al backend se valida con **Zod** antes de procesarse.
- Los esquemas Zod viven en `src/backend/validators/[modulo].validator.ts`.
- Los mismos esquemas se reutilizan para validar formularios frontend con React Hook Form + `@hookform/resolvers/zod`.

---

## 5. Tipado TypeScript (OBLIGATORIO)

- No se permite `any` (solo `unknown` con narrowing si es estrictamente necesario).
- Tipos compartidos (Front + Back) se definen en `src/types/`.
- Interfaces de respuesta de API en `src/types/api.types.ts`.
- Tipos de entidades en `src/types/[entidad].types.ts`.

---

## 6. Componentes UI (OBLIGATORIO)

Solo se usan los componentes atómicos de `src/frontend/components/ui/`:
- `Button`, `Input`, `Select`, `Modal`, `Table`, `Badge`, `Toast`, `StatsCard`, `Tabs`, `Breadcrumbs`, `ConfirmDialog`

**PROHIBIDO** crear estilos o botones inline en componentes de módulos.

---

## 7. Base de Datos MySQL + Prisma (OBLIGATORIO)

- Motor: **MySQL** con **Prisma ORM**.
- Las migraciones son **SIEMPRE incrementales** (`prisma migrate dev`).
- **PROHIBIDO** ejecutar `prisma migrate reset`, `DROP TABLE` o `TRUNCATE` sin confirmación explícita del usuario.
- El cliente Prisma se instancia una sola vez en `src/backend/db/prisma.ts`.

---

## 8. Seguridad (OBLIGATORIO)

- Contraseñas: siempre hasheadas con **bcryptjs** (rounds: 12).
- Sesiones: tokens JWT firmados con **jose**, almacenados en cookies HttpOnly.
- Rutas protegidas: el middleware en `src/middleware.ts` valida el token y el rol antes de dar acceso.
- Permisos CRUD por módulo: el Administrador asigna permisos a cada rol desde la interfaz.

---

## 9. Notificaciones y UX (OBLIGATORIO)

- Usar **Sonner** (Toast) para feedback al usuario en todas las operaciones.
- Las tablas deben tener: búsqueda en vivo, paginación, ordenamiento y columnas personalizables.
- Cada módulo muestra tarjetas de métricas (`StatsCard`) en la parte superior.

---

## 10. Módulos del Proyecto (Orden de Construcción)

1. ✅ **Infraestructura Base**: Next.js + Tailwind + MySQL/Prisma + estructura de carpetas
2. ✅ **Auth + Usuarios**: Login, roles (Admin, Técnico, Supervisor, Solicitante), RBAC, matriz de permisos
3. 🔲 **Catálogos**: Tipos de equipo, Marcas, Modelos, Ubicaciones, Estados
4. 🔲 **Inventario**: Equipos con código de activo, especificaciones, estados
5. 🔲 **Asignaciones**: Asignación de equipos a personas/áreas, historial
6. 🔲 **Incidencias**: Reporte y seguimiento de fallas
7. 🔲 **Órdenes de Servicio**: Mantenimiento preventivo y correctivo
8. 🔲 **Reportes**: Dashboard de métricas, exportación PDF/Excel

---

## 11. Estándar Global de Métricas Visuales y Maquetado Compacto (OBLIGATORIO)

1. **Métricas Visuales Adaptativas:**
   - Todos los módulos deben incluir una sección de métricas visuales profesionales en la parte superior ([Modulo]Metrics.tsx).
   - Combinar tarjetas resumen KPI con gráficos visuales adaptados a la naturaleza del módulo (Gráficos Donut/Torta para estados, Gráficos de Barras para distribuciones/roles, Gauges de progreso, etc.).
   - PROHIBIDO mostrar bloques de texto explicativo extensos en las métricas.

2. **Navegación sin Títulos de Cabecera:**
   - PROHIBIDO colocar bloques de título `<h1>` o subtítulos `<p>` en la parte superior de los módulos o dashboard.
   - La navegación se gestiona exclusivamente con `Breadcrumbs` ubicados en la esquina superior izquierda, alineados horizontalmente en la misma fila con los botones de acción principal (e.g. "Nuevo Usuario").

3. **Espaciado Compacto:**
   - Usar `space-y-3` o `space-y-[14px]` para mantener una distancia compacta y consistente entre la fila de navegación, métricas, pestañas, filtros y tablas.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
