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
  onChange: (option: OptionInfo) => void;
  selectedOption?: string;
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
        className={`flex items-center border-2 border-slate-50 w-full select bg-[#3C3731] ${
          selectedOption ? "text-[#E4E4E4]" : "text-[#9D9D9D]"
        }`}
      >
        {selectedOption?.label || title}
      </div>
      <ul tabIndex={0} className="w-full dropdown-content menu rounded-box z-[1] p-2 shadow mt-1 bg-[#3C3731]">
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
    // <select className={`select select-bordered w-full max-w-xs mt-2 ` + className}>
    //   <option disabled selected={!selectedOption}>
    //     {title}
    //   </option>
    //   {options.map(({ ecosystem }) => (
    //     <option key={ecosystem}>
    //       <p>{ecosystem}</p>
    //       <option>click me</option>
    //     </option>
    //     // <option key={value} value={value} selected={selectedOption?.value === value}>
    //     //   {label}
    //     // </option>
    //   ))}
    // </select>
  );
};

export default CategorySelect;
