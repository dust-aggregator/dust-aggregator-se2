import { useState } from "react";
import UserActionBoxContainer from "./UserActionBoxContainer";

const InputBox = () => {
  const [dustThresholdValue, setDustThresholdValue] = useState<number>(0);

  function handleChange(e: any) {
    setDustThresholdValue(e.target.value);
  }

  return (
    <UserActionBoxContainer>
      <div className="m-4">
        <p className="font-bold">DUST Threshold</p>
        <div className="flex gap-2">
          <input
            className="input rounded-lg p-1 bg-btn1"
            placeholder={""}
            name={"dustThreshold"}
            type="number"
            value={dustThresholdValue}
            onChange={handleChange}
            // disabled={disabled}
            // autoComplete="off"
            // ref={inputReft}
            // onFocus={onFocus}
          />
          <button className="px-6 bg-btn1 rounded-lg hover:brightness-50">Save</button>
        </div>
      </div>
      <div className="m-4">
        <p className="font-bold">Input</p>
        <div className="flex gap-2">
          <input
            className="input rounded-lg p-1 bg-btn1 w-[125px]"
            placeholder={""}
            name={"dustThreshold"}
            // disabled={disabled}
            // autoComplete="off"
            // ref={inputReft}
            // onFocus={onFocus}
          />
          <button className="px-6 bg-btn1 rounded-lg hover:brightness-50 min-w-30">{"Auto-select"}</button>
        </div>
      </div>
    </UserActionBoxContainer>
  );
};

export default InputBox;
