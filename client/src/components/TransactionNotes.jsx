import { useState } from "react";

function TransactionNotes({ walletAddress, signature }) {
  const storageKey = `relayledger:devnet:${walletAddress}:${signature}`;

  const [note, setNote] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));

      return {
        purpose: saved?.purpose || "",
        category: saved?.category || "Other",
        evidenceUrl: saved?.evidenceUrl || "",
      };
    } catch {
      return {
        purpose: "",
        category: "Other",
        evidenceUrl: "",
      };
    }
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setNote((previous) => ({ ...previous, [name]: value }));
    setMessage("");
    setError("");
  }

  function saveNote(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const cleaned = {
      purpose: note.purpose.trim(),
      category: note.category,
      evidenceUrl: note.evidenceUrl.trim(),
    };

    if (cleaned.evidenceUrl) {
      try {
        const url = new URL(cleaned.evidenceUrl);

        if (!["https:", "http:"].includes(url.protocol)) {
          throw new Error("Unsupported URL");
        }
      } catch {
        setError("Evidence must be a valid HTTP or HTTPS link.");
        return;
      }
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...cleaned,
          updatedAt: new Date().toISOString(),
        }),
      );

      setNote(cleaned);
      setMessage("Saved in this browser.");
    } catch {
      setError("Could not save. Browser storage may be unavailable.");
    }
  }

  return (
    <section aria-label="Transaction context">
      <h3>Spending context</h3>
      <p>Personal workspace notes — not verified community statements.</p>

      <form onSubmit={saveNote}>
        <p>
          <label>
            Purpose
            <textarea
              name="purpose"
              value={note.purpose}
              onChange={updateField}
              maxLength={2000}
              placeholder="Explain why this transaction happened"
              rows={3}
            />
          </label>
        </p>

        <p>
          <label>
            Category
            <select
              name="category"
              value={note.category}
              onChange={updateField}
            >
              <option>Other</option>
              <option>Funding</option>
              <option>Event costs</option>
              <option>Contributor payment</option>
              <option>Reimbursement</option>
              <option>Internal transfer</option>
            </select>
          </label>
        </p>

        <p>
          <label>
            Evidence link
            <input
              type="url"
              name="evidenceUrl"
              value={note.evidenceUrl}
              onChange={updateField}
              maxLength={2000}
              placeholder="https://..."
            />
          </label>
        </p>

        <button type="submit">Save context</button>
      </form>

      {!note.purpose.trim() && <p>⚠ Missing explanation</p>}
      {!note.evidenceUrl.trim() && <p>⚠ No evidence link supplied</p>}

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

export default TransactionNotes;
