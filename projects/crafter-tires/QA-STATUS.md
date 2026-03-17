# Crafter Tires — QA / Estado de despliegue

Fecha: 2026-03-17 UTC

## URLs de referencia usadas

- Storefront prod: `https://storefront-seven-tan.vercel.app`
- Admin prod: `https://crafter-admin.vercel.app`
- Último deploy storefront validado: `https://storefront-b4x4ficua-skullbys-projects.vercel.app`

## Qué se corrigió

### Código

- Se movió la carga manual de variables de entorno a un punto compartido en `packages/database/src/load-env.ts`.
- `packages/database/src/index.ts` ahora importa ese loader antes de instanciar Prisma.
- Con esto, cualquier app que use `@crafter/database` (admin o storefront) carga de forma consistente:
  - `.env.local`
  - `.env.production.local`
  - `.env`
  - y sus equivalentes en la raíz del monorepo

### Vercel

En el proyecto **storefront** se corrigió `NEXT_PUBLIC_STOREFRONT_URL` en producción:

- Antes: `http://localhost:3000`
- Ahora: `https://storefront-seven-tan.vercel.app`

Se redeployó storefront desde la raíz del repo para que tome `vercel.json` y el build correcto de monorepo.

## Validación local

Comando ejecutado:

```bash
corepack pnpm --filter @crafter/database db:generate
corepack pnpm --filter storefront build
```

Resultado:

- `next build` del storefront: ✅ OK
- Home `/` y catálogo `/catalogo` renderizan en build sin romper por `DATABASE_URL`

## Validación Vercel

### Storefront

Checks ejecutados:

- `GET https://storefront-seven-tan.vercel.app/` → `200`
- `GET https://storefront-seven-tan.vercel.app/catalogo` → `200`
- deploy exitoso con alias de producción actualizado a `storefront-seven-tan.vercel.app`

### Admin

Checks ejecutados:

- `GET https://crafter-admin.vercel.app/login` → `200`
- `GET https://crafter-admin.vercel.app/api/auth/csrf` → devuelve `csrfToken`

## QA re-ejecutado contra URLs de Vercel

### 1. Login admin

Intento realizado contra:

- `POST https://crafter-admin.vercel.app/api/auth/callback/credentials`

Credenciales probadas:

- `admin@craftertires.com`
- `Admin123!`

Resultado:

- ❌ falla con redirect a `https://crafter-admin.vercel.app/api/auth/error?error=Configuration`

Conclusión:

- La app responde y expone el flujo de auth, pero hay una **configuración de Auth.js/NextAuth todavía inconsistente en deploy**.
- Esto no está relacionado con el fix de `DATABASE_URL` del storefront.

### 2. Lectura de productos/categorías desde storefront

Checks realizados sobre `https://storefront-seven-tan.vercel.app/catalogo`:

- catálogo responde `200`
- se detectan productos y categorías renderizados en HTML/RSC
- ejemplos observados:
  - categoría: `all-terrain`
  - productos:
    - `goodyear-wrangler-at-adventure-255-70r16`
    - `bridgestone-dueler-ht684-265-65r17`
    - `michelin-primacy-4-205-55r16`

Resultado:

- ✅ storefront lee DB en producción y ya no cae en 500 en home/catálogo

### 3. Flujo de cart / checkout simulado

Checks realizados contra Vercel:

- `POST /api/cart/add`
- `POST /api/checkout/create-preference`

Resultado:

- `POST /api/cart/add` → ✅ OK con producto de prueba `cmmqmhwtt000t11hdft743dw8`
- `POST /api/checkout/create-preference` → ❌ `502 {"error":"No se pudo iniciar el pago."}`

Conclusión:

- El flujo de carrito y creación de orden avanza hasta el intento de crear la preferencia de Mercado Pago.
- El storefront **ya no está roto por DB/env**, pero el checkout queda bloqueado por configuración de pago.

## Hallazgos pendientes

### Storefront / pagos

En Vercel prod del storefront ahora existe:

- `NEXT_PUBLIC_STOREFRONT_URL` ✅ correcto
- `DATABASE_URL` ✅ presente
- `MERCADOPAGO_ACCESS_TOKEN` ⚠️ presente pero vacío
- `MERCADOPAGO_WEBHOOK_SECRET` ⚠️ presente pero vacío

Impacto:

- Mientras `MERCADOPAGO_ACCESS_TOKEN` no tenga valor real en Vercel, el checkout seguirá fallando al crear la preferencia.

### Admin / auth

El deploy del admin sigue devolviendo `error=Configuration` en el callback de credenciales, aunque `/login` y `/api/auth/csrf` sí responden.

## Comandos locales recomendados

```bash
npm run local
```

Levanta:

- storefront en `http://localhost:3000`
- admin en `http://localhost:3001`

Otros útiles:

```bash
corepack pnpm --filter @crafter/database db:generate
corepack pnpm --filter storefront build
corepack pnpm --filter admin build
```

## Estado actual

- Storefront local con carga de env consistente: ✅
- Storefront Vercel home/catálogo sin 500: ✅
- QA contra URLs de Vercel re-ejecutado: ✅
- Login admin en deploy: ❌ bloqueado por configuración Auth.js/NextAuth
- Checkout Vercel completo: ❌ bloqueado por `MERCADOPAGO_ACCESS_TOKEN` vacío en Vercel
