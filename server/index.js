import "dotenv/config";
import express from "express";
import { getWalletBalance, getWalletTransactions } from "./solana.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "RelayLedger API is running",
  });
});

app.get("/api/wallet/:address/balance", async (req, res) => {
  const { address } = req.params;

  // Preliminary format check; Solana validates the address further.
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({
      error: "Enter a valid Solana address.",
    });
  }

  try {
    const balance = await getWalletBalance(address);
    res.json(balance);
  } catch (error) {
    console.error("Balance lookup failed:", error.message);

    res.status(502).json({
      error: "Could not load the balance from Solana. Please try again.",
    });
  }
});

app.get("/api/wallet/:address/transactions", async (req, res) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return res.status(400).json({
      error: "Enter a valid Solana address.",
    });
  }

  try {
    const result = await getWalletTransactions(address);
    res.json(result);
  } catch (error) {
    console.error("Transaction lookup failed:", error.message);

    res.status(502).json({
      error: "Could not load transactions from Solana. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`RelayLedger API: http://localhost:${PORT}`);
});
