import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const SUPPORTED_CHAINS = [mainnet, sepolia]

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId)

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <select
            value={chainId}
            onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
            className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-gray-300"
          >
            {SUPPORTED_CHAINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="rounded bg-gray-800 px-3 py-1 font-mono text-sm text-gray-300">
            {shortAddress(address)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="rounded border border-gray-700 px-3 py-1 text-sm text-gray-400 hover:border-red-500 hover:text-red-400 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  const injectedConnector = connectors.find((c) => c.id === 'injected')

  return (
    <button
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      disabled={isPending || !injectedConnector}
      className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
    >
      {isPending ? 'Connecting…' : 'Connect Wallet'}
    </button>
  )
}
