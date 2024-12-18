import { Token } from "~~/lib/types";

interface Option {
  name: string;
  symbol: string;
}

interface Props {
  title: string;
  options: Option[];
  onChange: (newOutputToken: Token) => void;
  selectedOption?: string;
  disabled?: boolean;
}

const Select = ({ disabled, title, options, selectedOption, onChange }: Props) => {
  const handleClick = (option: Option) => {
    if (disabled) return;
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
        className={`min-h-0 h-8 py-1 px-2 leading-tight shadow-inner-xl flex items-center border-2 border-slate-50 w-full text-xs select bg-[#3C3731] ${
          !!selectedOption ? "text-[#E4E4E4]" : "text-[#9D9D9D]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {selectedOption?.name || title}
      </div>
      <ul tabIndex={0} className="w-full dropdown-content menu rounded-box z-[1] p-2 shadow-inner-xl mt-1 bg-[#3C3731]">
        {options.map(option => (
          <li key={option.symbol}>
            <a onClick={() => handleClick(option)} className="text-xs text-[#9D9D9D] px-2 py-1 flex justify-between">
              <span>{option.name}</span>
              <span>{option.symbol}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
