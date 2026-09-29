import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Swords,
  ShieldAlert,
  Settings,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { WalletButton } from './WalletButton';
import { useWeb3 } from '../context/Web3Context';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  openSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  openSettings,
}) => {
  const { isOwner, myCards } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gacha', label: 'Gacha', icon: Sparkles },
    {
      id: 'collection',
      label: 'My Collection',
      icon: Layers,
      badge: myCards.length > 0 ? myCards.length : null,
    },
    { id: 'battle', label: 'Battle', icon: Swords },
    { id: 'admin', label: 'Admin', icon: ShieldAlert, highlight: isOwner },
  ];

  const handleNav = (id: string) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center space-x-3 group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-purple-600/30 group-hover:shadow-purple-600/50 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-amber-300 transition-all">
              SIMPLE ANIME CARD GAME
            </span>
            <span className="font-mono-tech text-[10px] text-purple-400/80 uppercase tracking-widest">
              Web3 Solidity Edition
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold font-mono-tech tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 bg-purple-500/30 text-purple-300 text-[10px] rounded-full border border-purple-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Settings & Wallet */}
        <div className="hidden md:flex items-center space-x-2.5">
          <button
            onClick={openSettings}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 transition-all"
            title="Contract Address & Remix Guide"
          >
            <Settings className="w-4 h-4" />
          </button>
          <WalletButton />
        </div>

        {/* Mobile Section */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={openSettings}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`p-3 rounded-xl text-left font-mono-tech text-xs font-bold flex items-center space-x-2 ${
                    isActive
                      ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-purple-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-center">
            <WalletButton />
          </div>
        </div>
      )}
    </header>
  );
};
