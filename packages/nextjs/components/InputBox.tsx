import { useEffect, useState } from "react";
import Image from "next/image";
import CategorySelect from "./CategorySelect";
import CategorySelectInputBox from "./CategorySelectInputBox";
import UserActionBoxContainer from "./UserActionBoxContainer";
import UserActionBoxContainer2 from "./UserActionBoxContainer2";
import { AllTokensBalances } from "./token-balances/AllTokensBalances";
import { AllTokensPrices } from "./token-prices/AllTokensPrices";
import { useTokenBalancesWithMetadataByNetwork } from "~~/hooks/dust/useTokenBalancesWithMetadataByNetwork";
import { networks } from "~~/lib/constants";

const networkOptions = [
  {
    section: "Ethereum",
    options: [
      { value: "base", label: "Base", selected: true },
      { value: "bnb", label: "BNB", selected: false },
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

  // Update disabled property function
  const updateSpecificOption = (sectionKey: string, optionValue: string, selected: boolean) => {
    console.log("Updating...");
    console.log(sectionKey);
    console.log(optionValue);
    console.log(selected);

    setNetworkOptions2(prevOptions =>
      prevOptions.map(section =>
        section.section === sectionKey
          ? {
              ...section,
              options: section.options.map((option: any) =>
                option.value === optionValue ? { ...option, selected } : option,
              ),
            }
          : section,
      ),
    );
  };

  const filteredNetworkOptions = networkOptions2
    .map(network => ({
      ...network,
      options: network.options.filter((option: any) => option.selected),
    }))
    .filter(network => network.options.length > 0);

  const comps = filteredNetworkOptions.map((e: any, index: number) => {
    return (
      <div key={"sjf" + index} className="flex flex-col gap-1">
        <p className="m-0 text-xl text-bold">{e.section}</p>
        {e.options.map((option: any, index: number) => {
          return (
            <div
              className={`min-h-0 h-8 py-1 px-2 leading-tight shadow-inner-xl flex items-center w-full text-xs bg-[#3C3731] justify-between`}
              key={"sndn" + index}
            >
              <div className="flex gap-1">
                <button
                  className="m-0"
                  onClick={() => {
                    updateSpecificOption(e.section, option.value, !option.selected);
                  }}
                >
                  <Image src={"/Vector.png"} alt="" width={"12"} height={"12"} className="h-4" />
                </button>
                <p className="m-0">{option.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  });

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
            selected: false,
          };
        }),
      });
    }

    setNetworkOptions2(networkOptions2);
  }, [allTokensFromAlchemy.length]);

  return (
    <UserActionBoxContainer>
      <p className="font-bold m-0">DUST Threshold</p>
      <div className="flex gap-2">
        <input
          className="input rounded-lg p-1 bg-btn1 shadow-inner-xl p-2 h-8"
          placeholder={""}
          name={"dustThreshold"}
          type="number"
          value={dustThresholdValue}
          onChange={handleChange}
        />
        <button className="px-4 hover:brightness-50 bg-[url('/button1.png')] bg-no-repeat bg-center bg-cover">
          <p className="pb-2 m-0">Save</p>
        </button>
      </div>
      <p className="font-bold m-0">Input</p>

      <div className="flex gap-2">
        <CategorySelectInputBox
          title="Select tokens"
          options={networkOptions2}
          // onSelect={updateSpecificOption}
          onChange={updateSpecificOption}
        />
      </div>
      <div className="p-[0.4px] bg-[#FFFFFF] rounded my-3"></div>
      <div className="overflow-scroll h-40">
        {comps}
        {/* <AllTokensPrices /> */}
        {/* <AllTokensBalances address="0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf" /> */}
      </div>
    </UserActionBoxContainer>
  );
};

export default InputBox;
