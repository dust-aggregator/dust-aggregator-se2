import Image from "next/image";
import React from "react";
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
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0 relative">
      <div className="w-full flex justify-center relative">
        {/* SVG Image */}
        <Image className="w-[95%]" src={footerSVG} alt="footer" />

        <div className="absolute inset-0 flex justify-center items-center mb-5">
          <div className="flex justify-center">
            <Link href="https://discord.com/invite/zetachain" className="mx-3">
            <Image src={discordIcon} alt="discord"/>
            </Link>
            <Link href="https://discord.com/invite/zetachain" className="mx-3">
            <Image src={instagramIcon} alt="instagram"/>
            </Link>
            <Link href="https://discord.com/invite/zetachain" className="mx-3">
            <Image src={tiktokIcon} alt="tiktok"/>
            </Link>
            <Link href="https://www.youtube.com/@ZetaBlockchain" className="mx-3">
            <Image src={youtubeIcon} alt="youtube"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
