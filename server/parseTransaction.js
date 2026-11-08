export function parseTransaction(transaction) {
  const meta = transaction.meta;

  if (!meta) {
    return {
      status: "unknown",
      feeLamports: null,
      transfers: [],
    };
  }

  if (meta.err !== null) {
    return {
      status: "failed",
      feeLamports: meta.fee,
      transfers: [],
    };
  }

  const instructions = transaction.transaction.message.instructions;

  const transfers = instructions
    .filter(
      (instruction) =>
        instruction.program === "system" &&
        instruction.parsed?.type === "transfer",
    )
    .map((instruction) => {
      const info = instruction.parsed.info;

      return {
        source: info.source,
        destination: info.destination,
        lamports: info.lamports,
        sol: info.lamports / 1_000_000_000,
      };
    });

  return {
    status: "succeeded",
    feeLamports: meta.fee,
    transfers,
  };
}
