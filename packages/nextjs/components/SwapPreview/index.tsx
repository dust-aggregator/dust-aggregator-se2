import { RefObject, useEffect, useRef, useState } from "react";
import ConfirmButton from "./ConfirmButton";
import InputToken from "./InputToken";
import { keccak256, toUtf8Bytes } from "ethers";
import { ethers } from "ethers";
import { parseUnits } from "viem";
import chains from "viem/chains";
import { useAccount, usePublicClient } from "wagmi";
// import { useEthersProvider } from "~~/hooks/dust";
import { truncateToDecimals } from "~~/lib/utils";
import { getUniswapV3EstimatedAmountOut } from "~~/lib/zetachainUtils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const quoterAddressBaseSep = "0xC5290058841028F1614F3A6F0F5816cAd0df5E27";
const wethBaseSep = "0x4200000000000000000000000000000000000006";

const getToggleModal = (ref: RefObject<HTMLDialogElement>) => () => {
  if (ref.current) {
    if (ref.current.open) {
      ref.current.close();
    } else {
      ref.current.showModal();
    }
  }
};

const SwapPreview = () => {
  const { outputNetwork, outputToken, inputTokens } = useGlobalState();
  const [amountOut, setAmountOut] = useState<string | null>(null);
  const [quoteTime, setQuoteTime] = useState(30);
  const previewModalRef = useRef<HTMLDialogElement>(null);
  const { chain } = useAccount(wagmiConfig);

  const client = usePublicClient({ config: wagmiConfig });

  // useEffect(() => {
  //   calculateOutputTokenAmount();
  // },   const handleConfirm = async () => {

  useEffect(() => {
    const interval = setInterval(() => {
      if (readyForPreview) {
        setQuoteTime(quoteTime => {
          if (quoteTime === 1) {
            return 30;
          }
          return quoteTime - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  const calculateOutputTokenAmount = async () => {
    if (!outputToken || !outputNetwork || !inputTokens.length || !client || !provider) {
      return;
    }
    setAmountOut(null);

    const slippageBPS = 50;
    try {
      let transportTokenAmount = BigInt(0);

      for (const token of inputTokens) {
        const parsedAmount = parseUnits(token.amount, token.decimals);
        const swapTokenAmount = await getUniswapV3EstimatedAmountOut(
          // wagmiConfig,
          provider,
          quoterAddressBaseSep,
          token.address,
          wethBaseSep,
          parsedAmount,
          slippageBPS,
        );

        transportTokenAmount = transportTokenAmount.add(swapTokenAmount);
      }

      const outputTokenAmount = await getUniswapV3EstimatedAmountOut(
        client,
        quoterAddressBaseSep,
        wethBaseSep,
        outputToken.address,
        transportTokenAmount,
        slippageBPS,
      );

      const parsedOutputTokenAmount = ethers.utils.formatUnits(outputTokenAmount, outputToken.decimals);

      // Truncate to 4 decimal places
      const outputAmountWithFourDecimals = truncateToDecimals(parsedOutputTokenAmount, 4);

      setAmountOut(outputAmountWithFourDecimals);
    } catch (error) {
      console.error("Error calculating output token amount:", error);
    }
  };

  const readyForPreview = !!outputNetwork && !!outputToken && inputTokens.length > 0;

  const togglePreviewModal = getToggleModal(previewModalRef);
  const closePreviewModal = () => {
    if (previewModalRef.current) {
      previewModalRef.current.close();
    }
  };

  return (
    <div>
      <button
        disabled={!readyForPreview}
        style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
        className="text-[#FFFFFF] text-sm p-0 bg-center my-2 btn w-full min-h-0 h-8 rounded-lg mt-4"
        onClick={togglePreviewModal}
      >
        Preview Swap
      </button>
      <dialog ref={previewModalRef} className="modal">
        <div className="modal-box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded">
          <h3 className="font-bold text-xl">Input Tokens</h3>
          <div className="text-[#9D9D9D]">
            <span>{chain?.name}</span>
            <ul>
              {inputTokens.map(token => (
                <li key={token.symbol} className="flex justify-between">
                  <InputToken token={token} />
                </li>
              ))}
            </ul>
          </div>
          <h3 className="font-bold text-xl mt-2">Output Token</h3>
          <span className="text-[#9D9D9D]">{outputNetwork?.name}</span>
          <div key={outputToken?.name} className="flex justify-between mb-24">
            <div>
              <span className="px-2">•</span>
              <span>{outputToken?.name}</span>
            </div>
            <span className="text-[#F0BF26] flex font-bold">
              {amountOut} {outputToken?.name}
            </span>
          </div>
          <div className="text-[#9D9D9D]">
            <div className="w-full flex justify-center">
              <p>new quote in: 0:{String(quoteTime).padStart(2, "0")}</p>
            </div>
            <div className="flex justify-between">
              <h4 className="font-bold">Network fee</h4>
              <span className="text-[#FFFFFF]">$0.43</span>
            </div>
            <div className="flex justify-between">
              <h4 className="font-bold">Commission (0.25%)</h4>
              <span className="text-[#FFFFFF]">$0.21</span>
            </div>
            <div className="text=[#FFFFF]"></div>
          </div>
          <form method="dialog" className="w-full flex justify-center mt-6">
            <ConfirmButton togglePreviewModal={togglePreviewModal} />
            <button
              style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
              className="flex-1 text-[#FFFFFF] my-0 text-sm bg-center btn  min-h-0 h-10 rounded-lg"
              onClick={togglePreviewModal}
            >
              Cancel
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default SwapPreview;
