import { useEffect, useState } from "react";
import SwapResultModal from "../SwapResultModal";
import dustAbi from "./dustAbi.json";
import { ethers } from "ethers";
import { parseUnits } from "viem";
import { useAccount, useSignTypedData, useWriteContract } from "wagmi";
import { getAccount } from "wagmi/actions";
import { TokenSwap } from "~~/lib/types";
import {
  encodeDestinationPayload,
  encodeZetachainPayload,
  preparePermitData,
  readLocalnetAddresses,
} from "~~/lib/zetachainUtils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const dustTokensContractBaseSep = "0x300abcE823C6C015c8dD31e35cA7B0602d9f2a10";

interface Props {
  togglePreviewModal: () => void;
}

const ConfirmButton = ({ togglePreviewModal }: Props) => {
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const { address } = useAccount();
  const { outputNetwork, outputToken, inputTokens } = useGlobalState();
  const { writeContract, ...rest } = useWriteContract();
  // const { signTypedData } = useSignTypedData();
  const { chainId } = getAccount(wagmiConfig);

  const handleConfirm = async e => {
    e?.preventDefault();
    if (!outputNetwork || !outputToken || !inputTokens.length || !chainId) return;

    const signPermit = async (swaps: TokenSwap[]) => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const { domain, types, values, deadline, nonce } = await preparePermitData(
        chainId,
        swaps,
        dustTokensContractBaseSep,
      );
      const signature = await signer.signTypedData(domain, types, values);

      return { deadline, nonce, signature };
    };

    try {
      const recipient = address as string;

      // Step 1: Prepare payloads
      const outputTokenAddress = outputToken.address;
      const destinationPayload = encodeDestinationPayload(recipient, outputTokenAddress);
      const encodedParameters = encodeZetachainPayload(
        outputNetwork.zrc20Address,
        outputNetwork.contractAddress,
        recipient,
        destinationPayload,
      );
      const tokenSwaps: TokenSwap[] = inputTokens.map(({ amount, decimals, address }) => ({
        amount: parseUnits(amount, decimals),
        token: address,
        minAmountOut: BigInt(0), // TODO: Set a minimum amount out
      }));

      // Step 2: Create Permit2 Batch transfer signature
      const permit = await signPermit(tokenSwaps);

      // Step 3: Perform swap and bridge transaction
      writeContract({
        address: dustTokensContractBaseSep,
        abi: dustAbi,
        functionName: "SwapAndBridgeTokens",
        args: [tokenSwaps, encodedParameters, permit.nonce, permit.deadline, permit.signature],
      });
    } catch (error) {
      console.error("WHOOOPS", error);
    }
  };

  useEffect(() => {
    if (rest.error) {
      console.error("Error performing swap and bridge transaction:", rest.error);
      togglePreviewModal();
      setResultModalOpen(true);
    }
  }, [rest.error]);

  const retryOperation = () => {
    setResultModalOpen(false);
    togglePreviewModal();
    handleConfirm();
  };

  return (
    <>
      <button
        onClick={handleConfirm}
        className="flex-1 px-6 hover:brightness-50 bg-[url('/button2.png')] bg-no-repeat bg-center bg-cover h-10"
      >
        Approve
      </button>
      <SwapResultModal
        togglePreviewModal={togglePreviewModal}
        retryOperation={retryOperation}
        open={resultModalOpen}
        error={rest.error}
      />
    </>
  );
};

export default ConfirmButton;
