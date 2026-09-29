import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWeb3 } from '../context/Web3Context';
import { Card } from '../components/Card';
import { CardData } from '../contract/config';

interface GachaProps {
  openSettings: () => void;
  setCurrentPage?: (page: string) => void;
}

export const Gacha: React.FC<GachaProps> = ({ openSettings, setCurrentPage }) => {
  const {
    isConnected,
    isConfigured,
    connectWallet,
    drawCard,
    txPending,
    txHash,
    error,
    clearError,
    isDemoMode,
    toggleDemoMode,
    myCards,
    ethBalance,
  } = useWeb3();

  const [drawnCard, setDrawnCard] = useState<CardData | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleDraw = async () => {
    clearError();
    setIsFlipping(true);
    setRevealed(false);

    try {
      const card = await drawCard();
      if (card) {
        setDrawnCard(card);
        setRevealed(true);

        // Confetti burst for high rarity cards
        if (card.rarity === 'SSR' || card.rarity === 'SR') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'],
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFlipping(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 flex flex-col items-center justify-center relative">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-6 relative z-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase bg-purple-950/80 border border-purple-500/40 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>GACHA SYSTEM • PART 6</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-wider uppercase">
            DRAW CARD
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            สุ่มการ์ดตัวละครอนิเมะ Smart Contract จะทำการสุ่ม Card ID และบันทึกเข้ากระเป๋าของคุณทันที
          </p>
        </div>

        {/* User Balances Strip (เงินในกระเป๋า ETH & Collection) */}
        <div className="p-3 bg-slate-900/90 border border-purple-500/30 rounded-2xl flex items-center justify-around text-xs font-mono-tech shadow-md max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase">Crypto Balance</div>
              <div className="text-cyan-300 font-bold">{ethBalance}</div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase">Collection</div>
              <div className="text-purple-300 font-bold">{myCards.length} Cards</div>
            </div>
          </div>
        </div>

        {/* Testnet Randomness Disclaimer */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start space-x-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            <span className="font-semibold text-amber-400">ข้อควรทราบ (Demo Randomness):</span>{' '}
            ระบบสุ่มของ Smart Contract นี้ใช้ Pseudo-randomness ผ่าน block properties เพื่อความเรียบง่ายและทดสอบบน Testnet
            ได้อย่างสะดวก ไม่ได้ใช้ Chainlink VRF จึงเหมาะสำหรับการเรียนรู้และเดโมเท่านั้น ห้ามใช้กับเงินจริง
          </p>
        </div>

        {/* Card Stage / Mystery Box */}
        <div className="flex justify-center py-4">
          {revealed && drawnCard ? (
            <div className="animate-in zoom-in-75 duration-500 flex flex-col items-center space-y-4">
              <Card card={drawnCard} size="lg" isRevealing />

              <div className="flex items-center space-x-2 text-xs font-mono-tech text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-4 py-2 rounded-full shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ได้รับ {drawnCard.name} ({drawnCard.rarity}) เข้าสู่ Collection แล้ว!</span>
              </div>

              {/* Direct Link to Collection */}
              {setCurrentPage && (
                <button
                  onClick={() => setCurrentPage('collection')}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono-tech font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105"
                >
                  <Layers className="w-4 h-4" />
                  <span>ดูใน MY COLLECTION ({myCards.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Mystery Card Placeholder (as shown in PART 6) */
            <div
              className={`relative w-72 h-[410px] rounded-2xl border-2 border-dashed border-purple-500/50 bg-gradient-to-b from-slate-900/90 to-purple-950/40 backdrop-blur-md flex flex-col items-center justify-between p-6 shadow-2xl transition-all duration-300 ${
                isFlipping || txPending ? 'animate-pulse scale-95 border-amber-400/80' : ''
              }`}
            >
              {/* Top info */}
              <div className="w-full flex items-center justify-between text-xs font-mono-tech text-slate-400">
                <span>[ MYSTERY CARD ]</span>
                <span className="text-amber-400">???</span>
              </div>

              {/* Center icon / illustration */}
              <div className="my-auto flex flex-col items-center space-y-3">
                <div className="w-24 h-24 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                  {txPending ? (
                    <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                  ) : (
                    <HelpCircle className="w-12 h-12 text-purple-400/80" />
                  )}
                </div>

                <div className="text-center font-mono-tech space-y-1">
                  <div className="text-xs text-slate-300">
                    Name: <span className="font-bold text-white">?</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    HP: <span className="font-bold text-white">?</span> | ATK:{' '}
                    <span className="font-bold text-white">?</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Rarity: <span className="font-bold text-amber-400">?</span>
                  </div>
                </div>
              </div>

              {/* Bottom tag */}
              <div className="text-[11px] font-mono-tech text-slate-500 uppercase tracking-widest">
                {txPending ? 'Calling Smart Contract...' : 'Ready to Summon'}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono-tech">
            {error}
          </div>
        )}

        {/* Transaction hash link */}
        {txHash && (
          <div className="text-xs font-mono-tech text-purple-300 flex items-center justify-center space-x-1">
            <span>TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
          </div>
        )}

        {/* Draw Button Controls */}
        <div className="flex flex-col items-center space-y-3">
          {!isConnected ? (
            <div className="space-y-2 w-full max-w-xs">
              <button
                onClick={connectWallet}
                className="w-full px-6 py-3.5 rounded-xl font-mono-tech font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 transition-all uppercase tracking-wider"
              >
                CONNECT METAMASK FIRST
              </button>
              <button
                onClick={() => toggleDemoMode(true)}
                className="w-full text-xs text-slate-400 hover:text-amber-300 underline"
              >
                หรือคลิกที่นี่เพื่อเปิด Demo Mode
              </button>
            </div>
          ) : !isConfigured && !isDemoMode ? (
            <div className="space-y-2">
              <p className="text-xs text-amber-400 font-mono-tech">
                ⚠️ ยังไม่ได้ใส่ Contract Address
              </p>
              <button
                onClick={openSettings}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono-tech font-bold text-sm shadow-md transition-all"
              >
                ใส่ Contract Address ในตั้งค่า
              </button>
            </div>
          ) : (
            <button
              onClick={handleDraw}
              disabled={txPending}
              className={`w-full max-w-xs px-8 py-4 rounded-2xl font-mono-tech text-base font-extrabold tracking-widest uppercase text-white shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                txPending
                  ? 'bg-purple-900/60 cursor-wait opacity-80'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 hover:scale-105 active:scale-95 shadow-purple-600/40'
              }`}
            >
              {txPending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>SUMMONING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>[ DRAW ]</span>
                </>
              )}
            </button>
          )}

          {revealed && (
            <button
              onClick={() => {
                setRevealed(false);
                setDrawnCard(null);
              }}
              className="text-xs text-slate-400 hover:text-white font-mono-tech underline pt-1"
            >
              Reset Stage / สุ่มการ์ดใบใหม่
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
