import TransactionItem from "./TransactionItem";

function TransactionList({ transactions, walletAddress }) {
  if (transactions.length === 0) {
    return <p>No recent transactions found.</p>;
  }

  return (
    <section id="transactions">
      <h2>Recent transactions</h2>
      <p>
        Up to 10 recent records. Expand a transaction to inspect it or add
        context.
      </p>

      <ul className="transaction-list">
        {transactions.map((transaction) => (
          <li
            className="transaction-row"
            key={`${walletAddress}:${transaction.signature}`}
          >
            <details>
              <summary className="transaction-summary">
                <span>
                  <strong>
                    {transaction.blockTime == null
                      ? "Date unavailable"
                      : new Date(transaction.blockTime * 1000).toLocaleString()}
                  </strong>

                  <span className="transaction-id">
                    {transaction.signature.slice(0, 8)}…
                    {transaction.signature.slice(-8)}
                  </span>
                </span>

                <span
                  className={
                    transaction.failed ? "status-failed" : "status-success"
                  }
                >
                  {transaction.failed ? "Failed" : "Succeeded"}
                </span>
              </summary>

              <ul className="transaction-expanded">
                <TransactionItem
                  transaction={transaction}
                  walletAddress={walletAddress}
                />
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TransactionList;
