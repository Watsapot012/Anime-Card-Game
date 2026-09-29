import React from 'react';
import {
  Sparkles,
  Layers,
  Swords,
  ShieldAlert,
  Wallet,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  openSettings: () => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage, openSettings }) => {
  const {
    isConnected,
    shortAccount,
    connectWallet,
    allCards,
    myCards,
    isOwner,
    isConfigured,
    contractAddress,
    isDemoMode,
    toggleDemoMode,
    ethBalance,
  } = useWeb3();

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono-tech font-semibold bg-purple-950/80 border border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            ✦ Solidity Smart Contract ^0.8.20
          </span>
          {isConfigured ? (
            <span className="px-3.5 py-1 rounded-full text-xs font-mono-tech font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
              Contract Connected: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </span>
          ) : (
            <button
              onClick={openSettings}
              className="px-3.5 py-1 rounded-full text-xs font-mono-tech font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition-colors"
            >
              ⚠️ Setup Remix Contract Address
            </button>
          )}
        </div>

        {/* Main Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-wider uppercase text-white drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
            SIMPLE ANIME
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              CARD GAME
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-sans">
            เกมการ์ดอนิเมะ Web3 ขับเคลื่อนด้วย Smart Contract บนบล็อกเชน เชื่อมต่อกระเป๋า MetaMask
            สุ่มการ์ด กาชา สะสม และเข้าสู่ลานประลอง Anime Battle
          </p>
        </div>

        {/* Primary Action Buttons (as required in Part 5) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-mono-tech text-base font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Wallet className="w-5 h-5" />
              <span>CONNECT METAMASK</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 font-mono-tech text-sm flex items-center justify-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CONNECTED: {shortAccount}</span>
            </div>
          )}

          {!isConnected && !isDemoMode && (
            <button
              onClick={() => toggleDemoMode(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-mono-tech text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-purple-500 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>ลองเล่นผ่าน Demo Mode</span>
            </button>
          )}
        </div>

        {/* User Balance Overview Strip */}
        <div className="max-w-xl mx-auto p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl flex items-center justify-around gap-4 text-xs font-mono-tech shadow-lg">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Crypto Balance (ETH)</div>
              <div className="text-cyan-300 font-bold text-sm">{ethBalance}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Deck Size</div>
              <div className="text-purple-300 font-bold text-sm">{myCards.length} Cards</div>
            </div>
          </div>
        </div>

        {/* Navigation Grid (Cards for GACHA, MY COLLECTION, BATTLE, ADMIN) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* GACHA */}
          <button
            onClick={() => setCurrentPage('gacha')}
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-purple-950/40 border border-purple-500/30 hover:border-purple-500/80 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <span className="font-mono-tech text-xs text-purple-400/80">PART 6</span>
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-white tracking-wide group-hover:text-purple-300 transition-colors">
                GACHA
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                สุ่มการ์ดอนิเมะ สุ่ม Card ID บันทึกลงกระเป๋า On-Chain
              </p>
            </div>
            <div className="flex items-center text-xs text-purple-400 font-mono-tech font-bold">
              <span>DRAW CARD</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* MY COLLECTION */}
          <button
            onClick={() => setCurrentPage('collection')}
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500/80 hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="font-mono-tech text-xs text-indigo-400/80">
                {myCards.length} Cards
              </span>
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-white tracking-wide group-hover:text-indigo-300 transition-colors">
                MY COLLECTION
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                คลังการ์ดของคุณ ดึงข้อมูลจาก Smart Contract getMyCards()
              </p>
            </div>
            <div className="flex items-center text-xs text-indigo-400 font-mono-tech font-bold">
              <span>VIEW DECK</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* BATTLE */}
          <button
            onClick={() => setCurrentPage('battle')}
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-rose-950/40 border border-rose-500/30 hover:border-rose-500/80 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6 text-rose-400" />
              </div>
              <span className="font-mono-tech text-xs text-rose-400/80">Turn Battle</span>
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-white tracking-wide group-hover:text-rose-300 transition-colors">
                BATTLE
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                เลือกลงการ์ดต่อสู้กับศัตรู ลด HP และคว้าชัยชนะ
              </p>
            </div>
            <div className="flex items-center text-xs text-rose-400 font-mono-tech font-bold">
              <span>FIGHT NOW</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* ADMIN */}
          <button
            onClick={() => setCurrentPage('admin')}
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-amber-950/40 border border-amber-500/30 hover:border-amber-500/80 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <span className="font-mono-tech text-xs text-amber-400/80">
                {isOwner ? 'Authorized' : 'Owner Only'}
              </span>
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-white tracking-wide group-hover:text-amber-300 transition-colors">
                ADMIN
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ระบบเพิ่มการ์ดใหม่ addCard() สำหรับเจ้าของ Smart Contract
              </p>
            </div>
            <div className="flex items-center text-xs text-amber-400 font-mono-tech font-bold">
              <span>MANAGE CARDS</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Guide Banner */}
        <div className="pt-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  Remix IDE Deployment & Quickstart
                </h4>
                <p className="text-xs text-slate-400">
                  ดูวิธีการนำ <code className="text-purple-300">SimpleCardGame.sol</code> ไป Deploy
                  บน Remix และเชื่อมต่อกับ Frontend
                </p>
              </div>
            </div>
            <button
              onClick={openSettings}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white rounded-xl text-xs font-mono-tech font-semibold border border-purple-500/30 transition-all shrink-0"
            >
              เปิดคู่มือ Remix Guide →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
