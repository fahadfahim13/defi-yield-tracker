import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useProtocolYields } from './useProtocolYields'
import type { Pool } from '../lib/defiLlama'

const MOCK_POOLS: Pool[] = [
  {
    pool: 'pool-1',
    chain: 'Ethereum',
    project: 'aave-v3',
    symbol: 'USDC',
    tvlUsd: 1_000_000,
    apyBase: 3.5,
    apyReward: 1.0,
    apy: 4.5,
    apyMean30d: 4.2,
    apyPct7D: 0.1,
    stablecoin: true,
  },
  {
    pool: 'pool-2',
    chain: 'Ethereum',
    project: 'lido',
    symbol: 'ETH',
    tvlUsd: 5_000_000,
    apyBase: 4.0,
    apyReward: null,
    apy: 4.0,
    apyMean30d: 3.9,
    apyPct7D: -0.05,
    stablecoin: false,
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useProtocolYields', () => {
  it('starts in loading state', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', data: MOCK_POOLS }),
    }))

    const { result } = renderHook(() => useProtocolYields(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns all pools when no asset filter is given', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', data: MOCK_POOLS }),
    }))

    const { result } = renderHook(() => useProtocolYields(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(MOCK_POOLS.length)
    expect(result.current.error).toBeNull()
  })

  it('filters pools by asset symbol (case-insensitive)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', data: MOCK_POOLS }),
    }))

    const { result } = renderHook(() => useProtocolYields('usdc'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].symbol).toBe('USDC')
  })

  it('filters pools by asset symbol (uppercase input)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', data: MOCK_POOLS }),
    }))

    const { result } = renderHook(() => useProtocolYields('ETH'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].symbol).toBe('ETH')
  })

  it('returns empty array when asset filter matches nothing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', data: MOCK_POOLS }),
    }))

    const { result } = renderHook(() => useProtocolYields('BTC'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(0)
  })

  it('sets isError and error when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    }))

    const { result } = renderHook(() => useProtocolYields(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('503')
    expect(result.current.data).toBeUndefined()
  })

  it('returned pool data matches Pool interface shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', data: MOCK_POOLS }),
    }))

    const { result } = renderHook(() => useProtocolYields(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const pool = result.current.data![0]
    expect(pool).toHaveProperty('pool')
    expect(pool).toHaveProperty('chain')
    expect(pool).toHaveProperty('project')
    expect(pool).toHaveProperty('symbol')
    expect(pool).toHaveProperty('tvlUsd')
    expect(pool).toHaveProperty('apy')
    expect(pool).toHaveProperty('stablecoin')
  })
})
