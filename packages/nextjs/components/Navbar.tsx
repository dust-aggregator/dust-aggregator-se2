import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "./ui/connect-button";
import closeSVG from "~~/public/assets/close.svg";
import navBottomSVG from "~~/public/assets/nav-bottom.svg";
import navbarMobileSVG from "~~/public/assets/navbar-mobile.svg";
import navbarSVG from "~~/public/assets/navbar.svg";
import openSVG from "~~/public/assets/open.svg";

/**
 * Site navbar
 */
export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      {/* ========== DESKTOP ========== */}
      <div className="w-full md:flex justify-center relative hidden">
        {/* SVG Image */}
        <Image className="w-[95%]" src={navbarSVG} alt="navbar" />

        <div className="absolute inset-0 flex justify-between items-center mb-5 px-[7%]">
          <div className="w-1/4 h-1/2">
            <Link href="/" className="w-1/3 h-full flex">
              <span className=""></span>
            </Link>
          </div>

          <div className="w-1/4 flex justify-evenly text-xs lg:text-sm 2xl:text-base">
           
            <Link href="https://fingerpump.gitbook.io/dust.fun" className="" target="_blank" rel="noopener noreferrer">
              <span className="text-white font-bold">HOW IT WORKS</span>
            </Link>
            <Link href="#faq" className="">
              <span className="text-white font-bold">F.A.Q</span>
            </Link>
            <Link href="https://discord.com/invite/FTSeFc9Yh4" target="_blank" rel="noopener noreferrer">
              <span className="text-white font-bold">SUPPORT</span>
            </Link>
          </div>

          <div className="w-1/4 flex justify-around">           
            <ConnectButton _chain="sol" />
            <ConnectButton _chain="eth" />
          </div>
        </div>
      </div>

      {/* ========== MOBILE ========== */}

      <div className={`fixed ${open ? "block" : "hidden"} w-screen h-screen left-[0vw] top-[0vh] backdrop-blur-md`} />

      <div className="w-full flex justify-center md:hidden">
        {/* ====================>>>>> delete max-w- !! */}
        <div className="w-full flex flex-col justify-center items-center relative">
          <Image className="w-full z-10" src={navbarMobileSVG} alt="navbar" />

          <div className="absolute top-0 left-0 w-full h-full flex justify-end z-20">
            <button className="w-1/3 h-full flex" onClick={() => setOpen(!open)}>
              <Image src={open ? closeSVG : openSVG} alt="toggle nav" className="ml-[25%] mt-[15%] h-[35%]" />
            </button>
          </div>

          <div
            className={`absolute bottom-0 translate-y-full transition-all duration-700 ease origin-top
                ${open ? "scale-y-1" : "scale-y-0 opacity-0"} 
                w-[96%] flex justify-center z-0`}
          >
            {open && (
              <div
                className="w-[80%] px-[10%] pb-[5%] pt-[15%] bg-gradient-radial from-[#6D675E] to-[#36312B] 
              -mt-[10%] flex flex-col gap-12 relative"
              >
                <div className="flex flex-col gap-4 font-montserrat font-black text-xl">
                  <Link href={""}>SWAP</Link>
                  <Link href={""}>HOW IT WORKS</Link>
                  <Link href={""}>SUPPORT</Link>
                </div>

                <div className="w-full flex justify-between z-30">
                  <ConnectButton _chain="btc" />
                  <ConnectButton _chain="sol" />
                  <ConnectButton _chain="eth" />
                </div>

                <Image
                  src={navBottomSVG}
                  alt="nav bottom"
                  className="absolute w-[105%] max-w-[105%] -bottom-[5%] left-1/2 transform -translate-x-1/2 drop-shadow-[0_0_10px_rgba(0,_187,_255,_1)] flex -z-20"
                />

                <Image
                  src={navBottomSVG}
                  alt="nav bottom"
                  className="absolute w-[105%] max-w-[105%] -bottom-[5%] left-1/2 transform -translate-x-1/2 z-20"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};
