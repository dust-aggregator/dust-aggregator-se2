import { quoterV2Bytecode } from "./constants";
import { TokenSwap } from "./types";
import { PERMIT2_ADDRESS, SignatureTransfer } from "@uniswap/permit2-sdk";
import { simulateContract } from "@wagmi/core";
import { createConfig, http } from "@wagmi/core";
import { baseSepolia, mainnet, sepolia } from "@wagmi/core/chains";
import { AbiCoder, ethers } from "ethers";
import { PublicClient, concatHex, encodeAbiParameters, encodeFunctionData, pad, parseAbi } from "viem";

type AddressData = {
  chain: string;
  type: string;
  address: string;
};

const CHAIN_NAME_TO_ID: { [key: string]: number } = {
  ethereum: 31337,
  zetachain: 4,
};

const readLocalnetAddresses = (chain: string, type: string) => {
  // const filePath = path.join(__dirname, "../../foundry/localnet.json");

  // let data: LocalnetData = { addresses: [], pid: 0 };

  // // Read existing data if the file exists
  // if (fs.existsSync(filePath)) {
  //   try {
  //     const fileContent = fs.readFileSync(filePath, "utf-8");
  //     data = JSON.parse(fileContent) as LocalnetData;
  //   } catch (error) {
  //     console.error("Error reading or parsing the JSON file:", error);
  //     throw new Error("Failed to read the deployment data.");
  //   }
  // }

  return "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
};

const encodeDestinationPayload = (recipient: string, outputToken: string, minAmount): string => {
  return encodeFunctionData({
    abi: [
      {
        name: "ReceiveTokens",
        type: "function",
        inputs: [
          { name: "outputToken", type: "address" },
          { name: "recipient", type: "address" },
          { name: "minAmount", type: "uint256" },
        ],
        outputs: [],
      },
    ],
    functionName: "ReceiveTokens",
    args: [outputToken, recipient, minAmount],
  });
};

const encodeZetachainPayload = (
  targetChainToken: string,
  gasLimit: bigint,
  targetChainCounterparty: `0x${string}`,
  recipient: `0x${string}`,
  outputToken: `0x${string}`,
  minAmount: bigint,
  isBitcoin: boolean,
) => {
  const destinationPayload = isBitcoin ? "0x" : encodeDestinationPayload(recipient, outputToken, minAmount);

  const params = {
    targetChainToken,
    gasLimit,
    minAmount,
    originalSender: recipient,
    targetChainCounterparty: concatHex([pad(targetChainCounterparty, { size: 20 })]),
    destinationPayload,
  };

  const encodedParams = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { name: "targetChainToken", type: "address" },
          { name: "gasLimit", type: "uint256" },
          { name: "minAmount", type: "uint256" },
          { name: "originalSender", type: "address" },
          { name: "targetChainCounterparty", type: "bytes" },
          { name: "destinationPayload", type: "bytes" },
        ],
      },
    ],
    [params],
  );

  return encodedParams;
};

const preparePermitData = async (chainId: number, swaps: TokenSwap[], spender: string) => {
  const nonce = Math.floor(Math.random() * 1e15); // 1 quadrillion potential nonces
  const deadline = calculateEndTime(30 * 60 * 1000); // 30 minute sig deadline

  // Create the permit object for batched transfers
  const permit = {
    deadline: deadline,
    nonce: nonce,
    permitted: swaps.map(s => {
      return { amount: s.amount, token: s.token };
    }),
    spender: spender,
  };

  // Generate the permit return data & sign it
  const { domain, types, values } = SignatureTransfer.getPermitData(permit, PERMIT2_ADDRESS, chainId);

  const domainAny: any = domain;
  return { domain: domainAny, types, values, deadline, nonce };
};

const calculateEndTime = (duration: number) => {
  return Math.floor((Date.now() + duration) / 1000);
};

async function getUniswapV3EstimatedAmountOut(
  provider: ethers.providers.BaseProvider,
  quoterAddress: string, // Uniswap V3 Quoter address
  tokenIn: string,
  tokenOut: string,
  amountIn: ethers.BigNumber,
  slippageBPS: number,
) {
  const quoterAbi = [
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)",
  ];

  const abi = [
    "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  ];

  // Initialize the Quoter contract
  const quoterContract = new ethers.Contract(quoterAddress, abi, provider);

  // console.log(quoterContract);
  // console.log(provider);
  // console.log(quoterAddress);
  // console.log(tokenIn);
  // console.log(tokenOut);
  // console.log(amountIn);
  // console.log(slippageBPS);

  try {
    const amountOut: ethers.BigNumber = await quoterContract.quoteExactInputSingle([
      tokenIn,
      tokenOut,
      String(amountIn),
      550000,
      0, // sqrtPriceLimitX96, set to 0 for no limit
    ]);

    // ["0x5dEaC602762362FE5f135FA5904351916053cF70","0x4200000000000000000000000000000000000006","1000000000000000000",3000,0]

    // 0xc6a5026a0000000000000000000000005deac602762362fe5f135fa5904351916053cf7000000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000bb80000000000000000000000000000000000000000000000000000000000000000

    const slippageMultiplier = 10000 - slippageBPS; // 10000 represents 100%
    const amountOutMinimum = amountOut.mul(slippageMultiplier).div(10000);
    return amountOutMinimum;
  } catch (error) {
    console.error("Error getting estimated amount out:", error);
    throw error;
  }
}

export {
  readLocalnetAddresses,
  encodeDestinationPayload,
  encodeZetachainPayload,
  preparePermitData,
  getUniswapV3EstimatedAmountOut,
};

// // async function getUniswapV3EstimatedAmountOut(
// //   config,
// //   quoterAddress: string, // Uniswap V3 Quoter address
// //   tokenIn: string,
// //   tokenOut: string,
// //   amountIn: bigint,
//   slippageBPS: number,
// // ) {
// //   const quoterAbi = parseAbi([
// //     "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
// //   ]);

// //   try {
// //     const params = {
// //       tokenIn,
// //       tokenOut,
// //       amountIn, // Replace with the amountIn value (e.g., 1e6 for 1 USDC)
// //       fee: 300,
// //       sqrtPriceLimitX96: BigInt(0), // Replace with your desired sqrtPriceLimitX96 or 0 for no limit
// //     };
// //     const abi = parseAbi([
// //       "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
// //     ]);

// //     const result = await simulateContract(config, {
// //       abi,
// //       address: quoterAddress,
// //       functionName: "quoteExactInputSingle",
// //       args: [params],
// //     });

// //     console.log("result", result);

// //     // const amountOut = await client.call({
// //     //   code: quoterV2Bytecode,
// //     //   address: quoterAddress,
// //     //   args: [params],
// //     //   data: encodeFunctionData({
// //     //     abi,
// //     //     functionName: "quoteExactInputSingle",
// //     //   }),
// //     // });
// //     const amountOut = BigInt(4);

// //     const slippageMultiplier = 10000 - slippageBPS; // 10000 represents 100%
// //     const amountOutMinimum = (amountOut * BigInt(slippageMultiplier)) / BigInt(10000);
// //     return amountOutMinimum;
// //   } catch (error) {
// //     console.error("Error getting estimated amount out:", error);
// //     throw error;
// //   }
// // }

// // const abi = [
// //   {
// //     inputs: [
// //       { internalType: "address", name: "_factory", type: "address" },
// //       { internalType: "address", name: "_WETH9", type: "address" },
// //     ],
// //     stateMutability: "nonpayable",
// //     type: "constructor",
// //   },
// //   {
// //     inputs: [],
// //     name: "WETH9",
// //     outputs: [{ internalType: "address", name: "", type: "address" }],
// //     stateMutability: "view",
// //     type: "function",
// //   },
// //   {
// //     inputs: [],
// //     name: "factory",
// //     outputs: [{ internalType: "address", name: "", type: "address" }],
// //     stateMutability: "view",
// //     type: "function",
// //   },
// //   {
// //     inputs: [
// //       { internalType: "bytes", name: "path", type: "bytes" },
// //       { internalType: "uint256", name: "amountIn", type: "uint256" },
// //     ],
// //     name: "quoteExactInput",
// //     outputs: [
// //       { internalType: "uint256", name: "amountOut", type: "uint256" },
// //       { internalType: "uint160[]", name: "sqrtPriceX96AfterList", type: "uint160[]" },
// //       { internalType: "uint32[]", name: "initializedTicksCrossedList", type: "uint32[]" },
// //       { internalType: "uint256", name: "gasEstimate", type: "uint256" },
// //     ],
// //     stateMutability: "nonpayable",
// //     type: "function",
// //   },
// //   {
// //     inputs: [
// //       {
// //         components: [
// //           { internalType: "address", name: "tokenIn", type: "address" },
// //           { internalType: "address", name: "tokenOut", type: "address" },
// //           { internalType: "uint256", name: "amountIn", type: "uint256" },
// //           { internalType: "uint24", name: "fee", type: "uint24" },
// //           { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
// //         ],
// //         internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
// //         name: "params",
// //         type: "tuple",
// //       },
// //     ],
// //     name: "quoteExactInputSingle",
// //     outputs: [
// //       { internalType: "uint256", name: "amountOut", type: "uint256" },
// //       { internalType: "uint160", name: "sqrtPriceX96After", type: "uint160" },
// //       { internalType: "uint32", name: "initializedTicksCrossed", type: "uint32" },
// //       { internalType: "uint256", name: "gasEstimate", type: "uint256" },
// //     ],
// //     stateMutability: "nonpayable",
// //     type: "function",
// //   },
// //   {
// //     inputs: [
// //       { internalType: "bytes", name: "path", type: "bytes" },
// //       { internalType: "uint256", name: "amountOut", type: "uint256" },
// //     ],
// //     name: "quoteExactOutput",
// //     outputs: [
// //       { internalType: "uint256", name: "amountIn", type: "uint256" },
// //       { internalType: "uint160[]", name: "sqrtPriceX96AfterList", type: "uint160[]" },
// //       { internalType: "uint32[]", name: "initializedTicksCrossedList", type: "uint32[]" },
// //       { internalType: "uint256", name: "gasEstimate", type: "uint256" },
// //     ],
// //     stateMutability: "nonpayable",
// //     type: "function",
// //   },
// //   {
// //     inputs: [
// //       {
// //         components: [
// //           { internalType: "address", name: "tokenIn", type: "address" },
// //           { internalType: "address", name: "tokenOut", type: "address" },
// //           { internalType: "uint256", name: "amount", type: "uint256" },
// //           { internalType: "uint24", name: "fee", type: "uint24" },
// //           { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
// //         ],
// //         internalType: "struct IQuoterV2.QuoteExactOutputSingleParams",
// //         name: "params",
// //         type: "tuple",
// //       },
// //     ],
// //     name: "quoteExactOutputSingle",
// //     outputs: [
// //       { internalType: "uint256", name: "amountIn", type: "uint256" },
// //       { internalType: "uint160", name: "sqrtPriceX96After", type: "uint160" },
// //       { internalType: "uint32", name: "initializedTicksCrossed", type: "uint32" },
// //       { internalType: "uint256", name: "gasEstimate", type: "uint256" },
// //     ],
// //     stateMutability: "nonpayable",
// //     type: "function",
// //   },
// //   {
// //     inputs: [
// //       { internalType: "int256", name: "amount0Delta", type: "int256" },
// //       { internalType: "int256", name: "amount1Delta", type: "int256" },
// //       { internalType: "bytes", name: "path", type: "bytes" },
// //     ],
// //     name: "uniswapV3SwapCallback",
// //     outputs: [],
// //     stateMutability: "view",
// //     type: "function",
// //   },
// // ];
