import { useEffect, useState } from "react";
import Image from "next/image";
import { parseUnits } from "viem";
import { useTokenHasPermit2Approval } from "~~/hooks/dust";
import { SelectedToken } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";
import { QuoteSwapData } from "~~/types/quote-swap-data";

interface Props {
  _index: number;
  _token: SelectedToken;
  _approveIndexState: string;
  _setTokenHasApproval: (index: number) => void;
  _setTokensMinAmountOut: (index: number, amount: number) => void;

  _quoteSwapData: QuoteSwapData;
}

const InputToken = ({
  _index,
  _token,
  _approveIndexState,
  _setTokenHasApproval,
  _setTokensMinAmountOut,
  _quoteSwapData,
}: Props) => {
  const _fixedAmount = Number(_token.amount).toFixed(18);
  const parsedAmount = parseUnits(_fixedAmount, _token.decimals);
  const { hasApproval } = useTokenHasPermit2Approval(_token.address, parsedAmount);
  const [slippage, setSlippage] = useState(0);
  const [tokenQuote, setTokenQuote] = useState("");

  const { outputToken } = useGlobalState();

  const handleSlippageChange = (e: string) => {
    if (_quoteSwapData?.estimatedOutput) {
      const slippageValue = Number(e);
      setSlippage(slippageValue);
      const minAmountWithSlippage = _quoteSwapData?.estimatedOutput - (_quoteSwapData?.estimatedOutput * slippageValue) / 100;
      _setTokensMinAmountOut(_index, minAmountWithSlippage);
    }
  };

  useEffect(() => {
    if (hasApproval) _setTokenHasApproval(_index);
  }, [hasApproval]);

  useEffect(() => {
    if (_quoteSwapData?.estimatedOutput) {
      const value = Number(_quoteSwapData?.estimatedOutput).toFixed(7);
      setTokenQuote(value);
    }
  }, [_quoteSwapData?.estimatedOutput]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="">•</span>
          <span className="text-xs">
            {_token.name} ({_token.symbol})
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`rounded-full w-[6px] h-[6px] ${hasApproval || _approveIndexState === "success" ? "bg-[#75FF4A] drop-shadow-[0_0_7px_rgba(_66,_255,0,_0.8)]" : "bg-[#FF7171] drop-shadow-[0_0_7px_rgba(_255,0,0,_0.8)]"}`}
            />
            <span
              className={`text-xs
              ${!_approveIndexState && "text-orange-500"}
              ${_approveIndexState === "loading" && "text-amber-500"}
              ${_approveIndexState === "success" && "text-[#75FF4A]"}
              ${_approveIndexState === "error" && "text-[#FF7171]"}
              `}
            >
              {!_approveIndexState && "Requires Approval"}
              {_approveIndexState === "loading" && "Loading"}
              {_approveIndexState === "success" && "Approved"}
              {_approveIndexState === "error" && "Error"}
            </span>
          </div>
        </div>
        <span className="text-[#2DC7FF] flex text-xs">
          {Number(_token.amount).toFixed(2)} {_token.symbol}
          <Image className="ml-1" src="/assets/particles.svg" alt="dust_particles" width={10} height={10} />
        </span>
      </div>

      <div className="w-full flex justify-between items-center ml-1">
        <div className="flex gap-2">
          <div className="w-px h-5 border opacity-50" />
          <span className="text-xs">Max slippage</span>
        </div>
        <div className="rounded-lg border flex items-center bg-[#3C3731]">
          <button
            className={`w-[55px] p-1 text-sm rounded-lg ${slippage === 0 && "bg-[#e6ffff] drop-shadow-[0_0_5px_rgba(0,_187,_255,_1)] text-black"}`}
            onClick={() => handleSlippageChange("0")}
          >
            Auto
          </button>

          <div
            className={`w-[55px] p-1 text-sm rounded-lg ${slippage > 0 && "bg-[#e6ffff] drop-shadow-[0_0_5px_rgba(0,_187,_255,_1)]  text-black"}`}
          >
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="bg-transparent w-[40px] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ring-0 focus:ring-0 shadow-none focus:shadow-none focus:outline-none border-none focus:border-none"
              value={slippage}
              onChange={e => handleSlippageChange(e.target.value)}
              placeholder="0.5"
            />
            <span className="absolute right-2 text-sm text-gray-500">%</span>
          </div>

        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2">

          {_quoteSwapData?.quoteError ? (
            <span className="text-[#ff3333] text-xs font-bold">Quote not found for requested pair</span>
          ) : (
            <>
              <span className="text-[#00ccff] text-xs font-bold">Estimated output:</span>
              {_quoteSwapData?.estimatedOutput ? (
                <span className="text-[#00ccff] text-xs">
                  {tokenQuote} {outputToken?.symbol}
                </span>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-[#00ff99]"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              )}
            </>
          )}
        </div>
      </div>
      {/* <span>{_quoteSwapData?.swapInput.minAmountOut}</span>
      <span>{_quoteSwapData?.quoteError ? "true" : "false"}</span> */}
    </div>
  );
};

export default InputToken;
