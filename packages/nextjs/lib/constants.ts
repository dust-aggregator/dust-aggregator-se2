import { readLocalnetAddresses } from "./zetachainUtils";
import { Network as AlchemyNetwork } from "alchemy-sdk";
import { base, polygon } from "viem/chains";
import { Network } from "~~/lib/types";

export const networks = [
  { key: "Ethereum", alchemyEnum: AlchemyNetwork.ETH_MAINNET, chainId: 1 },
  { key: "Matic", alchemyEnum: AlchemyNetwork.MATIC_MAINNET, chainId: 137 },
  { key: "Binance", alchemyEnum: AlchemyNetwork.BNB_MAINNET, chainId: 56 },
  { key: "Base", alchemyEnum: AlchemyNetwork.BASE_MAINNET, chainId: 8453 },
  { key: "Optimism", alchemyEnum: AlchemyNetwork.OPT_MAINNET, chainId: 10 },
];

export const PERMIT2_BASE_SEPOLIA = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

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
    id: 97,
    value: "tBNB",
    label: "Binance Smart Chain Testnet",
    enabled: true,
    rpc: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    contractAddress: "0x03385697B62270019402A3fA5e538F6d8B52e4da",
    zrc20Address: "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891",
    nativeToken: {
      name: "BNB",
      symbol: "tBNB",
      decimals: 18,
      balance: 0,
      address: "0x0000000000000000000000000000000000000000",
    },
  },
];

export const ADDRESSES_BY_CHAIN_ID = {
  137: {
    EvmDustTokens: "0xC4b1221701ED9EeCbA01d5f52D60Cb95a9d492a2",
  },
  8453: {
    EvmDustTokens: "0x2dB3bF70B10007cDC1b33eB2Fcf7dfB876c2A981",
  },
};

export const SUPPORTED_NETWORKS: Network[] = [
  {
    ...polygon,
    contractAddress: "0xC4b1221701ED9EeCbA01d5f52D60Cb95a9d492a2",
    zrc20Address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501",
    alchemyName: "polygon-mainnet",
  },
  {
    ...base,
    contractAddress: "0x2dB3bF70B10007cDC1b33eB2Fcf7dfB876c2A981",
    zrc20Address: "0x1de70f3e971B62A0707dA18100392af14f7fB677",
    alchemyName: "base-mainnet",
  },
];
