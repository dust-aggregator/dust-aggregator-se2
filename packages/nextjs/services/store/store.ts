import { create } from "zustand";
import { Network, OutputToken, SelectedToken, Token } from "~~/lib/types";
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

export const mockOutputTokensByNetwork: any[] = [];

export const mockInputTokens: SelectedToken[] = [
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    balance: 3000000,
    address: "0x4200000000000000000000000000000000000006",
    amount: "0.001",
    hasPermit2Allowance: false,
  },
  // {
  //   name: "Dai Token",
  //   symbol: "DAI",
  //   decimals: 18,
  //   balance: 20000000,
  //   address: "0xE6F6e27c0BF1a4841E3F09d03D7D31Da8eAd0a27",
  //   amount: "2.52",
  //   isMax: true,
  //   hasPermit2Allowance: false,
  // },
  // {
  //   name: "Uniswap V2 Token",
  //   symbol: "UNI",
  //   decimals: 18,
  //   balance: 20000000,
  //   address: "0x74f4b0101a7b9704AD59843a11778AF91e7942aA",
  //   amount: "2.62",
  //   isMax: true,
  //   hasPermit2Allowance: false,
  // },
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
  outputNetwork: Network | null;
  setOutputNetwork: (newOutputNetwork: Network) => void;
  outputToken: OutputToken | null;
  setOutputToken: (newOutputToken: Token) => void;
  inputTokens: SelectedToken[];
  setInputTokens: (newInputTokens: SelectedToken[]) => void;
  outputTokensByNetwork?: SelectedToken[];
  setOutputTokensByNetwork: (newOutputTokensByNetwork: SelectedToken[]) => void;
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
  outputNetwork: null,
  setOutputNetwork: (newOutputNetwork: Network) => set(() => ({ outputNetwork: newOutputNetwork })),
  outputToken: null,
  setOutputToken: (newOutputToken: Token) => set(() => ({ outputToken: newOutputToken })),
  inputTokens: [],
  setInputTokens: (newInputTokens: SelectedToken[]) => set(() => ({ inputTokens: newInputTokens })),
  outputTokensByNetwork: [],
  setOutputTokensByNetwork: (newOutputTokensByNetwork: SelectedToken[]) =>
    set(() => ({ outputTokensByNetwork: newOutputTokensByNetwork })),
}));
