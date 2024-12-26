import { Token } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import { QuoteSwapData } from "~~/types/quote-swap-data";

function encodePath(tokenPath: any, pools: any, protocol: string) {
  if (protocol === "V3") {
    const types = [];
    const values = [];

    for (let i = 0; i < tokenPath.length; i++) {
      types.push("address");
      values.push(tokenPath[i].address);

      if (i < pools.length) {
        types.push("uint24");
        values.push(pools[i].fee);
      }
    }

    return ethers.utils.solidityPack(types, values);
  } else {
    const types = [];
    const values = [];

    for (let i = 0; i < tokenPath.length; i++) {
      types.push("address");
      values.push(tokenPath[i].address);
    }

    return ethers.utils.solidityPack(types, values);
  }
}

export const getExpressQuote = async (
  _chainId: number,
  _walletAddress: string,
  _tokenIn: Token,
  _tokenOut: Token,
  _amountIn: string,
): Promise<QuoteSwapData> => {
  if (!process.env.NEXT_PUBLIC_QUOTER_API_KEY) {
    throw new Error("API key is not defined");
  }

  const reqBody = {
    chainId: _chainId,
    walletAddress: _walletAddress,
    tokenIn: _tokenIn,
    tokenOut: _tokenOut,
    amountIn: _amountIn,
  };

  const quoteSwapData: QuoteSwapData = {
    estimatedOutput: 0,
    quoteError: false,
    estimatedGasUsedUSD: BigInt(0),
    swapInput: {
      isV3: false,
      path: "0x",
      amount: BigInt(0),
      minAmountOut: 0,
    },
  };

  const res = await fetch("http://localhost:8000/quote", {
    // const res = await fetch("https://express-quoter-production.up.railway.app/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_QUOTER_API_KEY,
    },
    body: JSON.stringify(reqBody),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(data);

    quoteSwapData.estimatedOutput = Number(data.readableAmount) * 0.99;
    quoteSwapData.estimatedGasUsedUSD = data.route.estimatedGasUsedUSD;

    const firstRoute = data.route.route[0];
    const encodedPath = encodePath(firstRoute.tokenPath, firstRoute.route.pools, firstRoute.protocol);

    quoteSwapData.swapInput = {
      isV3: firstRoute.protocol === "V3",
      path: encodedPath,
      amount: ethers.utils.parseUnits(Number(_amountIn).toFixed(_tokenIn.decimals), _tokenIn.decimals),
      minAmountOut: Number(data.readableAmount) * 0.99,
    };
  } else {
    quoteSwapData.quoteError = true;
  }

  return quoteSwapData;
};
