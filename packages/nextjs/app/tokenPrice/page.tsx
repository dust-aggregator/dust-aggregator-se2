"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";

const TokenPrice: NextPage = () => {
  async function getPrice() {
    const result = await fetch(`/api/cmc/test?ids=1,2,3,1027`);
    const resultJson = await result.json();
    console.log(resultJson);

    setTokens(Object.values(resultJson));
  }

  useEffect(() => {
    getPrice();
  }, []);

  const [tokens, setTokens] = useState([]);

  const tokenComponents = tokens.map((token: any, index: number) => {
    return (
      <div className="flex gap-1">
        <p>{`${token.name}:`}</p>
        <p>{`$${token.quote.USD.price}`}</p>
      </div>
    );
  });

  return <div>{tokenComponents}</div>;
};

export default TokenPrice;
