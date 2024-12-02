"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import IUniswapV3FactoryABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json";
import poolAbi from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Pool as V3Pool } from "@uniswap/v3-sdk";
import type { NextPage } from "next";
import { getContract, http, zeroAddress } from "viem";
import { createConfig, useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { mainnet } from "wagmi/chains";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

async function getPrice() {
  const USDC = new Token(
    1, // Mainnet chain ID
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract address
    6, // USDC decimals
    "USDC",
    "USD Coin",
  );

  const WETH = new Token(
    1, // Mainnet chain ID
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH contract address
    18, // WETH decimals
    "WETH",
    "Wrapped Ether",
  );

  const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // Uniswap V3 factory address

  const config = createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
  });
  const result = await readContract(config, {
    abi: IUniswapV3FactoryABI.abi,
    address: factoryAddress,
    functionName: "getPool",
    args: [USDC.address, WETH.address, 3000],
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

  const pool = new Pool(USDC, WETH, 3000, sqrtPriceX96.toString(), (liquidity as any).toString(), tick);

  const tokenAPrice = pool.token0Price.toSignificant(6);
  const tokenBPrice = pool.token1Price.toSignificant(6);

  console.log(tokenAPrice);
  console.log(tokenBPrice);

  // const provider = new ethers.providers.JsonRpcProvider("");

  // const poolAddress = Pool.getAddress(USDC, WETH, 3000); // 0.3% fee tier

  // const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);

  // const [liquidity, slot0] = await Promise.all([
  //   poolContract.liquidity(),
  //   poolContract.slot0(),
  // ]);

  // const { sqrtPriceX96 } = slot0;
}
// async function getTokenPrice() {
//   try {
//     // Fetch pool data asynchronously
//     const token0 = await readContract(wagmiConfig, {
//       address: UNISWAP_POOL_ADDRESS as `0x${string}`,
//       abi: poolAbi.abi,
//       functionName: "token0",
//     });

//     const token1 = await readContract(wagmiConfig, {
//       address: UNISWAP_POOL_ADDRESS as `0x${string}`,
//       abi: poolAbi.abi,
//       functionName: "token1",
//     });

//     const fee = await readContract(wagmiConfig, {
//       address: UNISWAP_POOL_ADDRESS as `0x${string}`,
//       abi: poolAbi.abi,
//       functionName: "fee",
//     });

//     const liquidity = await readContract(wagmiConfig, {
//       address: UNISWAP_POOL_ADDRESS as `0x${string}`,
//       abi: poolAbi.abi,
//       functionName: "liquidity",
//     });

//     const slot0 = await readContract(wagmiConfig, {
//       address: UNISWAP_POOL_ADDRESS as `0x${string}`,
//       abi: poolAbi.abi,
//       functionName: "slot0",
//     });

//     const token0IsUSDC = token0.toLowerCase() === USDC_ADDRESS.toLowerCase();

//     // // // Create token instances
//     const usdc = new Token(1, USDC_ADDRESS, 6, "USDC", "USD Coin");
//     const token = new Token(1, TOKEN_ADDRESS, 18, "TOKEN", "Your Token");

//     // // // Create the Uniswap V3 pool
//     const pool = new Pool(
//       token0IsUSDC ? usdc : token,
//       token0IsUSDC ? token : usdc,
//       Number(fee),
//       slot0.sqrtPriceX96.toString(),
//       liquidity.toString(),
//       slot0.tick,
//     );

//     // // Calculate price
//     // const price = pool.token0Price.toSignificant(6);
//     // return token0IsUSDC ? price : (1 / parseFloat(price)).toString();
//   } catch (error) {
//     console.error("Error fetching token price:", error);
//     throw error;
//   }
// }

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    // getTokenPrice();
    getPrice();
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
