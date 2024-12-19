import * as React from "react"
import Image from "next/image"
import buttonBg from "~~/public/connect-btn-bg.svg"
import btcLogo from "~~/public/btc.svg"
import solLogo from "~~/public/sol.svg"
import ethLogo from "~~/public/eth.svg"
import exitLogo from "~~/public/assets/exit.svg"
import { RainbowKitCustomConnectButton } from "../scaffold-eth"
import { cn } from "~~/lib/utils"
import {
  useAccount,
  useDisconnect
} from "wagmi"

export interface ConnectButtonProps {
  _chain: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const ConnectButton = React.forwardRef<HTMLDivElement, ConnectButtonProps>(
  ({ className, _chain, ...props }, ref) => {

    const { isConnected } = useAccount()
    const { disconnect } = useDisconnect()

    const isEthConnected = isConnected && _chain === "eth"

    const handleDisconnect = () => {
      if (isConnected && _chain === "eth") {
        disconnect()
      }
    }

    return (
      <div
        className={cn(
          "relative w-[28%] cursor-pointer font-bold text-[#D6D6D6]",
          _chain !== "eth" && "opacity-50 cursor-not-allowed",
          className,
        )}
        ref={ref}
        {...props}
        onClick={handleDisconnect}
      >
        <Image className="w-full" src={buttonBg} alt="footer" />

        <div className="absolute w-full h-full top-0 left-0">
          <div className={`w-full h-full flex items-center ${isEthConnected ? "justify-end" : "justify-start"}`}>

            <div className="bg-gradient-to-b from-[#D0A61D] to-[#533000] rounded-full w-[35px] h-[35px] lg:w-[40px] lg:h-[40px] 2xl:w-[50px] 2xl:h-[50px] -mx-4 flex justify-center items-center">
              <Image
                src={
                  _chain === "btc"
                    ? btcLogo
                    : _chain === "sol"
                      ? solLogo
                      : _chain === "eth"
                        ? ethLogo
                        : null
                }
                alt="chain"
                className="w-[85%] rounded-full"
              />
            </div>

            {!isEthConnected ? (
              <div className="absolute top-0 left-0 w-full h-[90%] flex items-center justify-end">
                <span className="w-[70%] text-xs 2xl:text-base text-center">
                  {_chain === "sol" ? "Soon" : "Connect"}
                </span>
              </div>
            ) : (
              <div className="absolute w-full h-[90%] flex items-center justify-start drop-shadow-[0_0_3px_rgba(0,_187,_255,_1)] group">
                
                <span className="w-[70%] text-xs 2xl:text-base text-center group-hover:hidden">
                  Active
                </span>

                <div className="w-[70%] items-center justify-center hidden group-hover:flex">
                  <Image
                    src={exitLogo}
                    alt="Exit"
                    className="h-[16px] 2xl:h-[20px]"
                  />
                </div>

              </div>

            )}
          </div>

        </div>        
      </div>
    )
  }
)
ConnectButton.displayName = "ConnectButton"

export { ConnectButton };
