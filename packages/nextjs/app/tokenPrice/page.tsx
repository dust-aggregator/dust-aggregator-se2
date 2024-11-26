"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";

const TokenPrice: NextPage = () => {
  async function getPrice() {
    const result = await fetch(`/api/cmc/quotesLatest?ids=1,2,3,1027`);
    const resultJson = await result.json();

    setTokens(Object.values(resultJson));
  }

  async function getAllListings() {
    let startCount = 1;
    let limit = 5000;

    const pagination = 5000;

    let currentPagination = pagination;

    const results = [];
    for (let i = 0; i < 10; i++) {
      const result = await getListings(startCount, pagination);

      results.push(...result);
      startCount += pagination;
      currentPagination += pagination;
    }

    setTokens2(results);
  }

  async function getListings(startCount: number, limit: number) {
    const result = await fetch(`/api/cmc/listingsLatest?start=${startCount}&limit=${limit}`);
    const resultJson = await result.json();

    const arr = Object.values(resultJson);
    return arr;
  }

  useEffect(() => {
    getPrice();

    getAllListings();
    // getListings();
  }, []);

  const [tokens, setTokens] = useState([]);
  const [tokens2, setTokens2] = useState<any[]>([]);

  console.log(tokens2);

  const tokenComponents = tokens.map((token: any, index: number) => {
    return (
      <div className="flex gap-1">
        <p>{`${token?.name}:`}</p>
        <p>{`$${token?.quote?.USD?.price}`}</p>
      </div>
    );
  });

  const tokenComponents2 = tokens2.map((token: any, index: number) => {
    return (
      <div className="flex gap-1">
        <p>{`${token?.name}:`}</p>
        <p>{`$${token?.quote?.USD?.price}`}</p>
      </div>
    );
  });

  return <div>{tokenComponents2}</div>;
};

export default TokenPrice;
