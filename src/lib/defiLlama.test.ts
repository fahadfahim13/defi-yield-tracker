import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPools, TRACKED_PROJECTS, type Pool } from './defiLlama'

const MOCK_POOL: Pool = {
  pool: 'abc-123',
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
}

const UNTRACKED_POOL: Pool = {
  ...MOCK_POOL,
  pool: 'xyz-999',
  project: 'some-random-protocol',
}

function mockFetch(data: Pool[], ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => ({ status: 'ok', data }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchPools', () => {
  it('returns only pools from TRACKED_PROJECTS', async () => {
    vi.stubGlobal('fetch', mockFetch([MOCK_POOL, UNTRACKED_POOL]))

    const pools = await fetchPools()

    expect(pools).toHaveLength(1)
    expect(pools[0].project).toBe('aave-v3')
    expect(TRACKED_PROJECTS).toContain(pools[0].project)
  })

  it('returned pool matches the Pool interface shape', async () => {
    vi.stubGlobal('fetch', mockFetch([MOCK_POOL]))

    const [pool] = await fetchPools()

    expect(pool).toHaveProperty('pool')
    expect(pool).toHaveProperty('chain')
    expect(pool).toHaveProperty('project')
    expect(pool).toHaveProperty('symbol')
    expect(pool).toHaveProperty('tvlUsd')
    expect(pool).toHaveProperty('apy')
    expect(pool).toHaveProperty('stablecoin')
    expect(typeof pool.tvlUsd).toBe('number')
    expect(typeof pool.apy).toBe('number')
    expect(typeof pool.stablecoin).toBe('boolean')
  })

  it('returns all tracked protocols when all are present', async () => {
    const allTracked: Pool[] = TRACKED_PROJECTS.map((project, i) => ({
      ...MOCK_POOL,
      pool: `pool-${i}`,
      project,
    }))
    vi.stubGlobal('fetch', mockFetch([...allTracked, UNTRACKED_POOL]))

    const pools = await fetchPools()

    expect(pools).toHaveLength(TRACKED_PROJECTS.length)
    const projects = pools.map((p) => p.project)
    TRACKED_PROJECTS.forEach((p) => expect(projects).toContain(p))
  })

  it('returns empty array when no pools match tracked projects', async () => {
    vi.stubGlobal('fetch', mockFetch([UNTRACKED_POOL]))

    const pools = await fetchPools()

    expect(pools).toHaveLength(0)
  })

  it('throws when the API returns a non-ok status', async () => {
    vi.stubGlobal('fetch', mockFetch([], false, 500))

    await expect(fetchPools()).rejects.toThrow('DeFiLlama error: 500')
  })

  it('calls the correct DeFiLlama endpoint', async () => {
    const spy = mockFetch([MOCK_POOL])
    vi.stubGlobal('fetch', spy)

    await fetchPools()

    expect(spy).toHaveBeenCalledWith('https://yields.llama.fi/pools')
  })

  it('handles nullable fields correctly', async () => {
    const poolWithNulls: Pool = {
      ...MOCK_POOL,
      apyBase: null,
      apyReward: null,
      apyMean30d: null,
      apyPct7D: null,
    }
    vi.stubGlobal('fetch', mockFetch([poolWithNulls]))

    const [pool] = await fetchPools()

    expect(pool.apyBase).toBeNull()
    expect(pool.apyReward).toBeNull()
    expect(pool.apyMean30d).toBeNull()
    expect(pool.apyPct7D).toBeNull()
  })
})
