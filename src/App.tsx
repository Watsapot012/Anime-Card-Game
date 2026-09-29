/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { ContractModal } from './components/ContractModal';
import { Home } from './pages/Home';
import { Gacha } from './pages/Gacha';
import { Collection } from './pages/Collection';
import { Battle } from './pages/Battle';
import { Admin } from './pages/Admin';
import { Sparkles, ExternalLink, Shield, Code2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['home', 'gacha', 'collection', 'battle', 'admin'].includes(hash)) {
        return hash;
      }
    }
    return 'home';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const { isConfigured, contractAddress, isDemoMode } = useWeb3();

  // Listen to hash changes and normalize URL path to prevent 404
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/' + (window.location.hash || ''));
      }
      const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (['home', 'gacha', 'collection', 'battle', 'admin'].includes(hash)) {
          setCurrentPage(hash);
        }
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.location.hash = page;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'gacha':
        return (
          <Gacha
            setCurrentPage={handleSetCurrentPage}
            openSettings={() => setIsSettingsOpen(true)}
          />
        );
      case 'collection':
        return (
          <Collection
            setCurrentPage={handleSetCurrentPage}
            openSettings={() => setIsSettingsOpen(true)}
          />
        );
      case 'battle':
        return <Battle setCurrentPage={handleSetCurrentPage} />;
      case 'admin':
        return <Admin openSettings={() => setIsSettingsOpen(true)} />;
      case 'home':
      default:
        return (
          <Home
            setCurrentPage={handleSetCurrentPage}
            openSettings={() => setIsSettingsOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">{renderPage()}</main>

      {/* Settings / Contract Address Configuration Modal */}
      <ContractModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-purple-500/10 bg-slate-950/90 py-6 px-4 text-center font-mono-tech text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-slate-400">
              Simple Anime Card Game • Full Web3 Implementation (Part 1 - Part 8)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-purple-400 transition-colors flex items-center space-x-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Remix Contract Guide</span>
            </button>
            <a
              href="https://remix.ethereum.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors flex items-center space-x-1"
            >
              <span>Remix IDE</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <Web3Provider>
      <MainContent />
    </Web3Provider>
  );
}

export default App;
