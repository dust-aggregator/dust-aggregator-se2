import { readLocalnetAddresses } from "./zetachainUtils";
import { Network as AlchemyNetwork } from "alchemy-sdk";
import { zeroAddress } from "viem";
import { base, bsc, polygon } from "viem/chains";
import { Network } from "~~/lib/types";
import baseSVG from "~~/public/base.svg";
import bnbSVG from "~~/public/bnb.svg";
import dustSVG from "~~/public/logo2.svg";
import polSVG from "~~/public/pol.svg";

export const networks = [
  { key: "Ethereum", alchemyEnum: AlchemyNetwork.ETH_MAINNET, chainId: 1 },
  { key: "Polygon", alchemyEnum: AlchemyNetwork.MATIC_MAINNET, chainId: 137 },
  { key: "Binance", alchemyEnum: AlchemyNetwork.BNB_MAINNET, chainId: 56 },
  { key: "Base", alchemyEnum: AlchemyNetwork.BASE_MAINNET, chainId: 8453 },
  // { key: "Optimism", alchemyEnum: AlchemyNetwork.OPT_MAINNET, chainId: 10 },
];

export const PERMIT2_BASE_SEPOLIA = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export const SUPPORTED_INPUT_NETWORKS: Network[] = [
  {
    ...polygon,
    contractAddress: "0xC4b1221701ED9EeCbA01d5f52D60Cb95a9d492a2",
    zrc20Address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501",
    alchemyName: "polygon-mainnet",
    wNativeAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    numBlocksForConfirmation: 300,
    blockTime: 2.1,
    logo: polSVG,
  },
  {
    ...base,
    contractAddress: "0x2dB3bF70B10007cDC1b33eB2Fcf7dfB876c2A981",
    zrc20Address: "0x1de70f3e971B62A0707dA18100392af14f7fB677",
    alchemyName: "base-mainnet",
    wNativeAddress: "0x4200000000000000000000000000000000000006",
    numBlocksForConfirmation: 300,
    blockTime: 2,
    logo: baseSVG,
  },
  {
    ...bsc,
    contractAddress: "0x04b869e9e9b557314935085ec8213662AfE7c956",
    zrc20Address: "0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb",
    alchemyName: "bnb-mainnet",
    wNativeAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    numBlocksForConfirmation: 20,
    blockTime: 3,
    logo: bnbSVG,
  },
];

export const BitcoinNetwork = {
  name: "Bitcoin",
  id: "bitcoin",
  zrc20Address: "0x13A0c5930C028511Dc02665E7285134B6d11A5f4",
  numBlocksForConfirmation: 3,
};

export const SUPPORTED_OUTPUT_NETWORKS_BY_ECOSYSTEM = [
  {
    ecosystem: "Ethereum",
    networks: SUPPORTED_INPUT_NETWORKS,
  },
  {
    ecosystem: "Bitcoin",
    networks: [BitcoinNetwork],
  },
];

export const UNIVERSAL_DAPP_ADDRESS = "0x78357ACa2F46b0aC0783368d17CA9cEc7d8aBCE6";

export const GAS_LIMIT_BY_TOKEN_TYPE = {
  native: 100000,
  wNative: 130000,
  erc20: 250000,
};

export const WRAPPED_NATIVE_TOKENS = SUPPORTED_INPUT_NETWORKS.map(network => network.wNativeAddress);
