"use client";

import Image from "next/image";
import { useAccount } from "wagmi";
import FAQ from "~~/components/FAQ";
import InputBox from "~~/components/InputBox";
import { MobileModal } from "~~/components/MobileModal";
import OutputBox from "~~/components/OutputBox";
import gearHubSVG from "~~/public/assets/gear_hub.svg";

export default function Component() {
  const account = useAccount();

  return (
    <div className="flex-col items-center justify-center h-500 mt-20 px-24">
      <div className="flex justify-center">
        <h1 className="text-4xl text-center font-theory">
          Combine All Small Token Balances in Your Wallet into One Asset in a Single Transaction
        </h1>
      </div>
      <div className="flex justify-center">
        <p className="mt-0 mb-16 font-montserrat">
          <span className="font-bold">Get rid of the dust</span>, exchange all low-value tokens across different chains
          into your favorite asset.
        </p>
      </div>
      {account?.address === undefined ? (
        <p className="text-center text-6xl font-bold">Please connect your wallet!</p>
      ) : (
        <></>
      )}
      <div className="flex justify-center mb-12">
        <InputBox />
        <Image className="w-[500px] mx-[-15px]" src={gearHubSVG} alt="gears" />
        <OutputBox />
      </div>
      <div className="flex justify-center items-center">
        <hr className="w-1/6 bg-[#9D9D9D]" />
        <p className="font-bold text-[#9D9D9D] px-4">Powered by Zetachain cross-chain engine</p>
        <hr className="w-1/6 bg-[#9D9D9D]" />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <MobileModal />
    </div>
  );
}
