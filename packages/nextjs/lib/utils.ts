import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateToDecimals = (value: string, decimals: number) => {
  if (value.indexOf(".") === -1) {
    // No decimal point, return the value as is
    return value;
  }
  const parts = value.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1].slice(0, decimals);
  return `${integerPart}.${decimalPart}`;
};
