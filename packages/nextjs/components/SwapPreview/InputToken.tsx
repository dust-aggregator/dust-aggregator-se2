import { useEffect } from "react";
import Image from "next/image";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { useWriteContract } from "wagmi";
import { useTokenHasPermit2Approval } from "~~/hooks/dust";
import { maxUint256 } from "~~/lib/constants";
import { PERMIT2_BASE_SEPOLIA } from "~~/lib/constants";

const InputToken = ({ token }) => {
  const parsedAmount = parseUnits(token.amount, token.decimals);
  const { hasApproval, refresh } = useTokenHasPermit2Approval(token.address, parsedAmount);
  const { writeContract, isPending, isError, isSuccess, error } = useWriteContract();

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
    <>
      <div>
        <span className="px-2">•</span>
        <span>
          {token.name} ({token.symbol})
        </span>
      </div>
      <span className="text-[#2DC7FF] flex">
        {!hasApproval && (
          <button onClick={handleApprove} className="mr-2 text-secondary">
            {btnText}
          </button>
        )}
        {token.amount} {token.ticker}
        <Image className="ml-1" src="/assets/particles.svg" alt="dust_particles" width={15} height={15} />
      </span>
    </>
  );
};

export default InputToken;
