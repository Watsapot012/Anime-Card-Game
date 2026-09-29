import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { Card } from '../components/Card';

export const Admin: React.FC<{ openSettings: () => void }> = ({ openSettings }) => {
  const {
    account,
    isConnected,
    isOwner,
    ownerAddress,
    isDemoMode,
    allCards,
    addCard,
    txPending,
    error,
    clearError,
    refreshGameData,
    connectWallet,
    toggleDemoMode,
  } = useWeb3();

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [hp, setHp] = useState<number | ''>(100);
  const [attack, setAttack] = useState<number | ''>(30);
  const [rarity, setRarity] = useState('Common');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const presets = [
    {
      name: 'Luffy (Gear 5)',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
      hp: 220,
      attack: 75,
      rarity: 'SSR',
    },
    {
      name: 'Zoro',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      hp: 160,
      attack: 55,
      rarity: 'SR',
    },
    {
      name: 'Zenitsu',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      hp: 110,
      attack: 40,
      rarity: 'Rare',
    },
    {
      name: 'Deku',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      hp: 130,
      attack: 45,
      rarity: 'Rare',
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setName(preset.name);
    setImage(preset.image);
    setHp(preset.hp);
    setAttack(preset.attack);
    setRarity(preset.rarity);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg(null);

    if (!name.trim()) return;
    const hpNum = Number(hp);
    const atkNum = Number(attack);

    if (hpNum <= 0 || atkNum <= 0) return;

    const imgUrl =
      image.trim() ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80';

    const success = await addCard(name.trim(), imgUrl, hpNum, atkNum, rarity);

    if (success) {
      setSuccessMsg(`การ์ด "${name}" ถูกเพิ่มเข้า Smart Contract เรียบร้อยแล้ว!`);
      setName('');
      setImage('');
      setHp(100);
      setAttack(30);
      setRarity('Common');
    }
  };

  // 1. Not connected
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-black text-white">
          Please Connect MetaMask
        </h2>
        <p className="text-xs text-slate-400 max-w-sm">
          หน้านี้เฉพาะเจ้าของ Smart Contract (Owner) เท่านั้น กรุณาเชื่อมต่อ MetaMask ด้วย Address ที่ใช้ Deploy
        </p>
        <div className="flex gap-3">
          <button
            onClick={connectWallet}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono-tech font-bold text-xs"
          >
            CONNECT METAMASK
          </button>
          <button
            onClick={() => toggleDemoMode(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-tech text-xs"
          >
            จำลองสิทธิ์ผ่าน Demo Mode
          </button>
        </div>
      </div>
    );
  }

  // 2. Access Denied (if connected wallet != owner)
  if (!isOwner && !isDemoMode) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-heading font-black text-rose-400 tracking-wider">
            Access Denied
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            คุณไม่ได้เป็น Owner ของ Smart Contract นี้ (ตรวจสอบจากฟังก์ชัน owner() ของ Ownable)
          </p>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-left font-mono-tech text-xs space-y-2 max-w-md w-full">
          <div className="flex justify-between">
            <span className="text-slate-400">กระเป๋าของคุณ:</span>
            <span className="text-rose-300 font-bold truncate max-w-[200px]">{account}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Contract Owner:</span>
            <span className="text-emerald-300 font-bold truncate max-w-[200px]">
              {ownerAddress || 'กำลังอ่าน...'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            onClick={() => toggleDemoMode(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono-tech rounded-lg border border-amber-500/30"
          >
            สลับไปใช้ Demo Admin Mode
          </button>
          <button
            onClick={openSettings}
            className="px-4 py-2 bg-purple-900/40 hover:bg-purple-800/40 text-purple-300 text-xs font-mono-tech rounded-lg border border-purple-500/30"
          >
            ตั้งค่า Contract Address ใหม่
          </button>
        </div>
      </div>
    );
  }

  // 3. Authorized Owner Admin Form
  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase bg-amber-950/80 border border-amber-500/40 text-amber-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>OWNER VERIFIED • PART 9</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-wider uppercase">
            ADMIN PANEL
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            เพิ่มการ์ดใหม่เข้าสู่ Smart Contract ผ่านฟังก์ชัน addCard(...) เฉพาะ Owner เท่านั้น
          </p>
        </div>

        <button
          onClick={() => refreshGameData()}
          disabled={txPending}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all flex items-center space-x-2 text-xs font-mono-tech self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${txPending ? 'animate-spin' : ''}`} />
          <span>REFRESH LIST</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ADD CARD FORM */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <span>ADD CARD</span>
            </h3>

            <span className="text-xs font-mono-tech text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Owner Authorized</span>
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-wider">
              Quick Presets (ตัวอย่างการ์ดสำเร็จรูป):
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/40 text-xs font-mono-tech text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 transition-colors"
                >
                  + {p.name} ({p.rarity})
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddCard} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono-tech font-bold text-slate-300 uppercase">
                Card Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Naruto, Tanjiro, Gojo, Goku"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl font-mono-tech text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-tech font-bold text-slate-300 uppercase">
                Card Image URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... (URL รูปภาพอนิเมะ)"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl font-mono-tech text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono-tech font-bold text-slate-300 uppercase">
                  HP (Health Points) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={9999}
                  value={hp}
                  onChange={(e) => setHp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl font-mono-tech text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono-tech font-bold text-slate-300 uppercase">
                  ATK (Attack Power) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={9999}
                  value={attack}
                  onChange={(e) => setAttack(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl font-mono-tech text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono-tech font-bold text-slate-300 uppercase">
                Rarity <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Common', 'Rare', 'SR', 'SSR'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRarity(r)}
                    className={`py-2 rounded-xl text-xs font-mono-tech font-bold uppercase transition-all ${
                      rarity === r
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono-tech">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono-tech flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={txPending}
              className={`w-full py-3.5 rounded-xl font-mono-tech font-black text-sm tracking-wider uppercase text-white shadow-xl transition-all flex items-center justify-center space-x-2 ${
                txPending
                  ? 'bg-purple-900/60 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 hover:scale-[1.01] active:scale-[0.99] shadow-amber-500/20'
              }`}
            >
              {txPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>EXECUTING ADDCARD TRANSACTION...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>[ ADD CARD ]</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* LIVE PREVIEW & REGISTERED CARDS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center space-y-3">
            <span className="text-xs font-mono-tech text-slate-400 uppercase tracking-wider">
              Card Live Preview
            </span>
            <Card
              card={{
                id: allCards.length + 1,
                name: name || 'Card Name',
                image:
                  image ||
                  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
                hp: typeof hp === 'number' ? hp : 100,
                attack: typeof attack === 'number' ? attack : 30,
                rarity,
                exists: true,
              }}
              size="md"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="font-bold text-white uppercase">
                Registered Cards ({allCards.length})
              </span>
              <span className="text-purple-400">Total in Contract</span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {allCards.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono-tech"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">#{c.id}</span>
                    <span className="text-white font-semibold">{c.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {c.rarity}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    HP: {c.hp} | ATK: {c.attack}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
