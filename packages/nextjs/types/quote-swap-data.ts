import { BigNumber } from "alchemy-sdk";

interface SwapInput {
  isV3: boolean;
  path: string;
  amount: bigint | BigNumber;
  minAmountOut: number;
}

export interface QuoteSwapData {
  displayOutput: number;
  estimatedOutput: number;
  quoteError: boolean;
  estimatedGasUsedUSD: string;
  swapInput: SwapInput;
}
