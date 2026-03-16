"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
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
              setError("No se pudo contactar al servidor de autenticacion. Intenta de nuevo.");
              return;
            }

            if (result.error) {
              if (result.error === "CredentialsSignin") {
                setError("Email o clave incorrectos, o usuario inactivo.");
              } else if (result.error === "Configuration") {
                setError("La autenticacion no esta configurada correctamente. Revisa las variables de entorno del admin.");
              } else {
                setError("No se pudo iniciar sesion. Intenta nuevamente.");
              }
              return;
            }

            if (!result.url) {
              setError("No se recibio una redireccion valida despues de iniciar sesion.");
              return;
            }

            window.location.href = result.url;
          } catch (err) {
            setError("Ocurrio un error inesperado al iniciar sesion. Revisa tu conexion e intenta otra vez.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <h1 className="text-2xl font-bold">Admin Crafter Tires</h1>
        <p className="mt-2 text-sm text-slate-600">Ingresa con tu cuenta de administrador o manager.</p>
        <div className="mt-6 space-y-3">
          <input className="w-full rounded-lg border p-3" name="email" type="email" required placeholder="Email" />
          <input className="w-full rounded-lg border p-3" name="password" type="password" required placeholder="Clave" />
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button disabled={loading} className="mt-5 w-full rounded-lg bg-accent p-3 font-semibold text-white" type="submit">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
