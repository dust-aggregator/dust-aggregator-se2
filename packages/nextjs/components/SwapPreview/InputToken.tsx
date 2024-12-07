import { useEffect } from "react";
import Image from "next/image";
import { erc20Abi, formatUnits } from "viem";
import { useWriteContract } from "wagmi";
import { useTokenHasPermit2Approval } from "~~/hooks/dust";
import { maxUint256 } from "~~/lib/constants";

const InputToken = ({ token }) => {
  const { hasApproval, refresh } = useTokenHasPermit2Approval(token.address, token.amount);
  const { writeContract, isPending, isError, isSuccess } = useWriteContract();

  useEffect(() => {
    if (isSuccess) refresh();
  }, [isSuccess, refresh]);

  const handleApprove = async () => {
    writeContract({
      abi: erc20Abi,
      address: token.address,
      functionName: "approve",
      args: ["0x000000000022D473030F116dDEE9F6B43aC78BA3", maxUint256],
    });
  };

  const formattedAmount = formatUnits(token.amount, token.decimals);
  const btnText = isSuccess ? "Approved!" : isError ? "Error" : isPending ? "Waiting for signature" : "Approve Token";

  return (
    <>
      <div>
        <span className="px-2">•</span>
        <span>
          {token.name} ({token.ticker})
        </span>
      </div>
      <span className="text-[#2DC7FF] flex">
        {!hasApproval && (
          <button onClick={handleApprove} className="mr-2 text-secondary">
            {btnText}
          </button>
        )}
        {formattedAmount} {token.ticker}
        <Image className="ml-1" src="/assets/particles.svg" alt="dust_particles" width={15} height={15} />
      </span>
    </>
  );
};

export default InputToken;
