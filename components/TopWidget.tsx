
import React from 'react';
import { User, Landmark, ShieldAlert } from 'lucide-react';
import { formatMoney } from '../utils/format';
import { JobPosition } from '../types';

interface TopWidgetProps {
  currentJob: JobPosition;
  bankLimit: number;
  balance: number;
  isBankFull: boolean;
  riskLevel: number;
  level: number;
}

export const TopWidget: React.FC<TopWidgetProps> = ({ currentJob, bankLimit, balance, isBankFull, riskLevel, level }) => {
  const limitPercent = Math.min(100, (balance / bankLimit) * 100);
  const isDangerZone = limitPercent > 90;
  const isRisk50 = riskLevel >= 50;
  const isRisk60 = riskLevel >= 60;
  const isRisk80 = riskLevel >= 80;

  return (
    <div className="relative z-[60] w-full pt-2 px-2 pointer-events-none">
      <div className="bg-surface/70 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-[0_4px_16px_rgba(0,0,0,0.35)] animate-slide-up flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex flex-col gap-1.5">
          {/* Identity Chip */}
          <div className="flex items-center gap-2 bg-white/5 py-0.5 pl-0.5 pr-2.5 rounded-full border border-white/5 w-full">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
              <User size={12} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.18em]">Ранг</span>
                <span className="text-[8px] font-black font-mono px-1.5 py-0.5 rounded-full bg-surfaceHighlight text-slate-200 border border-white/10 shrink-0">
                  LVL {Math.floor(level)}
                </span>
              </div>
              <div className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                {currentJob.title}
              </div>
            </div>
          </div>

          {/* Finance + Risk (compact grid) */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="text-right flex flex-col">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.18em] leading-none mb-0.5 flex items-center justify-end gap-1">
                Лимит <Landmark size={8} />
              </span>
              <div className={`text-[10px] font-mono font-black tracking-tighter ${isDangerZone ? 'text-red-400' : 'text-slate-300'}`}>
                {formatMoney(balance)}
                <span className="text-slate-600 mx-1 font-sans">/</span>
                <span className="text-slate-500">{formatMoney(bankLimit)}</span>
              </div>
            </div>

            <div className="text-right flex flex-col">
              <span className={`text-[7px] font-black uppercase tracking-[0.18em] leading-none mb-0.5 flex items-center justify-end gap-1 ${isRisk80 ? 'text-red-400' : isRisk60 ? 'text-orange-400' : isRisk50 ? 'text-yellow-400' : 'text-slate-500'}`}>
                Розыск <ShieldAlert size={8} />
              </span>
              <div className={`text-[10px] font-mono font-black tracking-tighter ${isRisk80 ? 'text-red-400' : isRisk60 ? 'text-orange-300' : isRisk50 ? 'text-yellow-300' : 'text-slate-300'}`}>
                {Math.floor(riskLevel)}%
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="px-0.5">
          <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                isBankFull 
                  ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' 
                  : isDangerZone 
                    ? 'bg-orange-500 animate-pulse' 
                    : 'bg-gradient-to-r from-primary to-accent'
              }`}
              style={{ width: `${limitPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5 px-0.5">
            <div className="flex items-center gap-1">
               <div className={`w-1 h-1 rounded-full ${isDangerZone ? 'bg-red-500 animate-ping' : 'bg-success'}`} />
               <span className="text-[6px] font-black text-slate-600 uppercase tracking-widest">Система Активна</span>
            </div>
            <span className={`text-[6px] font-black uppercase tracking-widest ${isDangerZone ? 'text-red-500' : 'text-slate-500'}`}>
               Заполнено: {Math.floor(limitPercent)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
