"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Token } from "@uniswap/sdk-core";
import IUniswapV3FactoryABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import type { NextPage } from "next";
import { Chain, http } from "viem";
import * as chains from "viem/chains";
import { createConfig, useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { mainnet } from "wagmi/chains";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

async function getPrice(
  chain: Chain,
  token0Address: string,
  token0Decimals: number,
  token1Address: string,
  token1Decimals: number,
) {
  const token0 = new Token(chain.id, token0Address, token0Decimals, "", "");
  const token1 = new Token(chain.id, token1Address, token1Decimals, "", "");

  const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // Uniswap V3 factory address

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

  const pool = new Pool(token0, token1, FeeAmount.MEDIUM, sqrtPriceX96.toString(), (liquidity as any).toString(), tick);

  const tokenAPrice = pool.token0Price.toSignificant(6);
  const tokenBPrice = pool.token1Price.toSignificant(6);

  console.log(tokenAPrice);
  console.log(tokenBPrice);
}
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    // getTokenPrice();
    getPrice(
      mainnet,
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      6,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      18,
    );
  }, []);
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
