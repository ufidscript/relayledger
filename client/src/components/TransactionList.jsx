function TransactionList({ transactions }) {
  if (transactions.length === 0) {
    return <p>No recent transactions found.</p>;
  }

  return (
    <section>
      <h2>Recent transactions</h2>
      <p>Up to 10 recent records—not a complete financial history.</p>

      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.signature}>
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
              View transaction on Solana Explorer
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TransactionList;
