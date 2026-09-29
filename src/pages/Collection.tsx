import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowRight,
  Shield,
  Swords,
  X,
  Star,
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { Card } from '../components/Card';
import { CardData } from '../contract/config';

export const Collection: React.FC<{
  setCurrentPage: (page: string) => void;
  openSettings: () => void;
}> = ({ setCurrentPage, openSettings }) => {
  const {
    isConnected,
    isConfigured,
    myCards,
    isLoadingCards,
    refreshGameData,
    isDemoMode,
    connectWallet,
    toggleDemoMode,
  } = useWeb3();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'attack' | 'hp' | 'rarity' | 'count'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  // Group duplicate cards and compute stats stably
  const { cardCounts, uniqueCards, rarityCounts, totalAtk, totalHp } = useMemo(() => {
    const counts: Record<number, number> = {};
    const uniques: CardData[] = [];
    const rCounts: Record<string, number> = { SSR: 0, SR: 0, RARE: 0, COMMON: 0 };
    let sumAtk = 0;
    let sumHp = 0;

    for (const card of myCards) {
      sumAtk += card.attack || 0;
      sumHp += card.hp || 0;

      const upperRarity = (card.rarity || 'COMMON').toUpperCase();
      if (rCounts[upperRarity] !== undefined) {
        rCounts[upperRarity] += 1;
      }

      if (!counts[card.id]) {
        counts[card.id] = 1;
        uniques.push(card);
      } else {
        counts[card.id] += 1;
      }
    }

    return {
      cardCounts: counts,
      uniqueCards: uniques,
      rarityCounts: rCounts,
      totalAtk: sumAtk,
      totalHp: sumHp,
    };
  }, [myCards]);

  // Rarity rank helper
  const getRarityRank = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'SSR':
        return 4;
      case 'SR':
        return 3;
      case 'RARE':
        return 2;
      case 'COMMON':
      default:
        return 1;
    }
  };

  // Filter & Sort
  const processedCards = useMemo(() => {
    return uniqueCards
      .filter((card) => {
        if (rarityFilter !== 'ALL' && card.rarity.toUpperCase() !== rarityFilter.toUpperCase()) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = card.name.toLowerCase().includes(q);
          const matchId = card.id.toString() === q || `#${card.id}` === q;
          const matchRarity = card.rarity.toLowerCase().includes(q);
          return matchName || matchId || matchRarity;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        switch (sortBy) {
          case 'attack':
            diff = a.attack - b.attack;
            break;
          case 'hp':
            diff = a.hp - b.hp;
            break;
          case 'rarity':
            diff = getRarityRank(a.rarity) - getRarityRank(b.rarity);
            break;
          case 'count':
            diff = (cardCounts[a.id] || 0) - (cardCounts[b.id] || 0);
            break;
          case 'id':
          default:
            diff = a.id - b.id;
            break;
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [uniqueCards, rarityFilter, searchQuery, sortBy, sortOrder, cardCounts]);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>PLAYER DECK • PART 7</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-wider uppercase">
            MY COLLECTION
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            คลังการ์ดทั้งหมดที่คุณเป็นเจ้าของ อ่านข้อมูลตรงจาก Smart Contract บนบล็อกเชน
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => refreshGameData()}
            disabled={isLoadingCards}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all flex items-center space-x-2 text-xs font-mono-tech shadow-sm"
            title="Refresh from Smart Contract"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingCards ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isLoadingCards ? 'SYNCING...' : 'SYNC ON-CHAIN'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('battle')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white font-mono-tech font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <Swords className="w-4 h-4 text-rose-400" />
            <span>GO TO BATTLE</span>
          </button>

          <button
            onClick={() => setCurrentPage('gacha')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-mono-tech font-bold text-xs shadow-md shadow-purple-600/30 flex items-center space-x-1.5 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>DRAW GACHA</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Cards */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-md">
          <div className="text-[11px] font-mono-tech text-slate-400 uppercase">Total Cards Owned</div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-white">{myCards.length}</span>
            <span className="text-xs font-mono-tech text-purple-400">({uniqueCards.length} unique)</span>
          </div>
        </div>

        {/* SSR Cards */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-md">
          <div className="text-[11px] font-mono-tech text-amber-400/90 uppercase flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>SSR Legendaries</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-amber-300">{rarityCounts.SSR || 0}</span>
            <span className="text-xs font-mono-tech text-amber-400/80">Cards</span>
          </div>
        </div>

        {/* Total Attack Power */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 shadow-md">
          <div className="text-[11px] font-mono-tech text-rose-400/90 uppercase flex items-center space-x-1">
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>Total ATK Power</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-rose-300">{totalAtk}</span>
            <span className="text-xs font-mono-tech text-rose-400/80">DMG</span>
          </div>
        </div>

        {/* Total Health Pool */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-md">
          <div className="text-[11px] font-mono-tech text-emerald-400/90 uppercase flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total HP Pool</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-emerald-300">{totalHp}</span>
            <span className="text-xs font-mono-tech text-emerald-400/80">HP</span>
          </div>
        </div>
      </div>

      {/* Warning for unconfigured contract */}
      {isConnected && !isConfigured && !isDemoMode && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-amber-300">
            ⚠️ ยังไม่ได้ระบุ Contract Address สำหรับเชื่อมต่อกับ Smart Contract บนบล็อกเชน
          </span>
          <button
            onClick={openSettings}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm"
          >
            ระบุ Contract Address
          </button>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อการ์ด, ID หรือ Rarity (เช่น Goku, SSR, #1)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-slate-500 font-mono-tech"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono-tech text-slate-300">
              <span className="text-slate-500 text-[11px]">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-purple-300 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="id" className="bg-slate-900 text-white">Card ID</option>
                <option value="attack" className="bg-slate-900 text-white">ATK Power</option>
                <option value="hp" className="bg-slate-900 text-white">HP Health</option>
                <option value="rarity" className="bg-slate-900 text-white">Rarity</option>
                <option value="count" className="bg-slate-900 text-white">Quantity Owned</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/50 transition-colors text-xs font-mono-tech flex items-center space-x-1"
              title={`Switch to ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-bold uppercase">{sortOrder}</span>
            </button>
          </div>
        </div>

        {/* Rarity Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'ALL', count: myCards.length },
              { id: 'SSR', label: 'SSR', count: rarityCounts.SSR || 0 },
              { id: 'SR', label: 'SR', count: rarityCounts.SR || 0 },
              { id: 'RARE', label: 'RARE', count: rarityCounts.RARE || 0 },
              { id: 'COMMON', label: 'COMMON', count: rarityCounts.COMMON || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRarityFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold uppercase transition-all flex items-center space-x-1.5 ${
                  rarityFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    rarityFilter === tab.id
                      ? 'bg-purple-800 text-purple-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono-tech text-slate-400">
            แสดง: <span className="text-white font-bold">{processedCards.length}</span> แบบ
          </div>
        </div>
      </div>

      {/* Cards Grid - STABLE RENDERING */}
      {processedCards.length === 0 ? (
        <div className="py-20 text-center space-y-5 rounded-2xl bg-slate-900/40 border-2 border-dashed border-slate-800 p-6">
          <div className="w-20 h-20 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <Layers className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-heading text-xl font-bold text-white">
              {searchQuery
                ? `ไม่พบการ์ดที่ตรงกับ "${searchQuery}"`
                : rarityFilter === 'ALL'
                ? 'ยังไม่มีการ์ดในคอลเลกชันของคุณ'
                : `ไม่มีการ์ดระดับ ${rarityFilter}`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {searchQuery
                ? 'ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูการ์ดทั้งหมด'
                : 'ไปที่หน้า Gacha แล้วกดสุ่มการ์ด Smart Contract จะสุ่มและบันทึกการ์ดลงในคอลเลกชันของคุณทันที'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-tech text-xs"
              >
                ล้างคำค้นหา
              </button>
            )}
            <button
              onClick={() => setCurrentPage('gacha')}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-mono-tech font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 inline-flex items-center space-x-1.5 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>ไปสุ่มการ์ดที่ GACHA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {processedCards.map((card) => (
            <Card
              key={card.id}
              card={card}
              count={cardCounts[card.id]}
              size="md"
              onClick={() => setSelectedCard(card)}
            />
          ))}
        </div>
      )}

      {/* Card Details Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative bg-slate-900 border border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center space-y-5">
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large Card Preview */}
            <Card card={selectedCard} count={cardCounts[selectedCard.id]} size="lg" />

            {/* Stats & Actions */}
            <div className="w-full space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono-tech uppercase">Copies Owned</div>
                  <div className="text-lg font-mono-tech font-black text-amber-400">
                    ×{cardCounts[selectedCard.id] || 1}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono-tech uppercase">Blockchain Verification</div>
                  <div className="text-xs font-mono-tech font-bold text-emerald-400 mt-1 flex items-center justify-center space-x-1">
                    <span>Verified On-Chain</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setCurrentPage('battle');
                  }}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-mono-tech font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <Swords className="w-4 h-4" />
                  <span>นำการ์ดนี้ไปประลองใน BATTLE</span>
                </button>

                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-tech text-xs rounded-xl transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
