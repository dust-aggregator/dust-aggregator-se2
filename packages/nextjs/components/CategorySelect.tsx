import { Network } from "~~/lib/types";

interface OptionInfo {
  value: string;
  label: string;
}

interface Option {
  ecosystem: string;
  options: OptionInfo[];
}

interface Props {
  title: string;
  options: Option[];
  onChange: any; //(option: OptionInfo) => void;
  selectedOption?: Network;
  className?: string;
}

const CategorySelect = ({ className, title, options, selectedOption, onChange }: Props) => {
  const handleClick = (option: OptionInfo) => {
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
    onChange(option);
  };
  return (
    <div className="dropdown w-full text-[#E4E4E4]">
      <div
        tabIndex={0}
        role="button"
        className={`min-h-0 h-8 py-1 px-2 leading-tight shadow-inner-xl flex items-center border-2 border-slate-50 w-full text-xs select bg-[#3C3731] ${
          selectedOption ? "text-[#E4E4E4]" : "text-[#9D9D9D]"
        }`}
      >
        {selectedOption?.label || title}
      </div>
      <ul tabIndex={0} className="w-full dropdown-content menu rounded-box z-[1] p-2 shadow-inner-xl mt-1 bg-[#3C3731]">
        {options.map(({ ecosystem, options }) => (
          <div key={ecosystem}>
            <p className="text-sm text-bold my-1 px-2">{ecosystem}</p>
            <ul>
              {options.map(({ value, label }) => (
                <li key={value}>
                  <a onClick={() => handleClick({ label, value })} className="text-xs text-[#9D9D9D] px-2 py-1">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default CategorySelect;
