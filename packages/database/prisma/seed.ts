import { PrismaClient, VehicleType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const productsSeed = [
  {
    name: "Neumatico Pirelli Cinturato P7 245/45R18",
    slug: "pirelli-cinturato-p7-245-45r18",
    sku: "PIR-2454518-P7",
    description: "Excelente adherencia en seco y mojado para conduccion urbana y ruta.",
    price: 285000,
    previousPrice: 320000,
    discountPercentage: 11,
    width: 245,
    height: 45,
    rim: 18,
    vehicleType: VehicleType.AUTO,
    runFlat: false,
    featured: true,
    stock: 16,
    brand: "Pirelli",
    category: "Premium",
    bestsellerScore: 95
  },
  {
    name: "Neumatico Michelin Primacy 4 205/55R16",
    slug: "michelin-primacy-4-205-55r16",
    sku: "MIC-2055516-PR4",
    description: "Mayor duracion y frenado confiable para autos familiares.",
    price: 214000,
    previousPrice: null,
    discountPercentage: null,
    width: 205,
    height: 55,
    rim: 16,
    vehicleType: VehicleType.AUTO,
    runFlat: false,
    featured: true,
    stock: 9,
    brand: "Michelin",
    category: "Turismo",
    bestsellerScore: 88
  },
  {
    name: "Neumatico Bridgestone Dueler H/T 684 265/65R17",
    slug: "bridgestone-dueler-ht684-265-65r17",
    sku: "BRI-2656517-D684",
    description: "Confort y estabilidad para SUV y camionetas en uso mixto.",
    price: 332000,
    previousPrice: 360000,
    discountPercentage: 8,
    width: 265,
    height: 65,
    rim: 17,
    vehicleType: VehicleType.SUV,
    runFlat: false,
    featured: true,
    stock: 7,
    brand: "Bridgestone",
    category: "SUV",
    bestsellerScore: 92
  },
  {
    name: "Neumatico Firestone F700 185/60R14",
    slug: "firestone-f700-185-60r14",
    sku: "FIR-1856014-F700",
    description: "Opcion economica con buen rendimiento para ciudad.",
    price: 129000,
    previousPrice: 139000,
    discountPercentage: 7,
    width: 185,
    height: 60,
    rim: 14,
    vehicleType: VehicleType.AUTO,
    runFlat: false,
    featured: false,
    stock: 24,
    brand: "Firestone",
    category: "Economica",
    bestsellerScore: 70
  },
  {
    name: "Neumatico Continental ContiSportContact 5 225/45R17",
    slug: "continental-contisportcontact5-225-45r17",
    sku: "CON-2254517-CSC5",
    description: "Prestaciones deportivas y excelente respuesta en curvas.",
    price: 268000,
    previousPrice: null,
    discountPercentage: null,
    width: 225,
    height: 45,
    rim: 17,
    vehicleType: VehicleType.AUTO,
    runFlat: true,
    featured: false,
    stock: 4,
    brand: "Continental",
    category: "Deportiva",
    bestsellerScore: 80
  },
  {
    name: "Neumatico Goodyear Wrangler AT Adventure 255/70R16",
    slug: "goodyear-wrangler-at-adventure-255-70r16",
    sku: "GOO-2557016-WAT",
    description: "Traccion confiable para caminos rurales y asfalto.",
    price: 301000,
    previousPrice: 330000,
    discountPercentage: 9,
    width: 255,
    height: 70,
    rim: 16,
    vehicleType: VehicleType.CAMIONETA,
    runFlat: false,
    featured: true,
    stock: 0,
    brand: "Goodyear",
    category: "All Terrain",
    bestsellerScore: 90
  }
];

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const brands = [...new Set(productsSeed.map((p) => p.brand))];
  const categories = [...new Set(productsSeed.map((p) => p.category))];

  const brandMap = new Map<string, string>();
  for (const name of brands) {
    const brand = await prisma.brand.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-")
      }
    });
    brandMap.set(name, brand.id);
  }

  const categoryMap = new Map<string, string>();
  for (const name of categories) {
    const category = await prisma.category.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description: `Neumaticos de categoria ${name}`
      }
    });
    categoryMap.set(name, category.id);
  }

  for (const p of productsSeed) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        previousPrice: p.previousPrice,
        discountPercentage: p.discountPercentage,
        width: p.width,
        height: p.height,
        rim: p.rim,
        vehicleType: p.vehicleType,
        runFlat: p.runFlat,
        featured: p.featured,
        active: true,
        brandId: brandMap.get(p.brand)!,
        categoryId: categoryMap.get(p.category)!,
        bestsellerScore: p.bestsellerScore,
        technicalDetails: {
          indiceCarga: "95",
          indiceVelocidad: "W",
          garantia: "5 anos"
        },
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
              alt: p.name,
              order: 0
            }
          ]
        },
        specifications: {
          create: [
            { key: "Ahorro de combustible", value: "B" },
            { key: "Agarre en mojado", value: "A" },
            { key: "Ruido externo", value: "71 dB" }
          ]
        },
        inventory: {
          create: {
            stock: p.stock,
            lowStockLevel: 5,
            movements: {
              create: {
                change: p.stock,
                reason: "SEED",
                note: "Carga inicial de inventario"
              }
            }
          }
        }
      }
    });

    console.log(`Producto creado: ${product.name}`);
  }

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const managerPasswordHash = await bcrypt.hash("Manager123!", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Administrador Crafter",
        email: "admin@craftertires.com",
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        active: true
      },
      {
        name: "Manager Crafter",
        email: "manager@craftertires.com",
        passwordHash: managerPasswordHash,
        role: UserRole.MANAGER,
        active: true
      }
    ]
  });

  console.log("Seed completado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });