import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGlobalState } from "~~/services/store/store";

const fetchTransactions = async (address: string) => {
  const response = await fetch(`https://blockstream.info/api/address/${address}/txs`);
  const data = await response.json();
  return data;
};

const fetchBlockHeight = async () => {
  const response = await fetch(`https://blockstream.info/api/blocks/tip/height`);
  const data = await response.json();
  return data;
};

export const useWaitForBitcoinOutput = (onSuccess: (amountReceived: bigint) => void) => {
  const { outputNetwork, recipient } = useGlobalState();
  const [blockNumBeforeSwap, setBlockNumBeforeSwap] = useState<bigint>(0n);

  const isBitcoin = outputNetwork?.id === "bitcoin";

  useEffect(() => {
    const setBlockNum = async () => {
      const blockHeight = await fetchBlockHeight();
      setBlockNumBeforeSwap(BigInt(blockHeight));
    };
    setBlockNum();
  }, []);

  const { data, error, isLoading } = useQuery({
    queryKey: ["transactions", recipient],
    queryFn: () => fetchTransactions(recipient),
    refetchInterval: 10000, // Poll every 10 seconds
    enabled: isBitcoin && !!recipient,
  });

  useEffect(() => {
    if (data) {
      const successfulTx = data.find((tx: any) => tx.status.block_height > blockNumBeforeSwap);

      if (successfulTx) {
        const vout = successfulTx.vout || [];
        const transferredValue = vout.reduce((sum, output) => {
          return output.scriptpubkey_address === recipient ? sum + output.value : sum;
        }, 0);

        onSuccess(BigInt(transferredValue));
      }
    }
  }, [data, blockNumBeforeSwap, onSuccess, recipient]);
};
