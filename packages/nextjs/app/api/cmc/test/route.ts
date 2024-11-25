import { NextResponse } from "next/server";
import axios from "axios";

//@params - req: Request
export const GET = async () => {
  let response: any;
  try {
    response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
      headers: {
        "X-CMC_PRO_API_KEY": "95ac92c8-a96f-4c62-aec4-1dcc0d313134",
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

  // try {
  //   console.log("Getting price");

  //   const url = new URL("https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest");

  //   const params = {
  //     start: "1",
  //     limit: "5000",
  //     convert: "USD",
  //   };

  //   Object.keys(params).forEach(key => url.searchParams.append(key, params[key as keyof typeof params]));

  //   const headers = new Headers();
  //   headers.append("Content-Type", "application/json");
  //   headers.append("X-CMC_PRO_API_KEY", "95ac92c8-a96f-4c62-aec4-1dcc0d313134");
  //   headers.append;
  //   const result = await fetch(url, {
  //     method: "GET",
  //     headers,
  //   });

  //   console.log(result);

  //   console.log("price received");
  //   return NextResponse.json(result, { status: 200 });
  // } catch (error: any) {
  //   if (error.message === "Request failed with status code 404") {
  //     return NextResponse.json({ error: (error as Error).message }, { status: 200 });
  //   } else {
  //     return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  //   }
  // }
};
