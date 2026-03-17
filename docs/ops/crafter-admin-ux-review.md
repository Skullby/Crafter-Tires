# Crafter Tires Admin — UX/UI review + refactor proposal

## Problemas detectados en el admin original

1. **Navegación con poca jerarquía**
   - Secciones operativas importantes mezcladas sin prioridad clara.
   - Difícil entender rápido dónde gestionar catálogo vs operación.

2. **Pantallas con baja escaneabilidad**
   - Formularios y listas con estructura plana.
   - Falta de headers, resúmenes y señales visuales de estado.

3. **Flujo de productos e inventario mejorable**
   - Alta, edición y stock no estaban optimizados para operación cotidiana.
   - Faltaban atajos para cambios rápidos y lectura inmediata de stock.

4. **Estados vacíos y feedback débiles**
   - Empty states poco trabajados.
   - Éxito/error/criticidad no tenían lenguaje visual consistente.

## Propuesta UX aplicada

### Nueva estructura de navegación
- Dashboard
- Productos
- Inventario
- Categorías
- Marcas
- Órdenes
- Clientes
- Importaciones

### Principios usados
- **Operación primero**: catálogo e inventario arriba de la navegación.
- **Escaneo rápido**: títulos claros, descripciones cortas y chips de contexto.
- **Edición sin fricción**: alta rápida + edición inline + editor completo.
- **Estados visibles**: badges para stock sano/bajo/sin stock.
- **Consistencia visual**: tarjetas, botones, inputs y empty states compartidos.

## Batch 1 implementado

### Layout / navegación
- Sidebar oscura con navegación persistente.
- Estado activo claro en navegación.
- Área de contenido más limpia y con ancho controlado.

### Sistema visual base
- Clases compartidas para:
  - `admin-card`
  - `admin-btn-primary`
  - `admin-btn-secondary`
  - `admin-field`
  - `admin-empty-state`
  - badges de éxito / warning / danger
  - check cards

### Páginas mejoradas
- Login
- Dashboard
- Productos
- Inventario
- Categorías
- Marcas
- Órdenes
- Clientes
- Importaciones
- Editor completo de producto

### Flujo Productos / Inventario
- Alta rápida de producto con foco operativo.
- Edición rápida de precio/stock en lista.
- Enlace a edición completa más cuidada.
- Inventario con badges por nivel de stock.
- Ajuste de stock con motivo y trazabilidad.

## Impacto operativo esperado
- Menos tiempo para encontrar acciones frecuentes.
- Mejor lectura de stock crítico.
- Menos fricción al dar de alta productos.
- Mantenimiento de catálogo más claro para managers/admins.

## Batch 2 recomendado
- Toasts de éxito/error persistentes tras server actions.
- Filtros más potentes en productos e inventario.
- Bulk actions para catálogo.
- Tabla avanzada para órdenes y clientes.
- Mejor responsive behavior del sidebar con drawer móvil.
