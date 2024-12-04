import React, { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { useAccount } from "wagmi";

const networks = [
  Network.ETH_MAINNET,
  Network.ZETACHAIN_MAINNET,
  Network.MATIC_MAINNET,
  Network.BNB_MAINNET,
  Network.BASE_MAINNET,
];

export const useTokenBalancesWithMetadataByNetwork = (address: any) => {
  // const { address: connectedAddress } = useAccount();

  console.log(address);
  const [allObjects, setAllObjects] = useState<any[]>([]);
  useEffect(() => {
    async function fn() {
      console.log("Entered");
      if (address === undefined) {
        console.log("RETURNED");
        return;
      }

      const objs = [];

      for (let i = 0; i < networks.length; i++) {
        const obj: any = { name: networks[i].toString(), tokenBalances: [], tokenBalancesWithMetadata: [] };

        const config = {
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
          network: networks[i],
        };
        const alchemy = new Alchemy(config);

        const balances = await alchemy.core.getTokenBalances(address);

        for (const token of balances.tokenBalances) {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          console.log(metadata);
          obj.tokenBalancesWithMetadata.push({ ...token, ...metadata });
        }

        obj.tokenBalances = balances.tokenBalances;

        objs.push(obj);
      }

      setAllObjects(objs);
      console.log("I RAN");
    }
    fn();
  }, [address]);

  // const [balancesWithMetadata, setBalancesWithMetadata] = useState<any[]>([]);

  return { allObjects };
};
