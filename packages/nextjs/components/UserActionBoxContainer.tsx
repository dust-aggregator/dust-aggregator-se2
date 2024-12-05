const UserActionBoxContainer = ({ children }: any) => {
  return (
    <div className="relative w-[313px] h-[354px]">
      <div className="w-full h-full absolute inset-0 bg-[#161D22] z-10 rounded-2xl" />
      <div className="w-full h-full flex justify-center items-center mt-1">
        <div
          className="flex-column w-[300px] h-[357px] bg-no-repeat bg-center bg-contain z-20 p-6"
          style={{ backgroundImage: "url('/assets/input_box_bg.svg')" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserActionBoxContainer;
