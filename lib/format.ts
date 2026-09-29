export function formatPrice(amount: number): string {
  return `${new Intl.NumberFormat("en-US").format(amount)} د.ج`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("ar-DZ-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}