import { useState } from "react";

function HandoverReport({ walletAddress, balance, transactions }) {
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  function generateReport() {
    setError("");
    setReport("");
    setSummary("");

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
          category:
            typeof saved?.category === "string"
              ? saved.category
              : "Uncategorised",
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

      const openCommitments = commitments.filter(
        (item) => item && !item.resolved,
      );

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
        "Missing information refers only to records saved in this browser.",
        "",
        "REVIEW SUMMARY",
        `Records without a saved explanation: ${missingPurpose.length}`,
        `Records without an evidence link: ${missingEvidence.length}`,
        `Open commitments: ${openCommitments.length}`,
        "",
        "TRANSACTION RECORDS",
      ];

      if (records.length === 0) {
        lines.push("No transaction records were loaded.");
      }

      records.forEach((record) => {
        const { transaction } = record;

        lines.push(
          "",
          `[${record.reference}] ${transaction.signature}`,
          `Execution: ${
            transaction.failed === true
              ? "Failed"
              : transaction.failed === false
                ? "Succeeded"
                : "Unknown"
          }`,
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
          `[C${index + 1}] ${item.description || "No description supplied"}`,
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

  async function generateSummary() {
    if (!report.trim() || summarizing) return;

    setSummarizing(true);
    setSummary("");
    setError("");

    try {
      const response = await fetch("/api/handover/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report }),
        signal: AbortSignal.timeout(100000),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an unexpected response. Check that the summary API is running.",
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Summary generation failed.");
      }

      if (typeof data.summary !== "string" || !data.summary.trim()) {
        throw new Error("The AI service returned an empty summary.");
      }

      setSummary(data.summary.trim());
    } catch (err) {
      setError(
        err.name === "TimeoutError"
          ? "The summary request timed out. You can still download the source report."
          : err.message || "Could not generate the AI summary.",
      );
    } finally {
      setSummarizing(false);
    }
  }

  function downloadReport() {
    if (!report) return;

    const exportText = summary
      ? `AI-ASSISTED DRAFT — REVIEW REQUIRED\n\n${summary}\n\nSOURCE REPORT\n\n${report}`
      : report;

    const blob = new Blob([exportText], {
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

      <button onClick={generateReport} disabled={summarizing}>
        Generate handover draft
      </button>

      {error && <p role="alert">{error}</p>}

      {report && (
        <>
          <p role="status">
            {summarizing
              ? "Writing your AI summary..."
              : "Draft ready. Review it before sharing."}
          </p>

          <button onClick={downloadReport} disabled={summarizing}>
            Download handover
          </button>

          <p>
            Creating an AI summary sends this report, including saved notes and
            commitments, to Google Gemini.
          </p>

          <button onClick={generateSummary} disabled={summarizing}>
            {summarizing ? "Writing summary..." : "Create AI summary"}
          </button>

          {summary && (
            <div>
              <h3>AI-assisted draft — review required</h3>
              <pre className="report-preview">{summary}</pre>
            </div>
          )}

          <details className="source-report">
            <summary>View source report and transaction references</summary>
            <pre className="report-preview">{report}</pre>
          </details>
        </>
      )}
    </section>
  );
}

export default HandoverReport;
