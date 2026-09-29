import React, { useState, useEffect } from 'react';
import {
  Swords,
  Shield,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle,
  Skull,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWeb3 } from '../context/Web3Context';
import { Card } from '../components/Card';
import { CardData, INITIAL_DEMO_CARDS } from '../contract/config';

export const Battle: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const { myCards, allCards } = useWeb3();

  // Cards to choose from (fallback to demo starter if collection empty)
  const availableCards = myCards.length > 0 ? myCards : INITIAL_DEMO_CARDS;
  const enemyPool = allCards.length > 0 ? allCards : INITIAL_DEMO_CARDS;

  const [selectedPlayerCard, setSelectedPlayerCard] = useState<CardData>(availableCards[0]);
  const [enemyCard, setEnemyCard] = useState<CardData>(() => {
    const randomIdx = Math.floor(Math.random() * enemyPool.length);
    return enemyPool[randomIdx];
  });

  // Battle state
  const [playerCurrentHp, setPlayerCurrentHp] = useState<number>(availableCards[0].hp);
  const [enemyCurrentHp, setEnemyCurrentHp] = useState<number>(enemyPool[0].hp);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<'WIN' | 'LOSE' | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  // Initialize or reset match
  const startNewBattle = (pCard: CardData, ePool = enemyPool) => {
    const randomIdx = Math.floor(Math.random() * ePool.length);
    const chosenEnemy = ePool[randomIdx];

    setSelectedPlayerCard(pCard);
    setEnemyCard(chosenEnemy);
    setPlayerCurrentHp(pCard.hp);
    setEnemyCurrentHp(chosenEnemy.hp);
    setBattleResult(null);
    setBattleLogs([
      `Battle started! ${pCard.name} (HP: ${pCard.hp}, ATK: ${pCard.attack}) VS ${chosenEnemy.name} (HP: ${chosenEnemy.hp}, ATK: ${chosenEnemy.attack})`,
    ]);
  };

  useEffect(() => {
    if (availableCards.length > 0 && !selectedPlayerCard) {
      startNewBattle(availableCards[0]);
    }
  }, [availableCards]);

  // Turn-based attack handler according to Part 8
  const handleAttack = () => {
    if (battleResult || isAttacking) return;
    setIsAttacking(true);

    const logs = [...battleLogs];

    // 1. Enemy HP -= Player ATK
    const newEnemyHp = Math.max(0, enemyCurrentHp - selectedPlayerCard.attack);
    logs.unshift(
      `⚔️ ${selectedPlayerCard.name} โจมตีใส่ ${enemyCard.name} สร้างความเสียหาย ${selectedPlayerCard.attack} DMG!`
    );
    setEnemyCurrentHp(newEnemyHp);

    if (newEnemyHp <= 0) {
      // Enemy defeated -> YOU WIN
      logs.unshift(`🏆 ${enemyCard.name} HP หมด! คุณเป็นฝ่ายชนะ!`);
      setBattleLogs(logs);
      setBattleResult('WIN');
      setIsAttacking(false);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#ec4899', '#3b82f6'],
      });
      return;
    }

    // 2. ถ้า Enemy ยังไม่ตาย: Player HP -= Enemy ATK
    setTimeout(() => {
      const newPlayerHp = Math.max(0, playerCurrentHp - enemyCard.attack);
      logs.unshift(
        `💥 ${enemyCard.name} สวนกลับใส่ ${selectedPlayerCard.name} ได้รับความเสียหาย ${enemyCard.attack} DMG!`
      );
      setPlayerCurrentHp(newPlayerHp);

      if (newPlayerHp <= 0) {
        // Player defeated -> YOU LOSE
        logs.unshift(`💀 ${selectedPlayerCard.name} HP หมด! คุณเป็นฝ่ายพ่ายแพ้...`);
        setBattleResult('LOSE');
      }

      setBattleLogs(logs);
      setIsAttacking(false);
    }, 400);
  };

  const getHpPercentage = (current: number, max: number) => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col justify-between space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase bg-rose-950/80 border border-rose-500/40 text-rose-300">
          <Swords className="w-3.5 h-3.5 text-rose-400" />
          <span>ANIME ARENA • PART 8</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-wider uppercase">
          SIMPLE BATTLE
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          ระบบต่อสู้แบบง่ายที่ Frontend ตามกติกา Turn-based (ประหยัด Gas ไม่ต้องบันทึกบนบล็อกเชน)
        </p>
      </div>

      {/* Battle Stage */}
      <div className="relative bg-gradient-to-b from-slate-900/90 to-purple-950/50 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* VS Badge in Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-600 to-amber-500 p-0.5 shadow-2xl shadow-rose-600/50">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <span className="font-heading font-black text-xl text-white tracking-widest">
                VS
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          {/* PLAYER SIDE */}
          <div
            className={`flex flex-col items-center space-y-4 p-4 rounded-2xl border transition-all ${
              isAttacking ? 'scale-105 border-emerald-400/80' : 'border-slate-800 bg-slate-950/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono-tech text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PLAYER</span>
              </span>
              <button
                onClick={() => setShowSelectModal(true)}
                className="text-[11px] font-mono-tech text-purple-400 hover:text-purple-300 underline"
              >
                เปลี่ยนการ์ด
              </button>
            </div>

            {/* Player Card Visual */}
            <div className="transform transition-transform hover:scale-105">
              <Card card={selectedPlayerCard} size="md" />
            </div>

            {/* Player HP Gauge */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between font-mono-tech text-xs">
                <span className="text-slate-300 font-bold">{selectedPlayerCard.name}</span>
                <span className="text-emerald-400 font-bold">
                  HP {playerCurrentHp} / {selectedPlayerCard.hp}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${getHpPercentage(playerCurrentHp, selectedPlayerCard.hp)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
                <span>ATK: {selectedPlayerCard.attack}</span>
                <span>Rarity: {selectedPlayerCard.rarity}</span>
              </div>
            </div>
          </div>

          {/* Mobile VS indicator */}
          <div className="flex sm:hidden justify-center items-center my-2">
            <span className="px-4 py-1 rounded-full bg-rose-600/30 border border-rose-500 text-rose-300 font-heading font-black text-sm">
              VS
            </span>
          </div>

          {/* ENEMY SIDE */}
          <div
            className={`flex flex-col items-center space-y-4 p-4 rounded-2xl border transition-all ${
              enemyCurrentHp <= 0
                ? 'opacity-60 grayscale border-rose-500/40'
                : 'border-slate-800 bg-slate-950/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono-tech text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>ENEMY</span>
              </span>
              <button
                onClick={() => startNewBattle(selectedPlayerCard)}
                className="text-[11px] font-mono-tech text-slate-400 hover:text-white underline"
              >
                สุ่มศัตรูใหม่
              </button>
            </div>

            {/* Enemy Card Visual */}
            <div className="transform transition-transform hover:scale-105">
              <Card card={enemyCard} size="md" />
            </div>

            {/* Enemy HP Gauge */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between font-mono-tech text-xs">
                <span className="text-slate-300 font-bold">{enemyCard.name}</span>
                <span className="text-rose-400 font-bold">
                  HP {enemyCurrentHp} / {enemyCard.hp}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${getHpPercentage(enemyCurrentHp, enemyCard.hp)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
                <span>ATK: {enemyCard.attack}</span>
                <span>Rarity: {enemyCard.rarity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Battle Status */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          {battleResult === 'WIN' ? (
            <div className="text-center space-y-3 animate-in zoom-in-90 duration-300">
              <div className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 text-xl font-heading font-black tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>YOU WIN</span>
              </div>
              <div>
                <button
                  onClick={() => startNewBattle(selectedPlayerCard)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono-tech font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>PLAY AGAIN / เริ่มรอบใหม่</span>
                </button>
              </div>
            </div>
          ) : battleResult === 'LOSE' ? (
            <div className="text-center space-y-3 animate-in zoom-in-90 duration-300">
              <div className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-rose-950/80 border-2 border-rose-500 text-rose-300 text-xl font-heading font-black tracking-widest shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                <Skull className="w-6 h-6 text-rose-400" />
                <span>YOU LOSE</span>
              </div>
              <div>
                <button
                  onClick={() => startNewBattle(selectedPlayerCard)}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono-tech font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RETRY / ลองใหม่อีกครั้ง</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAttack}
              disabled={isAttacking}
              className={`px-10 py-4 rounded-2xl font-mono-tech text-lg font-black tracking-widest uppercase text-white shadow-xl transition-all duration-200 flex items-center space-x-3 ${
                isAttacking
                  ? 'bg-rose-950/60 opacity-80 cursor-wait'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 hover:scale-105 active:scale-95 shadow-rose-600/40'
              }`}
            >
              <Swords className="w-6 h-6 animate-pulse" />
              <span>[ ATTACK ]</span>
            </button>
          )}
        </div>
      </div>

      {/* Battle Log Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400">
          <span className="font-bold uppercase tracking-wider text-purple-300">
            Combat Log (บันทึกการต่อสู้)
          </span>
          <span>{battleLogs.length} events</span>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1 font-mono-tech text-xs text-slate-300 divide-y divide-slate-900/60">
          {battleLogs.map((log, idx) => (
            <div key={idx} className="py-1">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Select Card Modal */}
      {showSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-white text-base">
                เลือกการ์ดลงสู่ลานประลอง
              </h3>
              <button
                onClick={() => setShowSelectModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono-tech"
              >
                ปิด
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto p-2">
              {availableCards.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  onClick={() => {
                    startNewBattle(card);
                    setShowSelectModal(false);
                  }}
                  className="cursor-pointer transform hover:scale-105 transition-transform"
                >
                  <Card card={card} size="sm" isSelected={selectedPlayerCard.id === card.id} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
