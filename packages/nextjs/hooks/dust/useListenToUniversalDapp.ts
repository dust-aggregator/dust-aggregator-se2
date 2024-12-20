import { zetachain } from "viem/chains";
import { useWatchContractEvent } from "wagmi";
import abi from "~~/lib/abis/UniversalDapp.json";
import { UNIVERSAL_DAPP_ADDRESS } from "~~/lib/constants";

export const useListenToUniversalDapp = () => {
  useWatchContractEvent({
    address: UNIVERSAL_DAPP_ADDRESS,
    abi,
    eventName: "SwappedAndWithdrawn",
    onLogs(logs) {
      console.log("Universal Dapp SwappedAndWithdrawn event", logs);
    },
    poll: true,
    pollingInterval: 4_000,
    chainId: zetachain.id,
  });
};
