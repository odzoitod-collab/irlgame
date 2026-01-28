
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, INITIAL_STATE, Tab, UpgradeItem, UpgradeType, GameEvent, PropertyItem, LaunderingItem, AssetItem, SchemeItem, ActiveScheme, VerticalType, DropItem } from './types';
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
import { Battery, Siren, ShieldOff, HardDrive, Wifi, Zap } from 'lucide-react';

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
            return {
                ...INITIAL_STATE,
                ...parsed,
                isPanicMode: false,
                panicClicks: 0
            };
        }
    } catch (e) {
        console.error("Save error", e);
    }
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

  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    const handleSave = () => {
      localStorage.setItem('scamTycoonSave_2Weeks_v1', JSON.stringify({ ...gameStateRef.current, lastSaveTime: Date.now() }));
    };
    const interval = setInterval(handleSave, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
     const tradeInterval = setInterval(() => {
         setGameState(prev => {
             const newPrices = { ...prev.assetPrices };
             ASSETS.forEach(a => {
                 const current = newPrices[a.id] || a.basePrice;
                 const changePercent = (Math.random() - 0.5) * 2 * a.volatility;
                 let nextPrice = current * (1 + changePercent);
                 newPrices[a.id] = parseFloat(Math.max(0.01, nextPrice).toFixed(4));
             });
             return { ...prev, assetPrices: newPrices };
         });
     }, 3000); 
     return () => clearInterval(tradeInterval);
  }, []);

  useEffect(() => {
    let lastTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      if (deltaSeconds > 0 && !gameStateRef.current.isPanicMode) {
        setGameState(prev => {
          const s = calculateDerivedStats(prev);
          const income = s.totalPassiveIncome * deltaSeconds;
          const actualBalance = Math.min(prev.balance + income, s.bankLimit);
          
          let newRisk = prev.riskLevel + (s.netRiskChange * deltaSeconds);
          newRisk = Math.max(0, Math.min(100, newRisk));

          if (newRisk >= 99 && Math.random() < 0.2) {
              return { ...prev, isPanicMode: true, panicClicks: 0 };
          }

          const updatedDrops = { ...prev.ownedDrops };
          let snitched = false;
          let snitchName = '';
          let penalty = 0;

          Object.keys(updatedDrops).forEach(id => {
              const dropDef = DROPS.find(d => d.id === id);
              if (dropDef) {
                  const currentDrop = updatedDrops[id];
                  const newFear = Math.min(100, currentDrop.fear + (dropDef.baseFearRate * deltaSeconds));
                  updatedDrops[id] = { ...currentDrop, fear: newFear };

                  if (newFear > 90 && Math.random() < 0.05 * deltaSeconds) {
                      snitched = true;
                      snitchName = dropDef.name;
                      penalty = prev.balance * 0.15;
                      delete updatedDrops[id];
                  }
              }
          });

          if (snitched) {
              setActiveEvent({ id: 'snitch', title: 'ПРЕДАТЕЛЬСТВО!', message: `${snitchName} сдал вас. -15% средств.`, type: 'BAD', effectValue: -penalty });
              setTimeout(() => setActiveEvent(null), 5000);
          }

          return { 
            ...prev, 
            balance: Math.max(0, actualBalance - penalty), 
            riskLevel: snitched ? Math.min(100, newRisk + 20) : newRisk, 
            lifetimeEarnings: prev.lifetimeEarnings + income, 
            reputation: prev.reputation + (s.passiveReputation * deltaSeconds),
            experience: prev.experience + (deltaSeconds * 0.1),
            ownedDrops: updatedDrops
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
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } 
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }
    
    const id = Date.now();
    setClicks(prev => [...prev, { id, x: clientX, y: clientY, val: stats.isBankFull ? 'FULL' : `+${formatMoney(stats.currentClickValue)}` }]);
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 800);
    
    if (!stats.isBankFull) {
        setGameState(prev => ({
            ...prev,
            balance: Math.min(prev.balance + stats.currentClickValue, stats.bankLimit),
            lifetimeEarnings: prev.lifetimeEarnings + stats.currentClickValue,
            experience: prev.experience + 0.05
        }));
    }
  }, [stats, gameState.isPanicMode]);

  const endPanicMode = () => {
      const savedRatio = Math.min(1, gameState.panicClicks / 40);
      const penaltyAmount = Math.floor(gameState.balance * (0.4 * (1 - savedRatio)));
      setGameState(prev => ({ ...prev, balance: Math.max(0, prev.balance - penaltyAmount), isPanicMode: false, riskLevel: 10, panicClicks: 0 }));
      setActiveEvent({ id: 'raid_end', title: 'ОБЛАВА ЗАВЕРШЕНА', message: penaltyAmount > 0 ? `Потеряно ${formatMoney(penaltyAmount)}` : 'Данные уничтожены!', type: penaltyAmount > 0 ? 'BAD' : 'GOOD', effectValue: -penaltyAmount });
      setTimeout(() => setActiveEvent(null), 4000);
  };

  const buyUpgrade = (upgrade: UpgradeItem) => {
    const currentLevel = gameState.upgrades[upgrade.id] || 0;
    const cost = calculateUpgradeCost(upgrade.baseCost, currentLevel);
    if (gameState.balance >= cost) setGameState(prev => ({ ...prev, balance: prev.balance - cost, upgrades: { ...prev.upgrades, [upgrade.id]: currentLevel + 1 } }));
  };

  const promote = (jobId: string) => {
    const targetJob = CAREER_LADDER.find(j => j.id === jobId);
    if (targetJob && gameState.balance >= targetJob.costToPromote) {
      setGameState(prev => ({ ...prev, balance: prev.balance - targetJob.costToPromote, currentJobId: jobId, lastPromotionTime: Date.now() }));
    }
  };

  return (
    <div className={`relative w-full h-screen flex flex-col overflow-hidden font-sans bg-background text-white selection:bg-primary/30 transition-colors duration-500 ${gameState.isPanicMode ? 'animate-pulse-red' : ''}`}>
      
      {appLoading && <LoadingScreen onFinished={() => setAppLoading(false)} />}

      {gameState.isPanicMode && (
          <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
              <Siren size={80} className="text-red-500 animate-bounce mb-8" />
              <h2 className="text-4xl font-black text-white uppercase mb-2">ОБЛАВА!</h2>
              <div className="relative w-48 h-48 mb-12">
                  <button onMouseDown={() => setGameState(p => ({ ...p, panicClicks: p.panicClicks + 1 }))} className="w-full h-full bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)] border-8 border-white/10">
                      <HardDrive size={64} className="text-white" />
                  </button>
              </div>
              <div className="w-full max-w-xs h-2 bg-red-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-white animate-shrink origin-left" style={{ animationDuration: '6s' }} onAnimationEnd={endPanicMode}/>
              </div>
          </div>
      )}

      {/* Global Thematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background">
          <img 
            src={characterImage} 
            alt="Thematic Background" 
            className="w-full h-full object-cover opacity-30 transition-all duration-[2000ms] scale-105"
            style={{ filter: 'grayscale(30%) brightness(50%) contrast(110%)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-[-20%] left-[20%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-float"></div>
      </div>

      <TopWidget currentJob={stats.currentJob} bankLimit={stats.bankLimit} balance={gameState.balance} isBankFull={stats.isBankFull} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-8">
           <div className="relative z-10 flex flex-col items-center animate-bounce-soft">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 bg-surfaceHighlight/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">BALANCE</span>
               <h1 className={`text-6xl sm:text-7xl font-mono font-black tracking-tight transition-all duration-300 drop-shadow-2xl ${stats.isBankFull ? 'text-red-500' : 'text-white'}`}>
                  {formatMoney(gameState.balance)}
               </h1>
               <div className="mt-3 flex gap-2">
                   <div className="text-[10px] font-bold text-success bg-surfaceHighlight/80 backdrop-blur-sm border border-white/5 px-4 py-1.5 rounded-xl flex items-center gap-2 uppercase tracking-widest">
                       <Zap size={14} className="animate-pulse text-yellow-500"/>
                       {formatMoney(stats.totalPassiveIncome)}/s
                   </div>
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
        <SchemesTab gameState={gameState} startScheme={() => {}} claimScheme={() => {}} buyUpgrade={buyUpgrade} />
      </BottomSheet>
      <BottomSheet isOpen={activeTab === Tab.MARKET} onClose={() => setActiveTab(Tab.CLICKER)} title="АКТИВЫ">
        <AssetsTab gameState={gameState} isBankFull={stats.isBankFull} portfolioValue={stats.portfolioValue} upgradeLaunderingItem={() => {}} buyUpgrade={buyUpgrade} buyAsset={() => {}} sellAsset={() => {}} buyProperty={() => {}} setActiveMiniGame={setActiveMiniGame} hireDrop={() => {}} payDropPremium={() => {}} />
      </BottomSheet>
      <BottomSheet isOpen={activeTab === Tab.PROFILE} onClose={() => setActiveTab(Tab.CLICKER)} title="ПРОФИЛЬ">
        <ProfileTab gameState={gameState} currentJob={stats.currentJob} promote={promote} openManual={() => setIsManualOpen(true)} upgradeSkill={() => {}} />
      </BottomSheet>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
          {clicks.map(c => (
              <div key={c.id} className="float-text text-4xl font-black text-white" style={{left: c.x, top: c.y}}>{c.val}</div>
          ))}
      </div>
    </div>
  );
};

export default App;
