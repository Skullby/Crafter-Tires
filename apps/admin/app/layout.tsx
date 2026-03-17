import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Crafter Tires",
  description: "Panel de administracion de Crafter Tires"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const env = process.env.NEXT_PUBLIC_ENV_NAME ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  const isProduction = env === "production";
  const productionAdminUrl = process.env.NEXT_PUBLIC_PROD_ADMIN_URL ?? "https://crafter-admin.vercel.app";
  const showStagingBanner = !isProduction && process.env.NEXT_PUBLIC_SHOW_STAGING_BANNER !== "false";

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {showStagingBanner && (
          <div className="fixed inset-x-0 top-0 z-50 bg-amber-400 text-black text-xs sm:text-sm shadow-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2">
              <p className="font-medium">
                Estás en el <span className="underline">panel admin v2 (staging)</span>. No usar para operaciones reales.
              </p>
              {productionAdminUrl && (
                <a
                  href={productionAdminUrl}
                  className="whitespace-nowrap rounded bg-black/10 px-2 py-1 text-[11px] font-semibold hover:bg-black/20"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ir al admin de producción
                </a>
              )}
            </div>
          </div>
        )}
        <div className={showStagingBanner ? "pt-12" : ""}>{children}</div>
      </body>
    </html>
  );
}
