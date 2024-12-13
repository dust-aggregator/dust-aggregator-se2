import { useEffect, useState } from "react";
import SwapResultModal from "../SwapResultModal";
import dustAbi from "./dustAbi.json";
import { ethers } from "ethers";
import { encode } from "punycode";
import { parseUnits } from "viem";
import { useAccount, useSignTypedData, useWriteContract } from "wagmi";
import { getAccount } from "wagmi/actions";
import { getGasLimitByOutputToken } from "~~/lib/constants";
import { TokenSwap } from "~~/lib/types";
import {
  encodeDestinationPayload,
  encodeZetachainPayload,
  preparePermitData,
  readLocalnetAddresses,
} from "~~/lib/zetachainUtils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

interface Props {
  togglePreviewModal: () => void;
}

const ConfirmButton = ({ togglePreviewModal }: Props) => {
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const { address } = useAccount();
  const { outputNetwork, outputToken, inputTokens, inputNetwork } = useGlobalState();
  const { writeContract, isError, ...rest } = useWriteContract();
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
        inputNetwork?.contractAddress,
      );
      const signature = await signer.signTypedData(domain, types, values);

      return { deadline, nonce, signature };
    };

    const gasLimit = getGasLimitByOutputToken(outputToken.address);
    const recipient = address as `0x${string}`;

    try {
      const encodedParameters = encodeZetachainPayload(
        outputNetwork.zrc20Address,
        gasLimit,
        outputNetwork.contractAddress,
        recipient,
        outputToken.address,
        BigInt(1),
      );

      const tokenSwaps: TokenSwap[] = inputTokens.map(({ amount, decimals, address }) => ({
        amount: parseUnits(amount, decimals),
        token: address,
        minAmountOut: BigInt(1), // TODO: Set a minimum amount out
      }));

      const permit = await signPermit(tokenSwaps);

      writeContract({
        address: inputNetwork?.contractAddress,
        abi: dustAbi,
        functionName: "SwapAndBridgeTokens",
        args: [tokenSwaps, encodedParameters, permit.nonce, permit.deadline, permit.signature],
        enabled: !!inputNetwork,
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
        isError={isError}
        error={rest.error}
        amountCurency={"4005.3333 DAI"}
      />
    </>
  );
};

export default ConfirmButton;
