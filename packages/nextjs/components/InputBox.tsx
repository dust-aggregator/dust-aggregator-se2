import { useEffect, useState } from "react";
import { TokenRow } from "./TokenRow";
import TokenSelector from "./TokenSelector";
import UserActionBoxContainer from "./UserActionBoxContainer";
import { RainbowKitCustomConnectButton } from "./scaffold-eth/RainbowKitCustomConnectButton";
import { sendGAEvent } from "@next/third-parties/google";
import { useAccount } from "wagmi";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { GA_EVENTS, SUPPORTED_INPUT_NETWORKS, networks } from "~~/lib/constants";
import { formatDecimal } from "~~/lib/utils";
import { useGlobalState } from "~~/services/store/store";
import { formatUnits } from "ethers/lib/utils";

const InputBox = () => {
  const [dustThresholdValue, setDustThresholdValue] = useState<number>(50);
  const [isSaved, setIsSaved] = useState(false);

  function handleChange(e: any) {
    setDustThresholdValue(e.target.value);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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

  const [totalDustInUsd, setTotalDustInUsd] = useState(0);

  // Update disabled property function
  const updateSpecificOption = (sectionKey: string, optionValue: string, selected: boolean, amountToDust: number) => {
    setNetworkOptions2(prevNetworkOptions2 => {
      const updatedOptions: any[] = prevNetworkOptions2.map((section: any) =>
        section.section === sectionKey
          ? {
              ...section,
              options: section.options.map((option: any) =>
                option.value === optionValue ? { ...option, selected, amountToDust: amountToDust } : option,
              ),
            }
          : section,
      );

      const filteredTokens = updatedOptions
        .flatMap((section: any) => section.options)
        .filter((option: any) => option.selected);

      const selectedInputTokens = filteredTokens.map((token: any) => ({
        name: token.label,
        decimals: token.decimals,
        balance: token.tokenBalance,
        amount: Number(token.amountToDust).toFixed(token.decimals),
        address: token.address,
        symbol: token.symbol,
        usdValue: token.usdValue,
        hasPermit2Allowance: false,
      }));

      setInputTokens(selectedInputTokens);

      // Recalculate totalDustInUsd
      let totalDust = 0;
      for (const net of updatedOptions) {
        for (const opt of net.options) {
          if (opt.selected) {
            totalDust += (opt.usdValue * opt.amountToDust) / opt.tokenBalance;
          }
        }
      }
      setTotalDustInUsd(totalDust);

      return updatedOptions;
    });
  };

  const filteredNetworkOptions = networkOptions2
    .map(network => ({
      ...network,
      options: network.options.filter((option: any) => option.selected),
    }))
    .filter(network => network.options.length > 0);

  const comps = filteredNetworkOptions.map((e: any, index: number) => {
    return (
      <div key={"sjf" + index} className="flex flex-col gap-2">
        {/* <p className="m-0 text-xl text-bold">{e.section}</p> */}
        {e.options.map((option: any, index: number) => {
          return (
            <TokenRow key={index} token={option} updateSpecificOption={updateSpecificOption} networkName={e.section} />
          );
        })}
      </div>
    );
  });

  const compsShort = networkOptions2
    .map(network => ({
      ...network,
      options: network.options.filter((option: any) => option.selected),
    }))
    .filter(network => network.options.length > 0)
    .map((e: any, index: number) => (
      <div key={"sjf" + index} className="flex flex-col gap-2">
        {e.options.map((option: any, index: number) => (
          <div key={"sndn" + index}>
            <div className={`px-4 h-10 flex items-center w-full text-xs justify-between rounded-lg`}>
              <div className="flex gap-2">
                <p className="m-0 text-xs ">
                  {e.section} / {option.label}
                </p>
              </div>

              <div className="flex gap-2 h-full items-center py-1">
                <div className="border-t border-gray-400 mx-2"></div>
                <p className="text-xs opacity-70">
                  {formatDecimal(option.amountToDust)} {option.symbol}
                </p>
              </div>
            </div>
            <hr className="border-gray-400 my-2" />
          </div>
        ))}
      </div>
    ));

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

    // Update totalDustInUsd
    let totalDust = 0;
    for (let i = 0; i < networkOptions2.length; i++) {
      for (let j = 0; j < networkOptions2[i].options.length; j++) {
        if (networkOptions2[i].options[j].selected) {
          totalDust +=
            (networkOptions2[i].options[j].usdValue * networkOptions2[i].options[j].amountToDust) /
            networkOptions2[i].options[j].tokenBalance;
        }
      }
    }
    setTotalDustInUsd(totalDust);
  }, [walletConnectBalances.length, dustThresholdValue]);

  const [inputNetwork, setInputNetworkLocal] = useState();

  const setInputNetwork = useGlobalState(({ setInputNetwork }) => setInputNetwork);

  useEffect(() => {
    let inputNetworkName = networkOptions2.find(item => item.options.some((option: any) => option.selected))?.section;
    if (inputNetworkName === "Matic") inputNetworkName = "Polygon";
    if (inputNetworkName === "Binance") inputNetworkName = "BNB Smart Chain";
    const inputNetwork = SUPPORTED_INPUT_NETWORKS.find(network => network.name === inputNetworkName);
    console.log(inputNetwork);
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
            <div className="font-bold m-0 flex items-center mb-4">
              DUST Threshold
              <div className="relative group inline-block ml-2">
                <InformationCircleIcon className="w-5 h-5" />
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-2 text-xs text-white bg-black rounded">
                  Dust threshold is the value limit you set to define small token balances (dust). For example, with a
                  $50 threshold, any tokens worth less than $50 are considered dust and can be swapped.
                </div>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="relative w-2/3">
                <input
                  className="input rounded-lg p-1 bg-btn1 shadow-inner-xl p-2 h-8 pr-7 w-full appearance-none
                  [&::-webkit-inner-spin-button]:appearance-none 
                  [&::-webkit-outer-spin-button]:appearance-none 
                  [&::-moz-appearance]:textfield"
                  placeholder=""
                  name="dustThreshold"
                  type="number"
                  value={dustThresholdValue}
                  onChange={handleChange}
                />
                <span className="absolute text-sm inset-y-0 right-0 pr-3 flex items-center text-gray-500">USD</span>
              </div>
            </div>
            <p className="font-bold m-0">Input</p>

            <TokenSelector
              _options={updatedOptions2}
              _updateSpecificOption={updateSpecificOption}
              _comps={comps}
              _dustThresholdValue={dustThresholdValue}
            />

            <div className="p-[0.4px] bg-[#FFFFFF] rounded my-4"></div>
            <div className="overflow-scroll h-40 mb-4">
              {compsShort}
              {/* <AllTokensPrices /> */}
              {/* <AllTokensBalances address="0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf" /> */}
            </div>
            <div className="flex items-center justify-center gap-2">
              <p>Total ≈ </p>
              <p>$</p>
              <p>{totalDustInUsd?.toFixed(2)}</p>
            </div>
          </>
        )
      ) : (
        <div
          onClick={() => sendGAEvent({ name: GA_EVENTS.walletConnect })}
          className="flex flex-col justify-center items-center"
        >
          <RainbowKitCustomConnectButton />
        </div>
      )}
    </UserActionBoxContainer>
  );
};

export default InputBox;
