import { useState } from "react";

function HandoverReport({ walletAddress, balance, transactions }) {
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  function generateReport() {
    setError("");
    setReport("");

    try {
      const prefix = `relayledger:devnet:${walletAddress}`;

      const records = transactions.map((transaction, index) => {
        const saved = JSON.parse(
          localStorage.getItem(`${prefix}:${transaction.signature}`),
        );

        return {
          reference: `T${index + 1}`,
          transaction,
          purpose:
            typeof saved?.purpose === "string" ? saved.purpose.trim() : "",
          category: saved?.category || "Uncategorised",
          evidenceUrl:
            typeof saved?.evidenceUrl === "string"
              ? saved.evidenceUrl.trim()
              : "",
        };
      });

      const savedCommitments = JSON.parse(
        localStorage.getItem(`${prefix}:commitments`),
      );

      const commitments = Array.isArray(savedCommitments)
        ? savedCommitments
        : [];

      const openCommitments = commitments.filter((item) => !item.resolved);

      const missingPurpose = records.filter((record) => !record.purpose);

      const missingEvidence = records.filter((record) => !record.evidenceUrl);

      const lines = [
        "RELAYLEDGER — HANDOVER DRAFT",
        "",
        `Generated: ${new Date().toISOString()}`,
        `Wallet: ${walletAddress}`,
        "Network: Solana Devnet — test funds",
        `Last loaded native SOL balance: ${balance.sol} SOL`,
        "",
        "SCOPE AND LIMITATIONS",
        `This report covers ${records.length} loaded recent transaction records.`,
        "It is not a complete financial history or an audit.",
        "The balance was loaded separately from the transaction history.",
        "Notes and commitments are user-entered and unverified.",
        "Evidence links have not been checked for authenticity or availability.",
        "Illustrative demo notes must not be treated as factual spending claims.",
        "",
        "REVIEW SUMMARY",
        `Records without a saved explanation: ${missingPurpose.length}`,
        `Records without an evidence link: ${missingEvidence.length}`,
        `Open commitments: ${openCommitments.length}`,
        "",
        "TRANSACTION RECORDS",
      ];

      records.forEach((record) => {
        const { transaction } = record;

        lines.push(
          "",
          `[${record.reference}] ${transaction.signature}`,
          `Execution: ${transaction.failed ? "Failed" : "Succeeded"}`,
          `Confirmation: ${transaction.confirmationStatus || "Unknown"}`,
          `Date: ${
            transaction.blockTime == null
              ? "Unavailable"
              : new Date(transaction.blockTime * 1000).toISOString()
          }`,
          `Category: ${record.category}`,
          `User explanation: ${record.purpose || "MISSING"}`,
          `Evidence link: ${record.evidenceUrl || "NOT PROVIDED"}`,
          `On-chain record: https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`,
        );
      });

      lines.push("", "OPEN COMMITMENTS — USER-ENTERED");

      if (openCommitments.length === 0) {
        lines.push("No open commitments recorded in this workspace.");
      }

      openCommitments.forEach((item, index) => {
        lines.push(
          "",
          `[C${index + 1}] ${item.description}`,
          `Responsible: ${item.owner || "Unassigned"}`,
        );
      });

      lines.push(
        "",
        "FOLLOW-UP CHECKLIST",
        `Request explanations for: ${
          missingPurpose.map((item) => item.reference).join(", ") || "None"
        }`,
        `Review missing evidence for: ${
          missingEvidence.map((item) => item.reference).join(", ") || "None"
        }`,
        "Review open commitments with the outgoing team.",
        "Confirm whether other wallets, tokens or older records must be included.",
        "",
        "This draft does not transfer wallet access or spending authority.",
      );

      setReport(lines.join("\n"));
    } catch {
      setError(
        "Could not read saved workspace records. No report was generated.",
      );
    }
  }

  function downloadReport() {
    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `relayledger-handover-${walletAddress.slice(0, 8)}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section>
      <h2>Financial handover</h2>
      <p>
        Save your transaction notes and commitments first. Generate again after
        making changes.
      </p>

      <button onClick={generateReport}>Generate handover draft</button>

      {error && <p role="alert">{error}</p>}

      {report && (
        <>
          <p role="status">Draft ready. Review it before sharing.</p>

          <button onClick={downloadReport}>Download handover</button>

          <pre className="report-preview">{report}</pre>
        </>
      )}
    </section>
  );
}

export default HandoverReport;
