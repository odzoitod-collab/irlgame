
import React, { useState, useEffect } from 'react';
import { GameState, JobPosition } from '../../types';
import { CAREER_LADDER, CHARACTER_STAGES, SKILLS, MARKET_ITEMS, PROPERTIES } from '../../constants';
import { formatMoney } from '../../utils/format';
import { CheckCircle2 } from 'lucide-react';

interface ProfileTabProps {
  gameState: GameState;
  currentJob: JobPosition;
  promote: (id: string) => void;
  openManual: () => void;
  upgradeSkill: (id: string) => void;
}

const getPlayerLevel = (xp: number) => Math.max(0, Math.floor(Math.sqrt(Math.max(0, xp) / 25)));

const checkRequirement = (job: JobPosition, state: GameState) => {
    const lvl = getPlayerLevel(state.experience);
    const checks = {
        level: { met: lvl >= (job.requiredLevel || 0), label: `Уровень: ${Math.floor(job.requiredLevel || 0)}` },
        reputation: { met: state.reputation >= job.requiredReputation, label: `Репутация: ${Math.floor(job.requiredReputation)}` },
        item: job.reqUpgradeId ? { 
            met: (state.upgrades[job.reqUpgradeId] || 0) > 0, 
            label: `Предмет: ${MARKET_ITEMS.find(u => u.id === job.reqUpgradeId)?.name || 'Инструмент'}` 
        } : null,
        property: job.reqPropertyId ? { 
            met: (state.properties[job.reqPropertyId] || 0) > 0, 
            label: `Актив: ${PROPERTIES.find(p => p.id === job.reqPropertyId)?.name || 'Имущество'}` 
        } : null
    };
    return { checks, allMet: Object.values(checks).filter(c => c !== null).every(c => c.met) };
};

export const ProfileTab: React.FC<ProfileTabProps> = ({ gameState, currentJob, promote, openManual, upgradeSkill }) => {
  const currentIdx = CAREER_LADDER.findIndex(j => j.id === gameState.currentJobId);
  const [activeTab, setActiveTab] = useState<'CAREER' | 'SKILLS' | 'GUIDE'>('CAREER');
  const [now, setNow] = useState(Date.now());
  const playerLevel = getPlayerLevel(gameState.experience);
  const hp = Math.max(0, Math.floor(100 - (gameState.riskLevel || 0)));

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in space-y-6 pb-32">
        {/* Header Widget */}
        <div className="bg-surface text-white p-6 rounded-[2.5rem] text-center relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-surfaceHighlight rounded-full mb-3 flex items-center justify-center border-4 border-surface shadow-2xl overflow-hidden">
                    <img src={CHARACTER_STAGES[currentIdx] || CHARACTER_STAGES[0]} alt="Char" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">{currentJob.title}</h2>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">УРОВЕНЬ: {playerLevel}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">ОПЫТ (XP): {Math.floor(gameState.experience)}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">HP (СВОБОДА): {hp}/100</div>
                
                <div className="grid grid-cols-3 gap-2 w-full">
                    <button onClick={() => setActiveTab('CAREER')} className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'CAREER' ? 'bg-primary text-white' : 'bg-surfaceHighlight text-slate-400'}`}>Карьера</button>
                    <button onClick={() => setActiveTab('SKILLS')} className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'SKILLS' ? 'bg-primary text-white' : 'bg-surfaceHighlight text-slate-400'}`}>Навыки</button>
                    <button onClick={() => setActiveTab('GUIDE')} className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'GUIDE' ? 'bg-primary text-white' : 'bg-surfaceHighlight text-slate-400'}`}>Как это работает</button>
                </div>
            </div>
        </div>

        {activeTab === 'SKILLS' && (
            <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 gap-3">
                    {SKILLS.map(skill => {
                        const level = gameState.skills[skill.id] || 0;
                        const cost = Math.floor(skill.baseExpCost * Math.pow(1.5, level));
                        const canUpgrade = gameState.experience >= cost && level < skill.maxLevel;

                        return (
                            <div key={skill.id} className="bg-surface p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl p-3 bg-surfaceHighlight rounded-2xl">{skill.icon}</div>
                                        <div>
                                            <h4 className="text-white font-black text-sm uppercase">{skill.name}</h4>
                                            <div className="flex gap-1 mt-1">
                                                {[...Array(skill.maxLevel)].map((_, i) => (
                                                    <div key={i} className={`h-1 w-3 rounded-full ${i < level ? 'bg-primary shadow-[0_0_5px_currentColor]' : 'bg-slate-800'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">LVL</span>
                                        <div className="text-xl font-black text-white">{level}</div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium mb-5">{skill.description}</p>
                                <button 
                                    onClick={() => upgradeSkill(skill.id)}
                                    disabled={!canUpgrade}
                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${canUpgrade ? 'bg-white text-black shadow-xl active:scale-95' : 'bg-surfaceHighlight text-slate-600'}`}
                                >
                                    {level >= skill.maxLevel ? 'МАКСИМУМ' : `УЛУЧШИТЬ (${cost} XP)`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {activeTab === 'CAREER' && (
            <div className="space-y-4 animate-fade-in">
                {CAREER_LADDER.map((job, idx) => {
                    const isCurrent = idx === currentIdx;
                    const isPassed = idx < currentIdx;
                    const { checks, allMet } = checkRequirement(job, gameState);
                    const canTake = !isPassed && !isCurrent && allMet;

                    return (
                        <div key={job.id} className={`p-5 rounded-[2rem] border-2 flex flex-col gap-3 transition-all ${isCurrent ? 'bg-surfaceHighlight border-primary' : 'bg-surface/60 border-transparent'} ${isPassed ? 'opacity-40 grayscale' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${isPassed ? 'bg-success/20 text-success' : isCurrent ? 'bg-primary text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                                    {isPassed ? <CheckCircle2 size={20} /> : idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-black text-white uppercase tracking-tight">{job.title}</h4>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{job.vertical}</div>
                                </div>
                            </div>
                            
                            {!isPassed && (
                                <div className="mt-2 pl-14 space-y-2 border-t border-white/5 pt-3">
                                    <div className="grid grid-cols-1 gap-1">
                                        {Object.entries(checks).map(([key, check]) => check && (
                                            <div key={key} className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${check.met ? 'bg-success shadow-[0_0_5px_currentColor]' : 'bg-red-500'}`} />
                                                <span className={`text-[10px] font-bold ${check.met ? 'text-slate-300' : 'text-slate-500'}`}>{check.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {!isCurrent && (
                                      <button 
                                          disabled={!canTake}
                                          onClick={() => promote(job.id)}
                                          className={`mt-3 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${canTake ? 'bg-white text-black shadow-lg shadow-white/10 active:scale-95' : 'bg-surfaceHighlight text-slate-600'}`}
                                      >
                                          {canTake ? 'ЗАНЯТЬ ДОЛЖНОСТЬ' : 'УСЛОВИЯ НЕ ВЫПОЛНЕНЫ'}
                                      </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

        {activeTab === 'GUIDE' && (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-surface p-5 rounded-3xl border border-white/5">
                    <div className="text-white font-black text-sm uppercase">Уровень и XP</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-2 space-y-2">
                        <div>Уровень считается от XP по формуле: <span className="text-slate-200 font-mono">lvl = floor(sqrt(xp / 25))</span>.</div>
                        <div>XP даётся за активные действия (клики), чуть-чуть пассивно со временем, за мини-игры и за расходники из «Лавки».</div>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-white/5">
                    <div className="text-white font-black text-sm uppercase">Репутация</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-2 space-y-2">
                        <div>Репутация нужна для повышений и некоторых открытий.</div>
                        <div>Основной источник — имущество из «Активы» (каждый предмет даёт пассивную репутацию со временем). Ещё можно получить репутацию расходниками.</div>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-white/5">
                    <div className="text-white font-black text-sm uppercase">Ранг</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-2 space-y-2">
                        <div>Ранг — это твоя текущая должность (то, что написано вверху).</div>
                        <div>Повышение открывается, когда выполнены требования по уровню, репутации и нужным предметам/активам (и иногда по стадии бизнеса/воркерам).</div>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-white/5">
                    <div className="text-white font-black text-sm uppercase">Розыск и HP</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-2 space-y-2">
                        <div>Розыск растёт от рискованных действий, «чёрных» темок, больших движений денег и высокой должности.</div>
                        <div>Если розыск высокий — чаще штрафы/заморозки/порезка трафика/временные блоки лимита.</div>
                        <div><span className="text-slate-200 font-bold">HP (Свобода)</span> — это индикатор безопасности: <span className="text-slate-200 font-mono">HP = 100 - розыск</span>. Чем ниже HP — тем ближе жёсткие последствия.</div>
                        <div>Снижать розыск можно «Безопасностью» в «Активы» и расходниками из «Лавки».</div>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-white/5">
                    <div className="text-white font-black text-sm uppercase">Трафик и обязательные расходники</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-2 space-y-2">
                        <div>Трафик — это множитель дохода команды. Если трафика нет — эффективность падает.</div>
                        <div>Обязательные расходники списываются периодически. Если их нет — ты теряешь деньги и розыск резко растёт.</div>
                        <div>В «Лавке» есть предметы, которые дают временную скидку на обязательные расходники.</div>
                    </div>
                </div>

                <button onClick={openManual} className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-white text-black shadow-xl active:scale-95">
                    ОТКРЫТЬ ПОЛНЫЙ ГАЙД
                </button>
            </div>
        )}
    </div>
  );
};
