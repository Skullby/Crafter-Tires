import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { getCategories } from "../lib/catalog";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const bodyFont = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display"
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000"),
  title: {
    default: "Crafter Tires",
    template: "%s | Crafter Tires"
  },
  description: "Compra neumaticos para auto, SUV y camioneta con stock real, cuotas y checkout seguro.",
  openGraph: {
    title: "Crafter Tires",
    description: "Tienda online de neumaticos con buscador por medida, cuotas y atencion profesional.",
    type: "website"
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="es">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <SiteHeader categories={categories} />
        <main>{children}</main>
        <SiteFooter categories={categories} />
      </body>
    </html>
  );
}
