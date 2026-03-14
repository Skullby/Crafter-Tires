"use client";

import { useState } from "react";

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      phone: String(formData.get("phone")),
      shippingAddress: {
        street: String(formData.get("street")),
        city: String(formData.get("city")),
        state: String(formData.get("state")),
        postalCode: String(formData.get("postalCode")),
        country: "AR"
      },
      billingSameAsShipping: true
    };

    const response = await fetch("/api/checkout/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Error de checkout");
      setLoading(false);
      return;
    }

    window.location.href = data.initPoint;
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <section className="grid gap-4">
        <div>
          <p className="eyebrow">Contacto</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Datos del comprador</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Nombre y apellido</span>
            <input name="name" required placeholder="Nombre y apellido" className="field-input" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input name="email" required type="email" placeholder="Email" className="field-input" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Telefono</span>
            <input name="phone" required placeholder="Telefono" className="field-input" />
          </label>
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <p className="eyebrow">Envio</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Direccion de entrega</h2>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          <span>Calle y numero</span>
          <input name="street" required placeholder="Calle y numero" className="field-input" />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Ciudad</span>
            <input name="city" required placeholder="Ciudad" className="field-input" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Provincia</span>
            <input name="state" required placeholder="Provincia" className="field-input" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Codigo postal</span>
            <input name="postalCode" required placeholder="CP" className="field-input" />
          </label>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Al continuar se validara el stock y se creara la preferencia de pago en Mercado Pago.
        </p>
        <button
          disabled={loading}
          aria-busy={loading}
          className="button-primary justify-center disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
        >
          {loading ? "Redirigiendo..." : "Pagar con Mercado Pago"}
        </button>
      </div>
    </form>
  );
}
