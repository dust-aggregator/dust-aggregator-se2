import { GAS_LIMIT_BY_TOKEN_TYPE, WRAPPED_NATIVE_TOKENS } from "./constants";
import { Network } from "./types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { zeroAddress } from "viem";
import chains from "viem/chains";

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

export const getGasLimitByOutputToken = (address: string, outputChainId: number): bigint => {
  if (outputChainId === 56) return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.bsc);
  if (address === zeroAddress) return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.native);
  if (WRAPPED_NATIVE_TOKENS.includes(address)) return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.wNative);
  return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.erc20);
};

export const getBlockExplorerTxLink = (network: Network | null, txHash?: string) => {
  if (txHash && network) {
    const baseURL = network.blockExplorers?.default.url;
    return `${baseURL}/tx/${txHash}`;
  }
};

export function formatDecimal(input: string): string {
  const numberValue = parseFloat(input); // Convert the string to a number
  return numberValue % 1 === 0
    ? numberValue.toString() // Return as an integer if no decimal values
    : numberValue.toFixed(2).replace(/\.?0+$/, ""); // Format to 4 decimals, remove trailing zeros
}
