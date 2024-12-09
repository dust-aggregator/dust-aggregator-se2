import { useEffect, useState } from "react";
import { ethers } from "ethers";

const BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";

export const useEthersProvider = () => {
  const [provider, setProvider] = useState<ethers.AbstractProvider | null>(null);
  useEffect(() => {
    const newProvider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
    setProvider(newProvider);
  }, []);

  return provider;
};
