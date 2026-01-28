
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, Binary, Zap, ShieldAlert, TrendingUp, ChevronLeft, ChevronRight, Fingerprint } from 'lucide-react';
import { formatMoney } from '../utils/format';

interface MiniGameProps {
  businessId: string;
  businessLevel: number;
  baseIncome: number;
  onClose: () => void;
  onComplete: (score: number) => void;
}

type GameType = 'TAP' | 'SORT' | 'REACTION' | 'TIMING';

const GAME_CONFIG: Record<string, { type: GameType; title: string; color: string; bgGradient: string }> = {
  'laund_fop': {
    type: 'REACTION',
    title: 'Взлом Терминала',
    color: 'text-green-500',
    bgGradient: 'from-green-500/20 to-black'
  },
  'laund_crypto': {
    type: 'SORT',
    title: 'Фишинг-Сортировка',
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/20 to-slate-900'
  },
  'laund_shawarma': {
    type: 'TAP',
    title: 'Крути Шаурму',
    color: 'text-orange-500',
    bgGradient: 'from-orange-500/20 to-red-500/5'
  },
  'laund_carwash': {
    type: 'TAP',
    title: 'Мойка Люкс',
    color: 'text-cyan-500',
    bgGradient: 'from-cyan-500/20 to-blue-500/5'
  },
  'laund_rest': {
    type: 'TIMING',
    title: 'Крипто-Памп',
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/20 to-pink-500/5'
  },
  'laund_const': {
    type: 'TIMING',
    title: 'Стройка Века',
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/20 to-orange-500/5'
  }
};

interface PhishingCard {
    id: number;
    name: string;
    balance: number;
    isTrap: boolean;
    avatar: string;
}

const PHISHING_NAMES = ["Марина 56", "Crypto_King", "Аноним", "Студент", "Бабушка", "Инвестор", "Мамонт", "Коп под прикрытием"];

export const MiniGameModal: React.FC<MiniGameProps> = ({ businessId, businessLevel, baseIncome, onClose, onComplete }) => {
  const config = GAME_CONFIG[businessId] || GAME_CONFIG['laund_fop'];
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Game Elements State
  const [targets, setTargets] = useState<{id: number, x: number, y: number, char: string, isGlitch: boolean}[]>([]);
  const [phishingCards, setPhishingCards] = useState<PhishingCard[]>([]);
  const [chartValue, setChartValue] = useState(50);
  const [chartHistory, setChartHistory] = useState<number[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize
  useEffect(() => {
    setIsPlaying(true);
    if (config.type === 'SORT') generatePhishingCard();
    return () => stopGame();
  }, []);

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  // Main Timer
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setShowResult(true);
          stopGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying]);

  // Game Specific Loops
  useEffect(() => {
    if (!isPlaying) return;

    if (config.type === 'REACTION') {
        gameLoopRef.current = setInterval(() => {
            const id = Date.now() + Math.random();
            const isGlitch = Math.random() < 0.3;
            setTargets(prev => [...prev.slice(-10), {
                id,
                x: Math.random() * 80 + 10,
                y: Math.random() * 70 + 15,
                char: isGlitch ? '0x' + Math.floor(Math.random()*255).toString(16) : Math.random() > 0.5 ? '1' : '0',
                isGlitch
            }]);
        }, 500);
    }

    if (config.type === 'TIMING') {
        let angle = 0;
        gameLoopRef.current = setInterval(() => {
            angle += 0.15;
            const noise = (Math.random() - 0.5) * 10;
            const newVal = 50 + Math.sin(angle) * 35 + noise;
            setChartValue(newVal);
            setChartHistory(prev => [...prev.slice(-30), newVal]);
        }, 100);
    }

    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [isPlaying, config.type]);

  // --- REACTION LOGIC ---
  const handleTargetClick = (id: number, isGlitch: boolean) => {
      if (isGlitch) {
          setScore(prev => prev + 5);
          if (navigator.vibrate) navigator.vibrate(10);
      } else {
          setScore(prev => Math.max(0, prev - 2));
      }
      setTargets(prev => prev.filter(t => t.id !== id));
  };

  // --- SORT LOGIC ---
  const generatePhishingCard = () => {
      const isTrap = Math.random() < 0.2;
      const card: PhishingCard = {
          id: Date.now(),
          name: isTrap ? "Майор Доигралес" : PHISHING_NAMES[Math.floor(Math.random() * PHISHING_NAMES.length)],
          balance: isTrap ? 0 : Math.floor(Math.random() * 50000) + 100,
          isTrap,
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${Math.random()}`
      };
      setPhishingCards([card]);
  };

  const handleSort = (scam: boolean) => {
      const current = phishingCards[0];
      if (!current) return;

      if (scam) {
          if (current.isTrap) {
              setScore(prev => Math.max(0, prev - 10));
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          } else {
              setScore(prev => prev + Math.ceil(current.balance / 5000) + 1);
              if (navigator.vibrate) navigator.vibrate(10);
          }
      } else {
          if (current.isTrap) setScore(prev => prev + 3);
      }
      generatePhishingCard();
  };

  // --- TIMING LOGIC ---
  const handleFixProfit = () => {
      // Zone between 75 and 100 is Profit
      if (chartValue >= 70) {
          const gain = Math.floor((chartValue - 60) / 2);
          setScore(prev => prev + gain);
          if (navigator.vibrate) navigator.vibrate(20);
      } else {
          setScore(prev => Math.max(0, prev - 5));
          if (navigator.vibrate) navigator.vibrate([50, 50]);
      }
  };

  const handleFinish = () => {
    const multiplier = config.type === 'REACTION' ? 1.5 : 1.0;
    const reward = Math.floor(baseIncome * (businessLevel + 1) * score * multiplier); 
    onComplete(reward);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <div className="relative w-full max-w-md bg-surface rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col h-[75vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-surfaceHighlight z-20 border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white/5 ${config.color}`}>
                   <Zap size={20} />
                </div>
                <div>
                    <h3 className="font-black text-white uppercase text-[10px] tracking-widest">{config.title}</h3>
                    <div className={`font-mono font-black text-xl ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>
            <div className="text-right">
                 <span className="text-[9px] text-slate-500 font-bold uppercase block">SCORE</span>
                 <span className={`text-2xl font-black ${config.color}`}>{score}</span>
            </div>
        </div>

        {/* REACTION GAME (Terminal) */}
        {isPlaying && config.type === 'REACTION' && (
            <div className={`relative flex-1 bg-black font-mono overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-pattern scale-150"></div>
                {targets.map(t => (
                    <button 
                        key={t.id}
                        onMouseDown={() => handleTargetClick(t.id, t.isGlitch)}
                        className={`absolute p-4 transition-all active:scale-75 ${t.isGlitch ? 'text-green-400 font-black animate-pulse text-xl' : 'text-green-900/40 text-sm'}`}
                        style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    >
                        {t.char}
                    </button>
                ))}
            </div>
        )}

        {/* SORT GAME (Phishing) */}
        {isPlaying && config.type === 'SORT' && (
            <div className="relative flex-1 flex flex-col items-center justify-center p-6 bg-slate-900">
                <div className="text-[10px] text-slate-500 font-black uppercase mb-8 tracking-[0.3em]">АНАЛИЗ ЦЕЛИ</div>
                
                {phishingCards.map(card => (
                    <div key={card.id} className="w-full bg-surfaceHighlight p-6 rounded-[2rem] border-2 border-white/5 shadow-2xl animate-pop text-center space-y-4">
                        <img src={card.avatar} alt="avatar" className="w-20 h-20 mx-auto rounded-full bg-slate-800 p-2" />
                        <div>
                            <div className="text-white font-black text-lg">{card.name}</div>
                            <div className="text-blue-400 font-mono font-bold text-sm">Баланс: {formatMoney(card.balance)}</div>
                        </div>
                    </div>
                ))}

                <div className="grid grid-cols-2 gap-4 w-full mt-12">
                    <button onClick={() => handleSort(false)} className="py-4 bg-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-black text-xs uppercase hover:bg-slate-700 active:scale-95 transition-all">
                        <ChevronLeft size={18}/> ПРОПУСК
                    </button>
                    <button onClick={() => handleSort(true)} className="py-4 bg-blue-600 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-xs uppercase hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                        СКАМ <ChevronRight size={18}/>
                    </button>
                </div>
            </div>
        )}

        {/* TIMING GAME (Chart) */}
        {isPlaying && config.type === 'TIMING' && (
            <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-black overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
                
                <div className="w-full h-48 relative flex items-end gap-1 px-4 mb-12">
                    {chartHistory.map((v, i) => (
                        <div key={i} className={`flex-1 rounded-t-sm transition-all duration-300 ${v > 70 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-slate-800'}`} style={{ height: `${v}%` }} />
                    ))}
                    <div className="absolute top-[30%] left-0 right-0 h-0.5 bg-purple-500/30 border-t border-dashed border-purple-500/50 z-0">
                         <span className="absolute -top-4 right-4 text-[8px] font-black text-purple-500 uppercase">PROFIT ZONE</span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="text-4xl font-mono font-black text-white tracking-tighter">
                        x{ (1 + chartValue/100).toFixed(2) }
                    </div>
                </div>

                <button 
                    onMouseDown={handleFixProfit}
                    className="w-full py-6 bg-purple-600 rounded-3xl text-white font-black text-lg uppercase tracking-widest hover:bg-purple-500 active:scale-95 transition-all shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-3"
                >
                    <TrendingUp size={24} /> ФИКСИРОВАТЬ
                </button>
            </div>
        )}

        {/* TAP GAME (Classic with better feel) */}
        {isPlaying && config.type === 'TAP' && (
            <div className="relative flex-1 flex items-center justify-center bg-slate-900">
                 <button 
                    onMouseDown={() => { setScore(s => s + 1); if(navigator.vibrate) navigator.vibrate(5); }}
                    className="w-48 h-48 bg-surfaceHighlight rounded-full border-8 border-white/5 flex flex-col items-center justify-center gap-2 transition-all active:scale-90 hover:scale-105 shadow-2xl relative group"
                 >
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20"></div>
                    <Fingerprint size={64} className={config.color} />
                    <span className="text-[10px] font-black text-slate-500 tracking-widest">TAP TAP</span>
                 </button>
            </div>
        )}

        {/* RESULTS */}
        {showResult && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"/>
                <div className="w-24 h-24 bg-surfaceHighlight rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                    <Trophy size={48} className={`${config.color} animate-bounce`} />
                </div>
                <h2 className="text-3xl font-black text-white uppercase mb-2">Операция Окончена</h2>
                <p className="text-xs text-slate-500 font-bold mb-8 uppercase tracking-widest">Ваш результат за сессию:</p>
                
                <div className="bg-surfaceHighlight w-full p-8 rounded-[2.5rem] mb-10 flex flex-col items-center border border-white/5 shadow-inner">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-3">Чистый Профит</span>
                    <span className="text-4xl font-mono font-black text-success">
                        +{formatMoney(Math.floor(baseIncome * (businessLevel + 1) * score * (config.type === 'REACTION' ? 1.5 : 1.0)))}
                    </span>
                </div>

                <button 
                    onClick={handleFinish}
                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl active:scale-95 transition-all"
                >
                    ЗАБРАТЬ КЭШ
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
