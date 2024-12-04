import React from "react";
import { useTokenBalancesWithMetadataByNetwork } from "~~/hooks/dust/useTokenBalancesWithMetadataByNetwork";

export const AllTokensBalances = ({ address }: any) => {
  const { allObjects, isLoading } = useTokenBalancesWithMetadataByNetwork(address);

  console.log(allObjects);

  const allObjectsFiltered = allObjects.filter((element: any) => {
    return element.tokenBalancesWithMetadata.length > 0;
  });

  const comps = allObjectsFiltered.map((networkWithTokens: any, index: number) => {
    return (
      <div key={index} className="flex flex-col">
        <p className="p-1 m-0 text-xl bg-base-300">{networkWithTokens.name}</p>
        {networkWithTokens.tokenBalancesWithMetadata.map((token: any, index2: number) => {
          const formattedBalance = token.tokenBalance / Math.pow(10, token.decimals);

          return (
            <div key={"p-" + index2} className="p-1 m-0 flex flex-wrap gap-1 justify-between">
              {/* <p className="m-0">{token.name}</p> */}
              <p className="m-0 w-[100px] text-ellipsis overflow-hidden line-clamp-1 text-sm">{token.symbol}</p>

              <p className="m-0 text-sm">{formattedBalance.toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    );
  });

  if (isLoading) {
    return (
      <>
        <p className="text-2xl text-center">Loading...</p>
      </>
    );
  }
  return <div>{comps}</div>;
};
