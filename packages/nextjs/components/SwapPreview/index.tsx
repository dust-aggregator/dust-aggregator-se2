import { RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ConfirmButton from "./ConfirmButton";
import InputToken from "./InputToken";
import { QUOTER_ADDRESSES } from "@uniswap/sdk-core";
import { keccak256, toUtf8Bytes } from "ethers";
import { ethers } from "ethers";
import { formatEther, parseUnits } from "viem";
import chains from "viem/chains";
import { useAccount, usePublicClient } from "wagmi";
import { readContract, writeContract } from "wagmi/actions";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
// import { useEthersProvider } from "~~/hooks/dust";
import { truncateToDecimals } from "~~/lib/utils";
import { getUniswapV3EstimatedAmountOut } from "~~/lib/zetachainUtils";
import infoSVG from "~~/public/assets/info.svg";
import requiredApprovalsSVG from "~~/public/assets/required-approvals.svg";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { useApprovePermit2 } from "~~/hooks/dust/useApprovePermit2";
import { PERMIT2_BASE_SEPOLIA } from "~~/lib/constants";

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

const SwapPreview = ({ isDisabled }: { isDisabled: boolean }) => {
  const { outputNetwork, outputToken, inputTokens, inputNetwork } = useGlobalState();
  const [amountOut, setAmountOut] = useState<string | null>(null);
  const [quoteTime, setQuoteTime] = useState(30);
  const [approvalCount, setApprovalCount] = useState(0);
  const previewModalRef = useRef<HTMLDialogElement>(null);
  const isBitcoin = outputNetwork?.id === "bitcoin";

  const client = usePublicClient({ config: wagmiConfig });

  const callApprovePermit2 = useApprovePermit2();
  const [tokensApproveStates, setTokensApproveStates] = useState<{ [key: number]: string }>({});

  const handleApproveTokens = async () => {
    for (const token of inputTokens) {
      setTokensApproveStates(prev => ({
        ...prev,
        [index]: "loading",
      }));
      const index = inputTokens.indexOf(token);
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

  const publicClient = usePublicClient();

  const account = useAccount();
  console.log(account);
  console.log(publicClient);

  const [totalOutputAmount, setTotalOutputAmount] = useState(BigInt(0));

  useEffect(() => {
    async function fn() {
      if (inputTokens.length <= 0) return;
      if (publicClient === undefined) return;
      if (outputToken?.address === undefined) return;
      if (outputNetwork === undefined) return;

      const abi = [
        {
          inputs: [
            {
              components: [
                { internalType: "address", name: "tokenIn", type: "address" },
                { internalType: "address", name: "tokenOut", type: "address" },
                { internalType: "uint256", name: "amountIn", type: "uint256" },
                { internalType: "uint24", name: "fee", type: "uint24" },
                { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
              ],
              internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "quoteExactInputSingle",
          outputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint160", name: "sqrtPriceX96After", type: "uint160" },
            { internalType: "uint32", name: "initializedTicksCrossed", type: "uint32" },
            { internalType: "uint256", name: "gasEstimate", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      let total = BigInt(0);

      for (const token of inputTokens) {
        const { result } = await publicClient.simulateContract({
          address: QUOTER_ADDRESSES[outputNetwork?.id || 1],
          abi,
          functionName: "quoteExactInputSingle",
          args: [
            {
              tokenIn: token.address, // tokenIn
              tokenOut: outputToken?.address, // tokenOut (base WETH)
              amountIn: parseUnits(token.amount, token.decimals), // amountIn
              fee: BigInt(500), // fee tier
              sqrtPriceLimitX96: BigInt(0), // price limit
            },
          ],
        });

        console.log(result);

        console.log("Amount out: ");

        total += result[0];
      }

      setTotalOutputAmount(total);
      // setAmountOut(total.toString());

      // console.log(formatEther(result[0]));

      // const slippageBPS = 50;

      // const outputTokenAmount = await getUniswapV3EstimatedAmountOut(
      //   client,
      //   "", //quoter
      //   "0x4200000000000000000000000000000000000006",
      //   inputTokens[0].address,
      //   10000,
      //   slippageBPS,
      // );

      // console.log(outputTokenAmount);

      // const result = await writeContract(wagmiConfig, {
      //   abi,
      //   address: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a", // base Quoter
      //   functionName: "quoteExactInputSingle",
      //   args: [
      //     inputTokens[0].address, // tokenIn
      //     "0x4200000000000000000000000000000000000006", // tokenOut (base WETH)
      //     parseUnits(inputTokens[0].amount, inputTokens[0].decimals), // amountIn
      //     550000,
      //     0,
      //   ],
      // });

      // console.log("HELLO!");
      // console.log(result);
    }
    fn();
  }, [inputTokens.length, publicClient?.chain?.id, outputToken?.address, outputNetwork?.id]);

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

      const parsedOutputTokenAmount = ethers.formatUnits(outputTokenAmount, outputToken.decimals);

      // Truncate to 4 decimal places
      const outputAmountWithFourDecimals = truncateToDecimals(parsedOutputTokenAmount, 4);

      setAmountOut(outputAmountWithFourDecimals);
    } catch (error) {
      console.error("Error calculating output token amount:", error);
    }
  };

  const readyForPreview =
    !!inputNetwork && !!outputNetwork && inputTokens.length > 0 && (!isBitcoin ? !!outputToken : true);

  const togglePreviewModal = getToggleModal(previewModalRef);
  const closePreviewModal = () => {
    if (previewModalRef.current) {
      previewModalRef.current.close();
    }
  };

  const networkFee = 0.43;
  const commission = 0.21;
  let totalUsdValue = inputTokens.reduce((sum, item) => sum + (item.usdValue || 0), 0);
  totalUsdValue -= networkFee;
  totalUsdValue -= commission;

  return (
    <div>
      <button
        disabled={!readyForPreview || isDisabled}
        style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
        className="text-[#FFFFFF] text-sm p-0 bg-center my-2 btn w-full min-h-0 h-8 rounded-lg mt-4"
        onClick={togglePreviewModal}
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
            <ul>
              {inputTokens.map((token, index) => (
                <li key={token.symbol} className="flex justify-between">
                  <InputToken token={token} _approveIndexState={tokensApproveStates[index]} />
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
                {Number(formatEther(totalOutputAmount)).toFixed(4)} {outputToken?.name}
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

              <span className="text-[#FFFFFF]">${networkFee}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2 items-center relative">
                <span className="font-bold">Commission (0.25%)</span>
                <div className="relative group">
                  <Image src={infoSVG} alt="info" className="cursor-pointer" />
                  <span className="absolute hidden group-hover:block border rounded-lg bg-[#3C3731] text-xs px-2 py-1 w-[200px] top-0 -translate-x-[50%] -translate-y-[100%] font-montserrat">
                    Lorem ipsum dolor sit amet, consectetur Lor em ipsum dolor sit amet.
                  </span>
                </div>
              </div>
              <span className="text-[#FFFFFF]">${commission}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Estimated Return</span>
              <span className="text-[#FFFFFF]">${totalUsdValue.toFixed(2)}</span>
            </div>
            <div className="text=[#FFFFF]"></div>
          </div>
          <form method="dialog" className="w-full flex justify-center mt-6">
            <ConfirmButton togglePreviewModal={togglePreviewModal} _handleApproveTokens={handleApproveTokens} />
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
