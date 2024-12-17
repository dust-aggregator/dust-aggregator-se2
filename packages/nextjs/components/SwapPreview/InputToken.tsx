import { useEffect, useState } from "react";
import Image from "next/image";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { useWriteContract } from "wagmi";
import { useTokenHasPermit2Approval } from "~~/hooks/dust";
import { maxUint256 } from "~~/lib/constants";
import { PERMIT2_BASE_SEPOLIA } from "~~/lib/constants";
import { SelectedToken } from "~~/lib/types";

interface Props {
  token: SelectedToken;
}

const InputToken = ({ token }: Props) => {
  const parsedAmount = parseUnits(token.amount, token.decimals);
  const { hasApproval, refresh } = useTokenHasPermit2Approval(token.address, parsedAmount);
  const { writeContract, isPending, isError, isSuccess, error } = useWriteContract();
  const [slippage, setSlippage] = useState(0)

  useEffect(() => {
    if (isSuccess) refresh();
    if (error) console.error(error);
  }, [isSuccess, refresh, error]);

  const handleApprove = async () => {
    writeContract({
      abi: erc20Abi,
      address: token.address,
      functionName: "approve",
      args: [PERMIT2_BASE_SEPOLIA, maxUint256],
    });
  };

  const btnText = isSuccess ? "Approved!" : isError ? "Error" : isPending ? "Waiting for signature" : "Approve Token";

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="">•</span>
          <span className="text-xs">
            {token.name} ({token.symbol})
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`rounded-full w-[6px] h-[6px] ${hasApproval ? "bg-[#75FF4A] drop-shadow-[0_0_7px_rgba(_66,_255,0,_0.8)]" : "bg-[#FF7171] drop-shadow-[0_0_7px_rgba(_255,0,0,_0.8)]"}`}
            />
            <span className={`text-xs ${hasApproval ? "text-[#75FF4A]" : "text-[#FF7171]"}`}>
              {hasApproval ? "Approbed" : "Requires Approval"}
            </span>
          </div>
        </div>
        <span className="text-[#2DC7FF] flex text-xs">
          {/* {!hasApproval && (
          <button onClick={handleApprove} className="mr-2 text-secondary">
            {btnText}
          </button>
        )} */}
          {Number(token.amount).toFixed(4)} {token.symbol}
          <Image className="ml-1" src="/assets/particles.svg" alt="dust_particles" width={10} height={10} />
        </span>
      </div>

      <div className="w-full flex justify-between items-center ml-1">
        <div className="flex gap-2">
          <div className="w-px h-5 border opacity-50" />
          <span className="text-xs">Max slippage</span>
        </div>
        <div className="rounded-lg border flex items-center bg-[#3C3731]">
          <button
            className={`px-2 p-1 text-sm rounded-lg font-medium ${slippage === 0 && "bg-[#e6ffff] drop-shadow-[0_0_5px_rgba(0,_187,_255,_1)] text-black"}`}
            onClick={() => setSlippage(0)}
          >
            Auto
          </button>
          <button
            className={`px-2 p-1 text-sm rounded-lg font-medium ${slippage > 0 && "bg-[#e6ffff] drop-shadow-[0_0_5px_rgba(0,_187,_255,_1)]  text-black"}`}
            onClick={() => setSlippage(2.5)}
          >
            2.50%
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputToken;
