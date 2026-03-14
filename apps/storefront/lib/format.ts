export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value));
}

export function formatMeasure(width: number, height: number, rim: number) {
  return `${width}/${height}R${rim}`;
}

export function formatVehicleType(value: string) {
  switch (value) {
    case "AUTO":
      return "Auto";
    case "SUV":
      return "SUV";
    case "CAMIONETA":
      return "Camioneta";
    case "UTILITARIO":
      return "Utilitario";
    default:
      return value;
  }
}
