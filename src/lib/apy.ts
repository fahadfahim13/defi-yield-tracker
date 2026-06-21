import type { PoolData } from '../hooks/useProtocolYields'

// Static fallback APYs (used when DeFiLlama has no match)
const FALLBACK_APYS: Record<string, number> = {
  'aave:USDC': 4.5,
  'aave:WETH': 0.8,
  'compound:USDC': 3.2,
  'compound:ETH': 0.3,
}

export function getApy(protocol: 'aave' | 'compound', underlyingSymbol: string): number {
  return FALLBACK_APYS[`${protocol}:${underlyingSymbol}`] ?? 0
}

// Try to find a live APY from DeFiLlama pools; fall back to static estimate
export function resolveApy(
  pools: PoolData[],
  protocol: 'aave' | 'compound',
  underlyingSymbol: string,
): { apy: number; isLive: boolean } {
  const protocolName = protocol === 'aave' ? 'Aave' : 'Compound'
  const match = pools.find(
    (p) =>
      p.protocol === protocolName &&
      p.chain === 'Ethereum' &&
      p.asset.toUpperCase().includes(underlyingSymbol.toUpperCase()),
  )
  if (match) return { apy: match.apy7d, isLive: true }
  return { apy: getApy(protocol, underlyingSymbol), isLive: false }
}
