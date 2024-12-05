import { useEffect, useState } from "react";
import CategorySelect from "./CategorySelect";
import Select from "./Select";
import SwapPreview from "./SwapPreview";
import UserActionBoxContainer from "./UserActionBoxContainer";
import { useAccount, useReadContract, useToken, useWatchContractEvent } from "wagmi";
import { useTokenBalancesWithMetadataByNetwork } from "~~/hooks/dust/useTokenBalancesWithMetadataByNetwork";
import { SUPPORTED_OUTPUT_NETWORKS, networks } from "~~/lib/constants";
import { Token } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";

const tokenOptions = [
  { value: "dai", label: "DAI", decorator: "5 USD" },
  { value: "uni", label: "UNI", decorator: "7 USD" },
  { value: "wbtc", label: "WBTC", decorator: "5 USD" },
];

const OutputBox = () => {
  const { outputNetwork, setOutputNetwork, outputToken, setOutputToken } = useGlobalState();
  const [outputBalances, setOutputBalances] = useState<Token[]>([]);

  const { address } = useAccount();

  const { allObjects, isLoading } = useTokenBalancesWithMetadataByNetwork(
    address,
    networks.map(({ alchemyEnum }) => alchemyEnum),
  );

  // useEffect(() => {
  //   if (rawBalancesDestination) {
  //     const formattedBalances = formatTokenBalances(rawBalancesDestination);
  //     setOutputBalances(formattedBalances);
  //   }
  // }, [rawBalancesDestination]);

  return (
    <UserActionBoxContainer>
      <h3 className="font-bold">Output</h3>
      <CategorySelect
        title="Select Network"
        options={SUPPORTED_OUTPUT_NETWORKS}
        onChange={setOutputNetwork}
        selectedOption={outputNetwork}
      />
      <div className="flex justify-center">
        <p className="text-[#9D9D9D] text-xs my-1">And</p>
      </div>
      <Select title="Select Token" options={tokenOptions} onChange={setOutputToken} selectedOption={outputToken} />
      <SwapPreview />
    </UserActionBoxContainer>
  );
};

export default OutputBox;
