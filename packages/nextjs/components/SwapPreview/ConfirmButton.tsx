import { useEffect, useState } from "react";
import SwapResultModal from "../SwapResultModal";
import dustAbi from "./dustAbi.json";
import { ethers } from "ethers";
import { encode } from "punycode";
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

const dustTokensContractBaseSep = "0xC6d53ffb203872b6250Fd18FC83aD5a9e00dC4cE";

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

      const outputTokenAddress = outputToken.address;
      const destinationPayload = encodeDestinationPayload(recipient, outputTokenAddress);
      const encodedParameters = encodeZetachainPayload(
        outputNetwork.zrc20Address,
        BigInt(550000),
        outputNetwork.contractAddress,
        recipient,
        destinationPayload,
      );

      const tokenSwaps: TokenSwap[] = inputTokens.map(({ amount, decimals, address }) => ({
        amount: parseUnits(amount, decimals),
        token: address,
        minAmountOut: BigInt(1), // TODO: Set a minimum amount out
      }));

      const permit = await signPermit(tokenSwaps);

      writeContract({
        address: "0x2dB3bF70B10007cDC1b33eB2Fcf7dfB876c2A981",
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
