import { mainnet, sepolia } from 'wagmi/chains'

export interface TokenConfig {
  address: `0x${string}`
  symbol: string
  decimals: number
  protocol: 'aave' | 'compound'
  underlyingSymbol: string
  underlyingDecimals: number
}

interface ChainContracts {
  aavePoolAddress: `0x${string}`
  tokens: TokenConfig[]
}

export const CONTRACT_ADDRESSES: Record<number, ChainContracts> = {
  [mainnet.id]: {
    aavePoolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    tokens: [
      {
        address: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5',
        symbol: 'aUSDC',
        decimals: 6,
        protocol: 'aave',
        underlyingSymbol: 'USDC',
        underlyingDecimals: 6,
      },
      {
        address: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
        symbol: 'aWETH',
        decimals: 18,
        protocol: 'aave',
        underlyingSymbol: 'WETH',
        underlyingDecimals: 18,
      },
      {
        address: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        symbol: 'cUSDC',
        decimals: 8,
        protocol: 'compound',
        underlyingSymbol: 'USDC',
        underlyingDecimals: 6,
      },
      {
        address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        symbol: 'cETH',
        decimals: 8,
        protocol: 'compound',
        underlyingSymbol: 'ETH',
        underlyingDecimals: 18,
      },
    ],
  },
  [sepolia.id]: {
    aavePoolAddress: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
    tokens: [
      {
        address: '0x16dA4541aD1807f4443d92D26044C1147406EB80',
        symbol: 'aUSDC',
        decimals: 6,
        protocol: 'aave',
        underlyingSymbol: 'USDC',
        underlyingDecimals: 6,
      },
      {
        address: '0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830',
        symbol: 'aWETH',
        decimals: 18,
        protocol: 'aave',
        underlyingSymbol: 'WETH',
        underlyingDecimals: 18,
      },
    ],
  },
}
