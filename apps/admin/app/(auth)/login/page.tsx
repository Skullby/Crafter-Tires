"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden bg-gradient-to-br from-orange-500 to-orange-700 p-10 text-white lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">Crafter Tires</p>
          <h1 className="mt-6 text-4xl font-bold leading-tight">Admin claro, rápido y listo para operar.</h1>
          <p className="mt-4 max-w-md text-sm text-orange-50/90">
            Gestioná productos, stock y órdenes desde un panel más limpio y directo.
          </p>
          <div className="mt-8 space-y-3 text-sm text-orange-50/90">
            <p>• Acceso seguro para administradores y managers</p>
            <p>• Gestión centralizada de catálogo e inventario</p>
            <p>• Flujo optimizado para operación diaria</p>
          </div>
        </div>

        <form
          className="w-full bg-white p-6 sm:p-8 lg:p-10"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError(null);

            const form = new FormData(event.currentTarget);
            const email = String(form.get("email") ?? "");
            const password = String(form.get("password") ?? "");

            try {
              const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/"
              });

              if (!result) {
                setError("No se pudo contactar al servidor de autenticación. Intentá de nuevo.");
                return;
              }

              if (result.error) {
                if (result.error === "CredentialsSignin") {
                  setError("Email o clave incorrectos, o usuario inactivo.");
                } else if (result.error === "Configuration") {
                  setError("La autenticación no está configurada correctamente. Revisá las variables de entorno del admin.");
                } else {
                  setError("No se pudo iniciar sesión. Intentá nuevamente.");
                }
                return;
              }

              if (!result.url) {
                setError("No se recibió una redirección válida después de iniciar sesión.");
                return;
              }

              window.location.href = result.url;
            } catch {
              setError("Ocurrió un error inesperado al iniciar sesión. Revisá tu conexión e intentá otra vez.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Acceso interno</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Admin Crafter Tires</h2>
            <p className="mt-2 text-sm text-slate-600">Ingresá con tu cuenta de administrador o manager.</p>

            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input id="email" className="w-full rounded-xl border px-4 py-3" name="email" type="email" required placeholder="admin@craftertires.com" autoComplete="email" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Clave
                </label>
                <input id="password" className="w-full rounded-xl border px-4 py-3" name="password" type="password" required placeholder="Tu clave" autoComplete="current-password" />
              </div>
            </div>

            {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            <button disabled={loading} className="admin-btn-primary mt-6 w-full" type="submit">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
