import { useEffect, useState } from "react";
import SwapResultModal from "../SwapResultModal";
import WaitingModal from "../WaitingModal";
import { sendGAEvent } from "@next/third-parties/google";
import { ethers } from "ethers";
import { parseUnits, zeroAddress } from "viem";
import { zetachain } from "viem/chains";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getAccount, getBlockNumber } from "wagmi/actions";
import { useDustEventHistory } from "~~/hooks/dust";
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
  _quoteSwapData: { [key: number]: QuoteSwapData };
  estimatedReturn: number;
}

const ConfirmButton = ({ togglePreviewModal, _handleApproveTokens, _quoteSwapData, estimatedReturn }: Props) => {
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [waitingModalOpen, setWaitingModalOpen] = useState(false);
  const [sameChainSwapPending, setSameChainSwapPending] = useState(false);
  const [amountReceived, setAmountReceived] = useState<bigint>();
  const [blockNumBeforeSwap, setBlockNumBeforeSwap] = useState<bigint>(0n);
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

  useEffect(() => {
    if (!outputNetwork) return;
    getBlockNumber(wagmiConfig, { chainId: outputNetwork?.id }).then(blockNum => setBlockNumBeforeSwap(blockNum));
  }, [outputNetwork]);

  const successEventName = isSameNetwork ? "Swapped" : "Withdrawn";

  const { data: successEvents } = useDustEventHistory({
    eventName: successEventName,
    fromBlock: BigInt(blockNumBeforeSwap),
    enabled: !!blockNumBeforeSwap,
  });

  useEffect(() => {
    const event = successEvents?.find((event: any) => event.args["0"] === (recipient || address));
    if (event) {
      setSameChainSwapPending(false);
      setWaitingModalOpen(false);
      setAmountReceived(event.args["2"]);
      setResultModalOpen(true);
    }
  }, [successEvents, recipient, address]);

  const { chainId } = getAccount(wagmiConfig);

  const handleConfirm = async (e?: any) => {
    e?.preventDefault();
    sendGAEvent({
      name: GA_EVENTS.approveSwap,
    });

    const isBitcoin = outputNetwork?.id === "bitcoin";
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

    const gasLimit = isNonEthereumNetwork ? BigInt(130000) : getGasLimitByOutputToken(outputToken?.address);
    const recipientAddress = (recipient || address) as `0x${string}`;
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
      );

      console.log(inputTokens);

      const tokenSwaps: TokenSwap[] = inputTokens.map(({ address, amount, decimals, balance }, index) => ({
        isV3: _quoteSwapData[index].swapInput.isV3,
        path: ethers.utils.hexlify(_quoteSwapData[index].swapInput.path),
        amount: parseUnits(Math.min(Number(amount), balance).toString(), decimals),
        minAmountOut: parseUnits(_quoteSwapData[index].swapInput.minAmountOut.toString(), decimals),
        token: address,
      }));

      const permit = await signPermit(tokenSwaps);

      // function SwapTokens(
      //   SwapInput[] calldata swaps,
      //   bool isNativeOutput,
      //   uint256 nonce,
      //   uint256 deadline,
      //   bytes calldata signature

      // function SwapAndBridgeTokens(
      //   SwapInput[] calldata swaps,
      //   bytes calldata message,
      //   uint256 nonce,
      //   uint256 deadline,
      //   bytes calldata signature

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
      console.error("Error performing swap and bridge transaction:", error.message);
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
        amountReceived={amountReceived}
      />
      {waitingModalOpen && (
        <WaitingModal open={waitingModalOpen} swapHash={swapHash} estimatedReturn={estimatedReturn} />
      )}
    </>
  );
};

export default ConfirmButton;
