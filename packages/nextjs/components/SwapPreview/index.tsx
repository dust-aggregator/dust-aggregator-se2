import { RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ConfirmButton from "./ConfirmButton";
import InputToken from "./InputToken";
import { Token } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import { useAccount, useSwitchChain } from "wagmi";
import { useApprovePermit2 } from "~~/hooks/dust/useApprovePermit2";
import { PERMIT2_BASE_SEPOLIA } from "~~/lib/constants";
import { SelectedToken } from "~~/lib/types";
import { getExpressQuote } from "~~/utils/express-quoter/expressQuoter";
import { QuoteSwapData } from "~~/types/quote-swap-data";
import infoSVG from "~~/public/assets/info.svg";
import requiredApprovalsSVG from "~~/public/assets/required-approvals.svg";
import { useGlobalState } from "~~/services/store/store";
import { zeroAddress } from "viem";

const getToggleModal = (ref: RefObject<HTMLDialogElement>) => () => {
  if (ref.current) {
    if (ref.current.open) {
      ref.current.close();
    } else {
      ref.current.showModal();
    }
  }
};

const SwapPreview = ({ isDisabled }: { isDisabled: boolean }) => {
  const account = useAccount();
  const { switchChain } = useSwitchChain();
  const { outputNetwork, outputToken, inputTokens, inputNetwork } = useGlobalState();
  const previewModalRef = useRef<HTMLDialogElement>(null);
  const callApprovePermit2 = useApprovePermit2();
  const [quoteTime, setQuoteTime] = useState(90);
  const [approvalCount, setApprovalCount] = useState(0);
  const [tokensApproveStates, setTokensApproveStates] = useState<{ [key: number]: string }>({});
  const [totalOutputAmount, setTotalOutputAmount] = useState(0);
  const [networkFee, setNetworkFee] = useState(0);

  const [quoteSwapData, setQuoteSwapData] = useState<{ [key: number]: QuoteSwapData }>({});

  const callSetTokenHasApproval = (index: number) => {
    setTokensApproveStates(prev => ({
      ...prev,
      [index]: "success",
    }));
  };

  const callSetTokensMinAmountOut = (index: number, amount: number) => {
    setQuoteSwapData(prevData => ({
      ...prevData,
      [index]: {
        ...prevData[index],
        swapInput: {
          ...prevData[index].swapInput,
          minAmountOut: amount,
        },
      },
    }));
  };

  const handleApproveTokens = async () => {
    for (const token of inputTokens) {
      const index = inputTokens.indexOf(token);

      if (tokensApproveStates[index] === "success") {
        console.log(`Token at index ${index} is already approved, skipping...`);
        continue;
      }

      setTokensApproveStates(prev => ({
        ...prev,
        [index]: "loading",
      }));
      const result = await callApprovePermit2(token.address, PERMIT2_BASE_SEPOLIA);
      if (result.success)
        setTokensApproveStates(prev => ({
          ...prev,
          [index]: "success",
        }));
      else
        setTokensApproveStates(prev => ({
          ...prev,
          [index]: "error",
        }));

      setApprovalCount(prev => prev + 1);
    }
    setApprovalCount(0);
  };

  const handlePreviewSwap = async () => {
    if (account.chainId !== inputNetwork?.id) {
      if (!inputNetwork) return;
      await switchChain({ chainId: inputNetwork?.id });
    }

    togglePreviewModal();
    getQuotes();
  };

  const getQuote = async (_token: SelectedToken, _index: number) => {
    if (!inputNetwork || inputTokens.length <= 0 || !outputToken?.address || !outputNetwork || !account.address) {
      alert("Missing params, make sure to select input tokens, otput token, output network");
      return;
    }

    setQuoteSwapData(prevData => ({
      ...prevData,
      [_index]: {
        ...prevData[_index],
        quoteError: false,
        displayOutput: 0,
        estimatedOutput: 0,
        swapInput: {
          isV3: false,
          path: "",
          amount: BigInt(0),
          minAmountOut: 0,
        },
      },
    }));

    if (inputNetwork.id === outputNetwork.id) {
      // ================ we call smart-order-router normally ================
      // If output is native token, send wrapped as output to get route
      let tokenOutAddress = outputToken.address;
      if (tokenOutAddress === zeroAddress) {
        if (outputNetwork.id === 137) tokenOutAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        else if (outputNetwork.id === 8453) tokenOutAddress = "0x4200000000000000000000000000000000000006";
        else tokenOutAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      }

      const tokenIn = new Token(inputNetwork.id, _token.address, Number(_token.decimals), _token.symbol, _token.name);
      const tokenOut = new Token(
        inputNetwork.id,
        tokenOutAddress,
        Number(outputToken.decimals),
        outputToken.symbol,
        outputToken.name,
      );

      const _quoteSwapData = await getExpressQuote(
        inputNetwork.id,
        account.address,
        tokenIn,
        tokenOut,
        _token.balance.toString(),
      );

      console.log(_quoteSwapData.displayOutput);

      setQuoteSwapData(prevData => ({
        ...prevData,
        [_index]: {
          ...prevData[_index],
          displayOutput: _quoteSwapData.displayOutput,
          estimatedOutput: _quoteSwapData.estimatedOutput,
          quoteError: _quoteSwapData.quoteError,
          estimatedGasUsedUSD: _quoteSwapData.estimatedGasUsedUSD,
          swapInput: _quoteSwapData.swapInput,
        },
      }));

      setTotalOutputAmount(prev => prev + _quoteSwapData.estimatedOutput);
      setNetworkFee(prev => prev + Number(_quoteSwapData.estimatedGasUsedUSD));
    } else {
      // =========== we call smart-order-router always with wrapped eth as output ===========

      let wrappedInputAddress;
      let wrappedInputSymbol;
      let wrappedInputName;
      let nativeInputSymbol;
      if (inputNetwork.id === 137) {
        wrappedInputAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        wrappedInputSymbol = "WPOL";
        wrappedInputName = "Wrapped POL";
        nativeInputSymbol = "POL";
      } else if (inputNetwork.id === 8453) {
        wrappedInputAddress = "0x4200000000000000000000000000000000000006";
        wrappedInputSymbol = "WETH";
        wrappedInputName = "Wrapped ETH";
        nativeInputSymbol = "ETH";
      } else {
        wrappedInputAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        wrappedInputSymbol = "WBNB";
        wrappedInputName = "Wrapped BNB";
        nativeInputSymbol = "BNB";
      }

      const tokenIn = new Token(inputNetwork.id, _token.address, Number(_token.decimals), _token.symbol, _token.name);
      const tokenOut = new Token(inputNetwork.id, wrappedInputAddress, 18, wrappedInputSymbol, wrappedInputName);

      const _quoteSwapData = await getExpressQuote(
        inputNetwork.id,
        account.address,
        tokenIn,
        tokenOut,
        _token.balance.toString(),
      );

      const result = await fetch(`/api/cmc/quotesLatest?symbols=${nativeInputSymbol},${outputToken.symbol}`);
      const resultJson = await result.json();

      const wrappedInputPrice = resultJson[nativeInputSymbol].quote.USD.price;
      const tokenOutputPrice = resultJson[outputToken.symbol].quote.USD.price;
      const wrappedInputUsdValue = _quoteSwapData.estimatedOutput * wrappedInputPrice;
      const finalOutputAmount = wrappedInputUsdValue / tokenOutputPrice;
      // console.log(`FINAL OUTPUT ${finalOutputAmount} ${outputToken.symbol}`);

      console.log(finalOutputAmount);

      setQuoteSwapData(prevData => ({
        ...prevData,
        [_index]: {
          ...prevData[_index],
          displayOutput: finalOutputAmount,
          estimatedOutput: _quoteSwapData.estimatedOutput,
          quoteError: _quoteSwapData.quoteError,
          estimatedGasUsedUSD: _quoteSwapData.estimatedGasUsedUSD,
          swapInput: _quoteSwapData.swapInput,
        },
      }));

      setTotalOutputAmount(prev => prev + finalOutputAmount);
      setNetworkFee(prev => prev + Number(_quoteSwapData.estimatedGasUsedUSD));
    }
  };

  const getQuotes: () => void = () => {
    setTotalOutputAmount(0);
    setNetworkFee(0);
    inputTokens.map((token, index) => {
      getQuote(token, index);
    });
  };

  const readyForPreview = !!inputNetwork && !!outputNetwork && inputTokens.length > 0;

  const togglePreviewModal = getToggleModal(previewModalRef);

  const commission = (totalOutputAmount * 1) / 100;
  const estimatedReturn = totalOutputAmount - commission;
  // let totalUsdValue = inputTokens.reduce((sum, item) => sum + (item.usdValue || 0), 0);
  // totalUsdValue -= networkFee;
  // totalUsdValue -= commission;

  useEffect(() => {
    const interval = setInterval(() => {
      if (readyForPreview) {
        setQuoteTime(quoteTime => {
          if (quoteTime === 1) {
            getQuotes();
            return 90;
          }
          return quoteTime - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  useEffect(() => {
    const count = Object.values(tokensApproveStates).filter((state: string) => state === "success").length;
    setApprovalCount(count);
  }, [tokensApproveStates]);

  return (
    <div>
      <button
        disabled={!readyForPreview || isDisabled}
        style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
        className="text-[#FFFFFF] text-sm p-0 bg-center my-2 btn w-full min-h-0 h-8 rounded-lg mt-4"
        // onClick={togglePreviewModal}
        onClick={() => {
          handlePreviewSwap();
        }}
      >
        Preview Swap
      </button>
      <dialog ref={previewModalRef} className="modal">
        <div className="modal-box bg-[url('/assets/preview_bg2.svg')] bg-no-repeat bg-center bg-auto rounded">
          <div className="flex justify-between items-center bg-auto">
            <h3 className="font-bold text-xl">Input Tokens</h3>
            <div className="relative">
              <Image src={requiredApprovalsSVG} alt="required" className="w-[220px]" />
              <div className="absolute top-0 left-0 w-full h-full flex justify-center">
                <span className="text-xs mt-1 font-bold">{`Tokens Required Approval: ${approvalCount}/${inputTokens.length}`}</span>
              </div>
            </div>
          </div>

          <div className="text-[#9D9D9D]">
            <span>{inputNetwork?.name}</span>
            <ul className="flex flex-col gap-3">
              {inputTokens.map((token, index) => (
                <li key={token.symbol} className="flex justify-between">
                  <InputToken
                    _index={index}
                    _token={token}
                    _approveIndexState={tokensApproveStates[index]}
                    _setTokenHasApproval={callSetTokenHasApproval}
                    _setTokensMinAmountOut={callSetTokensMinAmountOut}

                    _quoteSwapData={quoteSwapData[index]}
                  />
                </li>
              ))}
            </ul>
          </div>
          <h3 className="font-bold text-xl mt-2">Output Token</h3>
          <span className="text-[#9D9D9D]">{outputNetwork?.name}</span>
          {outputToken && (
            <div key={outputToken?.name} className="flex justify-between mb-24">
              <div>
                <span className="px-2">•</span>
                <span>{outputToken?.name}</span>
              </div>
              <span className="text-[#F0BF26] flex font-bold">
                {totalOutputAmount.toFixed(5)} {outputToken?.symbol}
              </span>
            </div>
          )}
          <div className="text-[#9D9D9D]">
            <div className="w-full flex justify-center">
              <p>new quote in: 0:{String(quoteTime).padStart(2, "0")}</p>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2 items-center relative">
                <span className="font-bold">Network fee</span>
                <div className="relative group">
                  <Image src={infoSVG} alt="info" className="cursor-pointer" />
                  <span className="absolute hidden group-hover:block border rounded-lg bg-[#3C3731] text-xs px-2 py-1 w-[200px] top-0 -translate-x-[50%] -translate-y-[100%] font-montserrat">
                    The estimated fees for processing the swap represent the combined gas costs across all the
                    blockchain networks involved in the transaction.
                  </span>
                </div>
              </div>

              <span className="text-[#FFFFFF]">{networkFee.toFixed(3)} USD</span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2 items-center relative">
                <span className="font-bold">Commission (1%)</span>
                <div className="relative group">
                  <Image src={infoSVG} alt="info" className="cursor-pointer" />
                  <span className="absolute hidden group-hover:block border rounded-lg bg-[#3C3731] text-xs px-2 py-1 w-[200px] top-0 -translate-x-[50%] -translate-y-[100%] font-montserrat">
                    Protocol fees are deducted from the output token after the conversion, in addition to the blockchain
                    fees incurred during the transaction.
                  </span>
                </div>
              </div>
              <span className="text-[#FFFFFF]">
                {commission.toFixed(5)} {outputToken?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2 items-center relative">
                <span className="font-bold">Estimated Return</span>
                <div className="relative group">
                  <Image src={infoSVG} alt="info" className="cursor-pointer" />
                  <span className="absolute hidden group-hover:block border rounded-lg bg-[#3C3731] text-xs px-2 py-1 w-[200px] top-0 -translate-x-[50%] -translate-y-[100%] font-montserrat">
                    The estimated return is calculated considering slippage and protocol fees. It is an approximation,
                    and the final output may vary.
                  </span>
                </div>
              </div>
              <span className="text-[#FFFFFF]">
                {estimatedReturn.toFixed(5)} {outputToken?.symbol}
              </span>
            </div>
            <div className="text=[#FFFFF]"></div>
          </div>
          <div className="w-full flex justify-center mt-6">
            <ConfirmButton
              togglePreviewModal={togglePreviewModal}
              _handleApproveTokens={handleApproveTokens}
              _quoteSwapData={quoteSwapData}
            />
            <button
              style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
              className="flex-1 text-[#FFFFFF] my-0 text-sm bg-center btn  min-h-0 h-10 rounded-lg"
              onClick={togglePreviewModal}
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default SwapPreview;
