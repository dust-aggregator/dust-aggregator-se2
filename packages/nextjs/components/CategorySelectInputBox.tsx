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
  onChange?: (option: OptionInfo) => void;
  onSelect?: any;

  selectedOption?: string;
  className?: string;
}

const CategorySelectInputBox = ({ className, title, options, selectedOption, onChange, onSelect }: Props) => {
  const handleClick = (option: OptionInfo) => {
    // const elem = document.activeElement;
    // if (elem) {
    //   (elem as any)?.blur();
    // }

    if (onChange) onChange(option);
  };
  return (
    <details className="dropdown">
      <summary className="btn m-0 text-xs p-0">Select tokens</summary>
      <ul className="menu dropdown-content flex flex-col flex-nowrap h-64 overflow-y-scroll bg-base-100 rounded-box p-2 w-52">
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
                          handleClick({ label, value, disabled, tokenBalance, decimals, selected });
                          onSelect(section, value, !selected);
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
    </details>
  );
};

export default CategorySelectInputBox;
