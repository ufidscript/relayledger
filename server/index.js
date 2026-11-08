import "dotenv/config";
import express from "express";
import {
  getWalletBalance,
  getWalletTransactions,
  getTransactionDetails,
} from "./solana.js";
import { parseTransaction } from "./parseTransaction.js";

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

app.get("/api/transactions/:signature", async (req, res) => {
  const { signature } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(signature)) {
    return res.status(400).json({
      error: "Enter a valid transaction signature.",
    });
  }

  try {
    const transaction = await getTransactionDetails(signature);

    if (transaction === null) {
      return res.status(404).json({
        error: "Transaction details are unavailable on Devnet.",
      });
    }

    res.json({
      signature,
      network: "devnet",
      blockTime: transaction.blockTime,
      ...parseTransaction(transaction),
      coverage: "Top-level native SOL transfers only",
    });
  } catch (error) {
    console.error("Transaction details failed:", error.message);

    res.status(502).json({
      error: "Could not load transaction details from Solana.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`RelayLedger API: http://localhost:${PORT}`);
});
