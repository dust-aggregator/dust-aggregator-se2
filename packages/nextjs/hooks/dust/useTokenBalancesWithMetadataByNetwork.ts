import React, { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { useAccount } from "wagmi";

// const alchemyNetworks = [
//   Network.ETH_MAINNET,
//   Network.ZETACHAIN_MAINNET,
//   Network.MATIC_MAINNET,
//   Network.BNB_MAINNET,
//   Network.BASE_MAINNET,
// ];

export const useTokenBalancesWithMetadataByNetwork = (address: any, networks: any) => {
  console.log(networks);

  const [allObjects, setAllObjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fn() {
      if (address === undefined) {
        return;
      }

      setIsLoading(true);
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
          obj.tokenBalancesWithMetadata.push({ ...token, ...metadata });
        }

        obj.tokenBalances = balances.tokenBalances;

        objs.push(obj);
      }

      setAllObjects(objs);
      setIsLoading(false);
    }
    fn();
  }, [address, networks?.length]);

  // const [balancesWithMetadata, setBalancesWithMetadata] = useState<any[]>([]);

  return { allObjects, isLoading };
};
