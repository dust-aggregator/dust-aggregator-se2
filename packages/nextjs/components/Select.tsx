import { OutputToken, Token } from "~~/lib/types";
import { useGlobalState } from "~~/services/store/store";

// interface Option {
//   name: string;
//   symbol: string;
//   address: string;
//   decimals: number;
//   balance: number;
// }

interface Props {
  title: string;
  options: Token[] | OutputToken[];
  onChange: (newOutputToken: Token | OutputToken) => void;
  selectedOption?: Token | null;
  disabled?: boolean;
}

const Select = ({ disabled, title, options, selectedOption, onChange }: Props) => {
  const { inputTokens, inputNetwork, outputNetwork } = useGlobalState();

  const handleClick = (option: Token | OutputToken, _optionDisabled: boolean) => {
    if (disabled || _optionDisabled) return;
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
    onChange(option);
  };
  return (
    <div className="dropdown w-full text-[#E4E4E4]">
      <div
        tabIndex={disabled ? -1 : 0}
        role="button"
        className={`min-h-0 h-8 py-1 px-2 leading-tight shadow-inner-xl flex items-center border-2 border-slate-50 w-full text-xs select bg-[#3C3731] ${!!selectedOption ? "text-[#E4E4E4]" : "text-[#9D9D9D]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {selectedOption?.name || title}
      </div>
      {options.length > 0 ? (
        <ul
          tabIndex={0}
          className="w-full dropdown-content menu rounded-box z-[1] p-2 shadow-inner-xl mt-1 bg-[#3C3731]"
        >
          {options.map(option => {
            const _disabled =
              inputNetwork?.id === outputNetwork?.id &&
              inputTokens.some(tokenObj => tokenObj.address.toLowerCase() === option.address.toLowerCase());
            return (
              <li key={option.symbol}>
                <a
                  onClick={() => handleClick(option, _disabled)}
                  className={`text-xs ${_disabled ? "text-[#000000] hover:cursor-not-allowed" : "text-[#9D9D9D]"} px-2 py-1 flex justify-between relative group`}
                >
                  <span>{option.name}</span>
                  <span>{option.symbol}</span>
                  <span
                    className={`absolute hidden text-[#9D9D9D] ${_disabled && "group-hover:block"} border rounded-lg bg-[#3C3731] text-xs px-2 py-1 w-[200px] top-0 -translate-x-[50%] -translate-y-[100%] font-montserrat`}
                  >
                    {option.name} and one of your selected input tokens are the same. Please remove it or choose another
                    output token.
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul
          tabIndex={0}
          className="w-full dropdown-content menu rounded-box z-[1] p-2 shadow-inner-xl mt-1 bg-[#3C3731]"
        >
          <li>
            <a className={`text-xs text-[#9D9D9D] px-2 py-1 flex justify-between relative group`}>
              <span>Loading token list..</span>
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Select;
