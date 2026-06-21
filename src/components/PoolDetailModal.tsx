import type { Pool } from '../hooks/useProtocolYields'
import { PROTOCOL_META } from '../lib/defiLlama'
import { apyColorClass, formatTvl } from './YieldTable'

interface Props {
  pool: Pool
  onClose: () => void
}

export function PoolDetailModal({ pool, onClose }: Props) {
  const meta = PROTOCOL_META[pool.project]
  const apy7d = pool.apyMean30d ?? pool.apy

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{pool.symbol}</h2>
            <p className="text-sm text-gray-400">
              {meta?.name ?? pool.project} &middot; {pool.chain}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-1 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="APY (7d avg)">
            <span className={`font-semibold ${apyColorClass(apy7d)}`}>{apy7d.toFixed(2)}%</span>
          </Row>
          <Row label="APR (base)">{(pool.apyBase ?? 0).toFixed(2)}%</Row>
          {pool.apyReward !== null && (
            <Row label="APR (reward)">{pool.apyReward.toFixed(2)}%</Row>
          )}
          <Row label="TVL">{formatTvl(pool.tvlUsd)}</Row>
          <Row label="Stablecoin">{pool.stablecoin ? 'Yes' : 'No'}</Row>
          {pool.ilRisk && <Row label="IL Risk">{pool.ilRisk}</Row>}
        </dl>

        {meta && (
          <a
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block w-full rounded-lg bg-indigo-600 py-2 text-center text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Open in {meta.name} ↗
          </a>
        )}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-200">{children}</dd>
    </div>
  )
}
