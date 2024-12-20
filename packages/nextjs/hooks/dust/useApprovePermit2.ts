import { useEffect, useState, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt
} from "wagmi";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { maxUint256 } from "viem";

export function useApprovePermit2() {
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [permit2Address, setPermit2Address] = useState<string | null>(null);

  // const [experienceData, setExperienceData] = useState<NewExperience | null>(null);
  const [resolveFunction, setResolveFunction] = useState<((value: { success: boolean }) => void) | null>(null);

  const {
    writeContract,
    data: dataApprove,
    error: errorApprove,
    // isError: isErrorEXP,
    // isPending: isPendingEXP,
  } = useWriteContract();

  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash: dataApprove });

  useEffect(() => {
    if (tokenAddress && permit2Address) {
      console.log(`Calling approve for contract ${tokenAddress}, to permit2 address ${permit2Address}`);

      writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [permit2Address, maxUint256],
      });
    }
  }, [tokenAddress, writeContract]); // add nothing else

  useEffect(() => {
    if (isSuccess && resolveFunction && tokenAddress) {
      resolveFunction({ success: true });
      setResolveFunction(null);
      setTokenAddress(null);
      setPermit2Address(null);
    } else if (isError && resolveFunction) {
      console.error("Transaction failed");
      resolveFunction({ success: false });
      setResolveFunction(null);
      setTokenAddress(null);
      setPermit2Address(null);
    }
  }, [isSuccess, isError]); // add nothing else

  useEffect(() => {
    if (errorApprove && resolveFunction) {
      console.error(`Transaction failed: ${errorApprove.message}`);
      resolveFunction({ success: false });
      setResolveFunction(null);
      setTokenAddress(null);
      setPermit2Address(null);
    }
  }, [errorApprove]); // add nothing else

  const approvePermit2Contract = useCallback(
    async (_tokenAddress: string, _permit2Address: string): Promise<{ success: boolean }> => {
      console.log(`Initiating approve for contract ${_tokenAddress}, to permit2 address ${_permit2Address}`);

      return new Promise<{ success: boolean }>(resolve => {
        setTokenAddress(_tokenAddress);
        setPermit2Address(_permit2Address);
        setResolveFunction(() => resolve);
      });
    },
    [],
  );

  return approvePermit2Contract;
}
