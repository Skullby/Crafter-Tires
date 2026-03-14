import { prisma } from "@crafter/database";
import { getOrCreateSessionId } from "./session";

export async function getCart() {
  const sessionId = getOrCreateSessionId();

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: {
              inventory: true,
              images: { take: 1, orderBy: { order: "asc" } }
            }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true,
                images: { take: 1, orderBy: { order: "asc" } }
              }
            }
          }
        }
      }
    });
  }

  return cart;
}

export async function addToCart(productId: string, quantity: number) {
  const cart = await getCart();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true }
  });

  if (!product || !product.active || !product.inventory) {
    throw new Error("Producto no disponible");
  }

  const existing = cart.items.find((item) => item.productId === productId);
  const nextQty = (existing?.quantity ?? 0) + quantity;

  if (nextQty > product.inventory.stock) {
    throw new Error("Stock insuficiente");
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId
      }
    },
    update: {
      quantity: nextQty,
      unitPrice: product.price
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
      unitPrice: product.price
    }
  });
}

export async function updateCartItem(itemId: string, quantity: number) {
  const cart = await getCart();

  if (quantity <= 0) {
    await removeCartItem(itemId);
    return;
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      product: { include: { inventory: true } }
    }
  });

  if (!item || item.cartId !== cart.id) {
    throw new Error("Item de carrito invalido");
  }

  if (!item.product.inventory || quantity > item.product.inventory.stock) {
    throw new Error("No hay stock suficiente");
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  });
}

export async function removeCartItem(itemId: string) {
  const cart = await getCart();
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    select: { id: true, cartId: true }
  });

  if (!item || item.cartId !== cart.id) {
    throw new Error("Item de carrito invalido");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
}

export function computeCartTotals(
  items: Array<{ quantity: number; unitPrice: { toNumber(): number } }>
) {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice.toNumber() * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}