import { GoogleAnalytics } from "@next/third-parties/google";
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Dust.fun",
  description: "CONVERT ALL DUST TOKENS FROM YOUR WALLET IN ONE TRANSACTION",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body className="text-[#FFFFFF]">
        <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
      </body>
      {process.env.VERCEL_ENV === "production" && <GoogleAnalytics gaId="G-1ZHGSF1P55" />}
    </html>
  );
};

export default ScaffoldEthApp;
