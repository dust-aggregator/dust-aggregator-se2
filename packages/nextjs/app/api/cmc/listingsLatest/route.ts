import { NextResponse } from "next/server";
import axios from "axios";

//@params - req: Request
export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const limit = url.searchParams.get("limit");

  let response: any;

  if (!process.env.CMC_API_KEY) {
    throw new Error("API key is not defined");
  }

  try {
    response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
      },
      params: {
        start: start,
        limit: limit,
      },
    });
  } catch (ex) {
    response = null;
    // error
    console.log(ex);
    return NextResponse.json({ error: (ex as Error).message }, { status: 500 });
  }
  if (response) {
    // success
    const json = response.data;
    console.log(json);
    return NextResponse.json(json.data, { status: 200 });
  }
};
