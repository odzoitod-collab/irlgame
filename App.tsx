
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, INITIAL_STATE, Tab, UpgradeItem, UpgradeType, GameEvent, PropertyItem, LaunderingItem, AssetItem, SchemeItem, ActiveScheme, VerticalType, DropItem, OwnedDrop } from './types';
import { MARKET_ITEMS, CAREER_LADDER, BASE_BANK_LIMIT, ASSETS, PROPERTIES, LAUNDERING_ITEMS, TEAM_STRATEGIES, SCHEMES_LIST, CHARACTER_STAGES, SKILLS, DROPS } from './constants';
import { formatMoney, calculateUpgradeCost } from './utils/format';
import { ClickerCircle } from './components/ClickerCircle';
import { Navigation } from './components/Navigation';
import { BottomSheet } from './components/BottomSheet';
import { MiniGameModal } from './components/MiniGameModal';
import { TopWidget } from './components/TopWidget';
import { BusinessTab } from './components/tabs/BusinessTab';
import { SchemesTab } from './components/tabs/SchemesTab';
import { AssetsTab } from './components/tabs/AssetsTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { GuideContent } from './components/GuideContent';
import { LoadingScreen } from './components/LoadingScreen';
import { Siren, HardDrive, Zap } from 'lucide-react';

const calculateDerivedStats = (state: GameState) => {
    const currentJob = CAREER_LADDER.find(j => j.id === state.currentJobId) || CAREER_LADDER[0];

    const skillAnonLevel = state.skills['skill_anon'] || 0;
    const skillCodingLevel = state.skills['skill_coding'] || 0;
    const skillSocEngLevel = state.skills['skill_soc_eng'] || 0;

    let bankLimit = BASE_BANK_LIMIT;
    LAUNDERING_ITEMS.forEach(item => {
        const level = state.launderingUpgrades[item.id] || 0;
        bankLimit += level * item.baseLimit;
    });
    Object.keys(state.ownedDrops).forEach(dropId => {
        const dropDef = DROPS.find(d => d.id === dropId);
        if (dropDef) bankLimit += dropDef.limitBonus;
    });

    let trafficMultiplier = 1.0;
    let clickRentalBuff = 0;
    let basePotentialPerWorker = 0;
    let hasSoftware = false;
    let blackMarketPassive = 0;
    let securityPower = 0;

    MARKET_ITEMS.forEach(u => {
        const level = state.upgrades[u.id] || 0;
        if (level > 0) {
            if (u.type === UpgradeType.TRAFFIC) trafficMultiplier += u.baseProfit * level;
            if (u.type === UpgradeType.RENTAL) clickRentalBuff += u.baseProfit * level;
            if (u.type === UpgradeType.SOFTWARE) {
                const codingBoost = 1 + (skillCodingLevel * 0.1);
                basePotentialPerWorker += u.baseProfit * level * codingBoost;
                hasSoftware = true;
            }
            if (u.type === UpgradeType.BLACK_MARKET) {
                blackMarketPassive += u.baseProfit * level;
            }
            if (u.type === UpgradeType.SECURITY) {
                securityPower += u.baseProfit * level;
            }
        }
    });

    let scamIncome = 0;
    if (state.hasBusiness) {
        const strategyMult = TEAM_STRATEGIES[state.teamStrategy]?.multiplier || 1;
        const totalWorkers = state.workers * state.officeBranches;
        if (hasSoftware) {
            const rawYield = basePotentialPerWorker * totalWorkers;
            const efficiency = state.workerSalaryRate * 2.5; 
            const gross = rawYield * efficiency * strategyMult;
            const salaryCost = rawYield * state.workerSalaryRate;
            scamIncome = Math.max(0, (gross - salaryCost) * trafficMultiplier);
        }
    }

    let cleanIncome = 0;
    LAUNDERING_ITEMS.forEach(item => {
        const level = state.launderingUpgrades[item.id] || 0;
        cleanIncome += level * item.baseIncome;
    });

    const jobPassive = currentJob.isManager ? currentJob.passiveIncome : 0;
    const totalPassiveIncome = scamIncome + cleanIncome + jobPassive + (blackMarketPassive * trafficMultiplier);

    const baseClick = state.clickValue + clickRentalBuff;
    const salaryClick = currentJob.salaryPerClick;
    const currentClickValue = Math.floor((baseClick + salaryClick) * trafficMultiplier);

    let passiveReputation = 0;
    PROPERTIES.forEach(p => {
        const count = state.properties?.[p.id] || 0;
        passiveReputation += count * p.reputationBonus;
    });

    const strategyRisk = TEAM_STRATEGIES[state.teamStrategy]?.risk || 0;
    const dirtyFlow = scamIncome + blackMarketPassive;
    const baseRiskGeneration = (dirtyFlow / 500) + strategyRisk + (currentJob.baseRisk || 0);
    const riskMitigation = (cleanIncome / 100) + securityPower;
    const anonMitigationFactor = 1 - (skillAnonLevel * 0.05);
    const netRiskChange = ((baseRiskGeneration * anonMitigationFactor) - riskMitigation) / 10;

    let portfolioValue = 0;
    ASSETS.forEach(a => {
        const amount = state.ownedAssets[a.id] || 0;
        const price = state.assetPrices[a.id] || a.basePrice;
        portfolioValue += amount * price;
    });

    return {
        currentJob,
        bankLimit,
        trafficMultiplier,
        basePotentialPerWorker,
        hasSoftware,
        scamIncome,
        cleanIncome,
        blackMarketPassive,
        totalPassiveIncome,
        currentClickValue,
        passiveReputation,
        isBankFull: state.balance >= bankLimit,
        portfolioValue,
        netRiskChange,
        securityPower,
        skillSocEngLevel
    };
};

const getCharacterImageIndex = (jobId: string): number => {
  const jobIndex = CAREER_LADDER.findIndex(j => j.id === jobId);
  return Math.min(Math.max(0, jobIndex), CHARACTER_STAGES.length - 1);
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
        const saved = localStorage.getItem('scamTycoonSave_2Weeks_v1'); 
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...INITIAL_STATE, ...parsed, isPanicMode: false, panicClicks: 0 };
        }
    } catch (e) {}
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.CLICKER);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; val: string }[]>([]);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  const stats = calculateDerivedStats(gameState);
  const characterStageIndex = getCharacterImageIndex(gameState.currentJobId);
  const characterImage = CHARACTER_STAGES[characterStageIndex];

  // Ref for storage and logic to avoid stale closures
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Handle Save
  useEffect(() => {
    const interval = setInterval(() => {
        localStorage.setItem('scamTycoonSave_2Weeks_v1', JSON.stringify(gameStateRef.current));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Exchange Market Prices
  useEffect(() => {
     const interval = setInterval(() => {
         setGameState(prev => {
             const newPrices = { ...prev.assetPrices };
             ASSETS.forEach(a => {
                 const current = newPrices[a.id] || a.basePrice;
                 newPrices[a.id] = parseFloat((current * (1 + (Math.random() - 0.5) * 2 * a.volatility)).toFixed(4));
             });
             return { ...prev, assetPrices: newPrices };
         });
     }, 3000); 
     return () => clearInterval(interval);
  }, []);

  // Main Loop
  useEffect(() => {
    let lastTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      if (deltaSeconds > 0 && !gameStateRef.current.isPanicMode) {
        setGameState(prev => {
          const s = calculateDerivedStats(prev);
          
          // Passive Income
          const income = s.totalPassiveIncome * deltaSeconds;
          const actualBalance = Math.min(prev.balance + income, s.bankLimit);
          
          // Risk Update
          let newRisk = Math.max(0, Math.min(100, prev.riskLevel + (s.netRiskChange * deltaSeconds)));
          if (newRisk >= 99 && Math.random() < 0.1 * deltaSeconds) return { ...prev, isPanicMode: true, panicClicks: 0 };

          // Schemes Progress
          const updatedSchemes = prev.activeSchemes.map(sch => {
              if (!sch.isReady && now >= sch.endTime) return { ...sch, isReady: true };
              return sch;
          });

          // Drops Fear
          const updatedDrops = { ...prev.ownedDrops };
          let penalty = 0;
          Object.keys(updatedDrops).forEach(id => {
              const dDef = DROPS.find(d => d.id === id);
              if (dDef) {
                  const d = updatedDrops[id];
                  const newFear = Math.min(100, d.fear + (dDef.baseFearRate * deltaSeconds));
                  updatedDrops[id] = { ...d, fear: newFear };
                  if (newFear > 95 && Math.random() < 0.02 * deltaSeconds) {
                      penalty += prev.balance * 0.1;
                      delete updatedDrops[id];
                  }
              }
          });

          return { 
            ...prev, 
            balance: Math.max(0, actualBalance - penalty), 
            riskLevel: newRisk, 
            lifetimeEarnings: prev.lifetimeEarnings + income, 
            reputation: prev.reputation + (s.passiveReputation * deltaSeconds),
            experience: prev.experience + (deltaSeconds * 0.1),
            ownedDrops: updatedDrops,
            activeSchemes: updatedSchemes
          };
        });
      }
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState.isPanicMode) {
        setGameState(prev => ({ ...prev, panicClicks: prev.panicClicks + 1 }));
        return;
    }
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (!stats.isBankFull) {
        setGameState(prev => ({
            ...prev,
            balance: Math.min(prev.balance + stats.currentClickValue, stats.bankLimit),
            lifetimeEarnings: prev.lifetimeEarnings + stats.currentClickValue,
            experience: prev.experience + 0.05
        }));
        const id = Date.now();
        setClicks(prev => [...prev, { id, x: clientX, y: clientY, val: `+${formatMoney(stats.currentClickValue)}` }]);
        setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 800);
    }
  }, [stats]);

  const buyUpgrade = (upgrade: UpgradeItem) => {
    setGameState(prev => {
        const lvl = prev.upgrades[upgrade.id] || 0;
        const cost = calculateUpgradeCost(upgrade.baseCost, lvl);
        if (prev.balance >= cost) return { ...prev, balance: prev.balance - cost, upgrades: { ...prev.upgrades, [upgrade.id]: lvl + 1 } };
        return prev;
    });
  };

  const startScheme = (scheme: SchemeItem) => {
    setGameState(prev => {
        if (prev.balance >= scheme.cost && prev.activeSchemes.length < 5) {
            const now = Date.now();
            const newActive = { id: Math.random().toString(36), schemeId: scheme.id, startTime: now, endTime: now + (scheme.durationSeconds * 1000), isReady: false };
            return { ...prev, balance: prev.balance - scheme.cost, activeSchemes: [...prev.activeSchemes, newActive] };
        }
        return prev;
    });
  };

  const claimScheme = (active: ActiveScheme) => {
    setGameState(prev => {
        const def = SCHEMES_LIST.find(s => s.id === active.schemeId);
        if (def && active.isReady) {
            const s = calculateDerivedStats(prev);
            const fail = Math.random() < (def.riskPercentage - (s.skillSocEngLevel * 2)) / 100;
            const profit = fail ? 0 : Math.floor(Math.random() * (def.maxProfit - def.minProfit)) + def.minProfit;
            return {
                ...prev,
                balance: Math.min(prev.balance + profit, s.bankLimit),
                riskLevel: Math.min(100, prev.riskLevel + (fail ? def.riskPercentage / 3 : 1)),
                activeSchemes: prev.activeSchemes.filter(a => a.id !== active.id)
            };
        }
        return prev;
    });
  };

  const hireDrop = (d: DropItem) => setGameState(p => p.balance >= d.hireCost && !p.ownedDrops[d.id] ? { ...p, balance: p.balance - d.hireCost, ownedDrops: { ...p.ownedDrops, [d.id]: { id: d.id, fear: 0, lastPremiumTime: Date.now() } } } : p);
  const payDropPremium = (id: string) => setGameState(p => { const cost = Math.floor((DROPS.find(d => d.id === id)?.hireCost || 0) * 0.2); return p.balance >= cost ? { ...p, balance: p.balance - cost, ownedDrops: { ...p.ownedDrops, [id]: { ...p.ownedDrops[id], fear: Math.max(0, p.ownedDrops[id].fear - 40) } } } : p; });
  const buyAsset = (a: AssetItem) => setGameState(p => { const pr = p.assetPrices[a.id] || a.basePrice; return p.balance >= pr ? { ...p, balance: p.balance - pr, ownedAssets: { ...p.ownedAssets, [a.id]: (p.ownedAssets[a.id] || 0) + 1 } } : p; });
  const sellAsset = (a: AssetItem) => setGameState(p => { const count = p.ownedAssets[a.id] || 0; if (count > 0) { const pr = p.assetPrices[a.id] || a.basePrice; return { ...p, balance: Math.min(p.balance + pr, calculateDerivedStats(p).bankLimit), ownedAssets: { ...p.ownedAssets, [a.id]: count - 1 } }; } return p; });
  const buyProperty = (pr: PropertyItem) => setGameState(p => { const lvl = p.properties[pr.id] || 0; const cost = calculateUpgradeCost(pr.baseCost, lvl); return p.balance >= cost ? { ...p, balance: p.balance - cost, properties: { ...p.properties, [pr.id]: lvl + 1 }, reputation: p.reputation + pr.reputationBonus } : p; });
  const upgradeSkill = (id: string) => setGameState(p => { const s = SKILLS.find(sk => sk.id === id); const lvl = p.skills[id] || 0; const cost = Math.floor((s?.baseExpCost || 0) * Math.pow(1.5, lvl)); return s && p.experience >= cost && lvl < s.maxLevel ? { ...p, experience: p.experience - cost, skills: { ...p.skills, [id]: lvl + 1 } } : p; });
  const upgradeLaunderingItem = (i: LaunderingItem) => setGameState(p => { const lvl = p.launderingUpgrades[i.id] || 0; const cost = calculateUpgradeCost(i.baseCost, lvl); return p.balance >= cost ? { ...p, balance: p.balance - cost, launderingUpgrades: { ...p.launderingUpgrades, [i.id]: lvl + 1 } } : p; });
  const promote = (id: string) => setGameState(p => { const job = CAREER_LADDER.find(j => j.id === id); return job && p.balance >= job.costToPromote ? { ...p, balance: p.balance - job.costToPromote, currentJobId: id, lastPromotionTime: Date.now() } : p; });

  // Fix: handleMiniGameComplete to receive rewards from laundering mini-games
  const handleMiniGameComplete = (reward: number) => {
    setGameState(prev => {
      const stats = calculateDerivedStats(prev);
      return {
        ...prev,
        balance: Math.min(prev.balance + reward, stats.bankLimit),
        lifetimeEarnings: prev.lifetimeEarnings + reward,
        experience: prev.experience + (reward / 1000)
      };
    });
    setActiveMiniGame(null);
  };

  const endPanicMode = () => {
    const saved = Math.min(1, gameState.panicClicks / 40);
    const penalty = Math.floor(gameState.balance * (0.4 * (1 - saved)));
    setGameState(prev => ({ ...prev, balance: Math.max(0, prev.balance - penalty), isPanicMode: false, riskLevel: 5, panicClicks: 0 }));
  };

  return (
    <div className={`relative w-full h-screen flex flex-col overflow-hidden bg-background text-white`}>
      {appLoading && <LoadingScreen onFinished={() => setAppLoading(false)} />}
      
      {gameState.isPanicMode && (
          <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
              <Siren size={80} className="text-red-500 animate-bounce mb-8" />
              <h2 className="text-4xl font-black uppercase mb-12">ОБЛАВА!</h2>
              <button onMouseDown={() => setGameState(p => ({ ...p, panicClicks: p.panicClicks + 1 }))} className="w-48 h-48 bg-red-600 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform mb-8">
                  <HardDrive size={64} className="text-white" />
              </button>
              <div className="w-full max-w-xs h-2 bg-red-900 rounded-full overflow-hidden">
                  <div className="h-full bg-white animate-shrink origin-left" style={{ animationDuration: '6s' }} onAnimationEnd={endPanicMode}/>
              </div>
          </div>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background opacity-20">
          <img src={characterImage} alt="Thematic" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <TopWidget currentJob={stats.currentJob} bankLimit={stats.bankLimit} balance={gameState.balance} isBankFull={stats.isBankFull} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-12">
          <div className="flex flex-col items-center animate-bounce-soft">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">BALANCE</span>
              <h1 className={`text-6xl font-mono font-black ${stats.isBankFull ? 'text-red-500' : 'text-white'}`}>{formatMoney(gameState.balance)}</h1>
              <div className="mt-2 text-[10px] font-bold text-success bg-surfaceHighlight px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                  <Zap size={14} className="text-yellow-500 animate-pulse" /> {formatMoney(stats.totalPassiveIncome)}/s
              </div>
          </div>
      </div>

      <div className="relative z-20 pb-28 w-full flex justify-center">
          <ClickerCircle onClick={handleClick} clickValue={stats.currentClickValue} />
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <BottomSheet isOpen={activeTab === Tab.MANAGEMENT} onClose={() => setActiveTab(Tab.CLICKER)} title="ИМПЕРИЯ">
          <BusinessTab gameState={gameState} setGameState={setGameState} buyUpgrade={buyUpgrade} hasSoftware={stats.hasSoftware} scamIncome={stats.scamIncome} />
      </BottomSheet>
      <BottomSheet isOpen={activeTab === Tab.SCHEMES} onClose={() => setActiveTab(Tab.CLICKER)} title="ТЕМКИ">
          <SchemesTab gameState={gameState} startScheme={startScheme} claimScheme={claimScheme} buyUpgrade={buyUpgrade} />
      </BottomSheet>
      <BottomSheet isOpen={activeTab === Tab.MARKET} onClose={() => setActiveTab(Tab.CLICKER)} title="АКТИВЫ">
          <AssetsTab gameState={gameState} isBankFull={stats.isBankFull} portfolioValue={stats.portfolioValue} upgradeLaunderingItem={upgradeLaunderingItem} buyUpgrade={buyUpgrade} buyAsset={buyAsset} sellAsset={sellAsset} buyProperty={buyProperty} setActiveMiniGame={setActiveMiniGame} hireDrop={hireDrop} payDropPremium={payDropPremium} />
      </BottomSheet>
      <BottomSheet isOpen={activeTab === Tab.PROFILE} onClose={() => setActiveTab(Tab.CLICKER)} title="ПРОФИЛЬ">
          <ProfileTab gameState={gameState} currentJob={stats.currentJob} promote={promote} openManual={() => setIsManualOpen(true)} upgradeSkill={upgradeSkill} />
      </BottomSheet>

      <BottomSheet isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} title="ПОМОЩЬ">
          <GuideContent />
      </BottomSheet>

      {activeMiniGame && (
          <MiniGameModal businessId={activeMiniGame} businessLevel={gameState.launderingUpgrades[activeMiniGame] || 1} baseIncome={LAUNDERING_ITEMS.find(i => i.id === activeMiniGame)?.baseIncome || 0} onClose={() => setActiveMiniGame(null)} onComplete={handleMiniGameComplete} />
      )}

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
          {clicks.map(c => <div key={c.id} className="float-text text-4xl font-black text-white" style={{left: c.x, top: c.y}}>{c.val}</div>)}
      </div>
    </div>
  );
};

export default App;
