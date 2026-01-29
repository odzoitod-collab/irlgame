import React from 'react';
import { GameState, SupplyItem } from '../../types';
import { SUPPLIES_ITEMS } from '../../constants';
import { formatMoney } from '../../utils/format';

interface SuppliesTabProps {
  gameState: GameState;
  buySupply: (item: SupplyItem) => void;
  sellSupply: (item: SupplyItem) => void;
  useSupply: (item: SupplyItem) => void;
}

export const SuppliesTab: React.FC<SuppliesTabProps> = ({ gameState, buySupply, sellSupply, useSupply }) => {
  const ownedCount = (id: string) => gameState.supplies?.[id] || 0;

  return (
    <div className="animate-fade-in space-y-6 pb-32">
      <div className="bg-surface text-white p-6 rounded-[2.5rem] text-center relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Лавка</h2>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Расходники: усиления, спасение от розыска и скидки на обязательные покупки.
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {SUPPLIES_ITEMS.map((item) => {
          const canBuy = gameState.balance >= item.cost;

          return (
            <div key={item.id} className="bg-surface p-5 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl p-3 bg-surfaceHighlight rounded-2xl">{item.icon}</div>
                  <div>
                    <div className="text-white font-black text-sm uppercase">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">{item.description}</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-2">
                      Цена: <span className="text-slate-200 font-mono">{formatMoney(item.cost)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">В инве</div>
                  <div className="text-xl font-black text-white font-mono">{ownedCount(item.id)}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => buySupply(item)}
                  disabled={!canBuy}
                  className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    canBuy ? 'bg-white text-black shadow-xl active:scale-95' : 'bg-surfaceHighlight text-slate-600'
                  }`}
                >
                  Купить
                </button>
                <button
                  onClick={() => useSupply(item)}
                  disabled={ownedCount(item.id) <= 0}
                  className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    ownedCount(item.id) > 0 ? 'bg-primary text-white shadow-xl active:scale-95' : 'bg-surfaceHighlight text-slate-600'
                  }`}
                >
                  Использовать
                </button>
              </div>

              <button
                onClick={() => sellSupply(item)}
                disabled={ownedCount(item.id) <= 0}
                className={`mt-2 w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  ownedCount(item.id) > 0 ? 'bg-surfaceHighlight text-slate-300 active:scale-95' : 'bg-surfaceHighlight text-slate-600'
                }`}
              >
                Продать ({formatMoney(item.sellPrice)})
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
