module.exports = async (req, res) => {
  try {
    const home = await fetch("https://www.nseindia.com", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    const cookies = home.headers.get("set-cookie");
    if (!cookies) {
      res.status(500).json({ error: true, message: "No NSE cookies" });
      return;
    }

    const api = await fetch("https://www.nseindia.com/api/allIndices", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
        "Cookie": cookies
      }
    });

    if (!api.ok) {
      res.status(500).json({ error: true, message: "NSE API blocked" });
      return;
    }

    const json = await api.json();

    const out = {};
    json.data.forEach(row => {
      if (row.index === "NIFTY 50") out.nifty50 = Number(row.last);
      if (row.index === "NIFTY MIDCAP 150") out.midcap150 = Number(row.last);
      if (row.index === "NIFTY SMALLCAP 250") out.smallcap250 = Number(row.last);
    });

    if (!out.nifty50 || !out.midcap150 || !out.smallcap250) {
      res.status(500).json({ error: true, message: "Missing index values" });
      return;
    }

    res.status(200).json({
      source: "NSE",
      data: out
    });

  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
};
