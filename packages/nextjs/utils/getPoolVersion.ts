import { ethers } from "ethers";
import { useGlobalState } from "~~/services/store/store";

// baseWETH = "0x4200000000000000000000000000000000000006";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const UNISWAP_V3_FACTORY_ADDRESS = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD";
const FACTORY_V3_ABI = ["function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"];

const FEES = [500, 3000, 10000];

const UNISWAP_V3_FACTORY_ADDRESSES = [
  { chainId: 137, address: "0x1F98431c8aD98523631AE4a59f267346ea31F984" },
  { chainId: 56, address: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865" }, // pancakeswap
  { chainId: 8453, address: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" },
];

const WRAPPED_NATIVE_TOKENS = [
  { chainId: 137, address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" },
  { chainId: 56, address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
  { chainId: 8453, address: "0x4200000000000000000000000000000000000006" },
];

export const checkUniswapV3Pool = async (tokenA: string, tokenB: string) => {
  const factory = new ethers.Contract(UNISWAP_V3_FACTORY_ADDRESS, FACTORY_V3_ABI, provider);
  for (const fee of FEES) {
    console.log(`Looking for pool beteen "BUIDL / ETH`)
    const poolAddress = await factory.getPool(tokenA, tokenB, fee);
    if (poolAddress !== ethers.constants.AddressZero) {
      return { poolAddress, fee };
    }
  }
  return null;
};

// const UNISWAP_V2_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
// const UNISWAP_V3_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
// const FACTORY_V2_ABI = [
//     "function getPair(address tokenA, address tokenB) external view returns (address)"
// ];
// const FACTORY_V3_ABI = [
//     "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
// ];

// const COMMON_TOKENS = [
//     { name: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" }, // Mainnet
//     { name: "USDC", address: "0xA0b86991C6218B36c1D19D4a2e9Eb0cE3606eB48" }, // Mainnet
//     { name: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" }  // Mainnet
// ];

// const V3_FEES = [500, 3000, 10000]; // 0.05%, 0.3%, 1%

// async function findUniswapPool(provider, tokenA) {
//     const v2Factory = new ethers.Contract(UNISWAP_V2_FACTORY_ADDRESS, FACTORY_V2_ABI, provider);
//     const v3Factory = new ethers.Contract(UNISWAP_V3_FACTORY_ADDRESS, FACTORY_V3_ABI, provider);

//     // Check Uniswap V3 Pools
//     for (const { name, address: tokenB } of COMMON_TOKENS) {
//         for (const fee of V3_FEES) {
//             const poolAddress = await v3Factory.getPool(tokenA, tokenB, fee);
//             if (poolAddress !== ethers.constants.AddressZero) {
//                 return { version: "V3", poolAddress, fee, tokenB: name };
//             }
//         }
//     }

//     // Check Uniswap V2 Pools
//     for (const { name, address: tokenB } of COMMON_TOKENS) {
//         const pairAddress = await v2Factory.getPair(tokenA, tokenB);
//         if (pairAddress !== ethers.constants.AddressZero) {
//             return { version: "V2", pairAddress, tokenB: name };
//         }
//     }

//     // No pool found
//     return { version: null, poolAddress: null, tokenB: null };
// }

// // Example usage
// (async () => {
//     const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
//     const tokenA = "0xYourTokenAddress"; // Replace with your token address

//     const result = await findUniswapPool(provider, tokenA);
//     if (result.version) {
//         console.log(`Pool encontrada en Uniswap ${result.version}:`);
//         console.log(`- Dirección: ${result.poolAddress}`);
//         console.log(`- TokenB: ${result.tokenB}`);
//         if (result.version === "V3") {
//             console.log(`- Fee: ${result.fee / 10000}%`);
//         }
//     } else {
//         console.log("No se encontró una pool para este token.");
//     }
// })();

// -------------------------------------------------------------------------

// All valid Uniswap V3 pools must implement the view functions token0 and token1.

// Call those functions on the address in question, and use the addresses returned by those functions to call getPool on the canonical UniswapV3Factory. The address returned by UniswapV3Factory.getPool should match the address of the contract in question. If not, you can be sure that the contract address was NOT deployed using the canonical UniswapV3Factory and thus is not a valid pool.

// The easiest implementation would be to simply check for the destination contract's factory parameter, since the single common denominator of all Uniswap V3 pools is that they all have the same Uniswap V3 factory address as follows:

// assert(UniswapV3Pool(destination).factory == 0x1F98431c8aD98523631AE4a59f267346ea31F984);
// But then, anyone would be able to deploy a mock contract containing that data. Just like anyone would be able to deploy a contract that implements the Uniswap V3 pair interface.

// const factory = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
// const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

// const key = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([ "address", "address", "uint24"], [token0, token1, fee]));
// const keccack = ethers.utils.solidityKeccak256(["bytes", "address", "bytes", "bytes32"], ["0xff", factory, key, POOL_INIT_CODE_HASH]);
// console.log(ethers.utils.hexDataSlice(keccak, 12));

// //keccak is 64 hex digit/nibbles == 32 bytes -> take rightmost 20 bytes=40 nibbles -> start at 64-40=24nibbles or 12 bytes
// const theoretical_address = ethers.utils.hexDataSlice(keccak, 12);