import { useState } from 'react'
import { useAccount } from 'wagmi'
import { YieldTable } from './components/YieldTable'
import { CompareView } from './pages/CompareView'
import { WalletConnect } from './components/WalletConnect'
import { PositionTracker } from './components/PositionTracker'

type Tab = 'yields' | 'compare' | 'positions'

function App() {
  const [tab, setTab] = useState<Tab>('yields')
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">DeFi Yield Tracker</h1>
          <WalletConnect />
        </div>
      </header>

      <nav className="border-b border-gray-800 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex gap-6">
          {(
            [
              { id: 'yields' as Tab,     label: 'Protocol Yields' },
              { id: 'compare' as Tab,    label: 'Compare Rates' },
              { id: 'positions' as Tab,  label: 'My Positions' },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tab === 'yields' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Protocol Yields</h2>
              <p className="mt-1 text-sm text-gray-400">
                Live APY/APR data across DeFi protocols. Click a row for details.
              </p>
            </div>
            <YieldTable />
          </>
        )}
        {tab === 'compare' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Compare Rates</h2>
              <p className="mt-1 text-sm text-gray-400">
                Side-by-side yield comparison across protocols for a single asset.
              </p>
            </div>
            <CompareView />
          </>
        )}
        {tab === 'positions' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">My Positions</h2>
              <p className="mt-1 text-sm text-gray-400">
                Your deposited balances in Aave V3 and Compound V2, read directly on-chain.
              </p>
            </div>
            {isConnected ? (
              <PositionTracker />
            ) : (
              <div className="rounded-lg border border-gray-800 bg-gray-900 py-16 text-center">
                <p className="text-lg font-medium text-gray-400">
                  Connect your wallet to view positions
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Supports Mainnet and Sepolia.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
