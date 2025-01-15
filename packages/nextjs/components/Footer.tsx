import React from "react";
import Image from "next/image";
import Link from "next/link";
import dfLogo from "~~/public/df-logo.svg";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0 relative flex flex-col gap-12">

      <div className="w-full flex justify-center">
        <div className="w-[80%] flex justify-between">

          <div className="w-[65%] flex flex-col gap-3">
            <Image src={dfLogo} alt="logo" className="w-[100px]" />
            <span className="font-montserrat opacity-50">
              Dust.fun is a Web3 application that simplifies wallet management by consolidating “dust” tokens—small, unused balances across multiple chains—into a single, valuable asset. Powered by ZetaChain’s cross-chain technology, Dust.fun makes cleaning your wallet effortless and efficient.
            </span>
          </div>

          <div className="w-[30%] flex font-bold text-base opacity-50 pb-5">
            <div className="w-1/2 flex flex-col justify-end gap-4">
              <Link href={"https://fingerpump.gitbook.io/dust.fun/about-us"} target="_blank" rel="noopener noreferrer">About us</Link>
              <Link href={"https://fingerpump.gitbook.io/dust.fun/available-chains-and-whitelisted-tokens"} target="_blank" rel="noopener noreferrer">Supported Chains</Link>
            </div>

            <div className="w-1/2 flex flex-col justify-end gap-4">
              <Link href={"/privacy"}>Privacy Policy</Link>
              <Link href={"/terms"}>Terms of Service</Link>
            </div>
          </div>

        </div>
      </div>

      <div className="w-full flex justify-center items-center gap-2">
        <hr className="w-1/6 bg-[#9D9D9D] opacity-50" />
        <span className="font-montserrat font-bold opacity-50">Made by UNDR Collective</span>
        <hr className="w-1/6 bg-[#9D9D9D] opacity-50" />
      </div>
    </div>
  );
};
