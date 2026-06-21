import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY as string | undefined
const wcProjectId = import.meta.env.VITE_WC_PROJECT_ID as string | undefined

function getTransport(chainId: number) {
  if (alchemyKey) {
    const subdomain = chainId === 1 ? 'eth-mainnet' : 'eth-sepolia'
    return http(`https://${subdomain}.g.alchemy.com/v2/${alchemyKey}`)
  }
  return http()
}

const connectors = [
  injected(),
  ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
]

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports: {
    [mainnet.id]: getTransport(mainnet.id),
    [sepolia.id]: getTransport(sepolia.id),
  },
})
