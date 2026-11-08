# RelayLedger

A treasury handover prototype for communities using Solana.

RelayLedger connects transaction records with user-written explanations,
evidence links and outstanding commitments, then produces an exportable
handover draft with an optional Gemini-assisted summary.

## Links

- Live app: https://relayledger-vvqm.onrender.com/
- Repository: https://github.com/ufidscript/relayledger

The first request may take around a minute while the free hosting service wakes up.

## Why we built it

The idea grew from Ibrahim's experience as a student community organizer
and an interest in how financial context survives leadership changes.

A transaction can show where funds moved, while the purpose, supporting
documents and pending responsibilities still need to be recorded by people.

This prototype explores that workflow for communities using Solana.
Demand for the specific handover workflow has not yet been validated
through user interviews.

## Team contributions

- **Ibrahim Danjuma:** application development, API integration and deployment.
- **Usman Abdullahi:** idea development and testing.

## Features

- Read a public address's native SOL balance on Solana Devnet.
- Load up to 10 recent transaction records.
- Inspect top-level native SOL transfer instructions.
- Save transaction explanations, categories and evidence links.
- Flag missing explanations and evidence links.
- Track outstanding commitments and responsible roles.
- Generate and download a text handover report.
- Request a Gemini-assisted summary with transaction references.

## Try it

Use this public Devnet example address:

```text
83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri
```

1. Load the wallet and expand a transaction.
2. Inspect its details.
3. Add a clearly labelled illustrative note.
4. Add an open commitment.
5. Generate the handover and optional AI summary.
6. Download the report.

The example address is not claimed as a wallet owned by this project.
Any demo explanations are illustrative, not factual claims about its activity.

## Architecture

- React and Vite: browser interface.
- Express and Node.js: API and production frontend hosting.
- Solana JSON-RPC: balances and transaction records.
- Browser localStorage: saved notes and commitments.
- Gemini API: handover summarization, called through the server.

The API key stays on the server. Creating an AI summary sends the
generated report, including saved notes and commitments, to Google Gemini.

## Run locally

Run the installation commands from the repository root:

```bash
npm ci --prefix server
npm ci --prefix client --include=dev
```

Create `server/.env`:

```env
SOLANA_RPC_URL=https://api.devnet.solana.com
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

Start the backend:

```bash
cd server
npm run dev
```

In another terminal, starting from the repository root, run:

```bash
cd client
npm run dev
```

Open the frontend URL printed by Vite.

For the production setup, run these commands from the repository root:

```bash
npm run build --prefix client
npm start --prefix server
```

Open http://localhost:3000.

## Limitations

- Devnet prototype using test funds.
- Loads only 10 recent transaction records, not a complete ledger.
- Transfer inspection covers top-level native SOL transfers.
- Transaction decoding currently supports legacy and version-0 transactions.
- Token transfers, inner transfers and full Squads interpretation are outside scope.
- Notes remain in the same browser and origin; there is no account system,
  shared workspace or cross-device synchronization.
- Anyone entering an address can create their own local notes; this does
  not establish authority over that wallet.
- Evidence links and spending explanations are not independently verified.
- Missing-information flags describe records in the local workspace;
  supporting information may exist elsewhere.
- The report does not calculate complete spending totals or reconcile accounts.
- AI output requires human review.
- The application cannot move funds or transfer wallet control.

## Validation

Ibrahim manually checked the deployed workflow:

- Wallet lookup and transaction inspection.
- Saved notes and commitments surviving refresh.
- Report generation and download.
- Gemini summary generation and inclusion in the downloaded report.

Usman also contributed to testing the prototype.

The frontend production build passed.

## AI disclosure

ChatGPT/Codex assisted with planning, architecture, code generation,
explanations and debugging. Gemini provides the application's optional
handover summaries.

Ibrahim implemented the application with AI assistance as part of his
learning journey. Usman contributed to idea development and testing.
