import { useEffect, useState } from "react";
import { useDustEventHistory } from "./useDustEventHistory";
import { useAccount } from "wagmi";
import { getBlockNumber } from "wagmi/actions";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const useWaitForBitcoinOutput = (onSuccess: (amountReceived: bigint) => void) => {};
