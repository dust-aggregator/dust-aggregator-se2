import { RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ConfirmButton from "./ConfirmButton";
import InputToken from "./InputToken";
import QuoteTimer from "./QuoteTimer";
import { Token } from "@uniswap/sdk-core";
import { zeroAddress } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { useApprovePermit2 } from "~~/hooks/dust/useApprovePermit2";
import { PERMIT2_ADDRESS } from "~~/lib/constants";
import { SelectedToken } from "~~/lib/types";
import infoSVG from "~~/public/assets/info.svg";
import requiredApprovalsSVG from "~~/public/assets/required-approvals.svg";
import { useGlobalState } from "~~/services/store/store";
import { QuoteSwapData } from "~~/types/quote-swap-data";
import { getExpressQuote } from "~~/utils/express-quoter/expressQuoter";

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

  const [approvalCount, setApprovalCount] = useState(0);
  const [tokensApproveStates, setTokensApproveStates] = useState<{ [key: string]: string }>({});
  const [totalOutputAmount, setTotalOutputAmount] = useState(0);
  const [networkFee, setNetworkFee] = useState(0);
  const [quoteSwapData, setQuoteSwapData] = useState<{ [key: string]: QuoteSwapData }>({});
  const [readyToSwap, setReadyToSwap] = useState(false);
  const [loading, setLoading] = useState(true);

  //============================================================
  // ===================== Approvals logic =====================
  //============================================================

  const callSetTokenHasApproval = (tokenAddress: string, state: string) => {
    setTokensApproveStates(prev => ({
      ...prev,
      [tokenAddress]: state,
    }));
  };

  useEffect(() => {
    let count = 0;

    inputTokens.forEach(token => {
      const tokenAddress = token.address;
      if (tokensApproveStates[tokenAddress] === "success") {
        count += 1;
      }
    });

    setApprovalCount(count);
  }, [tokensApproveStates, inputTokens]);

  const callSetTokensMinAmountOut = (tokenAddress: string, amount: number) => {
    setQuoteSwapData(prevData => ({
      ...prevData,
      [tokenAddress]: {
        ...prevData[tokenAddress],
        swapInput: {
          ...prevData[tokenAddress].swapInput,
          minAmountOut: amount,
        },
      },
    }));
  };

  const handleApproveTokens = async () => {
    for (const token of inputTokens) {
      if (tokensApproveStates[token.address] === "success") {
        console.log(`Token ${token.address} is already approved, skipping...`);
        continue;
      }

      setTokensApproveStates(prev => ({
        ...prev,
        [token.address]: "loading",
      }));
      const result = await callApprovePermit2(token.address, PERMIT2_ADDRESS);
      if (result.success) {
        setTokensApproveStates(prev => ({
          ...prev,
          [token.address]: "success",
        }));

        setApprovalCount(prev => prev + 1);
      } else {
        setTokensApproveStates(prev => ({
          ...prev,
          [token.address]: "error",
        }));
      }
    }
  };

  useEffect(() => {
    setReadyToSwap(false);
    if (inputTokens.length > 0 && approvalCount === inputTokens.length) setReadyToSwap(true);
  }, [approvalCount, inputTokens.length]);

  //============================================================
  // ==================== Quote/Route logic ====================
  //============================================================

  const getQuote = async (_token: SelectedToken) => {
    if (!inputNetwork || inputTokens.length <= 0 || !outputToken || !outputNetwork || !account.address) {
      alert("Missing params, make sure to select input tokens, output token, output network");
      return;
    }

    setQuoteSwapData(prevData => ({
      ...prevData,
      [_token.address]: {
        ...prevData[_token.address],
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

    setLoading(true);

    if (inputNetwork.id === outputNetwork.id) {
      // ================ we call smart-order-router normally ================
      // If output is native token, send wrapped as output to get route
      let tokenOutAddress = outputToken.address;
      if (tokenOutAddress === zeroAddress) {
        if (outputNetwork.id === 137) tokenOutAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        else if (outputNetwork.id === 8453) tokenOutAddress = "0x4200000000000000000000000000000000000006";
        else if (outputNetwork.id === 1) tokenOutAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
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
        _token.amount.toString(),
      );

      // console.log(_quoteSwapData.displayOutput);

      setQuoteSwapData(prevData => ({
        ...prevData,
        [_token.address]: {
          ...prevData[_token.address],
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
      } else if (inputNetwork.id === 1) {
        wrappedInputAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
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
        _token.amount.toString(),
      );

      const result = await fetch(`/api/cmc/quotesLatest?symbols=${nativeInputSymbol},${outputToken.symbol}`);
      const resultJson = await result.json();

      const wrappedInputPrice = resultJson[nativeInputSymbol].quote.USD.price;
      const tokenOutputPrice = resultJson[outputToken.symbol].quote.USD.price;
      const wrappedInputUsdValue = _quoteSwapData.estimatedOutput * wrappedInputPrice;
      const finalOutputAmount = wrappedInputUsdValue / tokenOutputPrice;
      // console.log(`FINAL OUTPUT ${finalOutputAmount} ${outputToken.symbol}`);

      // console.log(finalOutputAmount);

      setQuoteSwapData(prevData => ({
        ...prevData,
        [_token.address]: {
          ...prevData[_token.address],
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
    if (previewModalRef.current?.open) {
      setTotalOutputAmount(0);
      setNetworkFee(0);
      inputTokens.map(token => {
        getQuote(token);
      });
    }
  };

  useEffect(() => {
    if (inputTokens.length > 0) {
      let allRoutesReady = true;

      inputTokens.forEach(token => {
        if (quoteSwapData[token.address]) {
          if (!quoteSwapData[token.address].swapInput.path) {
            allRoutesReady = false;
            return;
          }
        }
      });

      if (allRoutesReady) setLoading(false);
    }
  }, [inputTokens, quoteSwapData]);

  useEffect(() => {
    if (!inputTokens.length) previewModalRef.current?.close();
  }, [inputTokens]);

  //============================================================
  //============================================================

  const handlePreviewSwap = async () => {
    if (account.chainId !== inputNetwork?.id) {
      if (!inputNetwork) return;
      await switchChain({ chainId: inputNetwork?.id });
    }

    togglePreviewModal();
    getQuotes();
  };

  const readyForPreview = !!inputNetwork && !!outputNetwork && inputTokens.length > 0;

  const togglePreviewModal = getToggleModal(previewModalRef);

  // temporarily zero for internal release
  // TODO: pull commission from contract
  const commission = 0;
  // const commission = (totalOutputAmount * 2) / 100;
  const estimatedReturn = totalOutputAmount - commission;

  return (
    <div>
      <button
        disabled={!readyForPreview || isDisabled}
        className="text-[#FFFFFF] text-sm p-0 bg-center my-2 btn w-full min-h-0 h-8 rounded-lg mt-4 bg-[#FFFFFF]/15 border border-[#d1d1e0]/10"
        // onClick={togglePreviewModal}
        onClick={() => {
          handlePreviewSwap();
        }}
      >
        Preview Swap
      </button>
      <dialog ref={previewModalRef} className="modal">
        <div className="modal-box bg-[#000000]/70 border border-[#d1d1e0]/10 rounded-xl">
          <div className="flex justify-between items-center bg-auto">
            <h3 className="font-bold text-xl">Input Tokens</h3>
            <div className="">
              <div className="w-full h-full flex justify-center bg-[#A66CFF] p-1 px-2 rounded-lg">
                <span className="text-xs font-bold">{`Tokens Required Approval: ${approvalCount}/${inputTokens.length}`}</span>
              </div>
            </div>
          </div>

          <div className="text-[#9D9D9D]">
            <span>{inputNetwork?.name}</span>
            <ul className="flex flex-col gap-3">
              {inputTokens.map(token => (
                <InputToken
                  key={token.address}
                  _token={token}
                  _approveIndexState={tokensApproveStates[token.address]}
                  _setTokenHasApproval={callSetTokenHasApproval}
                  _setTokensMinAmountOut={callSetTokensMinAmountOut}
                  _quoteSwapData={quoteSwapData[token.address]}
                />
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
              <span className="text-[#F0BF26] flex">
                {totalOutputAmount.toFixed(5)} {outputToken?.symbol}
              </span>
            </div>
          )}
          <div className="text-[#9D9D9D]">
            <div className="w-full flex justify-center">
              <QuoteTimer getQuotes={getQuotes} />
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

              <span className="text-[#FFFFFF]">{(networkFee * 3).toFixed(3)} USD</span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2 items-center relative">
                <span className="font-bold">
                  {/* temporarily 0% for internal release */}
                  Commission (<span className="line-through">2%</span> 0%)
                </span>
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
          <div className="w-full flex justify-center mt-6 gap-2">
            <button
              className="flex-1 text-[#FFFFFF] my-0 text-sm btn min-h-0 h-10 rounded-lg bg-[#FFFFFF]/15 border border-[#d1d1e0]/10"
              onClick={togglePreviewModal}
            >
              Cancel
            </button>
            <ConfirmButton
              togglePreviewModal={togglePreviewModal}
              _handleApproveTokens={handleApproveTokens}
              _quoteSwapData={quoteSwapData}
              estimatedReturn={estimatedReturn}
              _buttonText={readyToSwap ? "Swap dust" : "Approve dust"}
              _loading={loading}
            />
          </div>
          <div className="mt-3 text-xs font-montserrat flex justify-center">
            <span className="text-[#9D9D9D]">
              By approving you accept the{" "}
              <a href="/terms" target="_blank" className="text-[#FBFBFB] font-bold underline">
                terms and conditions
              </a>
            </span>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default SwapPreview;
