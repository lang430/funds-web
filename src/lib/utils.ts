export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait = 700
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

export function formatMoney(value: number, digits = 2): string {
  return value.toLocaleString("zh", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
