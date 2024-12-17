import { RefObject, useRef } from "react";
import CategorySelectInputBox from "./CategorySelectInputBox";

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
}

const TokenSelector = ({ _options, _updateSpecificOption, _comps }: Props) => {

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

  return (
    <div>
      <button
        // disabled={!readyForPreview}
        style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
        className="text-[#FFFFFF] text-sm p-0 bg-center my-2 btn w-full min-h-0 h-8 rounded-lg mt-4"
        onClick={togglePreviewModal}
      >
        Select Tokens
      </button>
      <dialog ref={previewModalRef} className="modal">
        <div className="modal-box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded-lg">
          <div className="w-full h-full h-[450px] flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-lg">Token Selection</span>

              <div className="flex gap-2">
                <CategorySelectInputBox
                  title="Select tokens"
                  options={_options}
                  // onSelect={updateSpecificOption}
                  onChange={_updateSpecificOption}
                />
              </div>
              <div className="overflow-x-auto overflow-y-scroll scrollbar-hide h-[300px]">{_comps}</div>
            </div>
            <form method="dialog" className="w-full flex justify-between gap-2">
              <button
                style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
                className="flex-1 text-[#FFFFFF] my-0 pb-1 text-sm bg-center btn  min-h-0 h-10 rounded-lg"
                onClick={togglePreviewModal}
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