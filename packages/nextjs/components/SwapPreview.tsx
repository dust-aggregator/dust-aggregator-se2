import { useEffect, useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { http, usePublicClient } from "wagmi";
import { useEthersProvider } from "~~/hooks/dust/useEthersProvider";
import { truncateToDecimals } from "~~/lib/utils";
import { getUniswapV3EstimatedAmountOut } from "~~/lib/zetachainUtils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const quoterAddressBaseSep = "0xC5290058841028F1614F3A6F0F5816cAd0df5E27";
const wethBaseSep = "0x4200000000000000000000000000000000000006";

const mockSelectedTokens = [
  {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    ticker: "DAI",
    name: "Dai",
    amount: "8.4",
    decimals: 18,
  },
  {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    ticker: "UNI",
    name: "Uni",
    amount: "3",
    decimals: 18,
  },
  {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    ticker: "LINK",
    name: "Link",
    amount: "14.1",
    decimals: 18,
  },
];

const SwapPreview = () => {
  const { outputNetwork, outputToken, inputTokens } = useGlobalState();
  const [amountOut, setAmountOut] = useState<string | null>(null);
  const [quoteTime, setQuoteTime] = useState(30);
  const provider = useEthersProvider();

  const client = usePublicClient({ config: wagmiConfig });

  useEffect(() => {
    calculateOutputTokenAmount();
  }, [outputToken, outputNetwork, inputTokens, client, provider]);

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

      console.log({ outputAmountWithFourDecimals });
      setAmountOut(outputAmountWithFourDecimals);
    } catch (error) {
      console.error("Error calculating output token amount:", error);
    }
  };

  const readyForPreview = !!outputNetwork && !!outputToken;

  return (
    <div>
      <button
        disabled={!readyForPreview}
        style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
        className="text-[#FFFFFF] text-sm p-0 bg-center my-2 btn w-full min-h-0 h-8 rounded-lg mt-4"
        onClick={() => document.getElementById("preview_modal").showModal()}
      >
        Preview Swap
      </button>
      <dialog id="preview_modal" className="modal">
        <div className="modal-box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded">
          <h3 className="font-bold text-xl">Input Tokens</h3>
          <div className="text-[#9D9D9D]">
            <span>Optimism</span>
            <ul>
              {mockSelectedTokens.map(token => (
                <li key={token.ticker} className="flex justify-between">
                  <div>
                    <span className="px-2">•</span>
                    <span>
                      {token.name} ({token.ticker})
                    </span>
                  </div>
                  <span className="text-[#2DC7FF] flex">
                    {token.amount} {token.ticker}
                    <Image className="ml-1" src="/assets/particles.svg" alt="dust_particles" width={15} height={15} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <h3 className="font-bold text-xl mt-2">Output Token</h3>
          <span className="text-[#9D9D9D]">{outputNetwork?.label}</span>
          <div key={outputToken?.label} className="flex justify-between mb-24">
            <div>
              <span className="px-2">•</span>
              <span>{outputToken?.label}</span>
            </div>
            <span className="text-[#F0BF26] flex font-bold">
              {amountOut} {outputToken?.label}
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
            <button className="flex-1 px-6 hover:brightness-50 bg-[url('/button2.png')] bg-no-repeat bg-center bg-cover h-10">
              Approve
            </button>
            <button
              style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
              className="flex-1 text-[#FFFFFF] my-0 text-sm bg-center btn  min-h-0 h-10 rounded-lg"
              onClick={() => document.getElementById("my_modal_1").showModal()}
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
