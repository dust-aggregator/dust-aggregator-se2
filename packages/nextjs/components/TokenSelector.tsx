import { RefObject, useRef, useState } from "react";
import CategorySelectInputBox from "./CategorySelectInputBox";
import { sendGAEvent } from "@next/third-parties/google";
import { GA_EVENTS } from "~~/lib/constants";

interface OptionInfo {
  value: string;
  label: string;
  disabled: boolean;
  tokenBalance: string;
  decimals: number;
  selected: boolean;
  usdValue: number;
  amountToDust: string;
}

interface Option {
  section: string;
  options: OptionInfo[];
}

interface Props {
  _options?: Option[];
  _updateSpecificOption: any;
  _comps: JSX.Element[];
  _dustThresholdValue: number;
  _refetchTokens: () => void;
}

const TokenSelector = ({ _options, _updateSpecificOption, _comps, _dustThresholdValue, _refetchTokens }: Props) => {
  const [tokensSelected, setTokensSelected] = useState(false);
  const [hover, setHover] = useState(false);

  const previewModalRef = useRef<HTMLDialogElement>(null);

  const getToggleModal = (ref: RefObject<HTMLDialogElement>) => () => {
    if (ref.current) {
      if (ref.current.open) {
        ref.current.close();
      } else {
        ref.current.showModal();
      }
    }
  };

  const togglePreviewModal = getToggleModal(previewModalRef);

  const handleConfirm = () => {
    setTokensSelected(true);
    togglePreviewModal();
  };

  return (
    <div>
      <button
        // disabled={!readyForPreview}
        style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
        className={`text-[#FFFFFF] text-sm p-0 bg-center my-2 btn w-full min-h-0 h-8 rounded-lg mt-4 ${tokensSelected ? "bg-green-500" : ""
        }`}
        onClick={togglePreviewModal}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {tokensSelected ? (hover ? "Update Selection" : "Tokens Selected") : "Select Tokens"}
      </button>
      {/*  =============== Token Selection Modal  ==================== */}
      <dialog ref={previewModalRef} className="modal">
        <div className="modal-box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded-lg">
          <div className="w-full h-full h-[530px] flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-lg">Token Selection</span>

              <span className="font-montserrat opacity-50 text-xs">
                Select the tokens you wanna swap, from the list of elegible tokens according to the selected threshold
              </span>

              <div className="w-full flex justify-center gap-2 items-center">
                <span className="font-montserrat opacity-50 text-xs">Don´t see your tokens?</span>
                <button
                  style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                  className="text-[#FFFFFF] my-0 pb-1 text-xs bg-center btn  min-h-0 h-10 rounded-lg"
                  onClick={_refetchTokens}
                >
                  Refresh
                </button>
              </div>

              <div onClick={() => sendGAEvent({ name: GA_EVENTS.selectInputTokensMenu })} className="flex gap-2">
                <CategorySelectInputBox
                  title="Select tokens"
                  options={_options}
                  // onSelect={updateSpecificOption}
                  onChange={_updateSpecificOption}
                  _dustThresholdValue={_dustThresholdValue}
                />
              </div>
              <div className="overflow-x-auto overflow-y-scroll scrollbar-hide h-[300px]">{_comps}</div>
            </div>
            <form method="dialog" className="w-full flex justify-between gap-2">
              <button
                style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                className="flex-1 text-[#FFFFFF] my-0 pb-1 text-sm bg-center btn  min-h-0 h-10 rounded-lg"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                className="flex-1 text-[#FFFFFF] my-0 pb-1 text-sm bg-center btn  min-h-0 h-10 rounded-lg"
                onClick={togglePreviewModal}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default TokenSelector;
