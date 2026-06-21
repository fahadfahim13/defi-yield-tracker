# DeFi Yield Tracker

Live APY/APR dashboard across major DeFi protocols — powered by DeFiLlama, no API key required.

**[Live Demo](https://defi-yield-tracker.vercel.app)**

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

## License

MIT — see [LICENSE](LICENSE)
