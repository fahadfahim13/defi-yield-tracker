export const DEFILLAMA_POOLS_URL = 'https://yields.llama.fi/pools'

export interface Pool {
  pool: string
  project: string
  symbol: string
  chain: string
  tvlUsd: number
  apy: number
  apyBase: number | null
  apyReward: number | null
  apyMean30d: number | null
  apyPct7D: number | null
  stablecoin: boolean
  ilRisk: string | null
  exposure: string | null
  underlyingTokens: string[] | null
  rewardTokens: string[] | null
}

export const PROTOCOL_META: Record<string, { name: string; url: string }> = {
  'aave-v3':     { name: 'Aave V3',     url: 'https://aave.com' },
  'compound-v3': { name: 'Compound V3', url: 'https://compound.finance' },
  'curve':       { name: 'Curve',       url: 'https://curve.fi' },
  'lido':        { name: 'Lido',        url: 'https://lido.fi' },
  'uniswap-v3':  { name: 'Uniswap V3', url: 'https://app.uniswap.org' },
}

export const CHAIN_DISPLAY: Record<string, string> = {
  Ethereum:  'Ethereum',
  Arbitrum:  'Arbitrum',
  Optimism:  'Optimism',
  Polygon:   'Polygon',
  Base:      'Base',
  Avalanche: 'Avalanche',
}

export const FEATURED_PROJECTS = Object.keys(PROTOCOL_META)

export interface PoolHistoryPoint {
  timestamp: string
  tvlUsd: number
  apy: number
  apyBase: number | null
  apyReward: number | null
}

export async function fetchPoolHistory(poolId: string): Promise<PoolHistoryPoint[]> {
  const res = await fetch(`https://yields.llama.fi/chart/${poolId}`)
  if (!res.ok) throw new Error(`DeFiLlama chart error: ${res.status}`)
  const json = (await res.json()) as { data: PoolHistoryPoint[] }
  return json.data
}
