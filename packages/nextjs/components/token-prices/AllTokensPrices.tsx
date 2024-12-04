"use client";

import { useEffect, useState } from "react";

export const AllTokensPrices = () => {
  async function getAllListings() {
    let startCount = 1;

    const pagination = 5000;

    let currentPagination = pagination;

    const results = [];
    for (let i = 0; i < 10; i++) {
      const result = await getListings(startCount, pagination);

      results.push(...result);
      startCount += pagination;
      currentPagination += pagination;
    }

    setTokens(results);
  }

  async function getListings(startCount: number, limit: number) {
    const result = await fetch(`/api/cmc/listingsLatest?start=${startCount}&limit=${limit}`);
    const resultJson = await result.json();

    const arr = Object.values(resultJson);
    return arr;
  }

  useEffect(() => {
    getAllListings();
  }, []);

  const [tokens, setTokens] = useState<any[]>([]);

  console.log(tokens);

  const tokenComponents2 = tokens.map((token: any, index: number) => {
    return (
      <div className="flex gap-1" key={"tc-" + index}>
        <p>{`${token?.name}:`}</p>
        <p>{`$${token?.quote?.USD?.price}`}</p>
      </div>
    );
  });

  return <div>{tokenComponents2}</div>;
};
