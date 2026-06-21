import { useQuery } from '@tanstack/react-query'
import { DEFILLAMA_POOLS_URL, FEATURED_PROJECTS, type Pool } from '../lib/defiLlama'

export type { Pool }

async function fetchYields(search?: string): Promise<Pool[]> {
  const res = await fetch(DEFILLAMA_POOLS_URL)
  if (!res.ok) throw new Error(`DeFiLlama API error: ${res.status}`)

  const json = (await res.json()) as { data: Pool[] }
  let pools = json.data.filter(
    (p) => FEATURED_PROJECTS.includes(p.project) && p.tvlUsd > 100_000 && p.apy > 0,
  )

  if (search) {
    const q = search.toLowerCase()
    pools = pools.filter(
      (p) => p.symbol.toLowerCase().includes(q) || p.project.toLowerCase().includes(q),
    )
  }

  return pools.slice(0, 100)
}

export function useProtocolYields(search?: string) {
  return useQuery<Pool[]>({
    queryKey: ['protocol-yields', search ?? ''],
    queryFn: () => fetchYields(search),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}
