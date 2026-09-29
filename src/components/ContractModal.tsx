import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_SOURCE_CODE, contractAbi, getStoredContractABI, DEFAULT_CONTRACT_ADDRESS } from '../contract/config';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose }) => {
  const {
    contractAddress,
    isConfigured,
    updateContractAddress,
    updateContractABI,
    resetToDefaultABI,
    refreshGameData,
    isDemoMode,
    toggleDemoMode,
  } = useWeb3();

  const [inputAddress, setInputAddress] = useState(contractAddress);
  const [abiText, setAbiText] = useState(() => JSON.stringify(getStoredContractABI(), null, 2));
  const [activeTab, setActiveTab] = useState<'settings' | 'remix_guide' | 'solidity'>('settings');
  const [copiedSol, setCopiedSol] = useState(false);
  const [copiedAbi, setCopiedAbi] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateContractAddress(inputAddress);
    try {
      const parsed = JSON.parse(abiText);
      updateContractABI(JSON.stringify(parsed));
    } catch {
      // ignore
    }
    setSaveSuccess(true);
    refreshGameData();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopySol = () => {
    navigator.clipboard.writeText(CONTRACT_SOURCE_CODE);
    setCopiedSol(true);
    setTimeout(() => setCopiedSol(false), 2000);
  };

  const handleCopyAbi = () => {
    navigator.clipboard.writeText(JSON.stringify(contractAbi, null, 2));
    setCopiedAbi(true);
    setTimeout(() => setCopiedAbi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="font-heading text-lg font-bold text-white tracking-wide">
              Smart Contract & Remix Setup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-mono-tech text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Contract Configuration
          </button>
          <button
            onClick={() => setActiveTab('remix_guide')}
            className={`py-3 px-4 font-mono-tech text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'remix_guide'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Remix Guide (วิธี Deploy)</span>
          </button>
          <button
            onClick={() => setActiveTab('solidity')}
            className={`py-3 px-4 font-mono-tech text-sm font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'solidity'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>SimpleCardGame.sol</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Demo Mode Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Demo Simulation Mode</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    ทดลองเล่น สุ่มการ์ด เปิดการ์ด และจัดทัพสู้ได้ทันทีโดยไม่ต้องใช้ Gas หรือ MetaMask
                  </p>
                </div>
                <button
                  onClick={() => toggleDemoMode()}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-mono-tech transition-colors ${
                    isDemoMode
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isDemoMode ? 'Active (คลิกเพื่อปิด)' : 'เปิดใช้งาน Demo'}
                </button>
              </div>

              {/* Contract Address Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-heading font-semibold text-slate-300 text-xs uppercase tracking-wider">
                    Contract Address (ที่อยู่ Contract ที่ Deploy แล้ว)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setInputAddress(DEFAULT_CONTRACT_ADDRESS)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 underline font-mono-tech"
                    >
                      ใช้ Official Contract
                    </button>
                    {isConfigured ? (
                      <span className="flex items-center text-xs text-emerald-400 font-mono-tech">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Valid
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-amber-400 font-mono-tech">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        Not configured
                      </span>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="0x... (วาง Contract Address ที่ได้จาก Remix IDE ที่นี่)"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl font-mono-tech text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400">
                  Deploy ใน Remix IDE แล้วคัดลอก Contract Address มาวางที่นี่ จากนั้นกดปุ่ม "Save
                  Configuration"
                </p>
              </div>

              {/* Contract ABI section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-heading font-semibold text-slate-300 text-xs uppercase tracking-wider">
                    Contract ABI (JSON)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyAbi}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                    >
                      {copiedAbi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy ABI</span>
                    </button>
                    <button
                      onClick={() => {
                        resetToDefaultABI();
                        setAbiText(JSON.stringify(contractAbi, null, 2));
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={abiText}
                  onChange={(e) => setAbiText(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono-tech text-xs text-slate-300 outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono-tech font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึก Contract Address & ABI</span>
                </button>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  {saveSuccess && (
                    <span className="text-emerald-400 font-mono-tech text-xs animate-in fade-in">
                      ✓ บันทึกสำเร็จแล้ว!
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono-tech font-semibold transition-colors"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>

              {/* What to do next card */}
              <div className="p-4 bg-gradient-to-r from-slate-950 to-purple-950/40 rounded-xl border border-purple-500/30 space-y-2">
                <span className="text-xs font-mono-tech font-bold text-amber-300 uppercase tracking-wide">
                  🎮 ขั้นตอนถัดไปหลังจากกดบันทึก:
                </span>
                <ol className="text-xs text-slate-300 space-y-1.5 pl-4 list-decimal font-sans leading-relaxed">
                  <li><strong>กดปิดหน้าต่างนี้</strong> ที่มุมขวาบน หรือกดปุ่ม "ปิดหน้าต่าง" ด้านบน</li>
                  <li><strong>กดปุ่ม CONNECT METAMASK</strong> ที่มุมขวาบนของหน้าเว็บ เพื่อเชื่อมต่อกระเป๋า</li>
                  <li><strong>ไปที่หน้า GACHA</strong> แล้วกดปุ่ม <code>[ DRAW ]</code> เพื่อสุ่มการ์ดอนิเมะใบแรกเข้ากระเป๋า On-Chain</li>
                  <li><strong>ไปที่หน้า MY COLLECTION</strong> เพื่อดูการ์ดทั้งหมดที่คุณเป็นเจ้าของ</li>
                  <li><strong>ไปที่หน้า BATTLE</strong> เพื่อนำการ์ดไปประลองกับศัตรู</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'remix_guide' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-200">เปิด Remix IDE ในบราวเซอร์:</span>
                  <p className="text-xs text-slate-300">
                    เครื่องมือเขียนและ Deploy Smart Contract ฟรีบน Ethereum & Testnet
                  </p>
                </div>
                <a
                  href="https://remix.ethereum.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors shrink-0"
                >
                  <span>remix.ethereum.org</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-3 font-sans text-xs sm:text-sm">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 font-mono-tech">
                    ขั้นตอนที่ 1: เตรียมไฟล์ Smart Contract
                  </span>
                  <p className="text-slate-300 text-xs">
                    เปิด Remix IDE → ที่เมนูด้านซ้ายกดไอคอน File Explorer → กด New File และตั้งชื่อว่า{' '}
                    <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded">SimpleCardGame.sol</code>
                  </p>
                  <button
                    onClick={handleCopySol}
                    className="mt-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-md text-xs font-mono-tech flex items-center space-x-1.5 transition-colors"
                  >
                    {copiedSol ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSol ? 'คัดลอกโค้ดสำเร็จแล้ว!' : 'กดเพื่อคัดลอกโค้ด SimpleCardGame.sol'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 font-mono-tech">
                    ขั้นตอนที่ 2: Compile Smart Contract
                  </span>
                  <p className="text-slate-300 text-xs">
                    คลิกแท็บ <strong>Solidity Compiler</strong> ทางด้านซ้าย → เลือก Compiler เวอร์ชัน{' '}
                    <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded">0.8.20</code> ขึ้นไป →
                    กดปุ่ม <strong>Compile SimpleCardGame.sol</strong> (จะปรากฏเครื่องหมายถูกสีเขียว)
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 font-mono-tech">
                    ขั้นตอนที่ 3: Deploy ด้วย MetaMask (Sepolia / Testnet)
                  </span>
                  <p className="text-slate-300 text-xs">
                    คลิกแท็บ <strong>Deploy & Run Transactions</strong> → ช่อง Environment เลือกเป็น{' '}
                    <strong>"Injected Provider - MetaMask"</strong> → ยืนยันเชื่อมต่อ MetaMask ในเครือข่ายที่ต้องการ (เช่น Sepolia Testnet) →
                    กดปุ่มสีส้ม <strong>Deploy</strong> → กดยืนยัน Transaction บน MetaMask
                  </p>
                </div>

                {/* FAQ: Missing Injected Provider */}
                <div className="p-4 bg-amber-950/30 rounded-xl border border-amber-500/40 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs font-mono-tech">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>⚠️ กรณีไม่มีตัวเลือก "Injected Provider" ให้เลือกในช่อง ENVIRONMENT:</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 pl-5 list-disc font-sans leading-relaxed">
                    <li>
                      <strong>ยังไม่ได้ติดตั้ง MetaMask Extension ใน Browser:</strong> ติดตั้งได้ที่{' '}
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 underline"
                      >
                        metamask.io
                      </a>
                    </li>
                    <li>
                      <strong>เพิ่งติดตั้งเสร็จ:</strong> ให้กดรีเฟรชหน้าเว็บ Remix (F5) 1 ครั้ง
                    </li>
                    <li>
                      <strong>MetaMask ถูกล็อก:</strong> คลิกที่ไอคอนสุนัขจิ้งจอกเพื่อใส่รหัสผ่าน Unlock
                    </li>
                    <li>
                      <strong>ทดสอบใน Remix ทันที:</strong> เลือก <strong>"Remix VM (Cancun)"</strong> ในช่อง ENVIRONMENT เพื่อกด Deploy และทดสอบใน Remix ได้ทันที!
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 font-mono-tech">
                    ขั้นตอนที่ 4: Copy Contract Address มาใส่ที่ Frontend
                  </span>
                  <p className="text-slate-300 text-xs">
                    เมื่อ Deploy สำเร็จ ตรงส่วน <strong>Deployed Contracts</strong> ด้านล่างจะมีชื่อ SimpleCardGame พร้อมปุ่ม Copy Icon เล็กๆ
                    คลิกคัดลอก Address แล้วนำมาวางในช่อง <strong>Contract Address</strong> ของแท็บ "Contract Configuration" แล้วกดบันทึก
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solidity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono-tech">
                  ไฟล์: /SimpleCardGame.sol (Solidity ^0.8.20)
                </span>
                <button
                  onClick={handleCopySol}
                  className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-xs font-mono-tech flex items-center space-x-1.5 transition-colors"
                >
                  {copiedSol ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSol ? 'คัดลอกเรียบร้อย' : 'Copy โค้ดทั้งหมด'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono-tech text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
                {CONTRACT_SOURCE_CODE}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
