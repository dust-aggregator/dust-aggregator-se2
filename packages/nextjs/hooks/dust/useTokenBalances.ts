import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const mockAlchemyResponse = {
  jsonrpc: "2.0",
  id: 0,
  result: {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    tokenBalances: [
      {
        contractAddress: "0x0000000000085d4780b73119b644ae5ecd22b376",
        tokenBalance: "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        contractAddress: "0x0abefb7611cb3a01ea3fad85f33c3c934f8e2cf4",
        tokenBalance: "0x00000000000000000000000000000000000000000000039e431953bcb76c0000",
      },
      {
        contractAddress: "0x0ad0ad3db75ee726a284cfafa118b091493938ef",
        tokenBalance: "0x0000000000000000000000000000000000000000008d00cf60e47f03a33fe6e3",
      },
    ],
    pageKey: "0x0ad0ad3db75ee726a284cfafa118b091493938ef",
  },
};

export function useTokenBalances() {
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState([]);
  const { address } = useAccount();

  useEffect(() => {
    setLoading(true);
    const { result } = mockAlchemyResponse;
    const formattedBalances = result?.tokenBalances.map(balance => {
      return {
        contractAddress: balance.contractAddress,
        tokenBalance: parseInt(balance.tokenBalance, 16),
      };
    });
    setLoading(false);
    setBalances(formattedBalances as any);
  }, [address]);

  return {
    loading,
    balances,
  };
}
