import React from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export const WalletButton: React.FC = () => {
  const {
    account,
    shortAccount,
    isConnected,
    isConnecting,
    networkName,
    hasMetaMask,
    isDemoMode,
    ethBalance,
    connectWallet,
    disconnectWallet,
    toggleDemoMode,
  } = useWeb3();

  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="relative group overflow-hidden px-5 py-2.5 rounded-xl font-bold font-mono-tech tracking-wider text-sm bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span>{isConnecting ? 'CONNECTING...' : 'CONNECT METAMASK'}</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all pointer-events-none" />
        </button>

        {!hasMetaMask && (
          <button
            onClick={() => toggleDemoMode(true)}
            className="text-xs px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-purple-500 transition-colors"
            title="Try with local simulation if MetaMask is not installed"
          >
            Demo Mode
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Real ETH Balance Badge */}
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-xs font-mono-tech shadow-sm">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-slate-400 text-[10px] uppercase font-bold">ETH:</span>
        <span className="text-cyan-300 font-bold tracking-wide">{ethBalance}</span>
      </div>

      {/* Network / Mode Tag */}
      <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs font-mono-tech">
        <span
          className={`w-2 h-2 rounded-full ${
            isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
          }`}
        />
        <span className="text-slate-300 font-medium">
          {isDemoMode ? 'Demo' : networkName}
        </span>
      </div>

      {/* Connected Account Pill */}
      <div className="flex items-center bg-slate-900/90 border border-purple-500/40 rounded-xl p-1 shadow-md shadow-purple-950/40">
        <div className="flex items-center space-x-2 px-3 py-1 text-sm font-mono-tech text-purple-200">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 ring-2 ring-emerald-400/20" />
          <span className="font-semibold tracking-wide">{shortAccount}</span>
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors p-0.5"
            title="Copy address"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={disconnectWallet}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
