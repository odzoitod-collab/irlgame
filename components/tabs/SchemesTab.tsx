
import React, { useState } from 'react';
import { GameState, SchemeItem, ActiveScheme, SchemeCategory, UpgradeItem, UpgradeType, VerticalType } from '../../types';
import { SCHEMES_LIST, MARKET_ITEMS } from '../../constants';
import { formatMoney, calculateUpgradeCost } from '../../utils/format';
import { Skull, FlaskConical, Flame, Hammer, Crosshair } from 'lucide-react';

interface SchemesTabProps {
  gameState: GameState;
  startScheme: (scheme: SchemeItem) => void;
  claimScheme: (scheme: ActiveScheme) => void;
  buyUpgrade: (u: UpgradeItem) => void;
}

export const SchemesTab: React.FC<SchemesTabProps> = ({ gameState, startScheme, claimScheme, buyUpgrade }) => {
  const [schemesTab, setSchemesTab] = useState<'ACTIVE' | 'BLACK_MARKET'>('ACTIVE');
  const activeList = gameState.activeSchemes;
  const now = Date.now();

  const getMarketIcon = (id: string, vertical: VerticalType) => {
     if (vertical === VerticalType.DARK) {
         if (id.includes('courier') || id.includes('grow')) return <FlaskConical size={18} />;
         if (id.includes('guns')) return <Crosshair size={18} />;
         if (id.includes('hitman')) return <Skull size={18} />;
         if (id.includes('thugs')) return <Hammer size={18} />;
         return <Flame size={18} />;
     }
     return <Flame size={18} />;
  };

  const getSoftTier = (u: UpgradeItem, level: number) => {
    if (!u.tierNames) return '';
    if (level === 0) return 'Не куплено';
    if (level < 10) return u.tierNames[0];
    if (level < 20) return u.tierNames[1];
    return u.tierNames[2];
  };

  return (
    <div className="animate-fade-in pb-24">
        {/* SUB TABS */}
        <div className="flex bg-surfaceHighlight p-1.5 rounded-2xl mb-6">
            <button onClick={() => setSchemesTab('ACTIVE')} className={`relative flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all ${schemesTab === 'ACTIVE' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>
                СХЕМЫ
                {activeList.some(s => s.isReady) && <span className="absolute top-1 right-2 w-2 h-2 bg-success rounded-full animate-pulse"/>}
            </button>
            <button onClick={() => setSchemesTab('BLACK_MARKET')} className={`relative flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all ${schemesTab === 'BLACK_MARKET' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                ЧЕРНУХА
            </button>
        </div>

        {schemesTab === 'ACTIVE' && (
            <div className="space-y-6">
                {activeList.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-2">В Процессе</h4>
                        {activeList.map(scheme => {
                            const def = SCHEMES_LIST.find(s => s.id === scheme.schemeId);
                            if (!def) return null;
                            const timeLeft = Math.max(0, Math.ceil((scheme.endTime - now) / 1000));
                            const progress = Math.min(100, ((now - scheme.startTime) / (scheme.endTime - scheme.startTime)) * 100);
                            const isBlack = def.category === SchemeCategory.BLACK;

                            return (
                                <div key={scheme.id} className={`p-4 rounded-3xl border ${isBlack ? 'bg-red-950/10 border-red-500/30' : 'bg-surface border-white/5'} relative overflow-hidden`}>
                                    <div className="flex justify-between items-center mb-2 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl">{def.icon}</div>
                                            <span className="font-bold text-sm text-white">{def.name}</span>
                                        </div>
                                        {scheme.isReady ? (
                                            <button onClick={() => claimScheme(scheme)} className="bg-success text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider animate-pulse">Забрать</button>
                                        ) : (
                                            <span className="font-mono text-xs text-slate-400">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                                        )}
                                    </div>
                                    {!scheme.isReady && (
                                        <div className="h-1.5 w-full bg-surfaceHighlight rounded-full overflow-hidden relative z-10">
                                            <div className={`h-full transition-all duration-1000 linear ${isBlack ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${progress}%` }}/>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="space-y-4">
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-2">Доступные Темы</h4>
                    {SCHEMES_LIST.filter(s => s.category === SchemeCategory.GREY).map(scheme => {
                            const trafficCost = 1;
                            const canAfford = gameState.balance >= scheme.cost;
                            const hasTraffic = (gameState.trafficUnits || 0) >= trafficCost;
                            const canStart = canAfford && hasTraffic;
                            return (
                                <div key={scheme.id} className="p-5 rounded-3xl relative overflow-hidden group bg-surface">
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl p-3 rounded-2xl bg-surfaceHighlight">{scheme.icon}</div>
                                            <div>
                                                <h4 className="text-white font-black text-sm uppercase">{scheme.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">{scheme.description}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-black bg-yellow-500 text-black`}>
                                            RISK {scheme.riskPercentage}%
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl mb-4 relative z-10">
                                        <div className="text-center">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Время</div>
                                            <div className="text-xs text-white font-mono">{scheme.durationSeconds / 60} мин</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Вложения</div>
                                            <div className="text-xs text-white font-mono">{formatMoney(scheme.cost)}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Выхлоп</div>
                                            <div className="text-xs text-success font-mono">~{formatMoney(scheme.maxProfit)}</div>
                                        </div>
                                    </div>

                                    <button onClick={() => startScheme(scheme)} disabled={!canStart} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95 ${canStart ? 'bg-white text-black' : 'bg-surfaceHighlight text-slate-500'}`}>
                                        НАЧАТЬ ТЕМУ
                                    </button>
                                </div>
                            )
                    })}
                </div>
            </div>
        )}

        {schemesTab === 'BLACK_MARKET' && (
            <div className="space-y-6">
                    <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-2xl text-center">
                        <Skull className="mx-auto text-red-500 mb-2" size={32} />
                        <h4 className="text-red-500 font-black uppercase text-sm tracking-widest">Черный Рынок</h4>
                        <p className="text-[10px] text-red-400/70 font-bold mt-1">Здесь покупают товар для перепродажи и запрещенный софт.</p>
                </div>

                <h4 className="text-xs text-red-500/70 font-bold uppercase tracking-widest pl-2">Товарка (Опасно)</h4>
                <div className="space-y-4">
                    {SCHEMES_LIST.filter(s => s.category === SchemeCategory.BLACK).map(scheme => {
                            const trafficCost = 2;
                            const canAfford = gameState.balance >= scheme.cost;
                            const hasTraffic = (gameState.trafficUnits || 0) >= trafficCost;
                            const canStart = canAfford && hasTraffic;
                            return (
                                <div key={scheme.id} className="p-5 rounded-3xl relative overflow-hidden group bg-gradient-to-br from-surface to-red-950/20 border border-red-900/10">
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl p-3 rounded-2xl bg-red-900/20">{scheme.icon}</div>
                                            <div>
                                                <h4 className="text-white font-black text-sm uppercase">{scheme.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">{scheme.description}</p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 rounded text-[10px] font-black bg-red-500 text-white">
                                            RISK {scheme.riskPercentage}%
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl mb-4 relative z-10">
                                        <div className="text-center">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Ждать</div>
                                            <div className="text-xs text-white font-mono">{scheme.durationSeconds / 60} мин</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Закуп</div>
                                            <div className="text-xs text-white font-mono">{formatMoney(scheme.cost)}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">Навар</div>
                                            <div className="text-xs text-success font-mono">~{formatMoney(scheme.maxProfit)}</div>
                                        </div>
                                    </div>

                                    <button onClick={() => startScheme(scheme)} disabled={!canStart} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95 ${canStart ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-surfaceHighlight text-slate-500'}`}>
                                        ЗАКУПИТЬ ТОВАР
                                    </button>
                                </div>
                            )
                    })}
                </div>

                <h4 className="text-xs text-red-500/70 font-bold uppercase tracking-widest pl-2 mt-8">Инфраструктура ОПГ</h4>
                {MARKET_ITEMS.filter(u => u.type === UpgradeType.BLACK_MARKET).map(u => {
                    const level = gameState.upgrades[u.id] || 0;
                    const cost = calculateUpgradeCost(u.baseCost, level);
                    const canBuy = gameState.balance >= cost;
                    return (
                        <div key={u.id} className="bg-surface border border-red-900/20 p-5 rounded-3xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-950/50 text-red-500 rounded-2xl border border-red-500/20">{getMarketIcon(u.id, u.vertical)}</div>
                                    <div>
                                        <div className="text-white font-black text-sm uppercase tracking-wide">{u.name}</div>
                                        <div className="text-[10px] text-red-400/80 font-bold px-2 py-0.5 rounded w-fit mt-1 bg-red-950/40 border border-red-900/20">{getSoftTier(u, level)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                        <div className="text-xs font-bold text-red-500">+{formatMoney(u.baseProfit)} / сек</div>
                                </div>
                            </div>
                                <button onClick={() => buyUpgrade(u)} disabled={!canBuy} className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] active:scale-95 transition-transform ${canBuy ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-surfaceHighlight text-slate-500'}`}>
                                КУПИТЬ {formatMoney(cost)}
                            </button>
                        </div>
                    )
                })}
            </div>
        )}
    </div>
  );
};
