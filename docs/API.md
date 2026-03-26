# Crafter Tires — API Reference

Last updated: 2026-03-26

## Storefront API

Base URL: `https://storefront-seven-tan.vercel.app/api`

### Cart

#### POST /api/cart/add
Add a product to the cart.

**Request:**
```json
{
  "productId": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
  "quantity": 3
}
```

**Validation:**
- `productId`: string, CUID format (required)
- `quantity`: integer, 1–10 (required)

**Response:** `{ "ok": true }` or `{ "ok": false, "error": "..." }` (400)

---

#### POST /api/cart/remove
Remove an item from the cart.

**Request:**
```json
{
  "itemId": "clxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Validation:**
- `itemId`: string, CUID format (required)

**Response:** `{ "ok": true }` or `{ "ok": false, "error": "..." }` (400)

---

#### POST /api/cart/update
Update quantity of a cart item. Setting quantity to 0 removes the item.

**Request:**
```json
{
  "itemId": "clxxxxxxxxxxxxxxxxxxxxxxxxx",
  "quantity": 5
}
```

**Validation:**
- `itemId`: string, CUID format (required)
- `quantity`: integer, 0–99 (required)

**Response:** `{ "ok": true }` or `{ "ok": false, "error": "..." }` (400)

---

### Checkout

#### POST /api/checkout/create-preference
Create a Mercado Pago payment preference and start checkout.

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+5491155554444",
  "shippingAddress": {
    "street": "Av. Corrientes 1234",
    "city": "CABA",
    "state": "Buenos Aires",
    "postalCode": "C1043",
    "country": "AR"
  },
  "billingSameAsShipping": true
}
```

**Validation:** Uses `checkoutSchema` from `@crafter/database`
- `name`: string, min 3 chars
- `email`: valid email
- `phone`: string, min 6 chars
- `shippingAddress`: object with street (min 4), city (min 2), state (min 2), postalCode (min 3), country (default "AR")
- `billingSameAsShipping`: boolean (default true)
- `billingAddress`: optional, same shape as shipping

**Flow:**
1. Validates cart is not empty
2. Checks inventory for all items
3. Creates/updates customer record
4. Creates order with unique number (format: `CT-YYYYMMDD-HHMMSS-RANDOM`)
5. Creates Mercado Pago preference
6. Clears cart

**Response (success):**
```json
{
  "orderId": "...",
  "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.ar/..."
}
```

**Errors:**
- 400: Cart empty, stock insufficient, invalid input
- 502: Mercado Pago preference creation failed (order gets canceled)

---

### Webhooks

#### POST /api/mercadopago/webhook
Receives payment status updates from Mercado Pago.

**Called by:** Mercado Pago servers (not by clients)

**Payload:** Mercado Pago notification format with `data.id` or `id` (payment ID)

**Flow:**
1. Extracts payment ID from payload
2. Fetches payment details from Mercado Pago API
3. Maps payment status to internal status
4. Updates payment and order records
5. On APPROVED: triggers `applyApprovedPayment` (inventory deduction, order status update)

**Response:** Always `{ "ok": true }` (idempotent)

---

## Admin API

Base URL: `http://localhost:3001/api` (or Vercel admin URL)

### Authentication

#### GET/POST /api/auth/[...nextauth]
NextAuth.js handler. Manages login, logout, and session.

**Provider:** Credentials (email + password)
**Session strategy:** JWT
**Protected routes:** All routes except `/login` and `/api/auth/*`

---

## Validation Schemas

All shared validation schemas live in `packages/database/src/validation.ts`:

- **`productInputSchema`** — product CRUD validation
- **`checkoutSchema`** — checkout form validation

Unit tests: `packages/database/src/validation.test.ts` (12 tests)
API schema tests: `packages/database/src/api-schemas.test.ts` (13 tests)
