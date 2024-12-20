import { useWatchContractEvent } from "wagmi";
import abi from "~~/lib/abis/EvmDustTokens.json";
import { useGlobalState } from "~~/services/store/store";

export const useWaitForOutput = (recipientAddress: `0x${string}`, onComplete: () => void) => {
  const { outputNetwork } = useGlobalState();

  useWatchContractEvent({
    address: outputNetwork?.contractAddress,
    abi,
    eventName: "Withdrawn",
    onLogs(logs) {
      console.log("Withdrawn event", logs);
      // TODO: Filter for recipient address, which will be accepted as a param to the hook
      onComplete(logs);
    },
    poll: true,
    pollingInterval: 4_000,
    chainId: outputNetwork?.chainId,
  });
};
