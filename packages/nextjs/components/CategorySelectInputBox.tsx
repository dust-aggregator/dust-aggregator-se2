import Image from "next/image";
import { formatEther } from "viem";

interface OptionInfo {
  value: string;
  label: string;
  disabled: boolean;
  tokenBalance: bigint;
  decimals: number;
  selected: boolean;
}

interface Option {
  section: string;
  options: OptionInfo[];
}

interface Props {
  title?: string;
  options?: Option[];
  onChange?: any;
  onSelect?: any;

  selectedOption?: string;
  className?: string;
}

const CategorySelectInputBox = ({ className, title, options, selectedOption, onChange, onSelect }: Props) => {
  // const handleClick = (option: OptionInfo) => {
  //   // const elem = document.activeElement;
  //   // if (elem) {
  //   //   (elem as any)?.blur();
  //   // }

  //   if (onChange) onChange(option);
  // };

  const handleClick = (section: string, option: OptionInfo) => {
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
    onChange(section, option.value, option.selected);
  };

  return (
    <div className="dropdown w-full">
      <div
        tabIndex={0}
        role="button"
        className={`min-h-0 h-8 py-1 px-2 leading-tight shadow-inner-xl flex items-center border-2 border-slate-50 w-full text-xs select bg-[#3C3731] ${
          selectedOption ? "text-[#E4E4E4]" : "text-[#9D9D9D]"
        }`}
      >
        {title}
      </div>
      <ul
        tabIndex={0}
        className="w-full dropdown-content menu rounded-box z-[1] p-2 shadow-inner-xl mt-1 bg-[#3C3731] flex flex-col overflow-y-scroll h-32 flex-nowrap"
      >
        {options?.map(({ section, options }) => {
          return (
            <div key={section}>
              <p className="text-sm font-bold my-1 px-2">{section}</p>
              <div>
                {options.map(({ value, label, disabled, tokenBalance, decimals, selected }) => {
                  const formattedBalance = Number(tokenBalance) / Math.pow(10, decimals);

                  if (selected) return <div key={value}></div>;

                  return (
                    <li key={value} className={disabled ? "disabled" : ""}>
                      <a
                        onClick={() => {
                          console.log("Handled");
                          handleClick(section, { label, value, disabled, tokenBalance, decimals, selected: !selected });
                          // onSelect(section, value, !selected);
                          disabled = !disabled;
                        }}
                        className="text-xs text-[#9D9D9D] px-2 py-1 justify-between"
                      >
                        <p>{label}</p>
                        <div className="flex items-center justify-center gap-1">
                          <p>{formattedBalance.toFixed(2)}</p>
                          <Image src={"/particles.png"} alt="" width={"12"} height={"12"} className="h-4" />
                        </div>
                      </a>
                    </li>
                  );
                })}
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default CategorySelectInputBox;
