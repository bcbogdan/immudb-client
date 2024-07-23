import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number | string,
  decimalPlaces: number = 2,
  currencySymbol: string = "$",
): string {
  try {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      throw new Error("Invalid number");
    }

    const formattedValue = numValue.toLocaleString("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    return `${currencySymbol}${formattedValue}`;
  } catch (error) {
    return String(value);
  }
}
