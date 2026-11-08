import "dotenv/config";
import express from "express";
import {
  getWalletBalance,
  getWalletTransactions,
  getTransactionDetails,
} from "./solana.js";
import { parseTransaction } from "./parseTransaction.js";
import { summarizeHandover } from "./gemini.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

app.post("/api/handover/summary", async (req, res) => {
  const { report } = req.body || {};

  if (
    typeof report !== "string" ||
    report.trim().length === 0 ||
    report.length > 40000
  ) {
    return res.status(400).json({
      error: "Provide a report between 1 and 40,000 characters.",
    });
  }

  try {
    const summary = await summarizeHandover(report);
    res.json({ summary });
  } catch (error) {
    console.error("Summary generation failed:", error.message);

    res.status(502).json({
      error:
        "AI summary unavailable. You can still download the original report.",
    });
  }
});

// Unknown API routes return JSON rather than an HTML page.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDirectory, "../client/dist");

app.use(express.static(clientDist));

app.get("/", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`RelayLedger API: http://localhost:${PORT}`);
});
