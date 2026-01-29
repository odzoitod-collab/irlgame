
import React, { useState } from 'react';
import { GameState, UpgradeItem, UpgradeType, TeamStrategy, BusinessStage } from '../../types';
import { MARKET_ITEMS, CAREER_LADDER, OFFICE_CAPACITY, CREATE_TEAM_COST, TEAM_STRATEGIES, WORKER_HIRE_COST_BASE } from '../../constants';
import { formatMoney, calculateUpgradeCost } from '../../utils/format';
import { AlertTriangle, Briefcase, Zap, Monitor, Globe, Smartphone, Cpu, Lock, Users, Award, Target } from 'lucide-react';

interface BusinessTabProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  buyUpgrade: (u: UpgradeItem) => void;
  hasSoftware: boolean;
  scamIncome: number;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({ gameState, setGameState, buyUpgrade, hasSoftware, scamIncome }) => {
  const [businessTab, setBusinessTab] = useState<'TEAM' | 'SOFT' | 'TRAFFIC' | 'CONSUMABLES'>('TEAM');

  const currentOfficeSpace = OFFICE_CAPACITY.find(o => o.level === gameState.officeLevel) || OFFICE_CAPACITY[0];
  const currentJobIndex = CAREER_LADDER.findIndex(j => j.id === gameState.currentJobId);
  const teamLeadIndex = CAREER_LADDER.findIndex(j => j.id === 'job_team_lead');
  const isAllowedToCreateTeam = currentJobIndex >= teamLeadIndex;

  const getSoftTier = (u: UpgradeItem, level: number) => {
    if (!u.tierNames) return '';
    if (level === 0) return 'Не куплено';
    if (level < 10) return u.tierNames[0];
    if (level < 20) return u.tierNames[1];
    return u.tierNames[2];
  };

  const getMarketIcon = (id: string) => {
     if (id.includes('proxy') || id.includes('vpn')) return <Globe size={18} />;
     if (id.includes('spam')) return <Monitor size={18} />;
     if (id.includes('sms')) return <Smartphone size={18} />;
     if (id.includes('parser') || id.includes('checker')) return <Cpu size={18} />;
     if (id.includes('cloaka')) return <Lock size={18} />;
     if (id.includes('dating')) return <Users size={24} />;
     if (id.includes('escort')) return <Award size={24} />;
     if (id.includes('shop')) return <Target size={24} />;
     if (id.includes('crypto')) return <Cpu size={24} />;
     return <Zap size={18} />;
  };

  return (
    <div className="animate-fade-in pb-24">
        {/* SUB TABS */}
        <div className="flex bg-surfaceHighlight p-1.5 rounded-2xl mb-6">
            <button onClick={() => setBusinessTab('TEAM')} className={`relative flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all ${businessTab === 'TEAM' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                КОМАНДА
            </button>
            <button onClick={() => setBusinessTab('SOFT')} className={`relative flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all ${businessTab === 'SOFT' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                СОФТ
                {!hasSoftware && gameState.workers > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
            </button>
            <button onClick={() => setBusinessTab('CONSUMABLES')} className={`relative flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all ${businessTab === 'CONSUMABLES' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                РАСХОДНИКИ
            </button>
            <button onClick={() => setBusinessTab('TRAFFIC')} className={`relative flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider transition-all ${businessTab === 'TRAFFIC' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                ТРАФИК
            </button>
        </div>

        {/* TEAM SECTION */}
        {businessTab === 'TEAM' && (
            <div className="space-y-6">
                {!gameState.hasBusiness ? (
                    <div className="bg-surface p-6 rounded-3xl text-center border border-dashed border-white/10">
                        <div className="w-16 h-16 bg-surfaceHighlight rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">👨‍💻</div>
                        <h3 className="text-xl font-black text-white mb-2">Старт Бизнеса</h3>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">Чтобы запустить свою Тиму, нужно дослужиться до Тим Лида и иметь стартовый капитал.</p>
                        
                        <div className="bg-surfaceHighlight p-4 rounded-xl mb-6 text-left space-y-2">
                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Требования:</div>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <span className={isAllowedToCreateTeam ? 'text-success' : 'text-red-400'}>{isAllowedToCreateTeam ? '✅' : '❌'} Должность Тим Лид</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <span className={hasSoftware ? 'text-success' : 'text-red-400'}>{hasSoftware ? '✅' : '❌'} Куплен любой Софт</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <span className={gameState.balance >= CREATE_TEAM_COST ? 'text-success' : 'text-red-400'}>{gameState.balance >= CREATE_TEAM_COST ? '✅' : '❌'} {formatMoney(CREATE_TEAM_COST)} на счету</span>
                            </div>
                        </div>

                        <button onClick={() => {
                            setGameState(prev => ({
                                ...prev, balance: prev.balance - CREATE_TEAM_COST,
                                hasBusiness: true, businessStage: BusinessStage.REMOTE_TEAM,
                                workers: 0, officeLevel: 1, officeBranches: 1
                            }));
                        }} disabled={!hasSoftware || gameState.balance < CREATE_TEAM_COST || !isAllowedToCreateTeam} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform ${!hasSoftware || gameState.balance < CREATE_TEAM_COST || !isAllowedToCreateTeam ? 'bg-surfaceHighlight text-slate-500 cursor-not-allowed' : 'bg-accent text-white shadow-lg shadow-accent/20'}`}>
                            Создать Команду
                        </button>
                    </div>
                ) : (
                    <div className="bg-surface p-6 rounded-3xl relative overflow-hidden border border-white/5">
                        {!hasSoftware && gameState.workers > 0 && (
                            <div className="mb-4 bg-red-500/10 p-3 rounded-2xl flex items-center gap-3 border border-red-500/20">
                                <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                                <div className="text-[10px] font-bold text-red-500 uppercase leading-tight">Воркеры не приносят прибыль без софта! Купите софт во вкладке.</div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Уровень Офиса</div>
                                <div className="text-xl font-black text-white">{currentOfficeSpace.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Профит Команды</div>
                                <div className="text-xl font-mono font-black text-success">+{formatMoney(scamIncome)}/s</div>
                            </div>
                        </div>

                        <div className="bg-surfaceHighlight p-4 rounded-2xl mb-4">
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                <span>Штат Сотрудников</span>
                                <span>{gameState.workers} / {currentOfficeSpace.maxWorkers * gameState.officeBranches}</span>
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-accent h-full rounded-full transition-all duration-500" style={{width: `${(gameState.workers / (currentOfficeSpace.maxWorkers * gameState.officeBranches)) * 100}%`}}></div>
                            </div>
                        </div>

                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 ml-1">Стратегия Работы (Риск)</div>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {Object.values(TeamStrategy).map((strat) => (
                                <button key={strat} onClick={() => setGameState(prev => ({...prev, teamStrategy: strat as TeamStrategy}))} className={`p-2 rounded-xl border transition-all ${gameState.teamStrategy === strat ? 'border-transparent bg-white text-black' : 'border-transparent bg-surfaceHighlight text-slate-500'}`}>
                                    <div className="text-[9px] font-black uppercase text-center">{TEAM_STRATEGIES[strat].name}</div>
                                    <div className={`text-[9px] text-center font-bold ${strat === TeamStrategy.AGGRESSIVE ? 'text-red-500' : 'text-slate-400'}`}>x{TEAM_STRATEGIES[strat].multiplier}</div>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button onClick={() => setGameState(prev => ({ ...prev, balance: prev.balance - calculateUpgradeCost(WORKER_HIRE_COST_BASE, gameState.workers), workers: prev.workers + 1 }))} 
                                disabled={gameState.workers >= currentOfficeSpace.maxWorkers * gameState.officeBranches || gameState.balance < calculateUpgradeCost(WORKER_HIRE_COST_BASE, gameState.workers)}
                                className="py-4 bg-accent text-white font-black rounded-2xl hover:brightness-110 disabled:opacity-50 disabled:bg-surfaceHighlight disabled:text-slate-500 transition-all active:scale-95 shadow-lg shadow-accent/20 flex flex-col items-center leading-none gap-1">
                                <span>ВОРКЕР</span>
                                <span className="text-[10px] opacity-80 font-mono font-medium">{formatMoney(calculateUpgradeCost(WORKER_HIRE_COST_BASE, gameState.workers))}</span>
                            </button>
                            
                            <button onClick={() => {
                                const teamLeaderCost = calculateUpgradeCost(WORKER_HIRE_COST_BASE * 10, gameState.upgrades['team_leader'] || 0);
                                if (gameState.balance >= teamLeaderCost) {
                                    setGameState(prev => ({ 
                                        ...prev, 
                                        balance: prev.balance - teamLeaderCost,
                                        upgrades: { ...prev.upgrades, team_leader: (prev.upgrades['team_leader'] || 0) + 1 },
                                        workers: prev.workers + 5
                                    }));
                                }
                            }} 
                                disabled={(gameState.workers + 5) > currentOfficeSpace.maxWorkers * gameState.officeBranches || gameState.balance < calculateUpgradeCost(WORKER_HIRE_COST_BASE * 10, gameState.upgrades['team_leader'] || 0)}
                                className="py-4 bg-purple-600 text-white font-black rounded-2xl hover:brightness-110 disabled:opacity-50 disabled:bg-surfaceHighlight disabled:text-slate-500 transition-all active:scale-95 shadow-lg shadow-purple-600/20 flex flex-col items-center leading-none gap-1">
                                <span>ТЕАМЛИД</span>
                                <span className="text-[10px] opacity-80 font-mono font-medium">{formatMoney(calculateUpgradeCost(WORKER_HIRE_COST_BASE * 10, gameState.upgrades['team_leader'] || 0))}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {businessTab === 'SOFT' && (
             <div className="space-y-4">
                 {!gameState.hasBusiness ? (
                    <div className="bg-surface p-6 rounded-3xl text-center border border-dashed border-white/10">
                        <div className="w-16 h-16 bg-surfaceHighlight rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">🚫</div>
                        <h3 className="text-xl font-black text-white mb-2">Сначала создайте команду</h3>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">Софт доступен только после создания своей команды.</p>
                        <button onClick={() => setBusinessTab('TEAM')} className="w-full py-4 rounded-2xl bg-accent text-white font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-accent/20">
                            Перейти к созданию команды
                        </button>
                    </div>
                 ) : (
                 <>
                 <div className="p-4 bg-primary/10 rounded-2xl text-xs text-primary font-bold border border-primary/20 mb-2">
                     💡 Софт необходим, чтобы воркеры приносили доход. Чем лучше софт, тем больше приносит каждый воркер.
                 </div>
                 {MARKET_ITEMS.filter(u => u.type === UpgradeType.SOFTWARE).map(u => {
                    const level = gameState.upgrades[u.id] || 0;
                    const cost = calculateUpgradeCost(u.baseCost, level);
                    const canBuy = gameState.balance >= cost;
                    return (
                        <div key={u.id} className="bg-surface p-5 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-surfaceHighlight text-secondary rounded-2xl">{getMarketIcon(u.id)}</div>
                                    <div>
                                        <div className="text-white font-black text-sm uppercase">{u.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold bg-surfaceHighlight px-2 py-0.5 rounded w-fit mt-1">{getSoftTier(u, level)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 mb-3 font-medium">{u.description}</div>
                            <button onClick={() => buyUpgrade(u)} disabled={!canBuy} className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform ${canBuy ? 'bg-secondary text-white' : 'bg-surfaceHighlight text-slate-500'}`}>
                            {level === 0 ? 'КУПИТЬ' : 'УЛУЧШИТЬ'} {formatMoney(cost)}
                            </button>
                        </div>
                    );
                })}
                 </>
                 )}
             </div>
        )}

        {businessTab === 'TRAFFIC' && (
             <div className="space-y-4">
                 <div className="p-4 bg-primary/10 rounded-2xl text-xs text-primary font-bold border border-primary/20 mb-2">
                     📈 Трафик работает как множитель дохода. +10% Трафика = +10% к доходу всей команды.
                 </div>

                 <div className="bg-surface p-5 rounded-3xl border border-white/5">
                     <div className="flex justify-between items-center mb-3">
                         <div>
                             <div className="text-white font-black text-sm uppercase">Запас трафика</div>
                             <div className="text-xs text-slate-400 font-bold mt-1">Единицы: <span className="font-mono text-white">{Math.floor(gameState.trafficUnits || 0)}</span></div>
                         </div>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                         {[
                             { id: 'traf_pack_small', name: '+25', units: 25, cost: 2500 },
                             { id: 'traf_pack_mid', name: '+150', units: 150, cost: 15000 },
                             { id: 'traf_pack_big', name: '+1000', units: 1000, cost: 120000 }
                         ].map(p => {
                             const canBuy = gameState.balance >= p.cost;
                             return (
                                 <button
                                     key={p.id}
                                     onClick={() => {
                                         if (!canBuy) return;
                                         setGameState(prev => ({
                                             ...prev,
                                             balance: prev.balance - p.cost,
                                             trafficUnits: (prev.trafficUnits || 0) + p.units
                                         }));
                                     }}
                                     disabled={!canBuy}
                                     className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform ${canBuy ? 'bg-primary text-white' : 'bg-surfaceHighlight text-slate-500'}`}
                                 >
                                     {p.name}
                                     <div className="text-[9px] font-mono opacity-80">{formatMoney(p.cost)}</div>
                                 </button>
                             );
                         })}
                     </div>
                 </div>

                 {MARKET_ITEMS.filter(u => u.type === UpgradeType.TRAFFIC).map(u => {
                    const level = gameState.upgrades[u.id] || 0;
                    const cost = calculateUpgradeCost(u.baseCost, level);
                    const canBuy = gameState.balance >= cost;
                    return (
                        <div key={u.id} className="bg-surface p-4 rounded-3xl flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="p-3 bg-surfaceHighlight text-primary rounded-2xl">{getMarketIcon(u.id)}</div>
                            <div>
                                <div className="text-white font-black text-sm">{u.name}</div>
                                <div className="text-xs text-primary font-bold mt-1">+{Math.round(u.baseProfit * 100)}% ДОХОД</div>
                            </div>
                        </div>
                        <button onClick={() => buyUpgrade(u)} disabled={!canBuy} className={`px-4 py-3 rounded-2xl text-xs font-black font-mono transition-transform active:scale-95 ${canBuy ? 'bg-primary text-white' : 'bg-surfaceHighlight text-slate-500'}`}>
                            {formatMoney(cost)}
                        </button>
                        </div>
                    );
                })}
             </div>
        )}

        {businessTab === 'CONSUMABLES' && (
             <div className="space-y-4">
                 <div className="p-4 bg-primary/10 rounded-2xl text-xs text-primary font-bold border border-primary/20 mb-2">
                     🛡️ Расходники необходимы для безопасной работы. VPN и Proxy защищают твою команду.
                 </div>

                 <div className="bg-surface p-5 rounded-3xl border border-white/5">
                     <div className="flex justify-between items-center mb-3">
                         <div>
                             <div className="text-white font-black text-sm uppercase">Запас расходников</div>
                             <div className="text-xs text-slate-400 font-bold mt-1">Единицы: <span className="font-mono text-white">{Math.floor(gameState.suppliesUnits || 0)}</span></div>
                         </div>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                         {[
                             { id: 'sup_pack_small', name: '+10', units: 10, cost: 1500 },
                             { id: 'sup_pack_mid', name: '+60', units: 60, cost: 8000 },
                             { id: 'sup_pack_big', name: '+400', units: 400, cost: 50000 }
                         ].map(p => {
                             const canBuy = gameState.balance >= p.cost;
                             return (
                                 <button
                                     key={p.id}
                                     onClick={() => {
                                         if (!canBuy) return;
                                         setGameState(prev => ({
                                             ...prev,
                                             balance: prev.balance - p.cost,
                                             suppliesUnits: (prev.suppliesUnits || 0) + p.units
                                         }));
                                     }}
                                     disabled={!canBuy}
                                     className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform ${canBuy ? 'bg-accent text-white' : 'bg-surfaceHighlight text-slate-500'}`}
                                 >
                                     {p.name}
                                     <div className="text-[9px] font-mono opacity-80">{formatMoney(p.cost)}</div>
                                 </button>
                             );
                         })}
                     </div>
                 </div>
                 
                 {/* VPN Section */}
                 <div className="bg-surface p-4 rounded-3xl border border-white/5">
                     <h3 className="text-white font-black text-sm uppercase mb-3 flex items-center gap-2">
                         <Globe size={18} className="text-blue-500" /> VPN & Прокси
                     </h3>
                     
                     {MARKET_ITEMS.filter(u => u.type === UpgradeType.RENTAL).map(u => {
                        const level = gameState.upgrades[u.id] || 0;
                        const cost = calculateUpgradeCost(u.baseCost, level);
                        const canBuy = gameState.balance >= cost;
                        return (
                            <div key={u.id} className="bg-surfaceHighlight p-4 rounded-2xl mb-3 last:mb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-surface text-blue-500 rounded-xl">{getMarketIcon(u.id)}</div>
                                        <div>
                                            <div className="text-white font-black text-sm">{u.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold mt-1">{u.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-blue-500">Уровень {level}</div>
                                        <div className="text-[10px] text-slate-400">+{u.baseProfit * level} Тап</div>
                                    </div>
                                </div>
                                <button onClick={() => buyUpgrade(u)} disabled={!canBuy} className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform ${canBuy ? 'bg-blue-600 text-white' : 'bg-surface text-slate-500'}`}>
                                    {level === 0 ? 'КУПИТЬ' : 'УЛУЧШИТЬ'} {formatMoney(cost)}
                                </button>
                            </div>
                        );
                    })}
                 </div>
                 
                 {/* Premium Tools */}
                 <div className="bg-surface p-4 rounded-3xl border border-white/5">
                     <h3 className="text-white font-black text-sm uppercase mb-3 flex items-center gap-2">
                         <Zap size={18} className="text-yellow-500" /> Премиум Инструменты
                     </h3>
                     
                     {[
                         { id: 'tool_proxy_premium', name: 'Премиум Прокси', cost: 50000, description: 'Элитные прокси для высоких нагрузок', tapBonus: 500 },
                         { id: 'tool_vpn_corporate', name: 'Корпоративный VPN', cost: 200000, description: 'VPN для всей команды', tapBonus: 2000 },
                         { id: 'tool_obfuscator', name: 'Обфускатор Трафика', cost: 500000, description: 'Маскировка трафика под легальный', tapBonus: 5000 }
                     ].map(tool => {
                        const owned = (gameState.upgrades[tool.id] || 0) > 0;
                        const canBuy = gameState.balance >= tool.cost;
                        return (
                            <div key={tool.id} className="bg-surfaceHighlight p-4 rounded-2xl mb-3 last:mb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-surface text-yellow-500 rounded-xl">
                                            {tool.id.includes('proxy') ? <Globe size={16} /> : 
                                             tool.id.includes('vpn') ? <Lock size={16} /> : 
                                             <Cpu size={16} />}
                                        </div>
                                        <div>
                                            <div className="text-white font-black text-sm">{tool.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold mt-1">{tool.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-yellow-500">{owned ? 'Куплено' : 'Не куплено'}</div>
                                        <div className="text-[10px] text-slate-400">+{tool.tapBonus} Тап</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (canBuy && !owned) {
                                            setGameState(prev => ({
                                                ...prev,
                                                balance: prev.balance - tool.cost,
                                                upgrades: { ...prev.upgrades, [tool.id]: 1 }
                                            }));
                                        }
                                    }} 
                                    disabled={!canBuy || owned}
                                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform ${canBuy && !owned ? 'bg-yellow-600 text-white' : 'bg-surface text-slate-500'}`}>
                                    {owned ? 'КУПЛЕНО' : `КУПИТЬ ${formatMoney(tool.cost)}`}
                                </button>
                            </div>
                        );
                    })}
                 </div>
             </div>
        )}
      </div>
  );
};
