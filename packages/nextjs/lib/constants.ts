import { readLocalnetAddresses } from "./zetachainUtils";
import { Network as AlchemyNetwork } from "alchemy-sdk";
import { zeroAddress } from "viem";
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

export const SUPPORTED_NETWORKS: Network[] = [
  {
    ...polygon,
    contractAddress: "0xC4b1221701ED9EeCbA01d5f52D60Cb95a9d492a2",
    zrc20Address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501",
    alchemyName: "polygon-mainnet",
    wNativeAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  {
    ...base,
    contractAddress: "0x2dB3bF70B10007cDC1b33eB2Fcf7dfB876c2A981",
    zrc20Address: "0x1de70f3e971B62A0707dA18100392af14f7fB677",
    alchemyName: "base-mainnet",
    wNativeAddress: "0x4200000000000000000000000000000000000006",
  },
];

const GAS_LIMIT_BY_TOKEN_TYPE = {
  native: 75000,
  wNative: 120000,
  erc20: 250000,
};

const WRAPPED_NATIVE_TOKENS = SUPPORTED_NETWORKS.map(network => network.wNativeAddress);

export const getGasLimitByOutputToken = (address: string): bigint => {
  if (address === zeroAddress) return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.native);
  if (WRAPPED_NATIVE_TOKENS.includes(address)) return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.wNative);
  return BigInt(GAS_LIMIT_BY_TOKEN_TYPE.erc20);
};
