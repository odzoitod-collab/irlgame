
import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck, Terminal, Wifi, Lock } from 'lucide-react';
import { CHARACTER_STAGES } from '../constants';

interface LoadingScreenProps {
  onFinished: () => void;
}

const MESSAGES = [
  "Инициализация зашифрованного канала...",
  "Проверка анонимности прокси-серверов...",
  "Обход систем антифрода...",
  "Загрузка базы данных мамонтов...",
  "Подготовка рабочих мест в офисе...",
  "Скрытие IP-адреса...",
  "Вербовка новых воркеров...",
  "Запуск теневой империи..."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = CHARACTER_STAGES.length;

    // Функция для предзагрузки изображений
    const preloadImages = async () => {
      const promises = CHARACTER_STAGES.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loadedCount++;
            // Обновляем прогресс на основе реальной загрузки (первые 90%)
            const realProgress = (loadedCount / totalAssets) * 90;
            setProgress(prev => Math.max(prev, realProgress));
            resolve(src);
          };
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(promises);
        setAssetsLoaded(true);
      } catch (err) {
        console.error("Ошибка при загрузке ассетов:", err);
        // В случае ошибки все равно продолжаем через таймаут
        setAssetsLoaded(true);
      }
    };

    preloadImages();

    // Плавное заполнение до 100%, когда ассеты готовы
    const msgTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 600);

    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    if (assetsLoaded) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setFadeOut(true), 500);
            setTimeout(onFinished, 1200);
            return 100;
          }
          return prev + 1.5; // Финальный рывок до 100%
        });
      }, 30);
      return () => clearInterval(timer);
    }
  }, [assetsLoaded, onFinished]);

  return (
    <div className={`fixed inset-0 z-[200] bg-[#0A0B0F] flex flex-col items-center justify-center transition-all duration-1000 ${fadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background FX: Glitchy Scanlines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        
        {/* Large Headline IRL TEAM GAME */}
        <div className="mb-4 text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic animate-pulse-glitch select-none">
                IRL <span className="text-primary drop-shadow-[0_0_15px_rgba(108,93,211,0.8)]">TEAM</span> GAME
            </h2>
            <div className="h-1 w-32 bg-primary mx-auto mt-3 rounded-full shadow-[0_0_20px_#6C5DD3]" />
        </div>

        {/* Logo Animation */}
        <div className="relative mb-8 mt-6">
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-surface/50 backdrop-blur-xl shadow-2xl">
                <Fingerprint size={64} className="text-primary animate-pulse" />
                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin duration-[2.5s]" />
                <div className="absolute inset-2 border-b-2 border-accent/30 rounded-full animate-spin-reverse duration-[4s]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-success p-2.5 rounded-xl shadow-[0_0_15px_rgba(127,186,122,0.4)] animate-bounce">
                <ShieldCheck size={20} className="text-black" />
            </div>
        </div>

        {/* Text Area */}
        <div className="text-center mb-10 h-14">
            <h1 className="text-xl font-black text-slate-300 uppercase tracking-tighter mb-2 italic">ScamTycoon <span className="text-primary">Empire</span></h1>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
                <Terminal size={12} className="text-primary" />
                <span className="animate-pulse">{MESSAGES[messageIndex]}</span>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-4">
            <div className="flex justify-between text-[11px] font-mono font-black text-slate-500 uppercase tracking-tighter">
                <span className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${assetsLoaded ? 'bg-success' : 'bg-primary animate-ping'}`} />
                  {assetsLoaded ? 'RESOURCES_READY' : 'FETCHING_ASSETS'}
                </span>
                <span className="text-primary tabular-nums">{Math.floor(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient-x transition-all duration-300 ease-out rounded-full shadow-[0_0_15px_rgba(108,93,211,0.6)]" 
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-center gap-6 text-[9px] font-black text-slate-600 uppercase tracking-widest pt-2">
                <div className="flex items-center gap-1.5"><Wifi size={12} /> SECURE_SSL</div>
                <div className="flex items-center gap-1.5"><Lock size={12} /> VERIFIED_BUILD</div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glitch {
          0%, 100% { opacity: 1; transform: scale(1) skew(0deg); filter: hue-rotate(0deg); }
          20% { transform: scale(1.02) skew(1deg); filter: hue-rotate(10deg); }
          40% { transform: scale(0.98) skew(-1deg); }
          60% { opacity: 0.8; transform: translateX(2px); }
          80% { transform: translateX(-2px); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-gradient-x {
          animation: gradient-x 2s ease infinite;
        }
        .animate-pulse-glitch {
          animation: pulse-glitch 4s ease-in-out infinite;
          text-shadow: 0 0 30px rgba(108, 93, 211, 0.5);
        }
        .animate-spin-reverse {
          animation: spin-reverse linear infinite;
        }
        .bg-scanline {
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%);
          background-size: 100% 4px;
        }
      `}</style>
    </div>
  );
};
