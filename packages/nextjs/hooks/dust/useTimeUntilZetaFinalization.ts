import { useEffect, useState } from "react";
import { zetachain } from "viem/chains";
import { useBlockNumber } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

export const useTimeUntilZetaFinalization = (blockNum?: bigint) => {
  const { inputNetwork, outputNetwork } = useGlobalState();
  const [totalTimeRequired, setTotalTimeRequired] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number>();
  const [percentageComplete, setPercentageComplete] = useState<number>(100);

  const { data: currentBlockNum } = useBlockNumber({
    chainId: zetachain.id,
    watch: true,
  });

  useEffect(() => {
    if (!!inputNetwork && !!outputNetwork) {
      const timeToDeposit = inputNetwork.numBlocksForConfirmation * inputNetwork.blockTime;
      const timeToWithdraw = outputNetwork.numBlocksForConfirmation * outputNetwork.blockTime;
      setTotalTimeRequired(timeToDeposit + timeToWithdraw);
    }
  }, [inputNetwork, outputNetwork]);

  useEffect(() => {
    if (currentBlockNum && totalTimeRequired && blockNum) {
      const numBlocksElapsed = Number(currentBlockNum) - Number(blockNum);
      const timeElapsed = numBlocksElapsed * 5;
      setTimeLeft(totalTimeRequired - timeElapsed);
    }
  }, [currentBlockNum, totalTimeRequired, blockNum]);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft && totalTimeRequired) {
      setPercentageComplete(Math.round(100 - (timeLeft / totalTimeRequired) * 100));
    }
  }, [timeLeft, totalTimeRequired]);

  return {
    percentageComplete,
    timeLeft,
  };
};
