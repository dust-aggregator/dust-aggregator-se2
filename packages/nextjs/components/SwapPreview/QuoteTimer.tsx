import { useEffect, useState } from "react";

const QuoteTimer = ({ getQuotes }: { getQuotes: () => void }) => {
  const [quoteTime, setQuoteTime] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteTime(quoteTime => {
        if (quoteTime === 1) {
          getQuotes();
          return 120;
        }
        return quoteTime - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });
  return (
    <p>
      new quote in: {Math.floor(quoteTime / 60)}:{String(quoteTime % 60).padStart(2, "0")}
    </p>
  );
};
export default QuoteTimer;
