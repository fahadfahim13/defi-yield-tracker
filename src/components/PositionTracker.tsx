import { useMemo } from 'react'
import { useAccount, useChainId, useReadContracts } from 'wagmi'
import { CONTRACT_ADDRESSES, type TokenConfig } from '../lib/contracts'
import { ERC20_ABI, CTOKEN_ABI } from '../lib/abis'
import { resolveApy } from '../lib/apy'
import { useProtocolYields } from '../hooks/useProtocolYields'

const ESTIMATE_DAYS = 30

interface Position {
  token: TokenConfig
  depositedAmount: bigint
  apy: number
  apyIsLive: boolean
}

function formatAmount(raw: bigint, decimals: number, display = 4): string {
  const divisor = BigInt(10) ** BigInt(decimals)
  const whole = raw / divisor
  const remainder = raw % divisor
  const frac = remainder.toString().padStart(decimals, '0').slice(0, display)
  return `${whole}.${frac}`
}

function estimatedEarned(depositedAmount: bigint, decimals: number, apy: number, days: number): string {
  // integer math: depositedAmount * apy/100 * days/365, scaled by 1e6
  const scaled = depositedAmount * BigInt(Math.round(apy * 1000)) * BigInt(days)
  const result = scaled / BigInt(100 * 1000 * 365)
  return formatAmount(result, decimals)
}

function ProtocolBadge({ protocol }: { protocol: 'aave' | 'compound' }) {
  const cls =
    protocol === 'aave'
      ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
      : 'bg-green-900/50 text-green-300 border border-green-700'
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {protocol === 'aave' ? 'Aave V3' : 'Compound V2'}
    </span>
  )
}

export function PositionTracker() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const chainContracts = CONTRACT_ADDRESSES[chainId]

  const { data: yieldPools = [] } = useProtocolYields()

  // Build batched read contracts list
  const contracts = useMemo(() => {
    if (!address || !chainContracts) return []

    const calls: {
      address: `0x${string}`
      abi: typeof CTOKEN_ABI | typeof ERC20_ABI
      functionName: string
      args?: readonly unknown[]
    }[] = []

    for (const token of chainContracts.tokens) {
      calls.push({
        address: token.address,
        abi: token.protocol === 'compound' ? CTOKEN_ABI : ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })
      if (token.protocol === 'compound') {
        calls.push({
          address: token.address,
          abi: CTOKEN_ABI,
          functionName: 'exchangeRateStored',
        })
      }
    }
    return calls
  }, [address, chainContracts])

  const { data, isLoading, refetch, isFetching } = useReadContracts({
    contracts,
    query: { enabled: !!address && !!chainContracts && contracts.length > 0 },
  })

  const positions = useMemo<Position[]>(() => {
    if (!data || !chainContracts) return []

    let idx = 0
    const result: Position[] = []

    for (const token of chainContracts.tokens) {
      const balResult = data[idx++]
      const balance = balResult?.status === 'success' ? (balResult.result as bigint) : 0n

      let depositedAmount: bigint

      if (token.protocol === 'aave') {
        // aToken balanceOf returns current underlying value (rebasing)
        depositedAmount = balance
      } else {
        // Compound: underlyingAmount = cTokenBalance * exchangeRate / 10^(18 + underlyingDecimals - 8)
        const exchResult = data[idx++]
        const exchangeRate = exchResult?.status === 'success' ? (exchResult.result as bigint) : 0n
        if (balance > 0n && exchangeRate > 0n) {
          const scaleFactor = BigInt(10) ** BigInt(18 + token.underlyingDecimals - 8)
          depositedAmount = (balance * exchangeRate) / scaleFactor
        } else {
          depositedAmount = 0n
        }
      }

      if (depositedAmount === 0n) continue

      const { apy, isLive } = resolveApy(yieldPools, token.protocol, token.underlyingSymbol)
      result.push({ token, depositedAmount, apy, apyIsLive: isLive })
    }

    return result
  }, [data, chainContracts, yieldPools])

  const summaryEarnings = useMemo(
    () =>
      positions.map((p) => ({
        symbol: p.token.underlyingSymbol,
        earned: estimatedEarned(p.depositedAmount, p.token.underlyingDecimals, p.apy, ESTIMATE_DAYS),
      })),
    [positions],
  )

  if (!isConnected) return null

  if (!chainContracts) {
    return (
      <div className="rounded-lg border border-yellow-700 bg-yellow-900/20 px-6 py-4 text-yellow-400">
        Unsupported network. Please switch to Mainnet or Sepolia.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 px-6 py-5">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm text-gray-400">Active Positions</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {isLoading ? '—' : positions.length}
            </p>
          </div>

          {positions.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Est. Earned ({ESTIMATE_DAYS}d)</p>
              <div className="mt-1 space-y-0.5">
                {summaryEarnings.map((e) => (
                  <p key={e.symbol} className="text-lg font-semibold tabular-nums text-green-400">
                    +{e.earned} {e.symbol}
                  </p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="ml-auto flex items-center gap-2 rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-500 hover:text-gray-200 disabled:opacity-50 transition-colors"
          >
            <svg
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table or empty state */}
      {isLoading ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 px-6 py-12 text-center text-gray-500">
          Loading on-chain balances…
        </div>
      ) : positions.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <p className="text-lg font-medium text-gray-400">No positions found</p>
          <p className="mt-1 text-sm text-gray-600">
            Deposit into Aave V3 or Compound V2 on Ethereum to see balances here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-6 py-3 text-left font-medium text-gray-400">Protocol</th>
                <th className="px-6 py-3 text-left font-medium text-gray-400">Asset</th>
                <th className="px-6 py-3 text-right font-medium text-gray-400">Deposited Amount</th>
                <th className="px-6 py-3 text-right font-medium text-gray-400">Current Value</th>
                <th className="px-6 py-3 text-right font-medium text-gray-400">Est. APY</th>
                <th className="px-6 py-3 text-right font-medium text-gray-400">Est. Earned (30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900">
              {positions.map((pos) => {
                const deposited = formatAmount(pos.depositedAmount, pos.token.underlyingDecimals)
                const earned = estimatedEarned(
                  pos.depositedAmount,
                  pos.token.underlyingDecimals,
                  pos.apy,
                  ESTIMATE_DAYS,
                )
                return (
                  <tr key={pos.token.address} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <ProtocolBadge protocol={pos.token.protocol} />
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {pos.token.underlyingSymbol}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-gray-300">
                      {deposited} {pos.token.underlyingSymbol}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-gray-300">
                      {deposited} {pos.token.underlyingSymbol}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-blue-400">
                      {pos.apy.toFixed(2)}%
                      {pos.apyIsLive && (
                        <span className="ml-1 text-xs text-blue-600">live</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-green-400">
                      +{earned} {pos.token.underlyingSymbol}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="border-t border-gray-800 bg-gray-900/50 px-6 py-2 text-xs text-gray-600">
            ⚠ Est. Earned assumes a 30-day deposit period. Actual yield depends on deposit date
            and protocol rate changes. &quot;Live&quot; APYs sourced from DeFiLlama (30d avg).
          </p>
        </div>
      )}
    </div>
  )
}
