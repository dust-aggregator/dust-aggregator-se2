import { use, useEffect, useState } from "react";
import Image from "next/image";
import CategorySelect from "./CategorySelect";
import CategorySelectInputBox from "./CategorySelectInputBox";
import UserActionBoxContainer from "./UserActionBoxContainer";
import UserActionBoxContainer2 from "./UserActionBoxContainer2";
import { RainbowKitCustomConnectButton } from "./scaffold-eth/RainbowKitCustomConnectButton";
import { AllTokensBalances } from "./token-balances/AllTokensBalances";
import { AllTokensPrices } from "./token-prices/AllTokensPrices";
import { useAccount } from "wagmi";
import { useTokenBalancesWithMetadataByNetwork } from "~~/hooks/dust/useTokenBalancesWithMetadataByNetwork";
import { useTokenPricesUniswap } from "~~/hooks/dust/useTokenPricesUniswap";
import { SUPPORTED_INPUT_NETWORKS, networks } from "~~/lib/constants";
import { SelectedToken } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import TokenSelector from "./TokenSelector";

const InputBox = () => {
  const [dustThresholdValue, setDustThresholdValue] = useState<number>(0);
  const { inputTokens } = useGlobalState();

  function handleChange(e: any) {
    setDustThresholdValue(e.target.value);
  }

  // const { allObjects: allTokensFromAlchemy, isLoading } = useTokenBalancesWithMetadataByNetwork(
  //   "0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf",
  //   networks.map(({ alchemyEnum }) => alchemyEnum),
  // );

  const [walletConnectBalances, setWalletConnectBalances] = useState<any[]>([]);

  const connectedAccount = useAccount();

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  useEffect(() => {
    async function fn() {
      if (connectedAccount?.address === undefined) return;

      setIsLoadingTokens(true);
      const apiResponse = await fetch("/api/walletconnect/fetch-wallet-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: connectedAccount.address,
        }),
      });

      if (apiResponse.ok) {
        const apiResponseJson = await apiResponse.json();

        setWalletConnectBalances(apiResponseJson.balances);
        console.log(apiResponseJson.balances);
      }

      setIsLoadingTokens(false);
    }
    fn();
  }, [connectedAccount?.address]);
  // const { price } = useTokenPricesUniswap();

  const [networkOptions2, setNetworkOptions2] = useState<any[]>([]);

  const setInputTokens = useGlobalState(({ setInputTokens }) => setInputTokens);

  // Update disabled property function
  const updateSpecificOption = (sectionKey: string, optionValue: string, selected: boolean, amountToDust: number) => {
    const updatedOptions: any[] = networkOptions2.map((section: any) =>
      section.section === sectionKey
        ? {
          ...section,
          options: section.options.map((option: any) =>
            option.value === optionValue ? { ...option, selected, amountToDust } : option,
          ),
        }
        : section,
    );

    const filteredTokens = updatedOptions
      .flatMap((section: any) => section.options)
      .filter((option: any) => {
        return option.selected === true;
      });

    const selectedInputTokens = filteredTokens.map((token: any, index: number) => {
      return {
        name: token.label,
        decimals: token.decimals,
        balance: token.tokenBalance,
        amount: token.amountToDust,
        address: token.address,
        symbol: token.symbol,
        usdValue: token.usdValue,
        hasPermit2Allowance: false,
      };
    });

    setInputTokens(selectedInputTokens);

    setNetworkOptions2(updatedOptions);
  };

  const filteredNetworkOptions = networkOptions2
    .map(network => ({
      ...network,
      options: network.options.filter((option: any) => option.selected),
    }))
    .filter(network => network.options.length > 0);

  function formatDecimal(input: string): string {
    const numberValue = parseFloat(input); // Convert the string to a number
    return numberValue % 1 === 0
      ? numberValue.toString() // Return as an integer if no decimal values
      : numberValue.toFixed(4).replace(/\.?0+$/, ""); // Format to 4 decimals, remove trailing zeros
  }

  const comps = filteredNetworkOptions.map((e: any, index: number) => {
    return (
      <div key={"sjf" + index} className="flex flex-col gap-2">
        {/* <p className="m-0 text-xl text-bold">{e.section}</p> */}
        {e.options.map((option: any, index: number) => {
          return (
            <div
              className={`px-4 h-10 leading-tight shadow-inner-xl flex items-center w-full text-xs justify-between rounded-lg border bg-[#514B44] shadow-inner shadow-[inset_0_1px_30px_rgba(0,0,0,1)]`}
              key={"sndn" + index}
            >
              <div className="flex gap-2">
                <button
                  className="m-0"
                  onClick={() => {
                    updateSpecificOption(e.section, option.value, !option.selected, option.amountToDust);
                  }}
                >
                  <Image src={"/Vector.png"} alt="" width={"8"} height={"8"} />
                </button>
                <p className="m-0 text-xs opacity-70">
                  {e.section} / {option.label}
                </p>
              </div>

              <div className="flex gap-2 h-full items-center py-1">
                <p className="text-xs opacity-70">
                  Balance: {formatDecimal(option.tokenBalance)} {option.symbol}
                </p>

                <input
                  type="number"
                  min={0}
                  value={Number(option.amountToDust).toFixed(6)}
                  onChange={(a: any) => {
                    updateSpecificOption(e.section, option.value, option.selected, a.target.value);
                  }}
                  className="w-[70px] text-xs h-full px-1 rounded border bg-[#3C3731] shadow-inner shadow-[inset_0_1px_13px_rgba(0,0,0,0.7)]"
                />

                <button className="h-full px-2 text-xs rounded-lg border bg-[#4C463F]">Max</button>
              </div>

              {/* <div className="flex items-center justify-center gap-1 text-xs">
                <p>$</p>
                <p>{option.usdValue?.toFixed(2)}</p>
              </div> */}
            </div>
          );
        })}
      </div>
    );
  });

  const compsShort = filteredNetworkOptions.map((e: any, index: number) => {
    return (
      <div key={"sjf" + index} className="flex flex-col gap-2">        
        {e.options.map((option: any, index: number) => {
          return (
            <div key={"sndn" + index}>
              <div
                className={`px-4 h-10 flex items-center w-full text-xs justify-between rounded-lg`}
              >
                <div className="flex gap-2">
                  <p className="m-0 text-xs ">
                    {e.section} / {option.label}
                  </p>
                </div>

                <div className="flex gap-2 h-full items-center py-1">
                  <div className="border-t border-gray-400 mx-2"></div>
                  <p className="text-xs opacity-70">
                    {formatDecimal(option.tokenBalance)} {option.symbol}
                  </p>                              
                </div>           
              </div>
              <hr className="border-gray-400 my-2" />
            </div>
          );
        })}
      </div>
    );
  });

  useEffect(() => {
    const networkOptions2: any[] = [];

    const filteredBalancesByUsdValue = walletConnectBalances.filter(token => token?.value <= dustThresholdValue);

    for (let i = 0; i < networks.length; i++) {
      // const networks = { chainId: 1};

      // const filteredTokens: any[] = [];

      // for (let j = 0; j < walletConnectBalances.length; j++) {
      //   if (walletConnectBalances[j]?.chainId?.replace("eip155:", "") === networks[i].chainId.toString) {
      //     filteredTokens.push(walletConnectBalances[j]);
      //   }
      // }
      const filteredTokens = filteredBalancesByUsdValue.filter(
        token => token?.chainId?.replace("eip155:", "") === networks[i].chainId.toString() && token?.address,
      );

      if (filteredTokens.length > 0) {
        const obj: any = {};
        obj.section = networks[i].key;
        obj.options = filteredTokens.map((e: any, index: number) => {
          return {
            value: "inputToken-" + index,
            label: e.name,
            disabled: false,
            tokenBalance: e.quantity.numeric,
            usdValue: e.value,
            decimals: e.quantity.decimals,
            selected: false,
            amountToDust: e.quantity.numeric,
            symbol: e.symbol,
            address: e.address?.split(":").pop(),
          };
        });

        networkOptions2.push(obj);
      }
    }

    //   if (networks[i].chainId === walletConnectBalances[i].chainId.replace("eip155:", "")) {
    //     const obj: any = {};
    //     obj.section = networks[i].key;

    //     const options:[] = [];

    //     for (let j = 0; j < walletConnectBalances.length; j++) {
    //       if (walletConnectBalances[j])
    //     }
    //     obj.options
    //   }

    // }

    // for (let i = 0; i < walletConnectBalances.length; i++) {

    //   const obj: any = {};
    //   obj.section = networks.find(network => network.chainId === walletConnectBalances[i].chainId.replace("eip155:", ""))?.key,;
    //   obj.options
    //   networkOptions2.push({
    //     section: networks.find(network => network.chainId === walletConnectBalances[i].chainId.replace("eip155:", ""))?.key,
    //     options: walletConnectBalances.map((e: any, index: number) => {
    //       return {
    //         value: "inputToken-" + index,
    //         label: e.name,
    //         disabled: false,
    //         tokenBalance: e.tokenBalance,
    //         decimals: e.decimals,
    //         selected: false,
    //       };
    //     }),
    //   });
    // }
    // for (let i = 0; i < allTokensFromAlchemy.length; i++) {
    //   networkOptions2.push({
    //     section: networks.find(network => network.alchemyEnum === allTokensFromAlchemy[i].name)?.key,
    //     options: allTokensFromAlchemy[i].tokenBalancesWithMetadata.map((e: any, index: number) => {
    //       return {
    //         value: "inputToken-" + index,
    //         label: e.name,
    //         disabled: false,
    //         tokenBalance: e.tokenBalance,
    //         decimals: e.decimals,
    //         selected: false,
    //       };
    //     }),
    //   });
    // }

    setNetworkOptions2(networkOptions2);
  }, [walletConnectBalances.length, dustThresholdValue]);

  let totalDustInUsd = 0;
  for (let i = 0; i < networkOptions2.length; i++) {
    for (let j = 0; j < networkOptions2[i].options.length; j++) {
      if (networkOptions2[i].options[j].selected) {
        totalDustInUsd += networkOptions2[i].options[j].usdValue;
      }
    }
  }

  const [inputNetwork, setInputNetworkLocal] = useState();

  const setInputNetwork = useGlobalState(({ setInputNetwork }) => setInputNetwork);

  useEffect(() => {
    let inputNetworkName = networkOptions2.find(item => item.options.some((option: any) => option.selected))?.section;
    if (inputNetworkName === "Matic") inputNetworkName = "Polygon";
    const inputNetwork = SUPPORTED_INPUT_NETWORKS.find(network => network.name === inputNetworkName);

    setInputNetwork(inputNetwork || null);
    setInputNetworkLocal(inputNetworkName);
  }, [networkOptions2, networkOptions2.length]);

  let updatedOptions2: any[] = [];
  if (inputNetwork === undefined) {
    updatedOptions2 = networkOptions2;
  } else {
    updatedOptions2 = networkOptions2.filter((option: any) => {
      return option.section === inputNetwork;
    });
  }

  return (
    <UserActionBoxContainer>
      {connectedAccount?.address ? (
        isLoadingTokens ? (
          <p>{"Loading Tokens..."}</p>
        ) : (
          <>
            <div className="font-bold m-0 flex items-center">DUST Threshold
              <div className="relative group inline-block ml-2">
                <InformationCircleIcon className="w-5 h-5" />
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-2 text-xs text-white bg-black rounded">
                  Dust threshold is the value limit you set to define small token balances (dust). For example, with a $5 threshold, any tokens worth less than $5 are considered dust and can be swapped.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative w-2/3">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  className="input rounded-lg p-1 bg-btn1 shadow-inner-xl p-2 h-8 pl-7 w-full"
                  placeholder={""}
                  name={"dustThreshold"}
                  type="number"
                  value={dustThresholdValue}
                  onChange={handleChange}
                />
              </div>
              <button className="px-4 rounded-lg hover:brightness-50 bg-[url('/button1.png')] bg-no-repeat bg-center bg-cover w-1/3 h-full text-xs font-black">
                <p className="pb-2 pt-1 m-0 font-montserrat">Save</p>
              </button>
            </div>
            <p className="font-bold m-0">Input</p>

            <TokenSelector _options={updatedOptions2} _updateSpecificOption={updateSpecificOption} _comps={comps} />

            {/* <div className="flex gap-2">
              <CategorySelectInputBox
                title="Select tokens"
                options={updatedOptions2}
                // onSelect={updateSpecificOption}
                onChange={updateSpecificOption}
              />
            </div> */}

            <div className="p-[0.4px] bg-[#FFFFFF] rounded my-3"></div>
            <div className="overflow-scroll h-40">
              {compsShort}
            {/* <AllTokensPrices /> */}
            {/* <AllTokensBalances address="0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf" /> */}
            </div>
            <div className="flex items-center justify-center gap-1">
              <p>Total ≈ </p>
              <p>$</p>
              <p>{totalDustInUsd?.toFixed(2)}</p>
            </div>
          </>
        )
      ) : (
        <div className="flex flex-col justify-center items-center">
          <RainbowKitCustomConnectButton />
        </div>
      )}
    </UserActionBoxContainer>
  );
};

export default InputBox;
