import Image from "next/image";
import React from "react";
import dfLogo from "~~/public/df-logo.svg";
import footerSVG from "~~/public/assets/footer.svg";
import discordIcon from "~~/public/assets/discord_icon.svg";
import instagramIcon from "~~/public/assets/instagram_icon.svg";
import tiktokIcon from "~~/public/assets/tiktok_icon.svg";
import youtubeIcon from "~~/public/assets/youtube_icon.svg";
import Link from "next/link";

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

      <div className="w-full flex justify-center relative">
        {/* SVG Image */}
        <Image className="w-[95%]" src={footerSVG} alt="footer" />

        <div className="absolute inset-0 flex justify-center items-center mb-5">
          <div className="flex justify-center">
            {/* <Link href="https://discord.com/invite/zetachain" className="mx-3">
              <Image src={discordIcon} alt="discord" />
            </Link>
            <Link href="https://discord.com/invite/zetachain" className="mx-3">
              <Image src={instagramIcon} alt="instagram" />
            </Link>
            <Link href="https://discord.com/invite/zetachain" className="mx-3">
              <Image src={tiktokIcon} alt="tiktok" />
            </Link>
            <Link href="https://www.youtube.com/@ZetaBlockchain" className="mx-3">
              <Image src={youtubeIcon} alt="youtube" />
            </Link> */}
            <span className="font-montserrat font-bold opacity-50">Made by UNDR Collective</span>
          </div>
        </div>
      </div>
    </div>
  );
};
