import { useEffect, useState } from "react";
import SwapResultModal from "../SwapResultModal";
import WaitingModal from "../WaitingModal";
import { ethers } from "ethers";
import { parseUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getAccount } from "wagmi/actions";
import dustAbi from "~~/lib/abis/EvmDustTokens.json";
import { TokenSwap } from "~~/lib/types";
import { getGasLimitByOutputToken } from "~~/lib/utils";
import { encodeZetachainPayload, preparePermitData } from "~~/lib/zetachainUtils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

interface Props {
  togglePreviewModal: () => void;
  _handleApproveTokens: () => void;
  _tokensMinAmountOut: { [key: number]: number | undefined };
}

const ConfirmButton = ({ togglePreviewModal, _handleApproveTokens, _tokensMinAmountOut }: Props) => {
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [waitingModalOpen, setWaitingModalOpen] = useState(false);
  const { address } = useAccount();
  const {
    outputNetwork,
    outputToken,
    inputTokens,
    inputNetwork,
    recipient,
    setInputNetwork,
    setInputTokens,
    setOutputNetwork,
    setOutputToken,
  } = useGlobalState();
  const isSameNetwork = outputNetwork?.id === inputNetwork?.id;

  const { writeContract, data: swapHash, isError, error, isPending: swapTxPending } = useWriteContract();

  const { data: swapReceipt, isPending: sameChainSwapPending } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  const { chainId } = getAccount(wagmiConfig);

  const handleConfirm = async (e?: any) => {
    e?.preventDefault();

    const isBitcoin = outputNetwork?.name === "bitcoin";

    if (!outputNetwork) return;
    if (!isBitcoin && (!outputToken || !inputTokens.length)) return;

    // ===================
    await _handleApproveTokens();
    // ===================

    console.log(_tokensMinAmountOut);

    const signPermit = async (swaps: TokenSwap[]) => {
      if (!inputNetwork || !chainId) {
        throw new Error("No input network");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const { domain, types, values, deadline, nonce } = await preparePermitData(
        chainId,
        swaps,
        inputNetwork?.contractAddress,
      );
      const signature = await signer._signTypedData(domain, types, values);

      return { deadline, nonce, signature };
    };

    if (!outputToken) {
      throw new Error("No output token");
    }

    const gasLimit = isBitcoin ? BigInt(130000) : getGasLimitByOutputToken(outputToken?.address);
    const recipientAddress = (recipient || address) as `0x${string}`;
    const targetChainCounterparty = isBitcoin ? recipientAddress : outputNetwork.contractAddress;

    try {
      const encodedParameters = encodeZetachainPayload(
        outputNetwork.zrc20Address,
        gasLimit,
        targetChainCounterparty,
        recipientAddress,
        outputToken?.address as `0x${string}`,
        BigInt(1),
        isBitcoin,
      );

      const tokenSwaps: TokenSwap[] = inputTokens.map(({ amount, decimals, address }, index) => ({
        amount: parseUnits(amount, decimals),
        token: address,
        minAmountOut: _tokensMinAmountOut[index]
          ? ethers.utils.parseUnits(_tokensMinAmountOut[index].toFixed(18).toString(), decimals)
          : BigInt(0),
      }));

      const permit = await signPermit(tokenSwaps);

      const functionName = isSameNetwork ? "SwapTokens" : "SwapAndBridgeTokens";
      const args = [
        tokenSwaps,
        isSameNetwork ? outputToken?.address : encodedParameters,
        permit.nonce,
        permit.deadline,
        permit.signature,
      ];

      writeContract({
        address: inputNetwork?.contractAddress as string,
        abi: dustAbi,
        functionName,
        args,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isError) {
      console.error("Error performing swap and bridge transaction:", error.message);
      togglePreviewModal();
      setResultModalOpen(true);
    }
  }, [isError, error]);

  useEffect(() => {
    // cross chain swap started
    if (swapHash && !isSameNetwork) setWaitingModalOpen(true);
  }, [swapHash, isSameNetwork]);

  useEffect(() => {
    // same chain swap ~finished
    if (swapReceipt && isSameNetwork) setResultModalOpen(true);
  }, [swapReceipt, isSameNetwork]);

  const retryOperation = () => {
    setResultModalOpen(false);
    togglePreviewModal();
    handleConfirm();
  };

  const rebootMachine = () => {
    togglePreviewModal();
    setInputNetwork(null);
    setInputTokens([]);
    setOutputNetwork(null);
    setOutputToken(null);
  };

  const showSpinner = swapTxPending || (!!swapHash && sameChainSwapPending);

  return (
    <>
      <button
        onClick={handleConfirm}
        style={{ backgroundImage: "url('/button2.png')" }}
        className="flex-1 px-6 hover:brightness-50 bg-no-repeat bg-center bg-cover min-h-0 h-10 btn rounded-lg bg-transparent hover:bg-transparent border-0"
        disabled={showSpinner}
      >
        {showSpinner ? <span className="loading loading-spinner loading-md"></span> : "Approve"}
      </button>
      <SwapResultModal
        // togglePreviewModal={togglePreviewModal}
        rebootMachine={rebootMachine}
        retryOperation={retryOperation}
        open={resultModalOpen}
        isError={isError}
        error={error}
        amountCurency={"4005.3333 DAI"}
      />
      {waitingModalOpen && <WaitingModal open={waitingModalOpen} swapHash={swapHash} />}
    </>
  );
};

export default ConfirmButton;
