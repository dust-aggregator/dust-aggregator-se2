import { useEffect, useRef } from "react";

interface Props {
  error: any;
  open: boolean;
  retryOperation: () => void;
}

const SwapResultModal = ({ error, open, retryOperation }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open]);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded border-4 border-[#FF6161] ">
        <div className="my-32 items-center flex flex-col justify-center">
          <h1 className="font-bold text-4xl">SWAP FAILED</h1>
          <div className="text-[#fffff] text-xl w-3/4 text-center leading-none mt-2">
            We regret to inform you that the operation was not successful, please check that you have the required
            amount in commission and try again.
          </div>
          <form method="dialog" className="w-full flex justify-center mt-6">
            {/* <button
              style={{ backgroundImage: "url('/assets/confirm_btn.svg')" }}
              className="flex-1 text-[#FFFFFF] my-0 text-sm bg-center btn  min-h-0 h-10 rounded-lg"
              onClick={() => document.getElementById("result_modal").showModal()}
            >
              Cancel
            </button> */}
            <button
              onClick={retryOperation}
              className="flex-1 px-6 hover:brightness-50 bg-[url('/button2.png')] bg-no-repeat bg-center bg-cover h-10"
            >
              Retry Operation
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default SwapResultModal;
