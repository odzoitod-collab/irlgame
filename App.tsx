import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, INITIAL_STATE, Tab, UpgradeItem, UpgradeType, PropertyItem, LaunderingItem, AssetItem, SchemeItem, ActiveScheme, DropItem, SupplyItem } from './types';
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
import { SuppliesTab } from './components/tabs/SuppliesTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { GuideContent } from './components/GuideContent';
import { LoadingScreen } from './components/LoadingScreen';
import { Zap } from 'lucide-react';

const CONSUMABLES_INTERVAL_MS = 5 * 60 * 1000;
const TRAFFIC_TICK_INTERVAL_MS = 60 * 1000;
const FINE_COOLDOWN_MS = 90 * 1000;
const ECONOMY_NERF = 0.6; // make the whole game tougher

const getPlayerLevel = (xp: number) => {
  // Slow curve: lvl 1 ~ 25xp, lvl 10 ~ 2500xp, lvl 20 ~ 10000xp
  return Math.max(0, Math.floor(Math.sqrt(Math.max(0, xp) / 25)));
};

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
    let trafficPassive = 0;
    let blackMarketPassive = 0;
    let securityPower = 0;

    MARKET_ITEMS.forEach(u => {
        const level = state.upgrades[u.id] || 0;
        if (level > 0) {
            if (u.type === UpgradeType.TRAFFIC) {
                trafficMultiplier += u.baseProfit * level;
                trafficPassive += u.baseProfit * 500 * level; // passive income from traffic
            }
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

    // Soft consequences
    const now = Date.now();
    if ((state.trafficDebuffUntil || 0) > now) {
      trafficMultiplier *= Math.max(0.3, Math.min(1, state.trafficDebuffMultiplier || 1));
    }
    if ((state.bankLimitBlockUntil || 0) > now) {
      bankLimit = Math.max(0, bankLimit - (state.bankLimitBlockAmount || 0));
    }

    let scamIncome = 0;
    if (state.hasBusiness) {
        const strategyMult = TEAM_STRATEGIES[state.teamStrategy]?.multiplier || 1;
        const totalWorkers = state.workers * state.officeBranches;
        const hasTrafficUnits = (state.trafficUnits || 0) > 0;
        if (hasSoftware && hasTrafficUnits) {
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
    const totalPassiveIncome = ((scamIncome + cleanIncome + jobPassive + blackMarketPassive + trafficPassive) * trafficMultiplier) * ECONOMY_NERF;

    const baseClick = state.clickValue + clickRentalBuff;
    const salaryClick = currentJob.salaryPerClick;
    // Tap value should reflect rental upgrades directly (no extra scaling).
    const currentClickValue = Math.max(1, Math.floor(baseClick + salaryClick));

    let passiveReputation = 0;
    PROPERTIES.forEach(p => {
        const count = state.properties?.[p.id] || 0;
        passiveReputation += count * p.reputationBonus;
    });

    const dirtyFlow = blackMarketPassive;
    const baseRiskGeneration = dirtyFlow / 200;
    // Security connections (связи) always reduce risk, not just when there's dirty flow
    const riskMitigation = dirtyFlow > 0 ? (cleanIncome / 120) + securityPower : securityPower;
    const anonMitigationFactor = 1 - (skillAnonLevel * 0.05);
    const netRiskChange = dirtyFlow > 0
      ? ((baseRiskGeneration * anonMitigationFactor) - riskMitigation) / 4
      : -0.6 - (securityPower / 10); // Always reduce risk with connections

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
            return { ...INITIAL_STATE, ...parsed };
        }
    } catch (e) {}
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.CLICKER);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; val: string }[]>([]);
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [smsAlert, setSmsAlert] = useState<{ title: string; message: string } | null>(null);

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

      if (deltaSeconds > 0) {
        setGameState(prev => {
          const s = calculateDerivedStats(prev);

          const isPanic = false;
          

          // Passive Income (during panic mode: do NOT earn)
          const income = isPanic ? 0 : (s.totalPassiveIncome * deltaSeconds);
          let actualBalance = Math.min(prev.balance + income, s.bankLimit);
          
          // Release frozen funds
          let frozenFunds = prev.frozenFunds || 0;
          let frozenFundsReleaseTime = prev.frozenFundsReleaseTime || 0;
          if (frozenFunds > 0 && frozenFundsReleaseTime > 0 && now >= frozenFundsReleaseTime) {
            const released = frozenFunds;
            frozenFunds = 0;
            frozenFundsReleaseTime = 0;
            actualBalance = Math.min(actualBalance + released, s.bankLimit);
            setSmsAlert({ title: 'SMS', message: `Разморозка средств: +${formatMoney(released)}.` });
          }

          // Risk Update
          let newRisk = Math.max(0, Math.min(100, prev.riskLevel + (s.netRiskChange * deltaSeconds)));

          const incomeNow = s.totalPassiveIncome;

          // Supplies: stock-based ops requirement every 5 minutes.
          // If you have no supplies => losses + risk spike.
          const stageMult = prev.businessStage === 'NETWORK' ? 4 : prev.businessStage === 'OFFICE' ? 2 : prev.businessStage === 'REMOTE_TEAM' ? 1.3 : 1;
          const totalWorkers = prev.workers * prev.officeBranches;
          const opsScale = 1 + totalWorkers / 12;
          const consMult = (prev.consumablesCostMultiplierUntil || 0) > now ? (prev.consumablesCostMultiplier || 1) : 1;
          const suppliesNeeded = Math.max(1, Math.ceil(stageMult * opsScale * consMult));
          let lastConsumablesPurchaseTime = prev.lastConsumablesPurchaseTime || 0;
          let suppliesUnits = prev.suppliesUnits || 0;
          if (now - lastConsumablesPurchaseTime >= CONSUMABLES_INTERVAL_MS) {
            if (suppliesUnits >= suppliesNeeded) {
              suppliesUnits = suppliesUnits - suppliesNeeded;
              lastConsumablesPurchaseTime = now;
            } else {
              const extraLoss = Math.max(500, Math.floor((prev.balance + income) * 0.15));
              actualBalance = Math.max(0, actualBalance - extraLoss);
              newRisk = Math.max(0, newRisk);
              lastConsumablesPurchaseTime = now;
              suppliesUnits = 0;
            }
          }

          // Traffic: decays over time but also generates from upgrades
          let trafficUnits = prev.trafficUnits || 0;
          let lastTrafficTickTime = prev.lastTrafficTickTime || 0;
          if (lastTrafficTickTime === 0) lastTrafficTickTime = now;
          if (now - lastTrafficTickTime >= TRAFFIC_TICK_INTERVAL_MS) {
            const trafficBurn = Math.max(1, Math.ceil((totalWorkers || 0) / 10));
            
            // Generate traffic from traffic upgrades
            let trafficGeneration = 0;
            MARKET_ITEMS.forEach(u => {
              if (u.type === UpgradeType.TRAFFIC) {
                const level = prev.upgrades[u.id] || 0;
                if (level > 0) {
                  // Each traffic upgrade generates different amounts of traffic units
                  if (u.id === 'tool_spam_soft') trafficGeneration += 0.3 * level; // 0.3 units per minute per level
                  if (u.id === 'traf_channels') trafficGeneration += 0.8 * level; // 0.8 units per minute per level  
                  if (u.id === 'traf_influencers') trafficGeneration += 2.0 * level; // 2.0 units per minute per level
                }
              }
            });
            
            trafficUnits = Math.max(0, Math.min(20, trafficUnits - trafficBurn + trafficGeneration)); // Cap at 20 units
            lastTrafficTickTime = now;
          }

          // High risk penalties: SMS + red mode + frequent fines
          // - risk > 60 => random fines 10-60% of balance
          let lastRiskSmsThreshold = prev.lastRiskSmsThreshold || 0;
          if (newRisk >= 50 && lastRiskSmsThreshold < 50) {
            lastRiskSmsThreshold = 50;
            setSmsAlert({ title: 'SMS', message: 'Уровень розыска > 50. Тебя уже ищут. Будь осторожен.' });
          }
          if (newRisk >= 60 && lastRiskSmsThreshold < 60) {
            lastRiskSmsThreshold = 60;
            setSmsAlert({ title: 'SMS', message: 'Уровень розыска > 60. Ожидаются штрафы 10-60% баланса!' });
          }
          
          // Random fines when risk > 60%
          let lastFineTime = prev.lastFineTime || 0;
          if (newRisk > 60 && now - lastFineTime > FINE_COOLDOWN_MS) {
            const fineChance = (newRisk - 60) / 40; // 0-100% chance based on risk over 60
            if (Math.random() < fineChance * 0.1) { // 10% of calculated chance per second
              const finePercentage = 10 + Math.random() * 50; // 10-60%
              const fineAmount = Math.floor(actualBalance * (finePercentage / 100));
              actualBalance = Math.max(0, actualBalance - fineAmount);
              lastFineTime = now;
              setSmsAlert({ 
                title: 'ШТРАФ!', 
                message: `Выписан штраф: -${formatMoney(fineAmount)} (${finePercentage.toFixed(1)}% баланса). Снизь риск через связи!` 
              });
            }
          }
          
          let trafficDebuffUntil = prev.trafficDebuffUntil || 0;
          let trafficDebuffMultiplier = prev.trafficDebuffMultiplier || 1;
          let bankLimitBlockUntil = prev.bankLimitBlockUntil || 0;
          let bankLimitBlockAmount = prev.bankLimitBlockAmount || 0;
          let consumablesCostMultiplierUntil = prev.consumablesCostMultiplierUntil || 0;
          let consumablesCostMultiplier = prev.consumablesCostMultiplier || 1;

          // NOTE: Random "stupidity" events removed.
          // Losses now happen logically on конкретных инвестициях (buying stuff / schemes / exchange).

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

          // decay movement window over time
          const nextMoneyMovedWindow = Math.max(0, (prev.moneyMovedWindow || 0) * Math.pow(0.86, deltaSeconds));

          return { 
            ...prev, 
            balance: Math.max(0, actualBalance - penalty), 
            riskLevel: newRisk, 
            lifetimeEarnings: prev.lifetimeEarnings + income, 
            reputation: prev.reputation + (s.passiveReputation * deltaSeconds),
            experience: prev.experience + (deltaSeconds * 0.1),
            ownedDrops: updatedDrops,
            activeSchemes: updatedSchemes,
            lastConsumablesPurchaseTime,
            lastFineTime,
            lastRiskSmsThreshold,
            moneyMovedWindow: nextMoneyMovedWindow,
            lastPassiveIncomeSnapshot: incomeNow,
            suppliesUnits,
            trafficUnits,
            lastTrafficTickTime,
            trafficDebuffUntil,
            trafficDebuffMultiplier,
            bankLimitBlockUntil,
            bankLimitBlockAmount,
            frozenFunds,
            frozenFundsReleaseTime,
            consumablesCostMultiplierUntil,
            consumablesCostMultiplier,
            isPanicMode: false,
            panicClicks: 0
          };
        });
      }
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
        if (prev.balance >= cost) {
          // Calculate risk increase based on cost (cheaper = less risk)
          const riskIncrease = Math.max(0.5, Math.min(5, cost / 10000)); // 0.5-5% risk based on cost
          const isBlackish = upgrade.type === UpgradeType.BLACK_MARKET || upgrade.id.includes('ransom') || upgrade.id.includes('banker');
          
          // Black market items give big risk increase
          const totalRiskIncrease = isBlackish ? Math.max(10, riskIncrease * 3) : riskIncrease;
          
          return {
            ...prev,
            balance: Math.max(0, prev.balance - cost),
            upgrades: { ...prev.upgrades, [upgrade.id]: lvl + 1 },
            riskLevel: Math.min(100, prev.riskLevel + totalRiskIncrease),
            moneyMovedWindow: (prev.moneyMovedWindow || 0) + cost
          };
        }
        return prev;
    });
  };

  const startScheme = (scheme: SchemeItem) => {
    setGameState(prev => {
        const trafficCost = scheme.category === 'BLACK' ? 2 : 1;
        if (prev.balance >= scheme.cost && (prev.trafficUnits || 0) >= trafficCost && prev.activeSchemes.length < 5) {
            const now = Date.now();
            const newActive = { id: Math.random().toString(36), schemeId: scheme.id, startTime: now, endTime: now + (scheme.durationSeconds * 1000), isReady: false };
            const isBlack = scheme.category === 'BLACK';
            
            // Black schemes automatically set risk to 90%, grey schemes give small risk increase
            const newRiskLevel = isBlack ? 90 : Math.min(100, prev.riskLevel + 2);
            
            return { 
              ...prev, 
              balance: prev.balance - scheme.cost, 
              trafficUnits: Math.max(0, (prev.trafficUnits || 0) - trafficCost), 
              activeSchemes: [...prev.activeSchemes, newActive], 
              riskLevel: newRiskLevel, 
              moneyMovedWindow: (prev.moneyMovedWindow || 0) + scheme.cost 
            };
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
            const isBlack = def.category === 'BLACK';
            // Penalties must be tied to the investment (scheme cost), not to total balance.
            // Fail means: seized goods, burned escrow, scammers above you.
            const investment = def.cost;
            const riskFactor = Math.min(1, prev.riskLevel / 100);
            const penaltyRate = Math.min(0.15, (isBlack ? 0.12 : 0.1) + riskFactor * 0.03);
            const extraPenalty = fail ? Math.floor(investment * penaltyRate) : 0;
            if (extraPenalty > 0) {
              const reason = isBlack ? 'Товар/закладка сгорела, часть забрали, часть списали' : 'Сорвалась тема: потеря на расходах/комиссиях';
              setSmsAlert({ title: 'SMS', message: `${reason}: -${formatMoney(extraPenalty)} (от вложений).` });
            }
            const moved = profit + extraPenalty;
            return {
                ...prev,
                balance: Math.min(Math.max(0, prev.balance + profit - extraPenalty), s.bankLimit),
                riskLevel: Math.min(100, prev.riskLevel + (fail ? (isBlack ? def.riskPercentage : def.riskPercentage / 3) : (isBlack ? 6 : 1))),
                activeSchemes: prev.activeSchemes.filter(a => a.id !== active.id),
                moneyMovedWindow: (prev.moneyMovedWindow || 0) + moved
            };
        }
        return prev;
    });
  };

  const hireDrop = (d: DropItem) => setGameState(p => p.balance >= d.hireCost && !p.ownedDrops[d.id] ? { ...p, balance: p.balance - d.hireCost, ownedDrops: { ...p.ownedDrops, [d.id]: { id: d.id, fear: 0, lastPremiumTime: Date.now() } } } : p);
  const payDropPremium = (id: string) => setGameState(p => { const cost = Math.floor((DROPS.find(d => d.id === id)?.hireCost || 0) * 0.2); return p.balance >= cost ? { ...p, balance: p.balance - cost, ownedDrops: { ...p.ownedDrops, [id]: { ...p.ownedDrops[id], fear: Math.max(0, p.ownedDrops[id].fear - 40) } } } : p; });
  const buyAsset = (a: AssetItem) => setGameState(p => {
    const pr = p.assetPrices[a.id] || a.basePrice;
    const fee = Math.max(1, Math.floor(pr * 0.01)); // 1% fee
    if (p.balance < pr + fee) return p;
    // Slippage / bad entry is a percent of the investment (price), not of balance.
    const riskFactor = Math.min(1, p.riskLevel / 100);
    const slipChance = 0.02 + riskFactor * 0.03; // 2%..5%
    const slipRate = Math.min(0.15, 0.1 + riskFactor * 0.05); // 10%..15% of pr
    const slippage = Math.random() < slipChance ? Math.floor(pr * slipRate) : 0;
    if (slippage > 0) setSmsAlert({ title: 'SMS', message: `Плохой вход / проскальзывание: -${formatMoney(slippage)} (от инвестиции).` });
    return {
      ...p,
      balance: Math.max(0, p.balance - pr - fee - slippage),
      ownedAssets: { ...p.ownedAssets, [a.id]: (p.ownedAssets[a.id] || 0) + 1 },
      riskLevel: Math.min(100, p.riskLevel + (slippage > 0 ? 1 : 0)),
      moneyMovedWindow: (p.moneyMovedWindow || 0) + pr + fee + slippage
    };
  });
  const sellAsset = (a: AssetItem) => setGameState(p => {
    const count = p.ownedAssets[a.id] || 0;
    if (count <= 0) return p;
    const pr = p.assetPrices[a.id] || a.basePrice;
    const fee = Math.max(1, Math.floor(pr * 0.01));
    return {
      ...p,
      balance: Math.min(p.balance + Math.max(0, pr - fee), calculateDerivedStats(p).bankLimit),
      ownedAssets: { ...p.ownedAssets, [a.id]: count - 1 },
      moneyMovedWindow: (p.moneyMovedWindow || 0) + pr
    };
  });
  const buyProperty = (pr: PropertyItem) => setGameState(p => { const lvl = p.properties[pr.id] || 0; const cost = calculateUpgradeCost(pr.baseCost, lvl); return p.balance >= cost ? { ...p, balance: p.balance - cost, properties: { ...p.properties, [pr.id]: lvl + 1 }, reputation: p.reputation + pr.reputationBonus } : p; });
  const upgradeSkill = (id: string) => setGameState(p => { const s = SKILLS.find(sk => sk.id === id); const lvl = p.skills[id] || 0; const cost = Math.floor((s?.baseExpCost || 0) * Math.pow(1.5, lvl)); return s && p.experience >= cost && lvl < s.maxLevel ? { ...p, experience: p.experience - cost, skills: { ...p.skills, [id]: lvl + 1 } } : p; });
  const upgradeLaunderingItem = (i: LaunderingItem) => setGameState(p => { const lvl = p.launderingUpgrades[i.id] || 0; const cost = calculateUpgradeCost(i.baseCost, lvl); return p.balance >= cost ? { ...p, balance: p.balance - cost, launderingUpgrades: { ...p.launderingUpgrades, [i.id]: lvl + 1 } } : p; });
  const promote = (id: string) => setGameState(p => {
    const job = CAREER_LADDER.find(j => j.id === id);
    if (!job) return p;
    // Career is by "level": use reputation threshold + requirements, no cooldown, no promo cost.
    const level = getPlayerLevel(p.experience);
    const hasReqLvl = level >= (job.requiredLevel || 0);
    const hasReqRep = p.reputation >= job.requiredReputation;
    const hasReqUpgrade = job.reqUpgradeId ? (p.upgrades[job.reqUpgradeId] || 0) > 0 : true;
    const hasReqProp = job.reqPropertyId ? (p.properties[job.reqPropertyId] || 0) > 0 : true;
    const hasReqWorkers = job.reqWorkers ? (p.workers >= job.reqWorkers) : true;
    const hasReqStage = (p.businessStage === job.reqBusinessStage) || (job.reqBusinessStage === 'NONE');
    const ok = hasReqLvl && hasReqRep && hasReqUpgrade && hasReqProp && hasReqWorkers && hasReqStage;
    return ok ? { ...p, currentJobId: id } : p;
  });

  const buySupply = (item: SupplyItem) => {
    setGameState(prev => {
      if (prev.balance < item.cost) return prev;
      return {
        ...prev,
        balance: Math.max(0, prev.balance - item.cost),
        supplies: { ...prev.supplies, [item.id]: (prev.supplies?.[item.id] || 0) + 1 }
      };
    });
  };

  const sellSupply = (item: SupplyItem) => {
    setGameState(prev => {
      const count = prev.supplies?.[item.id] || 0;
      if (count <= 0) return prev;
      return {
        ...prev,
        balance: Math.max(0, prev.balance + item.sellPrice),
        supplies: { ...prev.supplies, [item.id]: count - 1 }
      };
    });
  };

  const useSupply = (item: SupplyItem) => {
    setGameState(prev => {
      const count = prev.supplies?.[item.id] || 0;
      if (count <= 0) return prev;

      const nextSupplies = { ...prev.supplies, [item.id]: count - 1 };
      const now = Date.now();

      if (item.effectType === 'XP') {
        return { ...prev, supplies: nextSupplies, experience: prev.experience + item.effectValue };
      }
      if (item.effectType === 'REPUTATION') {
        return { ...prev, supplies: nextSupplies, reputation: prev.reputation + item.effectValue };
      }
      if (item.effectType === 'RISK_REDUCE') {
        return { ...prev, supplies: nextSupplies, riskLevel: Math.max(0, prev.riskLevel - item.effectValue) };
      }
      if (item.effectType === 'CONSUMABLES_DISCOUNT') {
        const durationMs = item.durationMs || 5 * 60 * 1000;
        return {
          ...prev,
          supplies: nextSupplies,
          consumablesCostMultiplierUntil: now + durationMs,
          consumablesCostMultiplier: item.effectValue
        };
      }

      return { ...prev, supplies: nextSupplies };
    });
  };

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

  return (
    <div className={`relative w-full h-screen flex flex-col overflow-hidden bg-background text-white ${gameState.riskLevel >= 60 ? 'outline outline-1 outline-red-500/30' : ''}`}>
      {appLoading && <LoadingScreen onFinished={() => setAppLoading(false)} />}

      {gameState.riskLevel >= 60 && (
        <div className="fixed inset-0 z-[40] pointer-events-none bg-red-950/10 mix-blend-screen" />
      )}

      {smsAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-[420px] pointer-events-auto">
          <div className={`rounded-2xl border p-4 backdrop-blur-xl shadow-2xl ${gameState.riskLevel >= 80 ? 'bg-red-950/60 border-red-500/40' : 'bg-surface/60 border-white/10'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{smsAlert.title}</div>
                <div className="text-sm font-bold text-white mt-1">{smsAlert.message}</div>
              </div>
              <button className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-black" onClick={() => setSmsAlert(null)}>Ок</button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background opacity-20">
          <img src={characterImage} alt="Thematic" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <TopWidget currentJob={stats.currentJob} bankLimit={stats.bankLimit} balance={gameState.balance} isBankFull={stats.isBankFull} riskLevel={gameState.riskLevel} level={getPlayerLevel(gameState.experience)} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-12">
          <div className="flex flex-col items-center animate-bounce-soft">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">BALANCE</span>
              <h1 className={`text-6xl font-mono font-black ${stats.isBankFull ? 'text-red-500' : 'text-white'}`}>{formatMoney(gameState.balance)}</h1>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-[10px] font-bold text-slate-200 bg-surfaceHighlight px-3 py-1 rounded-full border border-white/5">
                  Репутация: <span className="font-mono font-black">{Math.floor(gameState.reputation)}</span>
                </div>
                <div className="text-[10px] font-bold text-success bg-surfaceHighlight px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500 animate-pulse" /> {formatMoney(stats.totalPassiveIncome)}/s
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
          <SchemesTab gameState={gameState} startScheme={startScheme} claimScheme={claimScheme} buyUpgrade={buyUpgrade} />
      </BottomSheet>
      <BottomSheet isOpen={activeTab === Tab.MARKET} onClose={() => setActiveTab(Tab.CLICKER)} title="АКТИВЫ">
          <AssetsTab gameState={gameState} isBankFull={stats.isBankFull} portfolioValue={stats.portfolioValue} upgradeLaunderingItem={upgradeLaunderingItem} buyUpgrade={buyUpgrade} buyAsset={buyAsset} sellAsset={sellAsset} buyProperty={buyProperty} setActiveMiniGame={setActiveMiniGame} hireDrop={hireDrop} payDropPremium={payDropPremium} />
      </BottomSheet>
      <BottomSheet isOpen={activeTab === ('SUPPLIES' as Tab)} onClose={() => setActiveTab(Tab.CLICKER)} title="ЛАВКА">
          <SuppliesTab gameState={gameState} buySupply={buySupply} sellSupply={sellSupply} useSupply={useSupply} />
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
