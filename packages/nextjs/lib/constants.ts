import { readLocalnetAddresses } from "./zetachainUtils";
import { Network as AlchemyNetwork } from "alchemy-sdk";
import { Network } from "~~/lib/types";

export const networks = [
  { key: "Ethereum", alchemyEnum: AlchemyNetwork.ETH_MAINNET, chainId: 1 },
  { key: "Matic", alchemyEnum: AlchemyNetwork.MATIC_MAINNET, chainId: 137 },
  { key: "Binance", alchemyEnum: AlchemyNetwork.BNB_MAINNET, chainId: 56 },
  { key: "Base", alchemyEnum: AlchemyNetwork.BASE_MAINNET, chainId: 8453 },
];

export const SUPPORTED_OUTPUT_NETWORKS = [
  {
    ecosystem: "Ethereum",
    options: [
      { value: "base", label: "Base" },
      { value: "bnb", label: "BNB" },
    ],
  },
  { ecosystem: "Solana", options: [{ value: "mainnet", label: "Solana Mainnet" }] },
];

const supportedNetworks: Network[] = [
  {
    id: 31337,
    value: "ethereum",
    label: "Ethereum",
    enabled: true,
    rpc: "http://localhost:8545",
    contractAddress: readLocalnetAddresses("ethereum", "EvmDustTokens"),
    zrc20Address: readLocalnetAddresses("zetachain", "ZRC-20 ETH on 5"),
    nativeToken: {
      name: "Ether (Native)",
      symbol: "ETH",
      decimals: 18,
      balance: 0,
      address: "0x0000000000000000000000000000000000000000",
    },
  },
  {
    id: 0,
    value: "binance",
    label: "Binance Smart Chain",
    enabled: false,
    rpc: "",
    contractAddress: "",
    zrc20Address: "",
    nativeToken: {
      name: "Ether (Native)",
      symbol: "ETH",
      decimals: 18,
      balance: 0,
      address: "0x0000000000000000000000000000000000000000",
    },
  },
];
