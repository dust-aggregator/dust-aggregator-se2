import { formatEther } from "viem";

interface OptionInfo {
  value: string;
  label: string;
  disabled: boolean;
  tokenBalance: bigint;
  decimals: number;
}

interface Option {
  section: string;
  options: OptionInfo[];
}

interface Props {
  title?: string;
  options?: Option[];
  onChange?: (option: OptionInfo) => void;
  selectedOption?: string;
  className?: string;
}

const CategorySelectInputBox = ({ className, title, options, selectedOption, onChange }: Props) => {
  const handleClick = (option: OptionInfo) => {
    // const elem = document.activeElement;
    // if (elem) {
    //   (elem as any)?.blur();
    // }

    if (onChange) onChange(option);
  };
  return (
    <details className="dropdown">
      <summary className="btn m-1">open or close</summary>
      <ul className="menu dropdown-content flex flex-col flex-nowrap h-64 overflow-y-scroll bg-base-100 rounded-box p-2 w-52">
        {options?.map(({ section, options }) => {
          return (
            <div key={section}>
              <p className="text-sm font-bold my-1 px-2">{section}</p>
              <div>
                {options.map(({ value, label, disabled, tokenBalance, decimals }) => {
                  const formattedBalance = Number(tokenBalance) / Math.pow(10, decimals);
                  return (
                    <li key={value} className={disabled ? "disabled" : ""}>
                      <a
                        onClick={() => {
                          handleClick({ label, value, disabled, tokenBalance, decimals });
                          disabled = !disabled;
                        }}
                        className="text-xs text-[#9D9D9D] px-2 py-1 justify-between"
                      >
                        <p>{label}</p>
                        <p>{formattedBalance.toFixed(2)}</p>
                      </a>
                    </li>
                  );
                })}
              </div>
            </div>
          );
        })}
      </ul>

      {/* <summary className="btn m-1">open or close</summary>
      <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow h-32">
        {options?.map(({ section, options }) => (
          <li key={section} className="flex flex-col">
            <p className="text-sm text-bold my-1 px-2">{section}</p>
            <ul>
              {options.map(({ value, label }) => (
                <li key={value} className="flex flex-col">
                  <a onClick={() => handleClick({ label, value })} className="text-xs text-[#9D9D9D] px-2 py-1 block">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul> */}
    </details>
    // <details className="dropdown w-full text-[#E4E4E4]">
    //   <summary
    //     tabIndex={0}
    //     role="button"
    //     className={`flex items-center border-2 border-slate-50 w-full select bg-[#3C3731] text-xs ${
    //       selectedOption ? "text-[#E4E4E4]" : "text-[#9D9D9D]"
    //     }`}
    //   >
    //     {selectedOption || title}
    //   </summary>
    //   <ul
    //     tabIndex={0}
    //     className="w-full menu dropdown-content flex flex-col menu rounded-box z-[1] p-2 shadow mt-1 bg-[#3C3731] h-64 overflow-scroll"
    //   >

    //   </ul>
    // </details>
  );
};

export default CategorySelectInputBox;
