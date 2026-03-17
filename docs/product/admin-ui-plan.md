# Crafter Admin v2 — Plan de UI

_Fecha: 2026-03-17_

Este documento traduce la arquitectura de UX en decisiones concretas de UI para el panel admin.

## 1. Shell de aplicación

### Layout `(dashboard)`

- Mantener layout de 2 columnas en desktop: sidebar fijo + contenido.
- Mejorar legibilidad del sidebar:
  - Logo/título compacto
  - Email y rol en fuente secundaria
  - Grupos con títulos pequeños en mayúsculas

### Header global

- En la sección de contenido: header de página por ruta, no un header global único.
- Cada página usa el patrón `admin-page` + `admin-page-header` ya definidos en `globals.css`.

## 2. Sidebar y navegación

Refactor del array `nav` en `(dashboard)/layout.tsx` para soportar grupos:

```ts
const nav = [
  {
    label: "General",
    items: [{ href: "/", label: "Dashboard" }]
  },
  {
    label: "Catálogo",
    items: [
      { href: "/productos", label: "Productos" },
      { href: "/inventario", label: "Inventario" },
      { href: "/categorias", label: "Categorías" },
      { href: "/marcas", label: "Marcas" }
    ]
  },
  {
    label: "Ventas",
    items: [
      { href: "/ordenes", label: "Órdenes" },
      { href: "/clientes", label: "Clientes" }
    ]
  },
  {
    label: "Sistema",
    items: [{ href: "/importaciones", label: "Importaciones" }]
  }
];
```

UI:

- Título de grupo como texto xs uppercase, muted.
- Items con el mismo componente `NavLink`, adaptado para recibir `isSub` si hace falta ajustar padding.

## 3. Patrón de páginas de lista

A aplicar en:

- `/productos`
- `/inventario`
- `/categorias`
- `/marcas`
- `/ordenes`
- `/clientes`
- `/importaciones`

### Header de página

Estructura estándar:

- Título: nombre del módulo
- Descripción corta
- Actions a la derecha (cuando aplique):
  - Botón primario (`admin-btn-primary`) para crear/nueva acción
  - Botón secondary (`admin-btn-secondary`) para importar/exportar

### Lista principal

- Tabla dentro de `admin-card` o `admin-table-wrap` según necesidad.
- Filtros y búsqueda como fila superior dentro de la tarjeta:
  - Búsqueda (`input`) alineado a la izquierda
  - Filtros (selects/checkboxes) a la derecha en desktop, fila aparte en mobile

### Empty state

Si la lista está vacía:

- Reemplazar la tabla por un bloque `admin-empty-state` con:
  - Título corto
  - Descripción
  - Botón primario (crear/importar)

## 4. Inventario y alertas visuales

En `/inventario` y cualquier vista que liste stock:

- Columna de `stock` con badges:
  - `> 5`: texto normal
  - `1-5`: `admin-badge-warning`
  - `0`: `admin-badge-danger`

- Filtro rápido (checkbox o toggle):
  - "Solo stock bajo"
  - "Solo sin stock"

## 5. Órdenes

En `/ordenes`:

- Columna `estado` con badge según estado (`admin-badge-success/warning/danger`).
- Columna `pago` con texto claro (Pagado/Pendiente/Rechazado).
- Acción por fila: botón tipo link `Ver detalle` (aunque inicialmente pueda llevar a la misma página u otro placeholder), pensado para futura ruta `/ordenes/[id]`.

## 6. Consistencia visual

- Usar `admin-card` para contenedores principales.
- Evitar estilos ad-hoc en páginas; preferir utilidades de Tailwind + clases `admin-*`.
- Mantener tipografías, espaciados y radios de borde alineados al dashboard.

## 7. Accesibilidad básica

- Asegurar que `NavLink` use `aria-current="page"` para la ruta activa.
- Formularios con `label` explícito ligado a cada input.
- Botones con textos claros, sin depender solo de iconos (por ahora).

## 8. Fases de implementación

### Fase 1 — Shell + navegación + headers

- Refactor del sidebar para usar grupos.
- Alinear el Dashboard a `admin-page` + `admin-card` (ya está parcialmente).
- Ajustar cada página de módulo a la estructura de header + card.

### Fase 2 — Tablas + estados vacíos + badges

- Actualizar todas las páginas de lista para usar `admin-table` + `admin-empty-state`.
- Implementar badges de stock y estados de órdenes.

### Fase 3 — Filtros y acciones rápidas

- Agregar filtros mínimos a Inventario y Órdenes.
- Añadir CTAs en empty states.

Las fases 1 y 2 son el objetivo mínimo para este refactor inicial, sin romper flujos core existentes.