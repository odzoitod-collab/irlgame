
import React from 'react';
import { Briefcase, Shield, TrendingUp, Users, Lock, Target } from 'lucide-react';

export const GuideContent: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-300">
      
      {/* Intro */}
      <div className="bg-surfaceHighlight p-6 rounded-3xl border border-white/5">
        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          🚀 Путь к Успеху
        </h3>
        <p className="text-xs leading-relaxed">
          Твоя цель — стать <span className="text-white font-bold">CEO</span> теневой империи. 
          Игра построена на жесткой иерархии. Ты не можешь просто купить всё сразу. 
          Каждая должность открывает новые возможности, но требует конкретных активов.
        </p>
      </div>

      {/* Stage 1: Start */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-primary">
          <Target size={24} />
          <h4 className="font-black text-white uppercase tracking-wider">Этап 1: Воркер</h4>
        </div>
        <div className="bg-surface p-5 rounded-3xl space-y-3">
          <p className="text-xs">В начале ты никто. Твой доход — только клики.</p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-400">
            <li><strong className="text-white">Цель:</strong> Получить должность "Воркер".</li>
            <li><strong className="text-white">Что купить:</strong> Зайди в "Активы" -> "Инструменты" и купи <strong>VPN</strong>. Без него воркать нельзя.</li>
            <li><strong className="text-white">Далее:</strong> Копи на <strong>iPhone</strong> (вкладка "Лакшери"). Это требование для следующего повышения.</li>
          </ul>
        </div>
      </div>

      {/* Stage 2: Middle */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-accent">
          <Users size={24} />
          <h4 className="font-black text-white uppercase tracking-wider">Этап 2: Менеджмент</h4>
        </div>
        <div className="bg-surface p-5 rounded-3xl space-y-3">
          <p className="text-xs">Ты начинаешь получать пассивный доход, но берешь на себя ответственность.</p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-400">
            <li><strong className="text-white">Тим Лид:</strong> Это ключевая точка. Только став Тим Лидом, ты разблокируешь вкладку <strong>"Тима"</strong> (создание своей команды).</li>
            <li><strong className="text-white">Офис:</strong> Чтобы нанимать людей, нужен бюджет. Воркеры не приносят деньги без <strong>Софта</strong>. Сначала купи Софт, потом нанимай.</li>
            <li><strong className="text-white">Трафик:</strong> Это множитель. Если у тебя крутой офис, но нет трафика — доход будет низким.</li>
          </ul>
        </div>
      </div>

      {/* Stage 3: Late Game */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-red-500">
          <Shield size={24} />
          <h4 className="font-black text-white uppercase tracking-wider">Этап 3: Империя и Риски</h4>
        </div>
        <div className="bg-surface p-5 rounded-3xl space-y-3">
          <p className="text-xs">На высоких должностях (ТС, CEO) тобой интересуются органы.</p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-400">
            <li><strong className="text-white">Риск (Розыск):</strong> Растет от "черных" схем и высокой должности. Если риск 100% — будет облава (потеря 30% денег).</li>
            <li><strong className="text-white">Как снизить риск:</strong> Покупай "Безопасность" (Адвокаты, Связи) во вкладке "Активы".</li>
            <li><strong className="text-white">Обмыв:</strong> Банк имеет лимит. Чтобы хранить миллионы, покупай бизнесы (Шаурма, Рестораны). Они расширяют лимит банка.</li>
          </ul>
        </div>
      </div>

      {/* Strategy Tips */}
      <div className="bg-surfaceHighlight p-5 rounded-3xl border border-white/5">
        <h4 className="font-black text-white mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-success"/> Стратегия Победы
        </h4>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span>1. Покупай Активы</span>
            <span className="text-slate-400">Нужны для повышений</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span>2. Следи за Риском</span>
            <span className="text-slate-400">Не жалей денег на Крышу</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span>3. Балансируй Тиму</span>
            <span className="text-slate-400">Воркеры + Софт + Трафик</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>4. Инвестируй</span>
            <span className="text-slate-400">Крипта может дать х2</span>
          </div>
        </div>
      </div>

    </div>
  );
};
