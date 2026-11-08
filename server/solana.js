const RPC_URL = process.env.SOLANA_RPC_URL;

export async function getWalletBalance(address) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address, { commitment: "finalized" }],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Solana service returned ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return {
    address,
    network: "devnet",
    lamports: data.result.value,
    sol: data.result.value / 1_000_000_000,
  };
}

export async function getWalletTransactions(address) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getSignaturesForAddress",
      params: [
        address,
        {
          limit: 10,
          commitment: "finalized",
        },
      ],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Solana service returned ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return {
    address,
    network: "devnet",
    transactions: data.result.map((transaction) => ({
      signature: transaction.signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      failed: transaction.err !== null,
      confirmationStatus: transaction.confirmationStatus,
    })),
  };
}

export async function getTransactionDetails(signature) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [
        signature,
        {
          encoding: "jsonParsed",
          commitment: "finalized",
          maxSupportedTransactionVersion: 0,
        },
      ],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Solana service returned ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result;
}
