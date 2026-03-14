# Crafter Tires Monorepo

Monorepo de e-commerce en TypeScript con Next.js App Router, Tailwind CSS, Prisma y PostgreSQL.

## Arquitectura

- `apps/storefront`: sitio público (`www.craftertires.com`)
- `apps/admin`: panel privado (`admin.craftertires.com`)
- `packages/database`: Prisma schema, cliente y seed
- `packages/ui`: componentes UI compartidos
- `packages/config`: espacio para configuración compartida

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth (admin email/password)
- Mercado Pago API (checkout + webhook)

## Funcionalidades implementadas

### Storefront

- Home comercial en español con buscador por medida
- Catálogo con filtros (marca, ancho, alto, rodado, tipo, precio, stock)
- Ordenamiento (menor precio, mayor precio, más vendidos, recomendados)
- Página por categoría
- Detalle de producto con specs técnicas
- Carrito funcional con actualización de cantidad y eliminación
- Checkout funcional:
  - valida stock
  - crea cliente
  - crea orden + items + pago
  - crea preferencia Mercado Pago
  - redirige a flujo de pago
- Página de resultado de checkout
- Página de orden
- Webhook Mercado Pago:
  - actualiza estado de pago
  - marca orden
  - descuenta inventario al aprobarse
- SEO base: metadata, Open Graph, sitemap, robots

### Admin (subdominio)

- Login seguro con NextAuth y credenciales
- Protección de rutas con middleware
- Roles soportados: `ADMIN`, `MANAGER`
- Dashboard con métricas básicas
- Gestión de productos:
  - crear
  - editar rápido
  - editar completo
  - archivar (solo admin)
- Gestión de inventario:
  - ajustes manuales
  - registro mediante `InventoryMovement`
- Gestión de categorías
- Gestión de marcas
- Gestión de órdenes con búsqueda
- Vista de clientes e historial reciente
- Módulo placeholder de importación Excel (sin upload todavía)

## Modelo de datos (Prisma)

Incluye:

- `User` (roles admin/manager)
- `Customer`
- `Brand`
- `Category`
- `Product`
- `ProductImage`
- `ProductSpecification`
- `Inventory`
- `InventoryMovement`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`

Preparado para sincronización futura desde Excel por SKU.

## Seed

`packages/database/prisma/seed.ts` crea:

- Marcas y categorías realistas
- Productos con medidas como `245/45R18`, `185/60R14`
- Variación de stock, descuentos y destacados
- Usuarios admin/manager

Credenciales seed:

- Admin: `admin@craftertires.com` / `Admin123!`
- Manager: `manager@craftertires.com` / `Manager123!`

## Setup local

1. Instalar dependencias:
   - `corepack pnpm install`
2. Copiar env:
   - usar `.env.example` como base
3. Generar cliente Prisma:
   - `corepack pnpm db:generate`
4. Ejecutar migraciones:
   - `corepack pnpm db:migrate`
5. Cargar seed:
   - `corepack pnpm db:seed`
6. Levantar apps:
   - `corepack pnpm dev`
7. Levantar entorno visual completo en un solo comando:
   - `npm run local`
8. Limpiar procesos locales de storefront/admin:
   - `npm run local:clean`

`npm run local`:

- verifica PostgreSQL en `localhost:5432`
- intenta iniciar el servicio local en Windows si no esta corriendo
- levanta storefront en `http://localhost:3000`
- levanta admin en `http://localhost:3001`
- se detiene con `Ctrl + C`

`npm run local:clean`:

- mata procesos que esten ocupando `3000` y `3001`
- tambien limpia procesos `pnpm/next dev` asociados a `storefront` y `admin`
- util cuando una sesion local quedo colgada

Visualizar la base de datos:

- `npm run db:studio`

Esto abre Prisma Studio en el navegador para inspeccionar y editar datos de PostgreSQL de forma visual.

Puertos:

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3001`

## Despliegue en Vercel (dominio + subdominio)

Recomendado: **2 proyectos Vercel apuntando al mismo repo**.

### Proyecto 1: storefront

- Root Directory: `apps/storefront`
- Domain: `www.craftertires.com`
- Env vars:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_STOREFRONT_URL=https://www.craftertires.com`
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `MERCADOPAGO_WEBHOOK_SECRET` (opcional)

### Proyecto 2: admin

- Root Directory: `apps/admin`
- Domain: `admin.craftertires.com`
- Env vars:
  - `DATABASE_URL`
  - `NEXTAUTH_URL=https://admin.craftertires.com`
  - `NEXTAUTH_SECRET`

### Base de datos

- Usar PostgreSQL gestionado (Neon, Supabase, RDS, etc.)
- Ambos proyectos comparten la misma `DATABASE_URL`

## Mercado Pago

Flujo implementado:

1. `POST /api/checkout/create-preference`
2. Crea orden y pago pendiente
3. Crea preferencia MP
4. Redirige al checkout MP
5. Webhook `POST /api/mercadopago/webhook`
6. Actualiza pago/orden y descuenta stock al aprobar

## Excel import (futuro)

Preparado en:

- UI: `apps/admin/app/(dashboard)/importaciones/page.tsx`
- Servicio placeholder: `apps/admin/lib/imports/placeholder.ts`

Punto de integración recomendado:

1. Parseo Excel -> filas normalizadas
2. Validación Zod por planilla
3. Diff por SKU contra catálogo actual
4. Upsert transaccional (producto + inventario)
5. Registro de movimientos y reporte final

## Subir a GitHub

El proyecto ya quedo preparado para publicarse:

- `.gitignore` excluye dependencias, builds, logs y archivos `.env`
- `.gitattributes` normaliza finales de linea
- `package-lock.json` fue removido para no mezclar npm con pnpm

Pasos sugeridos:

1. `git init -b main`
2. `git add .`
3. `git commit -m "Initial commit"`
4. `git remote add origin https://github.com/TU_USUARIO/TU_REPO.git`
5. `git push -u origin main`
