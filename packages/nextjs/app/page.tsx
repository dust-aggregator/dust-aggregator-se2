"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
// import { ethers } from "ethers";
// import { Check, ChevronsUpDown, RotateCcw, X } from "lucide-react";
// import { ArcherContainer, ArcherElement } from "react-archer";
// import { toast } from "sonner";
// import { useAccount, useReadContract, useToken, useWatchContractEvent } from "wagmi";
import FAQ from "~~/components/FAQ";
import InputBox from "~~/components/InputBox";
import OutputBox from "~~/components/OutputBox";
// import { SwapPreviewDrawer } from "~~/components/SwapPreviewDrawer";
// import TransactionStatus from "~~/components/TransactionStatus";
// import { Button } from "~~/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
//   CommandShortcut,
// } from "~~/components/ui/command";
// import { Input } from "~~/components/ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from "~~/components/ui/popover";
// import { useTokenBalances } from "~~/hooks/dust/useTokenBalances";
// import { Network, SelectedToken, Token, TransactionState } from "~~/lib/types";
// import { cn } from "~~/lib/utils";
// import { EvmDustTokens, readLocalnetAddresses } from "~~/lib/zetachainUtils";
import gearHubSVG from "~~/public/assets/gear_hub.svg";

// const MOCK_SELECTED_TOKENS = [
//   {
//     address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
//     name: "DAI",
//     symbol: "DAI",
//     decimals: 18,
//     balance: 15,
//     amount: "10",
//     isMax: false,
//     hasPermit2Allowance: false,
//   },
//   {
//     address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
//     symbol: "USDC",
//     name: "USDC",
//     decimals: 6,
//     balance: 21,
//     amount: "10",
//     isMax: false,
//     hasPermit2Allowance: false,
//   },
//   {
//     address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
//     name: "UNI",
//     symbol: "UNI",
//     decimals: 18,
//     balance: 28,
//     amount: "10",
//     isMax: false,
//     hasPermit2Allowance: false,
//   },
// ];

// const networks: Network[] = [
//   {
//     id: 31337,
//     value: "ethereum",
//     label: "Ethereum",
//     enabled: true,
//     rpc: "http://localhost:8545",
//     contractAddress: readLocalnetAddresses("ethereum", "EvmDustTokens"),
//     zrc20Address: readLocalnetAddresses("zetachain", "ZRC-20 ETH on 5"),
//     nativeToken: {
//       name: "Ether (Native)",
//       symbol: "ETH",
//       decimals: 18,
//       balance: 0,
//       address: "0x0000000000000000000000000000000000000000",
//     },
//   },
//   {
//     id: 0,
//     value: "binance",
//     label: "Binance Smart Chain",
//     enabled: false,
//     rpc: "",
//     contractAddress: "",
//     zrc20Address: "",
//     nativeToken: {
//       name: "Ether (Native)",
//       symbol: "ETH",
//       decimals: 18,
//       balance: 0,
//       address: "0x0000000000000000000000000000000000000000",
//     },
//   },
// ];

export default function Component() {
  // ignore this comment <----
  // const [balances, setBalances] = useState<Token[]>([]);
  // const [outputBalances, setOutputBalances] = useState<Token[]>([]);
  // const [selectedOutputToken, setSelectedOutputToken] = useState<Token | null>(MOCK_SELECTED_TOKENS[0]);
  // const [loading, setLoading] = useState(false);
  // const [openToken, setOpenToken] = useState(false);
  // const [openNetwork, setOpenNetwork] = useState(false);
  // const [openOutputToken, setOpenOutputToken] = useState(false);
  // const [selectedTokens, setSelectedTokens] = useState<any[]>(MOCK_SELECTED_TOKENS);
  // const [inputNetwork, setInputNetwork] = useState<Network | null>(null);
  // const [transactionStatus, setTransactionStatus] = useState<TransactionState>("notStarted");

  // const { address, isConnected } = useAccount();

  // // MARK: Source chain contract hooks
  // const { data: rawBalances, isPending: balancesPending } = useReadContract({
  //   abi: EvmDustTokens.abi,
  //   address: readLocalnetAddresses("ethereum", "EvmDustTokens") as `0x${string}`,
  //   functionName: "getBalances",
  //   args: [address],
  //   query: {
  //     enabled: !!address,
  //   },
  // });

  // useWatchContractEvent({
  //   abi: EvmDustTokens.abi,
  //   address: readLocalnetAddresses("ethereum", "EvmDustTokens") as `0x${string}`,
  //   eventName: "SwappedAndDeposited",
  //   args: {
  //     executor: address,
  //   },
  //   enabled: !!address,
  //   onLogs(logs) {
  //     // Loop through logs and check if the executor is the recipient
  //     logs.forEach((log: any) => {
  //       const { executor, swaps, totalTokensReceived } = log.args;
  //       if (executor.toLowerCase() === address?.toLowerCase()) {
  //         setTransactionStatus("destinationPending");
  //       }
  //     });
  //   },
  // });

  // useEffect(() => {
  //   if (rawBalances) {
  //     const formattedBalances = formatTokenBalances(rawBalances);
  //     setBalances(formattedBalances);
  //   }
  // }, [rawBalances]);

  // // MARK: Destination chain contract hooks
  // const { data: rawBalancesDestination, isPending: balancesPendingDestination } = useReadContract({
  //   abi: EvmDustTokens.abi,
  //   address: inputNetwork?.contractAddress as `0x${string}`,
  //   chainId: inputNetwork?.id,
  //   functionName: "getBalances",
  //   args: [address],
  //   query: {
  //     enabled: !!address && !!inputNetwork,
  //   },
  // });

  // useWatchContractEvent({
  //   abi: EvmDustTokens.abi,
  //   address: inputNetwork?.contractAddress as `0x${string}`,
  //   chainId: inputNetwork?.id,
  //   eventName: "SwappedAndWithdrawn",
  //   args: {
  //     receiver: address,
  //   },
  //   enabled: !!address && !!inputNetwork,
  //   onLogs(logs) {
  //     // Loop through logs and check if the executor is the recipient
  //     logs.forEach((log: any) => {
  //       const { receiver, outputToken, totalTokensReceived } = log.args;
  //       // Filter based on signer
  //       if (receiver.toLowerCase() === address?.toLowerCase()) {
  //         const formattedAmount = ethers.formatUnits(totalTokensReceived, selectedOutputToken?.decimals);

  //         // Mark transaction as complete and show success
  //         setTransactionStatus("completed");
  //         toast.success("Your tokens have been successfully swapped and bridged!", {
  //           description: `You have received: ${formattedAmount} ${selectedOutputToken?.symbol}`,
  //           position: "top-center",
  //           duration: 8000,
  //         });
  //       }
  //     });
  //   },
  // });

  // useEffect(() => {
  //   if (rawBalancesDestination) {
  //     const formattedBalances = formatTokenBalances(rawBalancesDestination);
  //     setOutputBalances(formattedBalances);
  //   }
  // }, [rawBalancesDestination]);

  // const formatTokenBalances = (rawBalances: any) => {
  //   const addresses = rawBalances[0];
  //   const names = rawBalances[1];
  //   const symbols = rawBalances[2];
  //   const decimals = rawBalances[3];
  //   const tokenBalances = rawBalances[4];

  //   return addresses.map((address: string, index: number) => ({
  //     address,
  //     name: names[index],
  //     symbol: symbols[index],
  //     decimals: decimals[index],
  //     balance: Number(ethers.formatUnits(tokenBalances[index], decimals[index])),
  //   }));
  // };

  // const handleSelectToken = (token: Token) => {
  //   if (selectedTokens.length < 5 && !selectedTokens.some(t => t.symbol === token.symbol)) {
  //     setSelectedTokens([...selectedTokens, { ...token, amount: "", isMax: false, hasPermit2Allowance: true }]);
  //   } else {
  //     setSelectedTokens(selectedTokens.filter(t => t.symbol !== token.symbol));
  //   }
  //   setOpenToken(false);
  // };

  // const handleSelectOutputToken = (token: Token) => {
  //   setSelectedOutputToken(token);
  //   setOpenOutputToken(false);
  // };

  // const handleRemoveToken = (tokenValue: string) => {
  //   setSelectedTokens(selectedTokens.filter(t => t.symbol !== tokenValue));
  // };

  // const handleSelectNetwork = (network: Network) => {
  //   setInputNetwork(network);
  //   setOpenNetwork(false);
  // };

  // const handleAmountChange = async (tokenValue: string, amount: string) => {
  //   setSelectedTokens(
  //     selectedTokens.map(token =>
  //       token.symbol === tokenValue
  //         ? {
  //             ...token,
  //             amount,
  //             isMax: false,
  //           }
  //         : token,
  //     ),
  //   );
  // };

  // const handleMaxAmount = (tokenValue: string) => {
  //   setSelectedTokens(
  //     selectedTokens.map(token =>
  //       token.symbol === tokenValue ? { ...token, amount: token.balance.toString(), isMax: true } : token,
  //     ),
  //   );
  // };

  // const handleReset = () => {
  //   setSelectedTokens([]);
  //   setSelectedOutputToken(null);
  //   setInputNetwork(null);
  //   setTransactionStatus("notStarted");
  // };

  // const autoSelectTokens = () => {
  //   const tokensWithBalance = balances.filter(token => token.balance > 0);
  //   tokensWithBalance.sort((a, b) => b.balance - a.balance);

  //   const selected = tokensWithBalance.flatMap(token => {
  //     return {
  //       ...token,
  //       amount: token.balance.toString(),
  //       isMax: true,
  //     };
  //   });

  //   setSelectedTokens(selected);
  // };

  // const sortedTokens = [...balances].sort((a, b) => b.balance - a.balance);

  const account = useAccount();

  return (
    <div className="flex-col items-center justify-center h-500 mt-20 px-24">
      <div className="flex justify-center">
        <h1 className="text-4xl text-center font-theory">
          Combine All Small Token Balances in Your Wallet into One Asset with a Single Transaction
        </h1>
      </div>
      <div className="flex justify-center">
        <p className="mt-0 mb-16 font-montserrat">
          <span className="font-bold">Get rid of the dust</span>, exchange all low-value tokens across different chains
          into your favorite asset.
        </p>
      </div>
      {account?.address === undefined ? (
        <p className="text-center text-6xl font-bold">Please connect your wallet!</p>
      ) : (
        <></>
      )}
      <div className="flex justify-center mb-12">
        <InputBox />
        <Image className="w-[500px] mx-[-15px]" src={gearHubSVG} alt="gears" />
        <OutputBox />
      </div>
      <div className="flex justify-center items-center">
        <hr className="w-1/6 bg-[#9D9D9D]" />
        <p className="font-bold text-[#9D9D9D] px-4">Powered by Zetachain cross-chain engine</p>
        <hr className="w-1/6 bg-[#9D9D9D]" />
      </div>
      <div id="faq">
        <FAQ />
      </div>
    </div>
  );
}
