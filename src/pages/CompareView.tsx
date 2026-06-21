import { useState } from 'react'
import { useProtocolYields } from '../hooks/useProtocolYields'
import { PROTOCOL_META, CHAIN_DISPLAY } from '../lib/defiLlama'

const ASSETS = ['USDC', 'DAI', 'ETH', 'WBTC', 'USDT']
const CHAINS = ['All', 'Ethereum', 'Arbitrum', 'Polygon'] as const

type Chain = (typeof CHAINS)[number]

function fmt(n: number | null | undefined, suffix = '%'): string {
  if (n == null) return '—'
  return `${n.toFixed(2)}${suffix}`
}

function fmtTvl(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  return `$${n.toFixed(0)}`
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-28 rounded bg-gray-700" />
        <div className="h-5 w-12 rounded-full bg-gray-700" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-20 rounded bg-gray-800" />
            <div className="h-4 w-16 rounded bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CompareView() {
  const [asset, setAsset] = useState('USDC')
  const [chain, setChain] = useState<Chain>('All')
  const { data: pools, isLoading, isError, error } = useProtocolYields(asset)

  const filtered = (pools ?? [])
    .filter((p) => chain === 'All' || p.chain === chain)
    .sort((a, b) => b.apy - a.apy)

  const bestApy = filtered[0]?.apy ?? -Infinity

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Asset
          </label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ASSETS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Chain
          </label>
          <div className="flex gap-2">
            {CHAINS.map((c) => (
              <button
                key={c}
                onClick={() => setChain(c)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  chain === c
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Failed to load yields: {error?.message ?? 'Unknown error'}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 text-4xl text-gray-600">📭</div>
          <p className="text-gray-400 text-sm">
            No pools found for <span className="font-semibold text-white">{asset}</span>
            {chain !== 'All' && (
              <>
                {' '}on <span className="font-semibold text-white">{CHAIN_DISPLAY[chain] ?? chain}</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pool) => {
            const meta = PROTOCOL_META[pool.project]
            const isBest = pool.apy === bestApy
            return (
              <div
                key={pool.pool}
                className={`relative rounded-xl border bg-gray-900 p-5 transition-shadow hover:shadow-lg hover:shadow-black/40 ${
                  isBest ? 'border-indigo-500' : 'border-gray-800'
                }`}
              >
                {isBest && (
                  <span className="absolute -top-3 left-4 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white shadow">
                    Best Rate
                  </span>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: meta?.color ?? '#6B7280' }}
                    >
                      {meta?.name ?? pool.project}
                    </p>
                    <p className="text-xs text-gray-500">{pool.symbol}</p>
                  </div>
                  <span className="rounded-full border border-gray-700 px-2.5 py-0.5 text-xs text-gray-400">
                    {pool.chain}
                  </span>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">APY (current)</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        pool.apy > 5
                          ? 'text-emerald-400'
                          : pool.apy > 2
                          ? 'text-yellow-400'
                          : 'text-white'
                      }`}
                    >
                      {fmt(pool.apy)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">APY (7d avg)</span>
                    <span className="tabular-nums text-gray-300">
                      {fmt(pool.apyMean30d)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TVL</span>
                    <span className="tabular-nums text-gray-300">
                      {fmtTvl(pool.tvlUsd)}
                    </span>
                  </div>
                  {pool.apyReward != null && pool.apyReward > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reward APY</span>
                      <span className="tabular-nums text-purple-400">
                        {fmt(pool.apyReward)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
