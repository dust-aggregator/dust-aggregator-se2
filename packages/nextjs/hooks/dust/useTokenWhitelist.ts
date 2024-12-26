import { useEffect, useState } from "react";
import { Alchemy } from "alchemy-sdk";
import { zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import dustAbi from "~~/lib/abis/EvmDustTokens.json";
import { OutputToken } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";

export const useTokenWhitelist = () => {
  const [tokens, setTokens] = useState<OutputToken[]>([]);
  const { outputNetwork } = useGlobalState();

  const evmDustTokensAddress = outputNetwork?.contractAddress;

  const { data: tokenAddresses } = useReadContract({
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
    // const nativeCurrencyWithAddress = { address: zeroAddress, ...outputNetwork?.nativeCurrency };
    const getAllTokenMetadata = async addresses => {
      const allTokenData = await Promise.all(
        addresses.map(async address => {
          const tokenMetadata = await alchemy.core.getTokenMetadata(address);
          return { address, ...tokenMetadata };
        }),
      );
      // setTokens([nativeCurrencyWithAddress, ...allTokenData]);
      const filteredTokens = allTokenData.filter(token => token.symbol !== "ETH");
      setTokens([...filteredTokens]);
    };

    if (tokenAddresses) {
      getAllTokenMetadata(tokenAddresses);
    }
  }, [tokenAddresses]);

  return { tokens };
};
