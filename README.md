# DeFi Yield Tracker

Live APY/APR dashboard across major DeFi protocols — powered by DeFiLlama, no API key required.

**[Live Demo](https://defi-yield-tracker-fh7c3nhzo-fahadfahim13s-projects.vercel.app)**

---

## Features

- 📊 **Real-time yield data** from Aave V3, Compound V3, Curve, and Lido
- 🔍 **Asset filter** — search pools by symbol (ETH, USDC, DAI, etc.)
- 📈 **Sort by APY, TVL, or APR** — click column headers to reorder
- 🪟 **Pool detail modal** — click any row for a breakdown of APY components
- 🔌 **Wallet connect** — MetaMask and WalletConnect support (optional)
- 🆓 **No API keys needed** — uses the free DeFiLlama yields endpoint
- ⚡ **Auto-refresh** every 5 minutes via TanStack Query

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Web3 | wagmi v2 + viem |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v3 |
| Data source | DeFiLlama Yields API (free, no key) |
| Hosting | Vercel |

---

## Screenshot

> Dashboard showing live pool yields across Ethereum DeFi protocols.

```
┌─────────────────────────────────────────────────────────────┐
│  DeFi Yield Tracker                        [Connect Wallet] │
├─────────────────────────────────────────────────────────────┤
│  Protocol Yields                                            │
│  Live APY/APR data across DeFi protocols. Click for details │
│                                                             │
│  [Filter by asset...]                                       │
│                                                             │
│  Protocol   Asset    APY      TVL        Chain              │
│  ─────────────────────────────────────────────             │
│  Aave V3    USDC     5.23%    $2.4B      Ethereum           │
│  Lido       ETH      3.91%    $28B       Ethereum           │
│  Compound   USDT     4.10%    $890M      Ethereum           │
│  Curve      3CRV     2.88%    $1.1B      Ethereum           │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup & Run Locally

**Prerequisites:** Node.js 18+, npm

```bash
# Clone the repo
git clone https://github.com/fahadfahim13/defi-yield-tracker.git
cd defi-yield-tracker

# Install dependencies
npm install

# Copy env file (no real keys required — both are optional)
cp .env.example .env

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Optional env vars

| Variable | Purpose | Where to get |
|----------|---------|--------------|
| `VITE_ALCHEMY_KEY` | Faster RPC for on-chain reads | [alchemy.com](https://alchemy.com) — free tier |
| `VITE_WC_PROJECT_ID` | Mobile wallet support via WalletConnect | [cloud.walletconnect.com](https://cloud.walletconnect.com) — free |

Both are optional. The app works without them using the public RPC.

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Architecture

```
defi-yield-tracker/
├── src/
│   ├── App.tsx                    # Root layout — header + main
│   ├── components/
│   │   ├── YieldTable.tsx         # Main sortable/filterable pool table
│   │   └── PoolDetailModal.tsx    # Click-through detail view per pool
│   ├── hooks/
│   │   └── useProtocolYields.ts   # TanStack Query hook wrapping DeFiLlama
│   └── lib/
│       ├── defiLlama.ts           # fetchPools() + type definitions
│       ├── wagmi.ts               # wagmi config (chains, transports, connectors)
│       ├── abis.ts                # Contract ABIs (for future on-chain reads)
│       └── contracts.ts           # Contract addresses per chain
```

**Data flow:**

```
DeFiLlama API (/pools)
      │
      ▼
fetchPools() [defiLlama.ts]
      │  filter to TRACKED_PROJECTS
      ▼
useProtocolYields() [TanStack Query, 5min stale]
      │
      ▼
YieldTable → sort/filter in-component
      │
      └─ click row → PoolDetailModal
```

No backend. Everything is client-side. DeFiLlama is a public API with no rate limits for reasonable usage.

---

## Deploy to Vercel

The repo is pre-configured for Vercel (zero config needed for Vite):

1. Fork or clone this repo to your GitHub account
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the `defi-yield-tracker` repo
4. Leave all defaults (Vercel auto-detects Vite)
5. Add optional env vars if desired
6. Click **Deploy**

Auto-deploys on every push to `main`.

---

## Testing

### Running Unit Tests

```bash
# Run all tests once (CI mode)
npm run test

# Watch mode — re-runs on file change
npm run test:watch

# Interactive browser UI
npm run test:ui

# Coverage report
npm run test:coverage
```

Coverage is enforced at 70% for `src/lib/defiLlama.ts` and `src/hooks/useProtocolYields.ts`.

---

## Manual E2E Checklist

Run through this checklist against `npm run dev` (or a deployed build) before each release.

### 1. Wallet Connection

- [ ] Page loads without a connected wallet — "Connect Wallet" button is visible in the header
- [ ] Clicking "Connect Wallet" opens the wallet selection modal (MetaMask, WalletConnect, etc.)
- [ ] Connecting with MetaMask shows the truncated address in the header (e.g. `0xABcd…1234`)
- [ ] Disconnecting returns the header to the "Connect Wallet" state
- [ ] On mobile: WalletConnect QR code renders correctly and a mobile wallet can scan and connect

### 2. Yield Table

- [ ] On initial load, a loading skeleton or spinner is displayed while pools are fetched
- [ ] After fetch: table shows rows for Aave V3, Compound V3, Curve, and Lido pools
- [ ] Each row displays: Protocol, Chain, Symbol, TVL (USD), APY (%), 30D Mean APY
- [ ] Clicking a column header sorts the table by that column (ascending / descending toggle)
- [ ] The "Asset" filter input narrows rows to those whose symbol matches the typed string (case-insensitive)
- [ ] Clearing the filter restores all rows
- [ ] If the DeFiLlama API is unreachable, an error message is displayed instead of the table

### 3. APY History Chart

- [ ] Clicking a row in the yield table opens the Pool Detail modal / chart panel
- [ ] The chart renders a line graph of APY over time for the selected pool
- [ ] Time-range buttons (7D, 30D, 90D) switch the displayed history correctly
- [ ] The chart x-axis shows readable date labels; y-axis shows APY %
- [ ] Closing the modal returns focus to the table with no visible errors

### 4. Protocol Comparison

- [ ] The Compare view (if accessible via nav) loads and displays side-by-side protocol cards
- [ ] Each card shows Protocol name, current APY, 30D Mean APY, and TVL
- [ ] Selecting two or more protocols highlights differences in yield clearly
- [ ] The view is responsive: on a narrow viewport, cards stack vertically

### 5. General

- [ ] No console errors on initial page load
- [ ] No console errors after wallet connect / disconnect cycle
- [ ] No console errors after switching time ranges on the chart
- [ ] Page is functional on Chrome, Firefox, and Safari (latest stable)

---

## License

MIT — see [LICENSE](LICENSE)
