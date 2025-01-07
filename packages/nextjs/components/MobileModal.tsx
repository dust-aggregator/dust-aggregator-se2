import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logoSVG from "~~/public/logo.svg";
import logoText from "~~/public/df-logo.svg";

export const MobileModal = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 1050);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    if (isSmallScreen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isSmallScreen]);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box p-12 box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded-xl flex flex-col gap-3 items-center justify-center">
        <h1 className="text-2xl text-center font-theory">Optimized for Desktop</h1>
        <div className="flex gap-8 items-center">
          <Image src={logoText} alt="logo" className="w-[100px]" />
          <Image src={logoSVG} alt="logo" className="w-[60px]" />
        </div>
        <span className={`text-lg font-bold text-white opacity-50 font-montserrat text-center`}>
          Dust.fun is designed to provide the best experience on desktop devices. Please access the application from a
          computer to enjoy all its features.
        </span>
      </div>
    </dialog>
  );
};
