import { useEffect, useState } from "react";
import CategorySelect from "./CategorySelect";
import CategorySelectInputBox from "./CategorySelectInputBox";
import UserActionBoxContainer from "./UserActionBoxContainer";
import { AllTokensBalances } from "./token-balances/AllTokensBalances";
import { AllTokensPrices } from "./token-prices/AllTokensPrices";
import { Network } from "alchemy-sdk";
import { useTokenBalancesWithMetadataByNetwork } from "~~/hooks/dust/useTokenBalancesWithMetadataByNetwork";

const networks = [
  { key: "Ethereum", alchemyEnum: Network.ETH_MAINNET },
  { key: "Matic", alchemyEnum: Network.MATIC_MAINNET },
  { key: "Binance", alchemyEnum: Network.BNB_MAINNET },
  { key: "Base", alchemyEnum: Network.BASE_MAINNET },
];

const networkOptions = [
  {
    section: "Ethereum",
    options: [
      { value: "base", label: "Base" },
      { value: "bnb", label: "BNB" },
    ],
  },
  { section: "Solana", options: [{ value: "mainnet", label: "Solana Mainnet" }] },
];

const InputBox = () => {
  const [dustThresholdValue, setDustThresholdValue] = useState<number>(0);

  function handleChange(e: any) {
    setDustThresholdValue(e.target.value);
  }

  const { allObjects: allTokensFromAlchemy, isLoading } = useTokenBalancesWithMetadataByNetwork(
    "0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf",
    networks.map(({ alchemyEnum }) => alchemyEnum),
  );

  const [networkOptions2, setNetworkOptions2] = useState<any[]>([]);

  useEffect(() => {
    const networkOptions2: any[] = [];
    for (let i = 0; i < allTokensFromAlchemy.length; i++) {
      networkOptions2.push({
        section: networks.find(network => network.alchemyEnum === allTokensFromAlchemy[i].name)?.key,
        options: allTokensFromAlchemy[i].tokenBalancesWithMetadata.map((e: any, index: number) => {
          return {
            value: "inputToken-" + index,
            label: e.name,
            disabled: false,
            tokenBalance: e.tokenBalance,
            decimals: e.decimals,
          };
        }),
      });
    }

    setNetworkOptions2(networkOptions2);
    console.log(networkOptions2);
  }, [allTokensFromAlchemy.length]);

  console.log(allTokensFromAlchemy);

  console.log(networkOptions2);
  return (
    <UserActionBoxContainer>
      <p className="font-bold">DUST Threshold</p>
      <div className="flex gap-2">
        <input
          className="input rounded-lg p-1 bg-btn1 shadow-inner-xl p-2"
          placeholder={""}
          name={"dustThreshold"}
          type="number"
          value={dustThresholdValue}
          onChange={handleChange}
          // disabled={disabled}
          // autoComplete="off"
          // ref={inputReft}
          // onFocus={onFocus}
        />
        <button className="px-4 hover:brightness-50 bg-[url('/button1.png')] bg-no-repeat bg-center bg-cover">
          <p className="pb-2 m-0">Save</p>
        </button>
      </div>
      <p className="font-bold">Input</p>

      <div className="flex gap-2">
        <CategorySelectInputBox
          title="Select tokens"
          options={networkOptions2}
          // onChange={setSelectedNetwork}
          // selectedOption={selectedNetwork}
        />

        {/* <input
          className="input rounded-lg p-1 bg-btn1 shadow-inner-xl w-[125px]"
          placeholder={""}
          name={"dustThreshold"}
          // disabled={disabled}
          // autoComplete="off"
          // ref={inputReft}
          // onFocus={onFocus}
        /> */}
        <button className="px-6 hover:brightness-50 min-w-30 bg-[url('/button2.png')] bg-no-repeat bg-center bg-cover">
          {"Auto-select"}
        </button>
      </div>
      <div className="overflow-scroll h-32 p-4">
        {/* <AllTokensPrices /> */}
        {/* <AllTokensBalances address="0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf" /> */}
      </div>
    </UserActionBoxContainer>
  );
};

export default InputBox;
