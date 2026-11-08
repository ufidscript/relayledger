import { useState } from "react";
import TransactionList from "./components/TransactionList";
import Commitments from "./components/Commitments";
import HandoverReport from "./components/HandoverReport";

function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState(null);

  async function loadBalance(event) {
    event.preventDefault();

    const trimmedAddress = address.trim();

    setError("");
    setBalance(null);
    setTransactions(null);

    if (!trimmedAddress) {
      setError("Enter a Solana address.");
      return;
    }

    setLoading(true);

    try {
      const walletPath = `/api/wallet/${encodeURIComponent(trimmedAddress)}`;

      const balanceResponse = await fetch(`${walletPath}/balance`);
      const balanceData = await balanceResponse.json();

      if (!balanceResponse.ok) {
        throw new Error(balanceData.error || "Could not load the balance.");
      }

      setBalance(balanceData);

      const transactionsResponse = await fetch(`${walletPath}/transactions`);
      const transactionsData = await transactionsResponse.json();

      if (!transactionsResponse.ok) {
        throw new Error(
          transactionsData.error || "Could not load transactions.",
        );
      }

      setTransactions(transactionsData.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>RelayLedger</h1>
      <p>Clear treasury records. Better handovers.</p>
      <p>Network: Solana Devnet — test funds</p>
      <form onSubmit={loadBalance}>
        <label htmlFor="wallet-address">Solana wallet address</label>

        <input
          id="wallet-address"
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Paste a public Solana address"
          disabled={loading}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Load wallet"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {balance && (
        <section aria-label="Wallet balance">
          <h2>Wallet balance</h2>
          <p style={{ overflowWrap: "anywhere" }}>{balance.address}</p>
          <p>
            <strong>{balance.sol} SOL</strong>
          </p>
          <p>This is the native SOL balance, excluding other tokens.</p>
        </section>
      )}
      {balance && transactions !== null && (
        <TransactionList
          key={balance.address}
          transactions={transactions}
          walletAddress={balance.address}
        />
      )}

      {balance && (
        <Commitments key={balance.address} walletAddress={balance.address} />
      )}

      {balance && transactions !== null && (
        <HandoverReport
          key={balance.address}
          walletAddress={balance.address}
          balance={balance}
          transactions={transactions}
        />
      )}
    </main>
  );
}

export default App;
