import { useEffect, useState } from "react";
import SwapResultModal from "../SwapResultModal";
import WaitingModal from "../WaitingModal";
import { sendGAEvent } from "@next/third-parties/google";
import { ethers } from "ethers";
import { encodeFunctionData, parseUnits, zeroAddress } from "viem";
import { zetachain } from "viem/chains";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getAccount, getBlockNumber } from "wagmi/actions";
import { useWaitForEvmOutput } from "~~/hooks/dust";
import { useWaitForBitcoinOutput } from "~~/hooks/dust/useWaitForBitcoinOutput";
import dustAbi from "~~/lib/abis/EvmDustTokens.json";
import { GA_EVENTS } from "~~/lib/constants";
import { TokenSwap } from "~~/lib/types";
import { getGasLimitByOutputToken } from "~~/lib/utils";
import { encodeZetachainPayload, preparePermitData } from "~~/lib/zetachainUtils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { QuoteSwapData } from "~~/types/quote-swap-data";

interface Props {
  togglePreviewModal: () => void;
  _handleApproveTokens: () => void;
  _quoteSwapData: { [key: string]: QuoteSwapData };
  estimatedReturn: number;
  _buttonText: string;
  _loading: boolean;
}

const ConfirmButton = ({
  togglePreviewModal,
  _handleApproveTokens,
  _quoteSwapData,
  estimatedReturn,
  _buttonText,
  _loading,
}: Props) => {
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [waitingModalOpen, setWaitingModalOpen] = useState(false);
  const [sameChainSwapPending, setSameChainSwapPending] = useState(false);
  const [amountReceived, setAmountReceived] = useState<bigint>();

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
  const isBitcoin = outputNetwork?.id === "bitcoin";

  const handleSuccess = (_amountReceived: bigint) => {
    setSameChainSwapPending(false);
    setWaitingModalOpen(false);
    setAmountReceived(_amountReceived);
    setResultModalOpen(true);
  };
  useWaitForEvmOutput(handleSuccess);
  useWaitForBitcoinOutput(handleSuccess);

  const { writeContract, data: swapHash, isError, error, isPending: swapTxPending } = useWriteContract();

  const { chainId } = getAccount(wagmiConfig);

  const handleConfirm = async (e?: any) => {
    e?.preventDefault();
    sendGAEvent({
      name: GA_EVENTS.approveSwap,
    });

    const isZetaChain = outputNetwork?.id === zetachain.id;
    const isNonEthereumNetwork = isBitcoin || isZetaChain;

    if (!outputNetwork) return;
    if (!isNonEthereumNetwork && (!outputToken || !inputTokens.length)) return;

    // ===================
    await _handleApproveTokens();
    // ===================

    const signPermit = async (swaps: TokenSwap[]) => {
      console.log(swaps);

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
      console.log(domain);
      console.log(types);
      console.log(values);
      const signature = await signer._signTypedData(domain, types, values);

      return { deadline, nonce, signature };
    };

    if (!outputToken && !isNonEthereumNetwork) {
      throw new Error("No output token");
    }

    const gasLimit = isNonEthereumNetwork
      ? BigInt(130000)
      : getGasLimitByOutputToken(outputToken?.address, outputNetwork.id);
    const recipientAddress = isNonEthereumNetwork ? address : ((recipient || address) as `0x${string}`);
    const targetChainCounterparty = isNonEthereumNetwork ? recipientAddress : outputNetwork.contractAddress;

    try {
      const encodedParameters = encodeZetachainPayload(
        outputNetwork.zrc20Address,
        gasLimit,
        targetChainCounterparty,
        recipientAddress,
        outputToken?.address as `0x${string}`,
        BigInt(1),
        isNonEthereumNetwork,
        isZetaChain,
      );

      console.log(inputTokens);

      const tokenSwaps: TokenSwap[] = inputTokens.map(({ address, amount, balance, decimals }) => {
        const amountInWei = parseUnits(amount, decimals);
        const balanceInWei = parseUnits(balance.toString(), decimals);
        return {
          isV3: _quoteSwapData[address].swapInput.isV3,
          path: ethers.utils.hexlify(_quoteSwapData[address].swapInput.path),
          amount: amountInWei > balanceInWei ? balanceInWei : amountInWei,
          minAmountOut: parseUnits(_quoteSwapData[address].swapInput.minAmountOut.toString(), outputToken.decimals),
          token: address,
        };
      });

      console.log(tokenSwaps);

      const permit = await signPermit(tokenSwaps);

      const isNative = outputToken.address === zeroAddress;

      const functionName = isSameNetwork ? "SwapTokens" : "SwapAndBridgeTokens";
      const args = [
        tokenSwaps,
        isSameNetwork ? isNative : encodedParameters,
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
      if (isSameNetwork) setSameChainSwapPending(true);
    } catch (error) {
      sendGAEvent({
        name: GA_EVENTS.swapError,
        error: JSON.stringify(error),
      });
      console.error(error);
    }
  };

  useEffect(() => {
    if (isError) {
      console.error(error);
      togglePreviewModal();
      setResultModalOpen(true);
    }
  }, [isError, error]);

  useEffect(() => {
    // cross chain swap started
    if (swapHash && !isSameNetwork) setWaitingModalOpen(true);
  }, [swapHash, isSameNetwork]);

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

  const showSpinner = swapTxPending || (!!swapHash && sameChainSwapPending) || _loading;

  return (
    <>
      <button
        onClick={handleConfirm}
        style={{ backgroundImage: "url('/button2.png')" }}
        className="flex-1 px-6 hover:brightness-50 bg-no-repeat bg-center bg-cover min-h-0 h-10 btn rounded-lg bg-transparent hover:bg-transparent border-0"
        disabled={showSpinner}
      >
        {showSpinner ? <span className="loading loading-spinner loading-md"></span> : _buttonText}
      </button>
      <SwapResultModal
        rebootMachine={rebootMachine}
        retryOperation={retryOperation}
        open={resultModalOpen}
        isError={isError}
        error={error?.message}
        amountReceived={amountReceived}
      />
      {waitingModalOpen && (
        <WaitingModal open={waitingModalOpen} swapHash={swapHash} estimatedReturn={estimatedReturn} />
      )}
    </>
  );
};

export default ConfirmButton;
