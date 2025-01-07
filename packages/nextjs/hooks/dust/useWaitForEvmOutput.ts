import { useEffect, useState } from "react";
import { useDustEventHistory } from "./useDustEventHistory";
import { useAccount } from "wagmi";
import { getBlockNumber } from "wagmi/actions";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const useWaitForEvmOutput = (onSuccess: (amountReceived: bigint) => void) => {
  const { outputNetwork, inputNetwork, recipient } = useGlobalState();
  const { address } = useAccount();
  const [blockNumBeforeSwap, setBlockNumBeforeSwap] = useState<bigint>(0n);

  const isBitcoin = outputNetwork?.id === "bitcoin";
  const isSameNetwork = outputNetwork?.id === inputNetwork?.id;
  const successEventName = isSameNetwork ? "Swapped" : "Withdrawn";

  useEffect(() => {
    if (!outputNetwork || isBitcoin) return;
    getBlockNumber(wagmiConfig, { chainId: outputNetwork?.id as 1 | 8453 | 137 | 7000 | 56 | undefined }).then(
      blockNum => setBlockNumBeforeSwap(blockNum),
    );
  }, [outputNetwork, isBitcoin]);

  const { data: successEvents } = useDustEventHistory({
    eventName: successEventName,
    fromBlock: BigInt(blockNumBeforeSwap),
    enabled: !!blockNumBeforeSwap,
    watch: true,
  });

  useEffect(() => {
    const event = successEvents?.find((event: any) => event.args["0"] === (recipient || address));
    if (event && !isBitcoin) {
      const amountReceived = event.args["2"];
      onSuccess(amountReceived);
    }
  }, [successEvents, recipient, address, onSuccess, isBitcoin]);
};
