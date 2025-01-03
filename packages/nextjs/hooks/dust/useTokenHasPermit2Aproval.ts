import { useEffect, useState } from "react";
import { erc20Abi, parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { PERMIT2_BASE_SEPOLIA } from "~~/lib/constants";

export const useTokenHasPermit2Approval = (tokenAddress: string, amount: bigint) => {
  const [hasApproval, setHasApproval] = useState<boolean>(false);
  const { address } = useAccount();

  const enabled = !!address && !!tokenAddress && !!amount;

  const {
    data: approvedAmount,
    isError,
    isLoading,
  } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [address, PERMIT2_BASE_SEPOLIA],
    enabled,
  });

  useEffect(() => {
    if (approvedAmount !== undefined && !isError) {
      if (approvedAmount >= BigInt(amount)) {
        setHasApproval(true);
      } else {
        setHasApproval(false);
      }
    }
  }, [approvedAmount, isError, amount]);

  return { hasApproval, isLoading, isError };
};
