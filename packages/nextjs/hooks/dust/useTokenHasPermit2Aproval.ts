import { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useAccount, useReadContract } from "wagmi";

const PERMIT2_BASE_SEPOLIA = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const useTokenHasPermit2Approval = (tokenAddress: string, amount: string) => {
  const [hasApproval, setHasApproval] = useState<boolean>(false);
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
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
      }
      setNeedsRefresh(false);
    }
  }, [approvedAmount, isError, amount, needsRefresh]);

  const refresh = () => setNeedsRefresh(true);

  return { hasApproval, isLoading, isError, refresh };
};
