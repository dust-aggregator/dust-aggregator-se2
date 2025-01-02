import { sendGAEvent } from "@next/third-parties/google";
import { create } from "zustand";
import { GA_EVENTS } from "~~/lib/constants";
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
  setOutputNetwork: (newOutputNetwork: Network | null) => void;
  outputToken: OutputToken | null;
  setOutputToken: (newOutputToken: Token | null) => void;
  inputTokens: SelectedToken[];
  setInputTokens: (newInputTokens: SelectedToken[]) => void;
  outputTokensByNetwork?: SelectedToken[];
  setOutputTokensByNetwork: (newOutputTokensByNetwork: SelectedToken[]) => void;
  inputNetwork: Network | null;
  setInputNetwork: (newNetwork: Network | null) => void;
  recipient: string;
  setRecipient: (newRecipient: string) => void;
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
  setOutputNetwork: (newOutputNetwork: Network | null) => set(() => ({ outputNetwork: newOutputNetwork })),
  outputToken: null,
  setOutputToken: (newOutputToken: Token) => {
    sendGAEvent({
      name: GA_EVENTS.selectOutputToken,
      tokenName: newOutputToken.name,
      address: newOutputToken.address,
    });
    return set(() => ({ outputToken: newOutputToken }));
  },
  inputTokens: [],
  setInputTokens: (newInputTokens: SelectedToken[]) => set(() => ({ inputTokens: newInputTokens })),

  outputTokensByNetwork: [],
  setOutputTokensByNetwork: (newOutputTokensByNetwork: SelectedToken[]) =>
    set(() => ({ outputTokensByNetwork: newOutputTokensByNetwork })),
  inputNetwork: null,
  setInputNetwork: (newNetwork: Network | null) => set(() => ({ inputNetwork: newNetwork })),
  recipient: "",
  setRecipient: (newRecipient: string) => set(() => ({ recipient: newRecipient })),
}));
