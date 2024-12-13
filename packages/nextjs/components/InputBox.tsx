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
import { networks } from "~~/lib/constants";
import { SelectedToken } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";

const InputBox = () => {
  const [dustThresholdValue, setDustThresholdValue] = useState<number>(5);
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

    // console.log(updatedOptions);

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
                    updateSpecificOption(e.section, option.value, !option.selected, option.amountToDust);
                  }}
                >
                  <Image src={"/Vector.png"} alt="" width={"12"} height={"12"} className="h-4" />
                </button>
                <p className="m-0 text-xs">{option.label}</p>
              </div>

              <input
                type="number"
                value={Number(option.amountToDust).toFixed(6)}
                onChange={(a: any) => {
                  updateSpecificOption(e.section, option.value, option.selected, a.target.value);
                }}
                className="w-10"
              />
              <div className="flex items-center justify-center gap-1">
                <p className="text-xs">{formatDecimal(option.tokenBalance)}</p>
                <Image src={"/particles.png"} alt="" width={"12"} height={"12"} className="h-4" />
              </div>

              <div className="flex items-center justify-center gap-1 text-xs">
                <p>$</p>
                <p>{option.usdValue?.toFixed(2)}</p>
              </div>
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

  const selectedNetwork = networkOptions2.find(item => item.options.some((option: any) => option.selected))?.section;

  let updatedOptions2: any[] = [];
  if (selectedNetwork === undefined) {
    updatedOptions2 = networkOptions2;
  } else {
    updatedOptions2 = networkOptions2.filter((option: any) => {
      return option.section === selectedNetwork;
    });
  }

  return (
    <UserActionBoxContainer glow={false}>
      {connectedAccount?.address ? (
        isLoadingTokens ? (
          <p>{"Loading Tokens..."}</p>
        ) : (
          <>
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
                options={updatedOptions2}
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
            <div className="flex items-center justify-center gap-1">
              <p>Total: </p>
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
