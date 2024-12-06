import { useEffect, useState } from "react";
import { Token, V3_CORE_FACTORY_ADDRESSES } from "@uniswap/sdk-core";
import IUniswapV3FactoryABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Chain, http } from "viem";
import * as chains from "viem/chains";
import { mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import { readContract } from "wagmi/actions";

const findChainById = (id: number) => {
  // Convert the imported chains into an array of values to search through
  const chainsArray = Object.values(chains);

  // Find the chain with the specified id
  return chainsArray.find(chain => chain.id === id);
};

export function useTokenPricesUniswap(tokenAddress: string) {
  const [price, setPrice] = useState("0");

  async function getPrice(
    chain: Chain,
    token0Address: string,
    token0Decimals: number,
    token1Address: string,
    token1Decimals: number,
  ) {
    const token0 = new Token(chain.id, token0Address, token0Decimals, "", "");
    const token1 = new Token(chain.id, token1Address, token1Decimals, "", "");

    // const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // Uniswap V3 factory address

    const factoryAddress = V3_CORE_FACTORY_ADDRESSES[chain.id];
    const config = createConfig({
      chains: [chain],
      transports: {
        [chain.id]: http(),
      },
    });

    const result = await readContract(config, {
      abi: IUniswapV3FactoryABI.abi,
      address: factoryAddress,
      functionName: "getPool",
      args: [token0.address, token1.address, FeeAmount.MEDIUM],
    });

    const slot0 = await readContract(config, {
      abi: IUniswapV3PoolABI.abi, // Uniswap V3 Pool ABI
      address: result as string, // The pool address returned by getPool
      functionName: "slot0",
    });

    const liquidity = await readContract(config, {
      abi: IUniswapV3PoolABI.abi, // Uniswap V3 Pool ABI
      address: result as string, // The pool address returned by getPool
      functionName: "liquidity",
    });

    const sqrtPriceX96 = (slot0 as any)[0];
    const tick = (slot0 as any)[1];

    const pool = new Pool(
      token0,
      token1,
      FeeAmount.MEDIUM,
      sqrtPriceX96.toString(),
      (liquidity as any).toString(),
      tick,
    );

    const tokenAPrice = pool.token0Price.toSignificant(6);
    const tokenBPrice = pool.token1Price.toSignificant(6);

    console.log(tokenAPrice);
    console.log(tokenBPrice);

    setPrice(tokenBPrice);
  }

  useEffect(() => {
    const tokensChainId = 1;
    getPrice(
      findChainById(tokensChainId) || mainnet,
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      6,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      18,
    );
  }, []);

  return {
    price,
  };
}
