
import React from 'react';
import { User, Landmark, ShieldCheck, Wallet } from 'lucide-react';
import { formatMoney } from '../utils/format';
import { JobPosition } from '../types';

interface TopWidgetProps {
  currentJob: JobPosition;
  bankLimit: number;
  balance: number;
  isBankFull: boolean;
}

export const TopWidget: React.FC<TopWidgetProps> = ({ currentJob, bankLimit, balance, isBankFull }) => {
  const limitPercent = Math.min(100, (balance / bankLimit) * 100);
  const isDangerZone = limitPercent > 90;

  return (
    <div className="relative z-[60] w-full pt-4 px-4 pointer-events-none">
      <div className="bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-slide-up flex flex-col gap-3 pointer-events-auto overflow-hidden">
        
        {/* Subtle Decorative Gradient Blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          
          {/* Identity Chip */}
          <div className="flex items-center gap-2.5 bg-white/5 py-1.5 pl-1.5 pr-4 rounded-full border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
              <User size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-0.5">Ранг</span>
              <span className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[80px]">
                {currentJob.title}
              </span>
            </div>
          </div>

          {/* Finance Summary */}
          <div className="flex items-center gap-4">
            <div className="text-right flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1 flex items-center justify-end gap-1">
                Лимит <Landmark size={8} />
              </span>
              <div className={`text-xs font-mono font-black tracking-tighter ${isDangerZone ? 'text-red-400' : 'text-slate-300'}`}>
                {formatMoney(balance)}
                <span className="text-slate-600 mx-1 font-sans">/</span>
                <span className="text-slate-500">{formatMoney(bankLimit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="px-1">
          <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
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
          <div className="flex justify-between mt-1.5 px-0.5">
            <div className="flex items-center gap-1">
               <div className={`w-1 h-1 rounded-full ${isDangerZone ? 'bg-red-500 animate-ping' : 'bg-success'}`} />
               <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Система Активна</span>
            </div>
            <span className={`text-[7px] font-black uppercase tracking-widest ${isDangerZone ? 'text-red-500' : 'text-slate-500'}`}>
               Заполнено: {Math.floor(limitPercent)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
