import React from 'react';
import { Shield, Swords, Star } from 'lucide-react';
import { CardData } from '../contract/config';

interface CardProps {
  card: CardData;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isRevealing?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  count,
  isSelected = false,
  onClick,
  size = 'md',
  isRevealing = false,
}) => {
  const getRarityTheme = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'SSR':
        return {
          border: 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]',
          badge: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30',
          gradient: 'from-amber-950/40 via-purple-950/30 to-slate-900',
          textColor: 'text-amber-300',
          stars: 5,
        };
      case 'SR':
        return {
          border: 'border-purple-400/70 shadow-[0_0_15px_rgba(192,132,252,0.4)]',
          badge: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30',
          gradient: 'from-purple-950/40 via-indigo-950/30 to-slate-900',
          textColor: 'text-purple-300',
          stars: 4,
        };
      case 'RARE':
        return {
          border: 'border-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.3)]',
          badge: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30',
          gradient: 'from-cyan-950/40 via-blue-950/30 to-slate-900',
          textColor: 'text-cyan-300',
          stars: 3,
        };
      case 'COMMON':
      default:
        return {
          border: 'border-slate-600/80 shadow-sm',
          badge: 'bg-slate-700 text-slate-200',
          gradient: 'from-slate-800/40 via-slate-900 to-slate-950',
          textColor: 'text-slate-300',
          stars: 2,
        };
    }
  };

  const theme = getRarityTheme(card.rarity);

  const sizeClasses = {
    sm: 'w-44 h-64 text-xs',
    md: 'w-56 h-84 text-sm',
    lg: 'w-72 h-[410px] text-base',
  };

  const imageSizes = {
    sm: 'h-32',
    md: 'h-44',
    lg: 'h-56',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative select-none rounded-2xl border-2 transition-all duration-300 ${
        sizeClasses[size]
      } ${theme.border} ${
        isSelected
          ? 'ring-4 ring-amber-400 scale-105 z-10 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
          : onClick
          ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl'
          : ''
      } ${
        isRevealing ? 'animate-bounce' : ''
      } bg-gradient-to-b ${theme.gradient} flex flex-col overflow-hidden backdrop-blur-md`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-2.5 z-10 bg-slate-950/70 border-b border-white/10">
        <div className="flex items-center space-x-1">
          <span className="font-mono-tech font-bold text-slate-400 text-xs">#{card.id}</span>
          <span className={`font-heading font-bold truncate max-w-[120px] ${theme.textColor}`}>
            {card.name}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase ${theme.badge}`}
        >
          {card.rarity}
        </span>
      </div>

      {/* Card Image Art */}
      <div className={`relative w-full ${imageSizes[size]} overflow-hidden bg-slate-900`}>
        <img
          src={card.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80'}
          alt={card.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Count badge for collection duplicates */}
        {count && count > 1 && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-amber-300 font-mono-tech font-bold px-2 py-0.5 rounded-md border border-amber-400/40 text-xs shadow-lg">
            ×{count}
          </div>
        )}
      </div>

      {/* Card Stats Footer */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-slate-950/80 border-t border-white/10">
        {/* Rarity Stars */}
        <div className="flex items-center justify-center space-x-0.5 my-0.5">
          {Array.from({ length: theme.stars }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 fill-current ${
                card.rarity.toUpperCase() === 'SSR'
                  ? 'text-amber-400'
                  : card.rarity.toUpperCase() === 'SR'
                  ? 'text-purple-400'
                  : card.rarity.toUpperCase() === 'RARE'
                  ? 'text-cyan-400'
                  : 'text-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex items-center space-x-1.5 bg-emerald-950/50 border border-emerald-500/30 rounded-lg px-2 py-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-emerald-400/80 font-bold uppercase">HP</span>
              <span className="font-mono-tech font-bold text-white text-xs sm:text-sm">{card.hp}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-rose-950/50 border border-rose-500/30 rounded-lg px-2 py-1">
            <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-rose-400/80 font-bold uppercase">ATK</span>
              <span className="font-mono-tech font-bold text-white text-xs sm:text-sm">{card.attack}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
