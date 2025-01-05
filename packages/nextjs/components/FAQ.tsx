import { useState } from "react";
import Image from "next/image";
import faqBg from "~~/public/assets/faqbg.svg";
// import faqBgLight from "~~/public/assets/faqbg-light.svg"
import polygon from "~~/public/assets/polygon.svg";

interface Question {
  question: string;
  answer: React.ReactNode;
}

const frequentlyAskedQuestions: Question[] = [
  {
    question: "What is Dust.fun?",
    answer:
      "Dust.fun is a wallet maintenance tool that allows you to clean your wallet of low-value tokens (“dust”) across various chains. It consolidates these tiny, bothersome token balances into a single token of your choice, all in one seamless transaction.",
  },
  {
    question: "How does Dust.fun define “dust”?",
    answer:
      "“Dust” refers to tokens in your wallet with balances below a specific threshold, which you can define during the process. For example, you might set a limit of $5, and any tokens that have a combined value less than $5 will be categorized as dust and be available for you to swap.",
  },
  {
    question: "How does it work?",
    answer:
      "Dust.fun works by leveraging ZetaChain’s universal cross-chain contracts, enabling seamless aggregation and swapping of low-value tokens (dust) across multiple chains in a single transaction. This is powered by ZetaChain’s depositAndCall and withdrawAndCall functionalities, which allow assets and contract interactions to flow effortlessly between connected blockchains.",
  },
  {
    question: "Is this safe?",
    answer: (
      <p>
        We are audited by the RatherLabs team, you can read the report
        <a className="text-blue-600 ml-2 font-bold underline" target="_blank" href="#">
          here.
        </a>
      </p>
    ),
  },
  {
    question: "Are there any fees associated with using Dust.fun?",
    answer:
      "Yes, Dust.fun charges a small service fee for aggregating and swapping dust tokens in addition to the gas fee you have to pay. The exact fee will depend on the chain and the transaction but will always be transparently displayed before you approve the transaction.",
  },
];

const FAQ = () => {
  const [openIndexes, setOpenIndexes] = useState(new Array(frequentlyAskedQuestions.length).fill(false));

  const toggleOpen = (index: number) => {
    setOpenIndexes(prevState => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  return (
    <div className="w-full flex flex-col gap-3 my-8">
      {frequentlyAskedQuestions.map((faqElem, index) => {
        return (
          <div key={index} className="flex flex-col w-full items-center">
            <div className="w-full h-[70px] 2xl:h-[100px] relative">
              <div className="absolute w-full top-0 left-0 flex justify-center">
                <Image
                  src={faqBg}
                  className={`w-full transition-all duration-500 ${openIndexes[index] && "drop-shadow-[0_0_10px_rgba(0,_187,_255,_1)]"}`}
                  alt="faq question"
                />
              </div>

              <div className="absolute w-full top-0 left-0 flex justify-center z-20">
                <Image src={faqBg} className="w-full" alt="faq question" />
              </div>

              <button
                className="absolute w-full h-full top-0 left-0 flex justify-between items-center pb-[1%] px-[3%] z-30"
                onClick={() => toggleOpen(index)}
              >
                <span className="text-start font-montserrat font-bold text-lg">{faqElem.question}</span>
                <Image
                  src={polygon}
                  className={`w-[50px] ${openIndexes[index] ? "" : "rotate-180"} transition-all duration-500`}
                  alt="arrow"
                />
              </button>
            </div>

            {/* <div className={`${open ? "h-fit" : "h-0 opacity-0"} w-full -z-10 -mt-4 transition-all duration-500 border border-black overflow-y-hidden p-2 pt-6 `}> */}
            <div
              className={`transition-all duration-700 ease origin-top
                ${openIndexes[index] ? "scale-y-1" : "scale-y-0 opacity-0"} 
                w-[96%] flex z-0`}
            >
              {openIndexes[index] && (
                <div className="w-full px-6 pb-[2%] pt-[4%] bg-gradient-radial border rounded-lg -mt-[3%]">
                  <span className="text-[#9D9D9D] font-montserrat text-md">{faqElem.answer}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQ;
