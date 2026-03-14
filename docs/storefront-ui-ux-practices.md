# Crafter Tires UI/UX Practices

## 1. Arquitectura de informacion

### Orden de prioridad
1. Encontrar medida o producto
2. Validar precio, cuota y stock
3. Confirmar compatibilidad con el vehiculo
4. Avanzar a carrito o consulta por WhatsApp

### Regla
Todo bloque principal del storefront debe ayudar a una de esas cuatro tareas.

## 2. Navegacion

- Header persistente con acceso rapido a catalogo, categorias y contacto.
- CTA de carrito visible en desktop y mobile.
- Las categorias actuan como atajos, no como un catalogo paralelo complejo.

## 3. Finder por medida

- Debe aparecer arriba del fold en home.
- Debe usar tres campos simples: ancho, alto, rodado.
- Puede sumar tipo de vehiculo como filtro secundario, nunca como bloqueo.
- Debe enviar al catalogo con filtros preaplicados.

## 4. Product cards

### Anatomia obligatoria
- Imagen o placeholder consistente
- Marca
- Nombre corto legible
- Medida
- Tipo de vehiculo
- Precio actual
- Precio anterior y descuento si aplica
- Estado de stock
- CTA de detalle y compra

### Regla comercial
Las cards deben poder escanearse en 2 a 3 segundos.

## 5. Pricing UX

- El precio actual domina visualmente.
- El precio anterior se presenta solo como soporte.
- La financiacion aparece como mensaje corto y constante.
- El ahorro y el descuento se muestran solo cuando son reales.

## 6. PDP - Product Detail Page

- Columna izquierda: imagen y lectura visual del producto.
- Columna derecha: marca, nombre, specs, precio, stock, CTA, confianza.
- Debe existir una caja de compra separada del bloque de descripcion tecnica.
- La informacion tecnica va debajo del CTA, no antes.

## 7. Catalogo

- Sidebar de filtros con lectura simple y sticky en desktop.
- Resumen superior con cantidad de resultados y orden.
- Espaciado generoso entre cards para evitar ruido.
- Empty state claro, con sugerencia de limpiar filtros o volver al catalogo general.

## 8. Carrito y checkout

- El carrito debe hacer visibles: producto, cantidad, subtotal y siguiente paso.
- El checkout no debe competir visualmente con informacion irrelevante.
- Los campos se agrupan por logica: contacto, envio, confirmacion de pago.

## 9. Responsive behavior

- Mobile first real.
- Finder y CTA principales deben quedar dentro del primer scroll util.
- Filtros del catalogo pasan de sidebar a bloque superior.
- Las grillas de producto deben sostener consistencia de alto y spacing.

## 10. Accesibilidad

- Contraste alto en CTA y texto informativo.
- Labels visibles en formularios.
- Estados focus visibles y consistentes.
- Jerarquia semantica correcta en headings y landmarks.

## 11. Decision log

- Se usa una UI mas sobria y modular para que el catalogo escale sin rediseño posterior.
- Se privilegia una sola accion principal por bloque.
- Se normaliza el lenguaje comercial para eliminar ruido y mojibake heredado.
