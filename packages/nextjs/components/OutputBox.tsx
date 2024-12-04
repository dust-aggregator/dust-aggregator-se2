import { useState } from "react";
import CategorySelect from "./CategorySelect";
import UserActionBoxContainer from "./UserActionBoxContainer";

const networkOptions = [
  {
    ecosystem: "Ethereum",
    options: [
      { value: "base", label: "Base" },
      { value: "bnb", label: "BNB" },
    ],
  },
  { ecosystem: "Solana", options: [{ value: "mainnet", label: "Solana Mainnet" }] },
];

const OutputBox = () => {
  const [selectedNetwork, setSelectedNetwork] = useState();
  const [selectedToken, setSelectedToken] = useState();

  return (
    <UserActionBoxContainer>
      <h3 className="font-bold">Output</h3>
      <CategorySelect
        title="Select Network"
        options={networkOptions}
        onChange={setSelectedNetwork}
        selectedOption={selectedNetwork}
      />
      <div className="flex justify-center">
        <p className="text-[#9D9D9D] text-xs my-2">And</p>
      </div>
      <CategorySelect
        title="Select Token"
        options={networkOptions}
        onChange={setSelectedToken}
        selectedOption={selectedToken}
      />
    </UserActionBoxContainer>
  );
};

export default OutputBox;
