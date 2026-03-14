import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Crafter Tires",
  description: "Panel de administraci�n de Crafter Tires"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
