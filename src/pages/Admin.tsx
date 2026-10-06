import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Edit3,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { Card } from '../components/Card';
import { CardData } from '../contract/config';

export const Admin: React.FC<{ openSettings: () => void }> = ({ openSettings }) => {
  const {
    account,
    isConnected,
    isOwner,
    ownerAddress,
    isDemoMode,
    allCards,
    addCard,
    editCard,
    txPending,
    error,
    clearError,
    refreshGameData,
    connectWallet,
    toggleDemoMode,
  } = useWeb3();

  // Mode: 'add' or 'edit'
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

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

  // Load a card into the edit form
  const handleSelectCardToEdit = (card: CardData) => {
    setMode('edit');
    setEditingCardId(card.id);
    setName(card.name);
    setImage(card.image);
    setHp(card.hp);
    setAttack(card.attack);
    setRarity(card.rarity);
    clearError();
    setSuccessMsg(null);

    // Scroll smoothly to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch back to Add New Card mode
  const handleCancelEdit = () => {
    setMode('add');
    setEditingCardId(null);
    setName('');
    setImage('');
    setHp(100);
    setAttack(30);
    setRarity('Common');
    clearError();
    setSuccessMsg(null);
  };

  // Submit Handler: Add or Edit
  const handleSubmit = async (e: React.FormEvent) => {
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

    if (mode === 'edit' && editingCardId !== null) {
      // Execute Edit Card
      const success = await editCard(editingCardId, name.trim(), imgUrl, hpNum, atkNum, rarity);
      if (success) {
        setSuccessMsg(`บันทึกการแก้ไขการ์ด #${editingCardId} "${name}" เรียบร้อยแล้ว!`);
      }
    } else {
      // Execute Add Card
      const success = await addCard(name.trim(), imgUrl, hpNum, atkNum, rarity);
      if (success) {
        setSuccessMsg(`การ์ด "${name}" ถูกเพิ่มเข้า Smart Contract เรียบร้อยแล้ว!`);
        setName('');
        setImage('');
        setHp(100);
        setAttack(30);
        setRarity('Common');
      }
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
            Connect MetaMask
          </button>
          <button
            onClick={() => toggleDemoMode(true)}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-tech font-bold text-xs"
          >
            เปิดใช้งาน Demo Mode
          </button>
        </div>
      </div>
    );
  }

  // 2. Connected but not owner (and not demo mode)
  if (!isOwner && !isDemoMode) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-black text-white">Access Denied (Only Owner)</h2>
        <p className="text-xs text-slate-400 max-w-md">
          คุณไม่ได้เป็นเจ้าของ Smart Contract นี้ (เฉพาะ Address ผู้ Deploy สัญญาเท่านั้นที่สามารถจัดการการ์ดได้)
        </p>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono-tech text-slate-400 space-y-1">
          <div>
            Your Wallet: <span className="text-slate-200">{account}</span>
          </div>
          <div>
            Contract Owner: <span className="text-purple-400">{ownerAddress || 'Reading on-chain...'}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openSettings}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-tech"
          >
            เปลี่ยน Contract Address
          </button>
          <button
            onClick={() => toggleDemoMode(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono-tech font-bold"
          >
            สลับไป Demo Mode เพื่อทดสอบ
          </button>
        </div>
      </div>
    );
  }

  // Currently previewed card ID
  const previewId = mode === 'edit' && editingCardId !== null ? editingCardId : allCards.length + 1;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase bg-amber-950/80 border border-amber-500/40 text-amber-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>CONTRACT OWNER PANEL • ADMIN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-wider uppercase">
            CARD MANAGEMENT
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            เพิ่มการ์ดใหม่ หรือแก้ไขค่าพลังและรูปภาพการ์ดที่มีอยู่ใน Smart Contract
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshGameData}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 text-xs font-mono-tech"
            title="Refresh from blockchain"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH ON-CHAIN</span>
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono-tech">
            Total Cards: <span className="font-bold text-white">{allCards.length}</span>
          </div>
        </div>
      </div>

      {/* MODE TABS (ADD NEW / EDIT EXISTING) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={handleCancelEdit}
          className={`flex-1 py-2.5 rounded-xl text-xs font-mono-tech font-bold transition-all flex items-center justify-center space-x-2 ${
            mode === 'add'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>เพิ่มการ์ดใหม่ (Add Card)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (allCards.length > 0) {
              const target = allCards.find((c) => c.id === editingCardId) || allCards[0];
              handleSelectCardToEdit(target);
            }
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-mono-tech font-bold transition-all flex items-center justify-center space-x-2 ${
            mode === 'edit'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>แก้ไขการ์ด (Edit Card)</span>
        </button>
      </div>

      {/* FORM & PREVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM PANEL */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          {/* Header of Form */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="space-y-0.5">
              <h3 className="font-heading text-lg font-bold text-white flex items-center space-x-2">
                {mode === 'edit' ? (
                  <>
                    <Edit3 className="w-5 h-5 text-amber-400" />
                    <span>แก้ไขข้อมูลการ์ด #{editingCardId}</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 text-purple-400" />
                    <span>เพิ่มการ์ดใหม่เข้าสู่สัญญา</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'edit'
                  ? `กำลังแก้ไขการ์ด ID #${editingCardId} ใน Smart Contract`
                  : 'กรอกข้อมูลสเตตัสและการ์ดเพื่อส่งขึ้นบล็อกเชน'}
              </p>
            </div>

            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-tech flex items-center space-x-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>ยกเลิกการแก้ไข</span>
              </button>
            )}
          </div>

          {/* Quick Card Selector if in Edit Mode */}
          {mode === 'edit' && (
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5">
              <label className="text-[11px] font-mono-tech text-amber-300 font-bold uppercase flex items-center space-x-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>เลือกการ์ดที่ต้องการแก้ไข:</span>
              </label>
              <select
                value={editingCardId || ''}
                onChange={(e) => {
                  const target = allCards.find((c) => c.id === Number(e.target.value));
                  if (target) handleSelectCardToEdit(target);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-amber-500/40 rounded-lg text-xs font-mono-tech text-white focus:outline-none cursor-pointer"
              >
                {allCards.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    #{c.id} - {c.name} ({c.rarity}) [HP: {c.hp} | ATK: {c.attack}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PRESETS (ONLY FOR ADD MODE) */}
          {mode === 'add' && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-wider">
                เทมเพลตตัวอย่าง (คลิกเพื่อเติมค่าเร็ว):
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 text-xs font-mono-tech text-slate-300 hover:text-white transition-all"
                  >
                    + {preset.name} ({preset.rarity})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono-tech font-bold text-slate-300 uppercase">
                ชื่อตัวละคร (Card Name) <span className="text-rose-400">*</span>
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
                Card Image URL (ลิงก์รูปภาพ)
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
                      rarity.toLowerCase() === r.toLowerCase()
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
                  : mode === 'edit'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 hover:scale-[1.01] active:scale-[0.99] shadow-amber-500/20'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 hover:scale-[1.01] active:scale-[0.99] shadow-amber-500/20'
              }`}
            >
              {txPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {mode === 'edit' ? 'EXECUTING EDITCARD TRANSACTION...' : 'EXECUTING ADDCARD TRANSACTION...'}
                  </span>
                </>
              ) : mode === 'edit' ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>[ บันทึกการแก้ไขการ์ด #{editingCardId} ]</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>[ เพิ่มการ์ดเข้า SMART CONTRACT ]</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* LIVE PREVIEW & REGISTERED CARDS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Live Preview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col items-center space-y-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono-tech text-slate-400 uppercase tracking-wider">
                Card Live Preview
              </span>
              <span className="text-[11px] font-mono-tech px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300">
                {mode === 'edit' ? `Editing #${editingCardId}` : `New #${previewId}`}
              </span>
            </div>
            <Card
              card={{
                id: previewId,
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

          {/* Registered Cards List with Edit Buttons */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white uppercase">
                  Registered Cards ({allCards.length})
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">คลิก "แก้ไข" เพื่อแก้การ์ด</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allCards.map((c) => {
                const isSelected = mode === 'edit' && editingCardId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono-tech transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800/80 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400 font-bold">#{c.id}</span>
                          <span className="text-white font-semibold truncate">{c.name}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                              c.rarity === 'SSR'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : c.rarity === 'SR'
                                ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {c.rarity}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          HP: <span className="text-emerald-400">{c.hp}</span> | ATK:{' '}
                          <span className="text-rose-400">{c.attack}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectCardToEdit(c)}
                      className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold flex items-center space-x-1 transition-all shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : 'bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isSelected ? 'กำลังแก้' : 'แก้ไข'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
