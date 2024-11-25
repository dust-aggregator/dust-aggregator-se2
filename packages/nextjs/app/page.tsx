"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

async function getPrice() {
  const result = await fetch("/api/cmc/test/");
  const resultJson = await result.json();
  console.log(resultJson);
  // console.log("Getting price");

  // const url = new URL("https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest");

  // const params = {
  //   start: "1",
  //   limit: "5000",
  //   convert: "USD",
  // };

  // Object.keys(params).forEach(key => url.searchParams.append(key, params[key as keyof typeof params]));

  // const headers = new Headers();
  // headers.append("Content-Type", "application/json");
  // headers.append("X-CMC_PRO_API_KEY", "95ac92c8-a96f-4c62-aec4-1dcc0d313134");
  // headers.append
  // const result = await fetch("https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
  //   method: "GET",
  //   headers,
  // });

  // console.log(result);

  // console.log("price received");
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
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
