import { useState } from "react";
import TransactionNotes from "./TransactionNotes";

function TransactionItem({ transaction, walletAddress }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function inspectTransaction() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/transactions/${encodeURIComponent(transaction.signature)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not inspect transaction.");
      }

      setDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <li>
      <p>
        <strong>{transaction.failed ? "Failed" : "Succeeded"}</strong>
        {" · "}
        {transaction.confirmationStatus}
      </p>

      <p>
        {transaction.blockTime == null
          ? "Date unavailable"
          : new Date(transaction.blockTime * 1000).toLocaleString()}
      </p>

      <a
        href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Solana Explorer
      </a>

      <p>
        <button onClick={inspectTransaction} disabled={loading}>
          {loading
            ? "Inspecting..."
            : details
              ? "Refresh details"
              : "Inspect transaction"}
        </button>
      </p>

      {error && <p role="alert">{error}</p>}

      {details && (
        <section aria-label="Transaction details">
          <p>Execution: {details.status}</p>

          <p>
            Network fee:{" "}
            {details.feeLamports === null
              ? "Unavailable"
              : `${details.feeLamports} lamports`}
          </p>

          {details.transfers.length > 0 ? (
            <ul>
              {details.transfers.map((transfer, index) => (
                <li key={index}>
                  <p>
                    <strong>{transfer.sol} SOL</strong>
                  </p>
                  <p style={{ overflowWrap: "anywhere" }}>
                    From: {transfer.source}
                  </p>
                  <p style={{ overflowWrap: "anywhere" }}>
                    To: {transfer.destination}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No supported transfers found in this transaction.</p>
          )}

          <p>Coverage: {details.coverage}</p>
        </section>
      )}
      <TransactionNotes
        walletAddress={walletAddress}
        signature={transaction.signature}
      />
    </li>
  );
}

export default TransactionItem;
