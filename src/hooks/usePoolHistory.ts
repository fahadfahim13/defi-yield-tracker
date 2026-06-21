import { useQuery } from '@tanstack/react-query'
import { fetchPoolHistory } from '../lib/defiLlama'

export interface PoolHistoryPoint {
  date: string
  apy: number
}

export type TimeRange = '7D' | '30D' | '90D'

const DAYS_MAP: Record<TimeRange, number> = { '7D': 7, '30D': 30, '90D': 90 }

export function usePoolHistory(poolId: string | undefined, range: TimeRange = '30D') {
  return useQuery<PoolHistoryPoint[], Error>({
    queryKey: ['pool-history', poolId, range],
    queryFn: async () => {
      const data = await fetchPoolHistory(poolId!)
      const cutoff = Date.now() - DAYS_MAP[range] * 24 * 60 * 60 * 1000
      return data
        .filter((p) => new Date(p.timestamp).getTime() >= cutoff)
        .map((p) => ({
          date: p.timestamp.split('T')[0],
          apy: p.apy,
        }))
    },
    enabled: !!poolId,
    staleTime: 5 * 60 * 1000,
  })
}
