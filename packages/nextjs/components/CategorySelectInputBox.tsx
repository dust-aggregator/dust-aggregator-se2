import { useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { sendGAEvent } from "@next/third-parties/google";
import { formatEther, parseUnits } from "viem";
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
  title?: string;
  options?: Option[];
  onChange?: any;
  onSelect?: any;

  selectedOption?: string;
  className?: string;
  _dustThresholdValue: number;
}

const CategorySelectInputBox = ({
  className,
  title,
  options,
  selectedOption,
  onChange,
  onSelect,
  _dustThresholdValue,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectAll = (section: string) => {
    options?.forEach(network => {
      if (network.section === section) {
        network.options.forEach(option => {
          if (!option.selected) {
            handleClick(section, {
              ...option,
              selected: true,
            });
          }
        });
      }
    });
  };

  const handleClick = (section: string, option: OptionInfo) => {
    onChange(section, option.value, option.selected, option.amountToDust);
  };

  function formatDecimal(input: string): string {
    const numberValue = parseFloat(input); // Convert the string to a number
    return numberValue % 1 === 0
      ? numberValue.toString() // Return as an integer if no decimal values
      : numberValue.toFixed(2).replace(/\.?0+$/, ""); // Format to 2 decimals, remove trailing zeros
  }

  return (
    <div className="dropdown w-full">
      <div
        tabIndex={0}
        role="button"
        onClick={handleToggleDropdown}
        className={`min-h-0 h-8 py-1 px-2 leading-tight shadow-inner-xl flex items-center w-full text-xs select bg-[#FFFFFF]/15 border border-[#d1d1e0]/10 ${selectedOption ? "text-[#E4E4E4]" : "text-[#9D9D9D]"
        }`}
      >
        {title}
      </div>
      {isOpen && (
        <ul
          tabIndex={0}
          className="w-full dropdown-content menu rounded-box z-[1] shadow-inner-xl mt-1 flex flex-col overflow-y-scroll h-[280px] flex-nowrap bg-black"
        >
          {options && options?.length > 0 ? (
            <>
              {options?.map(({ section, options }) => {
                return (
                  <div key={section}>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold my-1 px-2">{section}</p>
                      <button onClick={() => handleSelectAll(section)} className="text-xs text-[#f8cd4c] px-2 py-1">
                        Select All
                      </button>
                    </div>
                    <div>
                      {options.map(
                        ({
                          value,
                          label,
                          disabled,
                          tokenBalance,
                          usdValue,
                          decimals,
                          selected,
                          amountToDust,
                          address,
                        }) => {
                          if (selected) return <div key={value}></div>;

                          return (
                            <li key={value} className={disabled ? "disabled" : ""}>
                              <a
                                onClick={() => {
                                  sendGAEvent({
                                    name: GA_EVENTS.selectInputToken,
                                    tokenName: label,
                                    address,
                                    network: section,
                                    tokenBalance,
                                  });
                                  handleClick(section, {
                                    label,
                                    value,
                                    disabled,
                                    tokenBalance,
                                    usdValue,
                                    decimals,
                                    selected: !selected,
                                    amountToDust: amountToDust,
                                  });
                                  disabled = !disabled;
                                }}
                                className="text-xs text-[#9D9D9D] my-1 gap-2 w-full py-0 bg-[#FFFFFF]/15 border border-[#d1d1e0]/10 flex justify-between"
                              >
                                <p className="w-1/3">{label}</p>
                                <p className="w-1/3 text-center">{formatDecimal(tokenBalance)}</p>
                                <p className="w-1/3 text-end">${usdValue?.toFixed(2)}</p>
                              </a>
                            </li>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <span className="m-2 opacity-50 font-montserrat text-xs">
              No tokens worth less than {_dustThresholdValue} USD in wallet, try with a higher amount.
            </span>
          )}
        </ul>
      )}
    </div>
  );
};

export default CategorySelectInputBox;
