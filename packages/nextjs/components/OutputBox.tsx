import { useEffect, useState } from "react";
import CategorySelect from "./CategorySelect";
import Select from "./Select";
import SwapPreview from "./SwapPreview";
import UserActionBoxContainer from "./UserActionBoxContainer";
import { useAccount, useReadContract, useToken, useWatchContractEvent } from "wagmi";
import { useTokenWhitelist } from "~~/hooks/dust";
import { useTokenBalancesWithMetadataByNetwork } from "~~/hooks/dust/useTokenBalancesWithMetadataByNetwork";
import { SUPPORTED_NETWORKS, networks } from "~~/lib/constants";
import { Token } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";

const evmNetworkOptions = SUPPORTED_NETWORKS.map(({ id, name }) => ({ label: name, value: id }));

const networkOptions = [{ ecosystem: "Ethereum", options: evmNetworkOptions }];

const OutputBox = () => {
  const { address } = useAccount();
  const { outputNetwork, setOutputNetwork, outputToken, setOutputToken } = useGlobalState();
  const { tokens: whitelistedTokens } = useTokenWhitelist();

  const handleSelectNetwork = network => {
    const newSelectedNetwork = SUPPORTED_NETWORKS.find(({ id }) => id === network.value);
    setOutputNetwork(newSelectedNetwork);
  };

  const formattedSelectedNetwork = {
    label: outputNetwork?.name || "Select Network",
    value: outputNetwork?.id || "",
  };

  return (
    <UserActionBoxContainer>
      {address ? (
        <>
          <h3 className="font-bold">Output</h3>
          <CategorySelect
            title="Select Network"
            options={networkOptions}
            onChange={handleSelectNetwork}
            selectedOption={formattedSelectedNetwork}
          />
          <div className="flex justify-center">
            <p className="text-[#9D9D9D] text-xs my-1">And</p>
          </div>
          <Select
            title="Select Token"
            options={whitelistedTokens}
            onChange={setOutputToken}
            selectedOption={outputToken}
          />
          <SwapPreview />
        </>
      ) : (
        <></>
      )}
    </UserActionBoxContainer>
  );
};

export default OutputBox;
