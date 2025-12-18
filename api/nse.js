import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const home = await fetch("https://www.nseindia.com", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      },
      timeout: 10000
    });

    const cookies = home.headers.raw()["set-cookie"];
    if (!cookies) throw new Error("No NSE cookies");

    const api = await fetch("https://www.nseindia.com/api/allIndices", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
        "Cookie": cookies.join("; ")
      },
      timeout: 10000
    });

    if (!api.ok) throw new Error("NSE API blocked");

    const json = await api.json();

    const out = {};
    json.data.forEach(row => {
      if (row.index === "NIFTY 50") out.nifty50 = Number(row.last);
      if (row.index === "NIFTY MIDCAP 150") out.midcap150 = Number(row.last);
      if (row.index === "NIFTY SMALLCAP 250") out.smallcap250 = Number(row.last);
    });

    if (!out.nifty50 || !out.midcap150 || !out.smallcap250) {
      throw new Error("Missing index values");
    }

    res.status(200).json({ source: "NSE", data: out });

  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
}
