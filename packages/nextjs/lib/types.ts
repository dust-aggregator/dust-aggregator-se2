import { Network as AlchemyNetwork } from "alchemy-sdk";
import { BigNumberish, ethers } from "ethers";
import { Chain } from "viem/chains";

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  balance: number;
  address: string;
}

export type SelectedToken = Token & {
  amount: string;
  hasPermit2Allowance: boolean;
};

export type Network = Chain & {
  contractAddress: `0x${string}`;
  zrc20Address: string;
  alchemyName: string;
};

export type TransactionState = "notStarted" | "sourcePending" | "zetaPending" | "destinationPending" | "completed";

export type TokenSwap = {
  amount: BigNumberish;
  token: string;
  minAmountOut: BigNumberish;
};

export type AlchemyTokenData = {
  decimals: number;
  logo: string | null;
  name: string;
  symbol: string;
};

export type OutputToken = AlchemyTokenData & {
  address: string;
};
