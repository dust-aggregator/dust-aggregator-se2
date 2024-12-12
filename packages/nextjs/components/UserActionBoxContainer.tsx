interface UserActionBoxContainerProps {
  children: any
  glow: boolean
}

const UserActionBoxContainer = ({ children, glow }: UserActionBoxContainerProps) => {
  return (
    <div className="relative w-[313px] h-[354px]">
      <div
        className={`w-full h-full absolute inset-0 ${glow ? "bg-[#e6ffff] drop-shadow-[0_0_7px_rgba(0,_187,_255,_1)]" : "bg-black"} z-10 rounded-2xl`}
      />
      <div className="w-full h-full flex justify-center items-center mt-1">
        <div
          className="flex flex-col w-[300px] h-[357px] bg-no-repeat bg-center bg-contain z-20 p-4"
          style={{ backgroundImage: "url('/assets/input_box_bg.svg')" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserActionBoxContainer;
