import { useState } from "react";
import Image from "next/image";
import faqBg from "~~/public/assets/faqbg.svg"
// import faqBgLight from "~~/public/assets/faqbg-light.svg"
import polygon from "~~/public/assets/polygon.svg"

const frequentlyAskedQuestions = [
  {
    question: "GLorem ipsum dolor sit amet, consectetur adipiscing elit ?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie ultricies malesuada. Cras euismod nunc id risus interdum mollis. Vivamus eleifend libero id orci sollicitudin posuere. Mauris placerat quam risus, a dapibus ante molestie quis. Sed et eleifend tortor, quis semper arcu. Sed eu orci rhoncus, venenatis mi eget, lacinia sem. Sed purus magna, malesuada eget justo eget, tempor auctor purus. Nullam dignissim, enim quis fringilla rutrum, diam urna faucibus est, sit amet faucibus diam massa a nunc. Suspendisse potenti. Nulla facilisi. Aenean auctor mi diam, venenatis gravida turpis consequat eget. Duis sagittis sapien eu quam blandit, nec malesuada magna feugiat."
  },
  {
    question: "GLorem ipsum dolor sit amet, consectetur adipiscing elit ?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie ultricies malesuada. Cras euismod nunc id risus interdum mollis. Vivamus eleifend libero id orci sollicitudin posuere. Mauris placerat quam risus, a dapibus ante molestie quis. Sed et eleifend tortor, quis semper arcu. Sed eu orci rhoncus, venenatis mi eget, lacinia sem. Sed purus magna, malesuada eget justo eget, tempor auctor purus. Nullam dignissim, enim quis fringilla rutrum, diam urna faucibus est, sit amet faucibus diam massa a nunc. Suspendisse potenti. Nulla facilisi. Aenean auctor mi diam, venenatis gravida turpis consequat eget. Duis sagittis sapien eu quam blandit, nec malesuada magna feugiat."
  },
  {
    question: "GLorem ipsum dolor sit amet, consectetur adipiscing elit ?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie ultricies malesuada. Cras euismod nunc id risus interdum mollis. Vivamus eleifend libero id orci sollicitudin posuere. Mauris placerat quam risus, a dapibus ante molestie quis. Sed et eleifend tortor, quis semper arcu. Sed eu orci rhoncus, venenatis mi eget, lacinia sem. Sed purus magna, malesuada eget justo eget, tempor auctor purus. Nullam dignissim, enim quis fringilla rutrum, diam urna faucibus est, sit amet faucibus diam massa a nunc. Suspendisse potenti. Nulla facilisi. Aenean auctor mi diam, venenatis gravida turpis consequat eget. Duis sagittis sapien eu quam blandit, nec malesuada magna feugiat."
  },
  {
    question: "GLorem ipsum dolor sit amet, consectetur adipiscing elit ?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie ultricies malesuada. Cras euismod nunc id risus interdum mollis. Vivamus eleifend libero id orci sollicitudin posuere. Mauris placerat quam risus, a dapibus ante molestie quis. Sed et eleifend tortor, quis semper arcu. Sed eu orci rhoncus, venenatis mi eget, lacinia sem. Sed purus magna, malesuada eget justo eget, tempor auctor purus. Nullam dignissim, enim quis fringilla rutrum, diam urna faucibus est, sit amet faucibus diam massa a nunc. Suspendisse potenti. Nulla facilisi. Aenean auctor mi diam, venenatis gravida turpis consequat eget. Duis sagittis sapien eu quam blandit, nec malesuada magna feugiat."
  },
]

const FAQ = () => {
  const [openIndexes, setOpenIndexes] = useState(
    new Array(frequentlyAskedQuestions.length).fill(false)
  )

  const toggleOpen = (index: number) => {
    setOpenIndexes(prevState => {
      const newState = [...prevState]
      newState[index] = !newState[index]
      return newState;
    });
  }

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
                <Image
                  src={faqBg}
                  className="w-full"
                  alt="faq question"
                />
              </div>

              <button
                className="absolute w-full h-full top-0 left-0 flex justify-between items-center pb-[1%] px-[3%] z-30"
                onClick={() => toggleOpen(index)}
              >
                <span className="text-start font-montserrat font-bold text-lg">
                  {faqElem.question}
                </span>
                <Image
                  src={polygon}
                  className={`w-[50px] ${openIndexes[index] ? "" : "rotate-180"} transition-all duration-500`}
                  alt="arrow"
                />
              </button>

            </div>

            {/* <div className={`${open ? "h-fit" : "h-0 opacity-0"} w-full -z-10 -mt-4 transition-all duration-500 border border-black overflow-y-hidden p-2 pt-6 `}> */}
            <div className={
              `transition-all duration-700 ease origin-top
                ${openIndexes[index] ? "scale-y-1" : "scale-y-0 opacity-0"} 
                w-[96%] flex z-0`
            }>
              {openIndexes[index] &&
                <div className="px-6 pb-[2%] pt-[4%] bg-gradient-radial border rounded-lg -mt-[3%]">
                  <span className="text-[#9D9D9D] font-montserrat text-md">
                    {faqElem.answer}
                  </span>
                </div>
              }
            </div>
          </div>
        );
      })}

    </div>
  )
};

export default FAQ;
