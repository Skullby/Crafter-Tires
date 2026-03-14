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
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/"
          });
          if (!result?.ok) {
            setError("Credenciales inv�lidas");
            setLoading(false);
            return;
          }
          window.location.href = "/";
        }}
      >
        <h1 className="text-2xl font-bold">Admin Crafter Tires</h1>
        <p className="mt-2 text-sm text-slate-600">Ingres� con tu cuenta de administrador o manager.</p>
        <div className="mt-6 space-y-3">
          <input className="w-full rounded-lg border p-3" name="email" type="email" required placeholder="Email" />
          <input className="w-full rounded-lg border p-3" name="password" type="password" required placeholder="Contrase�a" />
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button disabled={loading} className="mt-5 w-full rounded-lg bg-accent p-3 font-semibold text-white" type="submit">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
