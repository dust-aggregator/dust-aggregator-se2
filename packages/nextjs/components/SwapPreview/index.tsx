import { RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ConfirmButton from "./ConfirmButton";
import InputToken from "./InputToken";
import { Token } from "@uniswap/sdk-core";
import { useAccount, useSwitchChain } from "wagmi";
import infoSVG from "~~/public/assets/info.svg";
import requiredApprovalsSVG from "~~/public/assets/required-approvals.svg";
import { useGlobalState } from "~~/services/store/store";
import { useApprovePermit2 } from "~~/hooks/dust/useApprovePermit2";
import { PERMIT2_BASE_SEPOLIA } from "~~/lib/constants";
import { SelectedToken } from "~~/lib/types";
import { ethers } from "ethers";

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
  const { switchChain } = useSwitchChain()
  const { outputNetwork, outputToken, inputTokens, inputNetwork } = useGlobalState();
  // const [amountOut, setAmountOut] = useState<string | null>(null);
  const [quoteTime, setQuoteTime] = useState(30);
  const previewModalRef = useRef<HTMLDialogElement>(null);
  const callApprovePermit2 = useApprovePermit2();
  const [approvalCount, setApprovalCount] = useState(0);
  const [tokensApproveStates, setTokensApproveStates] = useState<{ [key: number]: string }>({});
  const [tokensEstimatedQuotes, setTokensEstimatedQuotes] = useState<{ [key: number]: number | undefined }>({});
  const [tokensMinAmountOut, setTokensMinAmountOut] = useState<{ [key: number]: number | undefined }>({});
  const [totalOutputAmount, setTotalOutputAmount] = useState(0);
  const [networkFee, setNetworkFee] = useState<string>("0");

  const callSetTokenHasApproval = (index: number) => {
    setTokensApproveStates(prev => ({
      ...prev,
      [index]: "success",
    }));
  };

  const callSetTokensMinAmountOut = (index: number, amount: number) => {
    setTokensMinAmountOut(prev => ({
      ...prev,
      [index]: amount,
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
    getGasPrice();
  };

  const getQuote = async (_token: SelectedToken, _index: number) => {
    if (!inputNetwork || inputTokens.length <= 0 || !outputToken?.address || !outputNetwork || !account.address) {
      alert("Missing params, make sure to select input tokens, otput token, output network");
      return;
    }

    setTokensEstimatedQuotes(prev => ({
      ...prev,
      [_index]: undefined,
    }));
    setTokensMinAmountOut(prev => ({
      ...prev,
      [_index]: undefined,
    }));

    const tokenIn = new Token(inputNetwork.id, _token.address, Number(_token.decimals), _token.symbol, _token.name);
    const tokenOut = new Token(
      inputNetwork.id,
      outputToken.address,
      Number(outputToken.decimals),
      outputToken.symbol,
      outputToken.name,
    );

    const reqBody = {
      chainId: inputNetwork.id,
      walletAddress: account.address,
      tokenIn,
      tokenOut,
      amountIn: _token.amount,
    };

    if (!process.env.NEXT_PUBLIC_QUOTER_API_KEY) {
      throw new Error("API key is not defined");
    }

    const res = await fetch("https://express-quoter-production.up.railway.app/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_QUOTER_API_KEY,
      },
      body: JSON.stringify(reqBody),
    });

    const data = await res.json();
    console.log(data);

    if (data.readableAmount) {
      const onePercentLess = Number(data.readableAmount) * 0.99;

      setTokensEstimatedQuotes(prev => ({
        ...prev,
        [_index]: onePercentLess,
      }));
      setTokensMinAmountOut(prev => ({
        ...prev,
        [_index]: onePercentLess,
      }));

      setTotalOutputAmount(prev => prev + onePercentLess);
    }
  };

  const getQuotes: () => void = () => {
    setTotalOutputAmount(0);
    inputTokens.map((token, index) => {
      getQuote(token, index);
    });
  };

  const readyForPreview = !!inputNetwork && !!outputNetwork && inputTokens.length > 0;

  const togglePreviewModal = getToggleModal(previewModalRef);

  const getGasPrice = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const gasPrice = await provider.getGasPrice();
    // console.log(`Gas price -> ${ethers.utils.formatUnits(gasPrice, "gwei")}`);

    const tx = {
      from: account.address,
      to: inputNetwork?.contractAddress,
      gasPrice: gasPrice,
    };

    const gasLimit = await provider.estimateGas(tx);

    const transactionFee = BigInt(gasLimit.toString()) * BigInt(gasPrice.toString());
    setNetworkFee(ethers.utils.formatUnits(transactionFee * BigInt(inputTokens.length) * BigInt(2), "ether"));
    // console.log(`Network fee -> ${ethers.utils.formatUnits(transactionFee * BigInt(inputTokens.length), "ether")}`);
    // console.log(`Transaction Fee: ${ethers.utils.formatUnits(transactionFee, "ether")} ETH`);
  };

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
            return 30;
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
        <div className="modal-box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded">
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
                    _tokensEstimatedQuotes={tokensEstimatedQuotes[index]}
                    _setTokenHasApproval={callSetTokenHasApproval}
                    _setTokensMinAmountOut={callSetTokensMinAmountOut}
                    _tokenMinOut={tokensMinAmountOut[index]}
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
                {totalOutputAmount.toFixed(7)} {outputToken?.symbol}
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
                    Lorem ipsum dolor sit amet, consectetur Lor em ipsum dolor sit amet.
                  </span>
                </div>
              </div>

              <span className="text-[#FFFFFF]">
                {networkFee} {inputNetwork?.nativeCurrency.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2 items-center relative">
                <span className="font-bold">Commission (1%)</span>
                <div className="relative group">
                  <Image src={infoSVG} alt="info" className="cursor-pointer" />
                  <span className="absolute hidden group-hover:block border rounded-lg bg-[#3C3731] text-xs px-2 py-1 w-[200px] top-0 -translate-x-[50%] -translate-y-[100%] font-montserrat">
                    Lorem ipsum dolor sit amet, consectetur Lor em ipsum dolor sit amet.
                  </span>
                </div>
              </div>
              <span className="text-[#FFFFFF]">
                {commission.toFixed(7)} {outputToken?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Estimated Return</span>
              <span className="text-[#FFFFFF]">
                {estimatedReturn.toFixed(7)} {outputToken?.symbol}
              </span>
            </div>
            <div className="text=[#FFFFF]"></div>
          </div>
          <div className="w-full flex justify-center mt-6">
            <ConfirmButton
              togglePreviewModal={togglePreviewModal}
              _handleApproveTokens={handleApproveTokens}
              _tokensMinAmountOut={tokensMinAmountOut}
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
