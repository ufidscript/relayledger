import TransactionItem from "./TransactionItem";

function TransactionList({ transactions, walletAddress }) {
  if (transactions.length === 0) {
    return <p>No recent transactions found.</p>;
  }

  return (
    <section>
      <h2>Recent transactions</h2>
      <p>Up to 10 recent records—not a complete financial history.</p>

      <ul>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.signature}
            transaction={transaction}
            walletAddress={walletAddress}
          />
        ))}
      </ul>
    </section>
  );
}

export default TransactionList;
