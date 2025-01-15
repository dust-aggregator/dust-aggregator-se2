import { useState } from "react";

interface UserActionBoxContainerProps {
  children: any
  glow?: boolean
}

const UserActionBoxContainer = ({ children }: UserActionBoxContainerProps) => {
  const [_glow, setGlow] = useState(false);

  return (
    <div className="w-[420px] h-[420px] backdrop-blur-xl bg-[#FFFFFF]/5 rounded-xl border border-[#d1d1e0]/10">
      <div className="w-full h-full flex justify-center items-center mt-1">
        <div className="flex flex-col w-full h-full bg-transparent z-20 p-6">{children}</div>
      </div>
    </div>
  );
};

export default UserActionBoxContainer;
