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

export const AllTokensBalances = ({ address }: any) => {
  // const { address: connectedAddress } = useAccount();

  const [allObjects, setAllObjects] = useState<any[]>([]);
  useEffect(() => {
    async function fn() {
      if (address === undefined) return;

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
    }
    fn();
  }, [address]);

  const [balancesWithMetadata, setBalancesWithMetadata] = useState<any[]>([]);

  console.log(balancesWithMetadata);

  const comps = allObjects.map((networkWithTokens: any, index: number) => {
    return (
      <div key={index} className="flex flex-col">
        <p className="p-1 m-0 text-xl bg-base-300">{networkWithTokens.name}</p>
        {networkWithTokens.tokenBalancesWithMetadata.map((token: any, index2: number) => {
          const formattedBalance = token.tokenBalance / Math.pow(10, token.decimals);

          return (
            <div key={"p-" + index2} className="p-1 m-0 flex flex-wrap gap-1 justify-between">
              {/* <p className="m-0">{token.name}</p> */}
              <p className="m-0 w-[100px] text-ellipsis overflow-hidden line-clamp-1">{token.symbol}</p>

              <p className="m-0">{formattedBalance.toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    );
  });

  return <div>{comps}</div>;
};
