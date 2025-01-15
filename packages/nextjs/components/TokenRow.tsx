import { useState } from "react";
import Image from "next/image";
import { formatDecimal } from "~~/lib/utils";

export const TokenRow = ({ token, updateSpecificOption, networkName }) => {
  const [rawVal, setRawVal] = useState(token.amountToDust);
  return (
    <div
      className={`px-4 h-10 leading-tight flex items-center w-full text-xs justify-between rounded-lg bg-[#FFFFFF]/15 border border-[#d1d1e0]/10`}
      key={token.address}
    >
      <div className="flex gap-2">
        <button
          className="m-0"
          onClick={() => {
            updateSpecificOption(networkName, token.value, !token.selected, token.amountToDust);
          }}
        >
          <Image src={"/Vector.png"} alt="" width={"8"} height={"8"} />
        </button>
        <p className="m-0 text-xs opacity-70">
          {networkName} / {token.label}
        </p>
      </div>

      <div className="flex gap-2 h-full items-center py-1">
        <p className="text-xs opacity-70">
          Balance: {formatDecimal(token.tokenBalance)} {token.symbol}
        </p>

        <input
          type="number"
          min={0}
          max={token.tokenBalance}
          value={rawVal}
          onBlur={() => {
            // Parse the input value as a float
            const enteredValue = parseFloat(rawVal || 0);
            // Ensure it does not exceed tokenBalance
            const value = Math.min(isNaN(enteredValue) ? 0 : enteredValue, token.tokenBalance);
            updateSpecificOption(networkName, token.value, token.selected, value);
            setRawVal(enteredValue);
          }}
          onChange={(e: any) => {
            const inputValue = e.target.value;
            const parsedValue = parseFloat(inputValue);
            if (!isNaN(parsedValue)) {
              setRawVal(parsedValue);
            } else if (inputValue === "") {
              setRawVal("");
            }
          }}
          className="w-[70px] text-xs h-full px-1 rounded bg-[#FFFFFF]/15 border border-[#d1d1e0]/10"
        />

        <button
          className="h-full px-2 text-xs rounded-lg bg-[#FFFFFF]/15 border border-[#d1d1e0]/10"
          onClick={() => {
            updateSpecificOption(networkName, token.value, token.selected, token.tokenBalance);
            setRawVal(token.tokenBalance);
          }}
        >
          Max
        </button>
      </div>

      {/* <div className="flex items-center justify-center gap-1 text-xs">
      <p>$</p>
      <p>{token.usdValue?.toFixed(2)}</p>
    </div> */}
    </div>
  );
};
