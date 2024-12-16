import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import pendingGearSVG from "~~/public/assets/pending-gear.svg";
import confirmedGearSVG from "~~/public/assets/confirmed-gear.svg";
import baseSVG from "~~/public/base.svg";
import bnbSVG from "~~/public/bnb.svg";
import polSVG from "~~/public/pol.svg";
import dustSVG from "~~/public/logo2.svg";
import linkSVG from "~~/public/assets/link.svg";
import arrowSVG from "~~/public/assets/arrow-waiting-modal.svg";
import successSVG from "~~/public/assets/success-green.svg";
import { useGlobalState } from "~~/services/store/store";

interface Props {
  open: boolean;
}

const WaitingModal = ({ open }: Props) => {

  const {
    // outputNetwork,
    // outputToken,
    // inputTokens,
    // inputNetwork
  } = useGlobalState();

  const inputNetwork = "Binance Smart Chain";
  const inputTokens = ["BNB"];
  const inputAmounts = [0.1];

  const outputNetwork = "Polygon";
  const outputToken = "USDC";
  const outputAmount = 31.95885;

  const ref = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(true);
  const date = "2023-04-13";
  const hour = "16:39:17";

  const [succeededTransactions, setSucceededTransactions] = useState([false, false, false]);

  const getLogo = (_logo: string) => {
    if (_logo === "Binance Smart Chain") return bnbSVG;
    else if (_logo === "Polygon") return polSVG;
  };

  // =================> TEST
  const updateTransactions = async () => {
    for (let i = 0; i < succeededTransactions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 6000));

      setSucceededTransactions(prevState => {
        const newState = [...prevState];
        newState[i] = true;
        return newState;
      });
    }
    setPending(false);
  };

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open]);

  useEffect(() => {
    open && updateTransactions();
  }, [open]);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box box bg-[url('/assets/preview_bg.svg')] bg-no-repeat bg-center bg-auto rounded-xl flex flex-col gap-4">
        <span className="text-[#fffff] text-xl font-bold">Estimated wait time</span>

        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="flex gap-2 items-center">
              <Image
                src={pending ? pendingGearSVG : confirmedGearSVG}
                alt={pending ? "pending" : "confirmed"}
                className={`${pending && "animate-spin-slow"}`}
              />
              <span className={`text-lg font-bold ${pending ? "text-[#FFD900]" : "text-[#5EFF50]"}`}>{pending ? "Pending" : "Confirmed"} </span>
            </div>
            <div className="text-sm opacity-50 text-white flex gap-4 ml-8">
              <span>{date}</span>
              <span>{hour}</span>
            </div>
          </div>
          <div className="text-sm opacity-50 text-white flex flex-col items-end justify-between">
            <span>Estimated time of arrival</span>
            <span className="font-bold">~1 minutes</span>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-bold flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Image src={succeededTransactions[0] ? successSVG : getLogo(inputNetwork)} alt={"network"} />
              <div className="opacity-50">
                <span>Swapping via {inputNetwork}</span>
                <div>
                  {inputAmounts.map((iAmount, index) => (
                    <span key={index}>{`${iAmount} ${inputTokens[index]}`}</span>
                  ))}
                </div>
              </div>
              <a href="">
                <Image
                  src={linkSVG}
                  alt="link"
                  className={`w-4 ${!succeededTransactions[0] && "opacity-20 cursor-wait"}`}
                />
              </a>
            </div>

            <Image src={arrowSVG} alt="arrow" className="ml-1" />

            <div className="flex items-center gap-3">
              <Image src={succeededTransactions[1] ? successSVG : dustSVG} alt={"network"} />
              <div className="opacity-80">
                <span>Transaction on Zetachain</span>
              </div>
              <a href="">
                <Image
                  src={linkSVG}
                  alt="link"
                  className={`w-4 ${!succeededTransactions[1] && "opacity-20 cursor-wait"}`}
                />
              </a>
            </div>

            <Image src={arrowSVG} alt="arrow" className="ml-1" />

            <div className="flex items-center gap-3">
              <Image src={succeededTransactions[2] ? successSVG : getLogo(outputNetwork)} alt={"network"} />
              <div className="opacity-50">
                <span>Swapping via {outputNetwork}</span>
                <div>
                  <span>{`${outputAmount} ${outputToken}`}</span>
                </div>
              </div>
              <a href="">
                <Image
                  src={linkSVG}
                  alt="link"
                  className={`w-4 ${!succeededTransactions[2] && "opacity-20 cursor-wait"}`}
                />
              </a>
            </div>

          </div>
        </div>

        <div className="w-full text-sm opacity-50 text-white font-bold flex justify-center">
          <span>Works with Zetachain Cross-Chain engine</span>
        </div>

      </div>
    </dialog>
  );
};

export default WaitingModal;
