import { create } from "zustand";
import { Network, SelectedToken, Token } from "~~/lib/types";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

const mockInputTokens: SelectedToken[] = [
  {
    name: "USDC Token",
    symbol: "USDC",
    decimals: 6,
    balance: 3000000,
    address: "0x5dEaC602762362FE5f135FA5904351916053cF70",
    amount: "3000000000000000000",
    isMax: true,
    hasPermit2Allowance: false,
  },
  {
    name: "Dai Token",
    symbol: "DAI",
    decimals: 18,
    balance: 2000000,
    address: "0x5dEaC602762362FE5f135FA5904351916053cF70",
    amount: "200000000000000000",
    isMax: true,
    hasPermit2Allowance: false,
  },
];

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  outputNetwork?: Network;
  setOutputNetwork: (newOutputNetwork: Network) => void;
  outputToken?: Token;
  setOutputToken: (newOutputToken: Token) => void;
  inputTokens: SelectedToken[];
  setInputTokens: (newInputTokens: SelectedToken[]) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: true,
  },
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
  outputNetwork: undefined,
  setOutputNetwork: (newOutputNetwork: Network) => set(() => ({ outputNetwork: newOutputNetwork })),
  outputToken: undefined,
  setOutputToken: (newOutputToken: Token) => set(() => ({ outputToken: newOutputToken })),
  inputTokens: mockInputTokens,
  setInputTokens: (newInputTokens: SelectedToken[]) => set(() => ({ inputTokens: newInputTokens })),
}));
