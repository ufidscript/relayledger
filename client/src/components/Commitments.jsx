import { useState } from "react";

function Commitments({ walletAddress }) {
  const storageKey = `relayledger:devnet:${walletAddress}:commitments`;

  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [error, setError] = useState("");

  function persist(nextItems) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextItems));
      setItems(nextItems);
      setError("");
      return true;
    } catch {
      setError("Could not save commitments in this browser.");
      return false;
    }
  }

  function addCommitment(event) {
    event.preventDefault();

    if (!description.trim()) return;

    const nextItems = [
      ...items,
      {
        id: crypto.randomUUID(),
        description: description.trim(),
        owner: owner.trim(),
        resolved: false,
        createdAt: new Date().toISOString(),
      },
    ];

    if (persist(nextItems)) {
      setDescription("");
      setOwner("");
    }
  }

  function toggleResolved(id) {
    persist(
      items.map((item) =>
        item.id === id ? { ...item, resolved: !item.resolved } : item,
      ),
    );
  }

  function removeCommitment(id) {
    persist(items.filter((item) => item.id !== id));
  }

  return (
    <section>
      <h2>Outstanding commitments</h2>
      <p>
        Record pending payments, missing documents or follow-up tasks. These
        statements are entered by you, not verified on Solana.
      </p>

      <form onSubmit={addCommitment}>
        <label>
          What still needs attention?
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="For example: request the printing receipt"
            maxLength={1000}
            required
          />
        </label>

        <label>
          Responsible person or role
          <input
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="For example: outgoing treasurer"
            maxLength={100}
          />
        </label>

        <button type="submit">Add commitment</button>
      </form>

      {error && <p role="alert">{error}</p>}

      <p>{items.filter((item) => !item.resolved).length} open commitments</p>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <h3>{item.resolved ? "Resolved" : "Open"}</h3>
            <p>{item.description}</p>
            <p>Responsible: {item.owner || "Unassigned"}</p>
            <button onClick={() => toggleResolved(item.id)}>
              {item.resolved ? "Reopen" : "Mark resolved"}
            </button>{" "}
            <button onClick={() => removeCommitment(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Commitments;
