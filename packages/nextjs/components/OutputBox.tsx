import { useState } from "react";
import Image from "next/image";
import CategorySelect from "./CategorySelect";
import Select from "./Select";
import SwapPreview from "./SwapPreview";
import UserActionBoxContainer from "./UserActionBoxContainer";
import { sendGAEvent } from "@next/third-parties/google";
import { zetachain } from "viem/chains";
import { useAccount } from "wagmi";
import { useTokenWhitelist } from "~~/hooks/dust";
import {
  BitcoinNetwork,
  BitcoinToken,
  GA_EVENTS,
  SUPPORTED_INPUT_NETWORKS,
  WrappedZetaToken,
  ZetaChainNetwork,
} from "~~/lib/constants";
import pasteSVG from "~~/public/assets/paste.svg";
import { useGlobalState } from "~~/services/store/store";

const evmNetworkOptions = SUPPORTED_INPUT_NETWORKS.map(({ id, name }) => ({ label: name, value: id }));

const networkOptions = [
  { ecosystem: "ZetaChain", options: [{ label: "ZetaChain", value: zetachain.id }] },
  { ecosystem: "Ethereum", options: evmNetworkOptions },
  { ecosystem: "Bitcoin (Coming Soon)", options: [] },
];

const OutputBox = () => {
  const { inputNetwork, outputNetwork, setOutputNetwork, outputToken, setOutputToken, recipient, setRecipient } =
    useGlobalState();
  const [receiverWalletMode, setReceiverWalletMode] = useState<string>("");
  const [understoodRisk, setUnderstoodRisk] = useState(false);

  const isSameNetwork = outputNetwork?.id === inputNetwork?.id;
  const isBitcoin = outputNetwork?.id === "bitcoin";
  const isZetaChain = outputNetwork?.id === zetachain.id;
  const isNonEthereumNetwork = isBitcoin || isZetaChain;

  const { address } = useAccount();
  const { tokens: whitelistedTokens } = useTokenWhitelist();

  const handleSelectNetwork = network => {
    sendGAEvent({
      name: GA_EVENTS.selectOutputNetwork,
      network: network.label,
    });
    if (network.value === "bitcoin") {
      setOutputNetwork(BitcoinNetwork);
      setOutputToken(BitcoinToken);
      setReceiverWalletMode("");
    } else if (network.value === zetachain.id) {
      setOutputNetwork(ZetaChainNetwork);
      setOutputToken(WrappedZetaToken);
    } else {
      const newInputNetwork = SUPPORTED_INPUT_NETWORKS.find(({ id }) => id === network.value);
      setOutputNetwork(newInputNetwork);
      setOutputToken(null);
    }
  };

  const formattedOuputNetwork = {
    label: outputNetwork?.name || "Select Chain",
    value: outputNetwork?.id || "",
  };

  const handlePaste = async () => {
    const copiedAdd = await navigator.clipboard.readText();
    if (copiedAdd) setRecipient(copiedAdd);
  };

  const isSwapDisabled = receiverWalletMode !== "connected" && (!understoodRisk || !recipient);

  return (
    <UserActionBoxContainer>
      {address ? (
        <>
          <h3 className="font-bold">Output</h3>
          <CategorySelect
            title="Select Chain"
            options={networkOptions}
            onChange={handleSelectNetwork}
            selectedOption={formattedOuputNetwork}
          />
          <div className="flex justify-center">
            <p className="text-[#9D9D9D] text-xs my-1">and</p>
          </div>
          <Select
            disabled={isNonEthereumNetwork || !outputNetwork}
            title="Select Token"
            options={whitelistedTokens}
            onChange={setOutputToken}
            selectedOption={outputToken}
          />

          <div className="flex flex-col gap-2 my-2">
            <div>
              <h3 className="font-bold">Send to</h3>
            </div>

            <div className="flex gap-1">
              <button
                disabled={isBitcoin}
                style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                className={` text-[#FFFFFF] text-sm p-0 bg-center btn w-1/2 min-h-0 h-8 rounded-lg font-normal text-xs transition-all duration-700`}
                onClick={() => {
                  sendGAEvent({
                    name: GA_EVENTS.sendToConnectedWallet,
                  });
                  setReceiverWalletMode("connected");
                }}
              >
                <span
                  className={`${receiverWalletMode === "connected" && "drop-shadow-[0_0_3px_rgba(0,_187,_255,_1)]"}`}
                >
                  Connected Wallet
                </span>
              </button>
              <button
                style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                className={` text-[#FFFFFF] text-sm p-0 bg-center btn w-1/2 min-h-0 h-8 rounded-lg font-normal text-xs transition-all duration-700`}
                onClick={() => {
                  sendGAEvent({
                    name: GA_EVENTS.sendToCustomWallet,
                  });
                  setReceiverWalletMode("recipient");
                }}
                disabled={isSameNetwork}
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
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
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
                    {understoodRisk && <span className="text-white">&#10003;</span>}
                  </button>
                  <span className="text-xs opacity-50">
                    This address is correct and not an exchange wallet. Any tokens sent to the wrong address will be
                    impossible to retrieve.
                  </span>
                </div>
              </div>
            )}
          </div>
          <SwapPreview isDisabled={isSwapDisabled} />
        </>
      ) : (
        <></>
      )}
    </UserActionBoxContainer>
  );
};

export default OutputBox;
