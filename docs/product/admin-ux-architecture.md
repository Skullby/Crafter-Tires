# Crafter Admin v2 — Arquitectura de UX

_Fecha: 2026-03-17_

## Objetivo

Rediseñar el panel admin de Crafter Tires para que sea:

- Más rápido de entender para nuevos admins/managers
- Optimizado para las tareas diarias (stock, catálogo, órdenes)
- Consistente en patrones (listas, formularios, estados vacíos)
- Preparado para crecer sin volverse caótico

## Roles y necesidades

- **Admin**
  - Gestionar catálogo completo (productos, marcas, categorías)
  - Supervisar stock global y alertas
  - Ver y gestionar órdenes y clientes
  - Configurar parámetros globales (futuro)

- **Manager / Operativo**
  - Ver rápidamente qué productos requieren acción de stock
  - Cargar/actualizar inventario
  - Procesar órdenes y actualizar estados

## IA (Information Architecture)

### Nivel 1 — Dashboard

Ruta: `/`

- KPIs clave: total productos, stock bajo, sin stock, órdenes recientes
- Entradas rápidas a:
  - **Ver productos con stock bajo**
  - **Ir a inventario**
  - **Ir a órdenes pendientes** (futuro)

### Nivel 2 — Módulos principales

Todas las rutas viven bajo el layout `(dashboard)` y comparten componentes y patrones.

1. **Productos** (`/productos`)
   - Lista de productos con búsqueda por nombre/sku/categoría
   - Filtros básicos (categoría, marca, estado)
   - Acción primaria: "Crear producto"
   - Acción secundaria: "Ver inventario de este producto"

2. **Inventario** (`/inventario`)
   - Vista por SKU con niveles de stock, sucursal/ubicación (si aplica futuro)
   - Filtro rápido: "Solo stock bajo" / "Solo sin stock"
   - Acción primaria: "Actualizar stock" (modal o inline)

3. **Categorías** (`/categorias`)
   - Lista simple, cantidad de productos por categoría
   - Crear/editar/eliminar categorías (respetando restricciones de negocio)

4. **Marcas** (`/marcas`)
   - Similar a categorías

5. **Órdenes** (`/ordenes`)
   - Lista de órdenes con estado, cliente, total
   - Filtro por estado (pendiente, pagada, enviada, cancelada)
   - Detalle de orden (vista dedicada futura)

6. **Clientes** (`/clientes`)
   - Lista de clientes
   - Búsqueda por email/nombre

7. **Importaciones** (`/importaciones`)
   - Historial de import jobs
   - Estado, fecha, tipo y resultado

## Patrones de UX transversales

### 1. Estructura de página

Todas las páginas internas usan el mismo shell:

- **Header de página** con:
  - Título
  - Descripción breve
  - Acciones primarias (botones a la derecha)

- **Contenido**:
  - Tarjeta principal con tabla o formulario
  - Estados vacíos claros y orientados a la acción

### 2. Estados (empty / loading / error)

Para cada módulo de lista (productos, inventario, órdenes, clientes):

- **Loading**: skeleton simple sobre la tabla
- **Empty**: bloque con icono + mensaje + CTA (crear, importar, etc.)
- **Error**: tarjeta con borde amarillo/rojo con mensaje y posible retry

### 3. Listas y tablas

- Encabezados consistentes
- Acciones contextuales al final de cada fila
- Columnas ordenables (futuro)

### 4. Formularios

- Layout en 2 columnas para pantallas grandes, stack en mobile
- Validaciones inline con mensajes claros
- Botón primario alineado a la derecha en el footer del formulario

## Navegación

- Sidebar fijo con grupos lógicos:
  - General: Dashboard
  - Catálogo: Productos, Inventario, Categorías, Marcas
  - Ventas: Órdenes, Clientes
  - Sistema: Importaciones

- Estado activo claro, accesible via `aria-current="page"`

## Roadmap de UX

### Fase 1 — Consistencia y shell

- Unificar headers de página y componentes card
- Estandarizar tablas y estados vacíos
- Ajustar navegación lateral con grupos

### Fase 2 — Flujo de stock y órdenes

- Mejorar filtros y acciones rápidas en Inventario y Órdenes
- Agregar vista de detalle de orden

### Fase 3 — Calidad de vida

- Búsquedas avanzadas
- Atajos de teclado y mejoras de productividad

Esta arquitectura guía el diseño de UI y la implementación frontend/backend sin romper los flujos core existentes (login, catálogo, stock, órdenes).