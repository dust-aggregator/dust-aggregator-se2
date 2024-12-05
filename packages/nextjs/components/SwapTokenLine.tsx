import { Badge } from "./ui/badge";
import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { MaxUint256, ethers } from "ethers";
import { parseAbi } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { SelectedToken } from "~~/lib/types";
import { readLocalnetAddresses } from "~~/lib/zetachainUtils";

const allowanceAbi = parseAbi(["function allowance(address owner, address spender) returns (uint256)"]);

export default function SwapTokenLine({ token }: { token: SelectedToken }) {
  const { address } = useAccount();
  const amountToSweep = BigInt(token.amount) ** BigInt(token.decimals);

  const { data: permit2Allowance = 0n } = useReadContract({
    abi: allowanceAbi,
    address: token.address,
    functionName: "allowance",
    args: [address, readLocalnetAddresses("ethereum", "permit2") as `0x${string}`],
  });

  const permit2Enabled = permit2Allowance >= amountToSweep;

  const { writeContract, ...rest } = useWriteContract();

  const enablePermit2 = async (tokenAddress: string) => {
    const ercAbi = parseAbi(["function approve(address spender, uint256 amount) returns (bool)"]);

    writeContract({
      address: token.address as `0x${string}`,
      abi: ercAbi,
      functionName: "approve",
      args: [PERMIT2_ADDRESS, MaxUint256],
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <span>
          {token.name} {`(${token.symbol})`}
        </span>
        <span>{token.amount}</span>
      </div>

      {!permit2Enabled && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-red-500 mr-2 text-xs">Permit2 not enabled for {token.symbol}</span>
          <Badge className="cursor-pointer" variant="destructive" onClick={() => enablePermit2(token.address)}>
            Enable
          </Badge>
        </div>
      )}
    </div>
  );
}
