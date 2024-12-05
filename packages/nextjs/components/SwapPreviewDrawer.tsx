import React, { useEffect } from "react";
import SwapTokenLine from "./SwapTokenLine";
import { signTypedData } from "@wagmi/core";
import { BigNumberish, ZeroAddress, ethers, formatUnits, parseUnits } from "ethers";
import { ArrowDown, Coins } from "lucide-react";
import { toast } from "sonner";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~~/components/ui/dialog";
import { Network, SelectedToken, Token, TokenSwap } from "~~/lib/types";
import {
  EvmDustTokens,
  encodeDestinationPayload,
  encodeZetachainPayload,
  getUniswapV3EstimatedAmountOut,
  preparePermitData,
  readLocalnetAddresses,
} from "~~/lib/zetachainUtils";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

type ProfileFormDrawerProps = {
  selectedTokens: SelectedToken[];
  selectedNetwork: Network;
  selectedOutputToken: Token;
  disabled?: boolean;
};

export function SwapPreviewDrawer({
  selectedTokens,
  selectedNetwork,
  selectedOutputToken,
  disabled = false,
}: ProfileFormDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const [amountOut, setAmountOut] = React.useState<string | null>(null);

  const client = usePublicClient({
    chainId: 31337,
  });

  const { address } = useAccount();
  const { data: hash, isPending, writeContract, ...rest } = useWriteContract();

  useEffect(() => {
    const initializeProvider = async () => {
      if (open) {
        calculateOutputTokenAmount();
      }
    };

    initializeProvider();
  }, [open, selectedTokens, selectedNetwork, selectedOutputToken]);

  function truncateToDecimals(value: string, decimals: number) {
    if (value.indexOf(".") === -1) {
      // No decimal point, return the value as is
      return value;
    }
    const parts = value.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1].slice(0, decimals);
    return `${integerPart}.${decimalPart}`;
  }

  const calculateOutputTokenAmount = async () => {
    if (!open || !selectedOutputToken || !selectedNetwork || !client) {
      return;
    }
    setAmountOut(null);

    const slippageBPS = 50;
    try {
      let transportTokenAmount = BigInt(0);

      for (const token of selectedTokens) {
        const parsedAmount = parseUnits(token.amount, token.decimals);
        const swapTokenAmount = await getUniswapV3EstimatedAmountOut(
          client,
          readLocalnetAddresses("ethereum", "uniswapQuoterV3"),
          token.address,
          readLocalnetAddresses("ethereum", "weth"),
          parsedAmount,
          slippageBPS,
        );

        transportTokenAmount = transportTokenAmount + swapTokenAmount;
      }

      const outputTokenAmount = await getUniswapV3EstimatedAmountOut(
        client,
        readLocalnetAddresses("ethereum", "uniswapQuoterV3"),
        readLocalnetAddresses("ethereum", "weth"),
        selectedOutputToken.address,
        transportTokenAmount,
        slippageBPS,
      );

      // const zetachainExchangeRate = await getUniswapV2AmountOut(
      //   "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe",
      //   "0x65a45c57636f9BcCeD4fe193A602008578BcA90b",
      //   transportTokenAmount
      // );

      // console.log("ZETA EXCHANGE RATE:", zetachainExchangeRate);

      // console.log("ZETA EXCHANGE RATE:", zetachainExchangeRate);

      const parsedOutputTokenAmount = formatUnits(outputTokenAmount, selectedOutputToken.decimals);

      // Truncate to 4 decimal places
      const outputAmountWithFourDecimals = truncateToDecimals(parsedOutputTokenAmount, 4);

      setAmountOut(outputAmountWithFourDecimals);
    } catch (error) {
      console.error("Error calculating output token amount:", error);
    }
  };

  const signPermit = async (swaps: TokenSwap[]) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();

    if (client) {
      const { domain, types, values, deadline, nonce } = await preparePermitData(
        client,
        swaps,
        readLocalnetAddresses("ethereum", "EvmDustTokens"),
      );

      const signature = await (await signer).signTypedData(domain, types, values);

      return { deadline, nonce, signature };
    }
  };

  const handleConfirm = async () => {
    try {
      const recipient = address as string;

      // Step 1: Prepare payloads
      const outputToken = selectedOutputToken.address;
      const destinationPayload = encodeDestinationPayload(recipient, outputToken);
      const encodedParameters = encodeZetachainPayload(
        selectedNetwork.zrc20Address,
        selectedNetwork.contractAddress,
        recipient,
        destinationPayload,
      );
      const tokenSwaps: TokenSwap[] = selectedTokens.map(({ amount, decimals, address }) => ({
        amount: parseUnits(amount, decimals),
        token: address,
        minAmountOut: ZeroAddress, // TODO: Set a minimum amount out
      }));

      // Step 2: Create Permit2 Batch transfer signature
      const permit = await signPermit(tokenSwaps);

      if (!permit) return;

      // Step 3: Perform swap and bridge transaction
      writeContract({
        address: readLocalnetAddresses("ethereum", "EvmDustTokens") as `0x${string}`,
        abi: EvmDustTokens.abi,
        functionName: "SwapAndBridgeTokens",
        args: [tokenSwaps, encodedParameters, permit.nonce, permit.deadline, permit.signature],
      });

      setOpen(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again later.", {
        position: "top-center",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={disabled}>
          <Coins className="w-4 h-4 mr-2" />
          Preview Swap
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="w-full text-center">Preview Swap</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="font-semibold">Input Tokens:</div>
          {selectedTokens.map((token, index) => (
            <SwapTokenLine token={token} key={index} />
          ))}
          <div className="flex justify-center my-2">
            <ArrowDown className="h-6 w-6" />
          </div>
          <div className="font-semibold">Output Network & Token:</div>
          <div className="flex justify-between items-center">
            <span>{`${selectedOutputToken?.name} @ ${selectedNetwork?.label}`}</span>
            <span>{amountOut ? `${amountOut} ${selectedOutputToken?.symbol}` : "Calculating..."}</span>
          </div>
        </div>
        <DialogFooter className="flex flex-column mt-4">
          <Button
            variant="default"
            disabled={disabled || !amountOut}
            loading={isPending}
            size="full"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
          <Button
            variant="outline"
            disabled={disabled || !amountOut || isPending}
            size="full"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
