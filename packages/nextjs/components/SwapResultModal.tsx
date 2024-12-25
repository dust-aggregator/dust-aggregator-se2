import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import discordIcon from "~~/public/assets/discord_icon.svg";
import instagramIcon from "~~/public/assets/instagram_icon.svg";
import SuccessSVG from "~~/public/assets/success.svg";
import tiktokIcon from "~~/public/assets/tiktok_icon.svg";
import youtubeIcon from "~~/public/assets/youtube_icon.svg";

interface Props {
  isError: boolean;
  error: any;
  open: boolean;
  retryOperation: () => void;
  rebootMachine: () => void;
  amountCurency?: string;
}

const SwapResultModal = ({ isError, error, open, retryOperation, rebootMachine, amountCurency }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open]);

  const parseErrorMessage = (error: any) => {
    if (!error) return "An unexpected error occurred.";
    return error.message.split(" (")[0]; // Extract the main error message
  };

  const getErrorDetails = (error: any) => {
    if (!error) return null;
    const details = error.message.split(" (")[1]?.split(")")[0];
    return details; // Replace long bytecode with "0x..."
  };

  const copyErrorToClipboard = () => {
    if (error) {
      navigator.clipboard.writeText(error.message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset the copy success message after 2 seconds
    }
  };

  return (
    <dialog ref={ref} className="modal">
      <div
        className={`modal-box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded-xl border-4
          ${isError ? "border-[#FF6161]" : "border-[#00BBFF]"}`}
      >
        <div className={`${isError ? "my-32" : "gap-12 my-12"} items-center flex flex-col justify-center`}>
          <h1 className="font-bold text-4xl">{isError ? "SWAP FAILED" : "SUCCESSFULLY"}</h1>
          <div className="text-[#fffff] text-xl w-3/4 text-center leading-none mt-2 flex flex-col gap-3 items-center">
            {isError ? (
              <>
                We regret to inform you that the operation was not successful, please check that you have the required
                amount in commission and try again.
              </>
            ) : (
              <>
                <div className="flex gap-1 items-center drop-shadow-[0_3px_3px_rgba(0,_187,_255,_1)]">
                  <Image src={SuccessSVG} alt="success" />
                  <span className="font-montserrat font-bold text-3xl">{amountCurency}</span>
                </div>
                <span>Thank you very much for using Dust.Fun, your dust has been transformed</span>
              </>
            )}
          </div>
          <form method="dialog" className="w-full flex justify-center mt-6">
            <button
              onClick={isError ? retryOperation : rebootMachine}
              className="flex-1 px-6 hover:brightness-50 bg-[url('/button2.png')] bg-no-repeat bg-center bg-cover h-10"
            >
              {isError ? "Retry Operation" : "Reboot machine"}
            </button>
          </form>
          {isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 w-3/4 text-center">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{parseErrorMessage(error)}</span>
              {getErrorDetails(error) && (
                <div className="text-xs mt-2">
                  <span>{getErrorDetails(error)}</span>
                </div>
              )}
            </div>
          )}
          {isError && (
            <div className="mt-4 flex flex-col items-center">
              <div className="relative">
                <button
                  onClick={copyErrorToClipboard}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-2"
                >
                  Copy Error
                </button>
                {copySuccess && (
                  <span className="absolute right-[-20px]  top-[40%] transform -translate-y-1/2 text-success">&#10003;</span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Contact Support
                </span>
                <Link href="https://discord.com/invite/FTSeFc9Yh4" target="_blank" rel="noopener noreferrer">
                  <Image src={discordIcon} alt="discord" />
                </Link>
              </div>
            </div>
          )}
          {!isError && (
            <div className="flex justify-center items-center -mt-7 -mb-10">
              <div className="flex gap-3 justify-center">
                <Link href="https://discord.com/invite/zetachain">
                  <Image src={discordIcon} alt="discord" />
                </Link>
                <Link href="https://discord.com/invite/zetachain">
                  <Image src={instagramIcon} alt="instagram" />
                </Link>
                <Link href="https://discord.com/invite/zetachain">
                  <Image src={tiktokIcon} alt="tiktok" />
                </Link>
                <Link href="https://www.youtube.com/@ZetaBlockchain">
                  <Image src={youtubeIcon} alt="youtube" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default SwapResultModal;
