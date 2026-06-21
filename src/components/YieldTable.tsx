import { useState } from 'react'
import { useProtocolYields, type Pool } from '../hooks/useProtocolYields'
import { PROTOCOL_META, CHAIN_DISPLAY } from '../lib/defiLlama'
import { PoolDetailModal } from './PoolDetailModal'

type SortKey = 'project' | 'symbol' | 'apy7d' | 'apr' | 'tvlUsd' | 'chain'
type SortDir = 'asc' | 'desc'

const SUPPORTED_CHAINS = Object.keys(CHAIN_DISPLAY)

export const PROJECT_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  'aave-v3':     { bg: 'bg-blue-900/60',   text: 'text-blue-300',   label: 'Aave'     },
  'compound-v3': { bg: 'bg-green-900/60',  text: 'text-green-300',  label: 'Compound' },
  'curve':       { bg: 'bg-yellow-900/60', text: 'text-yellow-300', label: 'Curve'    },
  'lido':        { bg: 'bg-teal-900/60',   text: 'text-teal-300',   label: 'Lido'     },
}

function protocolBadge(project: string) {
  return (
    PROJECT_BADGE[project] ?? {
      bg: 'bg-gray-800',
      text: 'text-gray-300',
      label: PROTOCOL_META[project]?.name ?? project,
    }
  )
}

export function apyColorClass(apy: number): string {
  if (apy >= 10) return 'text-green-400'
  if (apy >= 5) return 'text-yellow-400'
  return 'text-gray-400'
}

export function formatTvl(usd: number): string {
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`
  return `$${(usd / 1e3).toFixed(2)}K`
}

function sortValue(pool: Pool, key: SortKey): string | number {
  switch (key) {
    case 'project': return pool.project
    case 'symbol': return pool.symbol
    case 'apy7d': return pool.apyMean30d ?? pool.apy
    case 'apr': return pool.apyBase ?? 0
    case 'tvlUsd': return pool.tvlUsd
    case 'chain': return pool.chain
  }
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-800">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-800" />
        </td>
      ))}
    </tr>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-gray-600">⇅</span>
  return <span className="ml-1 text-white">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function YieldTable() {
  const [search, setSearch] = useState('')
  const { data: pools, isLoading, isError } = useProtocolYields(search || undefined)

  const [chainFilter, setChainFilter] = useState('All')
  const [sortKey, setSortKey] = useState<SortKey>('tvlUsd')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Pool | null>(null)

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = (pools ?? [])
    .filter((p) => chainFilter === 'All' || p.chain === chainFilter)
    .sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      const cmp =
        typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

  const headers: { key: SortKey; label: string }[] = [
    { key: 'project', label: 'Protocol' },
    { key: 'symbol', label: 'Asset' },
    { key: 'apy7d', label: 'APY (7d)' },
    { key: 'apr', label: 'APR' },
    { key: 'tvlUsd', label: 'TVL' },
    { key: 'chain', label: 'Chain' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by asset or protocol…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {(['All', ...SUPPORTED_CHAINS] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChainFilter(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                chainFilter === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-gray-800 bg-gray-900">
            <tr>
              {headers.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                  <SortIcon active={sortKey === key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900/50">
            {isLoading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-400">
                  Failed to load yield data. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No pools match your filter.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filtered.map((pool) => {
                const badge = protocolBadge(pool.project)
                const apy7d = pool.apyMean30d ?? pool.apy
                const apr = pool.apyBase ?? 0
                return (
                  <tr
                    key={pool.pool}
                    onClick={() => setSelected(pool)}
                    className="cursor-pointer transition-colors hover:bg-gray-800/60"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{pool.symbol}</td>
                    <td className={`px-4 py-3 font-semibold ${apyColorClass(apy7d)}`}>
                      {apy7d.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-gray-300">{apr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-gray-300">{formatTvl(pool.tvlUsd)}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {CHAIN_DISPLAY[pool.chain] ?? pool.chain}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {selected && <PoolDetailModal pool={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
