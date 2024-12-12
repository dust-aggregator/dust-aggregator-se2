import { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { erc20Abi, parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import dustAbi from "~~/components/SwapPreview/dustAbi.json";
import { ADDRESSES_BY_CHAIN_ID, PERMIT2_BASE_SEPOLIA } from "~~/lib/constants";
import { OutputToken } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";

export const useTokenWhitelist = () => {
  const [tokens, setTokens] = useState<OutputToken[]>([]);
  const { outputNetwork } = useGlobalState();

  // get DT address
  const evmDustTokensAddress = outputNetwork?.contractAddress;

  const { data: tokenAddresses, ...rest } = useReadContract({
    abi: dustAbi,
    address: evmDustTokensAddress,
    functionName: "getTokenList",
    chainId: outputNetwork?.id,
  });

  const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: outputNetwork?.alchemyName,
  };
  const alchemy = new Alchemy(config);

  useEffect(() => {
    const getAllTokenMetadata = async addresses => {
      const allTokenData = await Promise.all(
        addresses.map(async address => {
          const tokenMetadata = await alchemy.core.getTokenMetadata(address);
          return { address, ...tokenMetadata };
        }),
      );
      setTokens(allTokenData);
    };

    if (tokenAddresses) {
      getAllTokenMetadata(tokenAddresses);
    }
  }, [tokenAddresses]);

  return { tokens };
};
