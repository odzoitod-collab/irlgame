
import React, { useState } from 'react';
import { GameState, LaunderingItem, UpgradeItem, AssetItem, PropertyItem, UpgradeType, VerticalType, DropItem } from '../../types';
import { LAUNDERING_ITEMS, MARKET_ITEMS, ASSETS, PROPERTIES, DROPS } from '../../constants';
import { formatMoney, calculateUpgradeCost } from '../../utils/format';
import { Siren, Shield, Lock, Briefcase, Globe, Monitor, Smartphone, Cpu, Zap, Award, Target, Users, Gamepad2, Activity, Heart, AlertCircle, Skull } from 'lucide-react';

interface AssetsTabProps {
  gameState: GameState;
  isBankFull: boolean;
  portfolioValue: number;
  upgradeLaunderingItem: (item: LaunderingItem) => void;
  buyUpgrade: (u: UpgradeItem) => void;
  buyAsset: (a: AssetItem) => void;
  sellAsset: (a: AssetItem) => void;
  buyProperty: (p: PropertyItem) => void;
  setActiveMiniGame: (id: string) => void;
  hireDrop: (d: DropItem) => void;
  payDropPremium: (id: string) => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ 
    gameState, isBankFull, portfolioValue, upgradeLaunderingItem, buyUpgrade, buyAsset, sellAsset, buyProperty, setActiveMiniGame, hireDrop, payDropPremium 
}) => {
  const [financeTab, setFinanceTab] = useState<'ASSETS' | 'LUXURY' | 'SECURITY' | 'EXCHANGE' | 'DROPS'>('ASSETS');

  const getMarketIcon = (id: string, vertical: VerticalType) => {
     if (vertical === VerticalType.SECURITY) {
        if (id.includes('cop')) return <Shield size={18} />;
        if (id.includes('lawyer')) return <Briefcase size={18} />;
        if (id.includes('cyber')) return <Lock size={18} />;
        return <Siren size={18} />;
     }
     return <Zap size={18} />;
  };

  return (
    <div className="animate-fade-in pb-24">
        {/* SUB TABS */}
        <div className="flex bg-surfaceHighlight p-1.5 rounded-2xl mb-6 overflow-x-auto no-scrollbar gap-1">
            <button onClick={() => setFinanceTab('ASSETS')} className={`flex-shrink-0 px-3 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all whitespace-nowrap ${financeTab === 'ASSETS' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                ОБМЫВ
            </button>
            <button onClick={() => setFinanceTab('DROPS')} className={`relative flex-shrink-0 px-3 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all whitespace-nowrap ${financeTab === 'DROPS' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                ДРОПЫ
                {Object.values(gameState.ownedDrops).some(d => d.fear > 70) && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
            </button>
            <button onClick={() => setFinanceTab('LUXURY')} className={`flex-shrink-0 px-3 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all whitespace-nowrap ${financeTab === 'LUXURY' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                ЛАКШЕРИ
            </button>
            <button onClick={() => setFinanceTab('SECURITY')} className={`relative flex-shrink-0 px-3 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all whitespace-nowrap ${financeTab === 'SECURITY' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                БЕЗОПАСНОСТЬ
            </button>
            <button onClick={() => setFinanceTab('EXCHANGE')} className={`flex-shrink-0 px-3 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all whitespace-nowrap ${financeTab === 'EXCHANGE' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                БИРЖА
            </button>
        </div>

        {financeTab === 'DROPS' && (
            <div className="space-y-4">
                <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="text-orange-500 flex-shrink-0" />
                    <p className="text-[10px] text-orange-200 font-bold uppercase leading-tight">
                        Дропы расширяют ваш лимит банка, но со временем они начинают бояться. 
                        Если "Страх" > 90%, дроп может кинуть вас. Выплачивайте премии, чтобы успокоить их.
                    </p>
                </div>

                <div className="space-y-3">
                    {DROPS.map(drop => {
                        const owned = gameState.ownedDrops[drop.id];
                        const canHire = gameState.balance >= drop.hireCost;
                        const premiumCost = Math.floor(drop.hireCost * 0.2);
                        const canPayPremium = gameState.balance >= premiumCost;

                        return (
                            <div key={drop.id} className={`p-5 rounded-[2rem] border transition-all ${owned ? 'bg-surfaceHighlight border-primary/30' : 'bg-surface border-white/5 opacity-80'}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-3xl p-3 bg-surface/50 rounded-2xl">{drop.icon}</div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-black text-sm uppercase">{drop.name}</h4>
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{drop.role}</div>
                                        <div className="text-[10px] text-success font-bold mt-1">+{formatMoney(drop.limitBonus)} ЛИМИТ</div>
                                    </div>
                                    {owned && (
                                        <div className="text-right">
                                            <span className="text-[9px] text-slate-500 font-bold uppercase block">СТРАХ</span>
                                            <span className={`text-xl font-black font-mono ${owned.fear > 70 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{Math.floor(owned.fear)}%</span>
                                        </div>
                                    )}
                                </div>

                                {owned ? (
                                    <div className="space-y-3">
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 ${owned.fear > 70 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${owned.fear}%` }} />
                                        </div>
                                        <button 
                                            onClick={() => payDropPremium(drop.id)}
                                            disabled={!canPayPremium}
                                            className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${canPayPremium ? 'bg-success text-white' : 'bg-slate-800 text-slate-500'}`}
                                        >
                                            <Heart size={14} /> УСПОКОИТЬ ({formatMoney(premiumCost)})
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => hireDrop(drop)}
                                        disabled={!canHire}
                                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${canHire ? 'bg-white text-black' : 'bg-slate-800 text-slate-600'}`}
                                    >
                                        НАНЯТЬ ({formatMoney(drop.hireCost)})
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {financeTab === 'SECURITY' && (
            <div className="space-y-4">
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <h4 className="text-red-500 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                            <Siren size={16} /> Уровень Розыска
                            </h4>
                            <span className="text-white font-mono font-bold">{Math.floor(gameState.riskLevel)}%</span>
                        </div>
                        <div className="w-full h-3 bg-red-950 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${gameState.riskLevel}%`}} />
                        </div>
                         {/* Flashing lights effect if high risk */}
                        {gameState.riskLevel > 80 && (
                            <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
                        )}
                    </div>

                    {MARKET_ITEMS.filter(u => u.type === UpgradeType.SECURITY).map(u => {
                    const level = gameState.upgrades[u.id] || 0;
                    const cost = calculateUpgradeCost(u.baseCost, level);
                    const canBuy = gameState.balance >= cost;
                    return (
                        <div key={u.id} className="bg-surface p-4 rounded-3xl flex justify-between items-center relative overflow-hidden group">
                            <div className="flex items-center gap-4 flex-1 z-10">
                                <div className="p-3 rounded-2xl bg-surfaceHighlight text-accent">{getMarketIcon(u.id, u.vertical)}</div>
                                <div>
                                    <div className="text-white font-black text-sm uppercase">{u.name}</div>
                                    <div className="text-xs text-slate-400 font-bold mt-1">{u.description}</div>
                                </div>
                            </div>
                            <button onClick={() => buyUpgrade(u)} disabled={!canBuy} className={`z-10 px-5 py-3 rounded-2xl text-xs font-black font-mono transition-all active:scale-95 ${canBuy ? 'bg-blue-600 text-white' : 'bg-surfaceHighlight text-slate-500'}`}>
                                {formatMoney(cost)}
                            </button>
                        </div>
                    );
                })}
            </div>
        )}

        {financeTab === 'ASSETS' && (
            <div className="space-y-4">
                {isBankFull && <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 font-bold text-xs uppercase text-center animate-pulse border border-red-500/20">Банк переполнен! Нужно расширение</div>}
                
                <div className="grid grid-cols-1 gap-3">
                    {LAUNDERING_ITEMS.map((item, index) => {
                        const currentLevel = gameState.launderingUpgrades[item.id] || 0;
                        const cost = calculateUpgradeCost(item.baseCost, currentLevel);
                        const canBuy = gameState.balance >= cost;
                        const canPlay = ['laund_shawarma', 'laund_carwash', 'laund_rest', 'laund_const'].includes(item.id) && currentLevel > 0;

                        return (
                            <div key={item.id} className="p-5 rounded-3xl bg-surface relative overflow-hidden border border-white/5">
                                <div className="flex items-center gap-4 mb-3 relative z-10">
                                    <div className="text-3xl p-3 bg-surfaceHighlight rounded-2xl">{item.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                        <h4 className="font-black text-white text-sm">{item.name}</h4>
                                        <span className="text-[10px] font-bold bg-surfaceHighlight px-2 py-0.5 rounded text-slate-400">Lvl {currentLevel}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold mt-1">+{formatMoney(item.baseLimit)} Лимит</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-5 gap-2 relative z-10">
                                    <button onClick={() => upgradeLaunderingItem(item)} disabled={!canBuy} className={`col-span-3 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${canBuy ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surfaceHighlight text-slate-500'}`}>{`UP ${formatMoney(cost)}`}</button>
                                    
                                    {canPlay ? (
                                        <button onClick={() => setActiveMiniGame(item.id)} className="col-span-2 py-3 bg-accent text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-accent/20 animate-pop">
                                            <Gamepad2 size={20} />
                                        </button>
                                    ) : (
                                    <div className="col-span-2 bg-surfaceHighlight rounded-2xl flex items-center justify-center opacity-30 cursor-not-allowed">
                                        <Lock size={16} />
                                    </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {financeTab === 'LUXURY' && (
            <div className="grid grid-cols-2 gap-3 pb-24">
                {PROPERTIES.map(p => {
                    const count = gameState.properties?.[p.id] || 0;
                    const cost = calculateUpgradeCost(p.baseCost, count);
                    const canBuy = gameState.balance >= cost;
                    return (
                    <button key={p.id} onClick={() => buyProperty(p)} disabled={!canBuy} className={`relative overflow-hidden p-4 rounded-3xl flex flex-col items-center text-center transition-all active:scale-95 ${canBuy ? 'bg-surface hover:bg-surfaceHighlight border border-white/10' : 'bg-surface/50 opacity-60 border border-transparent'}`}>
                        <div className="text-white mb-2 text-3xl drop-shadow-md">{p.image.includes('http') ? <img src={p.image} className="w-8 h-8"/> : p.image}</div>
                        <div className="text-xs font-black text-white uppercase tracking-wide leading-tight mb-1">{p.name}</div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold mt-2 ${canBuy ? 'bg-success text-white' : 'bg-surfaceHighlight text-slate-500'}`}>{formatMoney(cost)}</div>
                        {count > 0 && <div className="absolute top-3 right-3 text-[9px] font-black bg-white text-black w-5 h-5 flex items-center justify-center rounded-full shadow-md">{count}</div>}
                    </button>
                    )
                })}
            </div>
        )}

        {financeTab === 'EXCHANGE' && (
            <div className="space-y-3">
                <div className="bg-surfaceHighlight p-5 rounded-3xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Мой Портфель</div>
                    <div className="text-3xl font-mono font-black mt-1 flex items-center gap-2 text-white">
                        {formatMoney(portfolioValue)}
                        <Activity size={20} className="text-primary" />
                    </div>
                </div>
                {ASSETS.map(asset => {
                    const price = gameState.assetPrices[asset.id] || asset.basePrice;
                    const owned = gameState.ownedAssets[asset.id] || 0;
                    const canBuy = gameState.balance >= price;
                    const canSell = owned > 0;
                    return (
                        <div key={asset.id} className="bg-surface p-5 rounded-3xl relative">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl bg-surfaceHighlight w-12 h-12 flex items-center justify-center rounded-2xl">{asset.icon}</div>
                                    <div>
                                        <div className="font-black text-white">{asset.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 bg-surfaceHighlight px-2 py-0.5 rounded w-fit mt-1">{asset.symbol}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-black text-lg text-white">{formatMoney(price)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => buyAsset(asset)} disabled={!canBuy} className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-transform active:scale-95 ${canBuy ? 'bg-success text-white' : 'bg-surfaceHighlight text-slate-500'}`}>Купить</button>
                                <button onClick={() => sellAsset(asset)} disabled={!canSell} className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-transform active:scale-95 ${canSell ? 'bg-secondary text-white' : 'bg-surfaceHighlight text-slate-500'}`}>Продать</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
    </div>
  );
};
