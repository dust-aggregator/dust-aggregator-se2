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
import pasteSVG from "~~/public/assets/paste.svg";
import Image from "next/image";

const evmNetworkOptions = SUPPORTED_NETWORKS.map(({ id, name }) => ({ label: name, value: id }));

const networkOptions = [{ ecosystem: "Ethereum", options: evmNetworkOptions }];

const OutputBox = () => {
  const outputTokensByNetwork = useGlobalState(({ outputTokensByNetwork }) => outputTokensByNetwork);

  console.log(outputTokensByNetwork);

  const { outputNetwork, setOutputNetwork, outputToken, setOutputToken } = useGlobalState();
  const [outputBalances, setOutputBalances] = useState<Token[]>([]);
  const [receiverWalletMode, setReceiverWalletMode] = useState<string>("")
  const [receiverWallet, setReceiverWallet] = useState("")
  const [understoodRisk, setUnderstoodRisk] = useState(false)

  const { address } = useAccount();
  const { tokens: whitelistedTokens } = useTokenWhitelist();

  const handleSelectNetwork = network => {
    const newInputNetwork = SUPPORTED_NETWORKS.find(({ id }) => id === network.value);
    setOutputNetwork(newInputNetwork);
  };

  const formattedInputNetwork = {
    label: outputNetwork?.name || "Select Network",
    value: outputNetwork?.id || "",
  };

  const handlePaste = async () => {
    const copiedAdd = await navigator.clipboard.readText()
    if (copiedAdd)
      setReceiverWallet(copiedAdd)
  }

  return (
    <UserActionBoxContainer>
      {address ? (
        <>
          <h3 className="font-bold">Output</h3>
          <CategorySelect
            title="Select Network"
            options={networkOptions}
            onChange={handleSelectNetwork}
            selectedOption={formattedInputNetwork}
          />
          <div className="flex justify-center">
            <p className="text-[#9D9D9D] text-xs my-1">And</p>
          </div>
          <Select title="Select Token" options={tokenOptions} onChange={setOutputToken} selectedOption={outputToken} />

          <div className="flex flex-col gap-2 my-2">
            <div>
              <h3 className="font-bold">Send to</h3>
            </div>

            <div className="flex gap-1">
              <button
                style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                className={`${receiverWalletMode === "connected" && "drop-shadow-[0_0_3px_rgba(0,_187,_255,_1)]"} text-[#FFFFFF] text-sm p-0 bg-center btn w-1/2 min-h-0 h-8 rounded-lg font-normal text-xs transition-all duration-700`}
                onClick={() => setReceiverWalletMode("connected")}
              >
                <span
                  className={`${receiverWalletMode === "connected" && "drop-shadow-[0_0_3px_rgba(0,_187,_255,_1)]"}`}
                >
                  Connected Wallet
                </span>
              </button>
              <button
                style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                className={`${receiverWalletMode === "recipient" && "drop-shadow-[0_0_3px_rgba(0,_187,_255,_1)]"} text-[#FFFFFF] text-sm p-0 bg-center btn w-1/2 min-h-0 h-8 rounded-lg font-normal text-xs transition-all duration-700`}
                onClick={() => setReceiverWalletMode("recipient")}
              >
                <span
                  className={`${receiverWalletMode === "recipient" && "drop-shadow-[0_0_3px_rgba(0,_187,_255,_1)]"}`}
                >
                  Add Recipient Wallet
                </span>
              </button>
            </div>

            {receiverWalletMode === "recipient" && (
              <div className="flex flex-col gap-2">
                <div className="w-full flex relative">
                  <input
                    className="input rounded-lg p-1 bg-btn1 shadow-inner-xl p-2 h-8 text-xs w-full"
                    placeholder={"Destination Address"}
                    name={"destinationAddress"}
                    type="string"
                    value={receiverWallet}
                    onChange={(e) => setReceiverWallet(e.target.value)}
                  />
                  <Image
                    onClick={handlePaste}
                    src={pasteSVG}
                    alt="paste"
                    className="absolute h-full right-3 top-0 hover:cursor-pointer"
                  />
                </div>

                <div
                  className="w-full flex gap-1 hover:cursor-pointer"
                  onClick={() => setUnderstoodRisk(!understoodRisk)}
                >
                  <button
                    // style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                    className={`text-[#FFFFFF] p-0 bg-btn1 shadow-inner-xl w-7 min-w-7 h-7 rounded-lg font-normal transition-all duration-700`}
                  >
                    {understoodRisk && "✔"}
                  </button>
                  <span className="text-xs opacity-50">
                    This address is correct and not an exchange wallet. Any tokens sent to the wrong address will be
                    impossible to retrieve.
                  </span>
                </div>
              </div>
            )}
          </div>

          <SwapPreview />
        </>
      ) : (
        <></>
      )}
    </UserActionBoxContainer>
  );
};

export default OutputBox;
