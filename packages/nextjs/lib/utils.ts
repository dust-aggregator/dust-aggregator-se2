import { GAS_LIMIT_BY_TOKEN_TYPE, WRAPPED_NATIVE_TOKENS } from "./constants";
import { zeroAddress } from "viem";
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

export const getGasLimitByOutputToken = (address: string): bigint => {
  if (address === zeroAddress) return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.native);
  if (WRAPPED_NATIVE_TOKENS.includes(address)) return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.wNative);
  return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.erc20);
};
