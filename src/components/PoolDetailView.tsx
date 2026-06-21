import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PoolData } from '../hooks/useProtocolYields'
import { usePoolHistory, type TimeRange } from '../hooks/usePoolHistory'

interface Props {
  pool: PoolData
  onClose: () => void
}

function formatTvl(usd: number): string {
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(2)}B`
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`
  return `$${usd.toLocaleString()}`
}

interface TooltipPayload {
  date: string
  apy: number
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: TooltipPayload }[]
}) {
  if (!active || !payload?.length) return null
  const { date, apy } = payload[0].payload
  return (
    <div className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm shadow-lg">
      <p className="text-gray-400">{date}</p>
      <p className="font-semibold text-emerald-400">{apy.toFixed(2)}% APY</p>
    </div>
  )
}

const TIME_RANGES: TimeRange[] = ['7D', '30D', '90D']

export function PoolDetailView({ pool, onClose }: Props) {
  const [range, setRange] = useState<TimeRange>('30D')
  const { data, isLoading, isError } = usePoolHistory(pool.id, range)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl rounded-xl border border-gray-800 bg-gray-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-900/50 px-2 py-0.5 text-xs font-medium text-indigo-300">
                {pool.protocol}
              </span>
              <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {pool.chain}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {pool.asset}
            </h2>
            <div className="mt-1 flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                APY{' '}
                <span className="font-medium text-emerald-400">
                  {pool.apy7d.toFixed(2)}%
                </span>
              </span>
              <span className="text-gray-400">
                TVL{' '}
                <span className="font-medium text-white">
                  {formatTvl(pool.tvlUsd)}
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center gap-2 px-6 py-3">
          <span className="text-xs text-gray-500">Range:</span>
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                range === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="px-4 pb-6">
          {isLoading && (
            <div className="flex h-56 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          )}
          {isError && (
            <div className="flex h-56 items-center justify-center text-sm text-gray-500">
              Data unavailable
            </div>
          )}
          {data && !isLoading && (
            <div className="h-56 overflow-x-auto">
              <div className="min-w-[420px]">
                <ResponsiveContainer width="100%" height={224}>
                  <LineChart
                    data={data}
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                      width={48}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="apy"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
