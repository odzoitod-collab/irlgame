
import { UpgradeItem, JobPosition, VerticalType, UpgradeType, PropertyItem, BusinessStage, LaunderingItem, TeamStrategy, AssetItem, AssetType, SchemeItem, SchemeCategory, Skill, DropItem, SupplyItem } from './types';

export const CREATE_TEAM_COST = 25000; 
export const WORKER_HIRE_COST_BASE = 500; 
export const BASE_BANK_LIMIT = 5000; 
export const PROMOTION_COOLDOWN_DEFAULT = 8; 

export const SKILLS: Skill[] = [
  { id: 'skill_soc_eng', name: 'СИ (Соц. Инженерия)', description: 'Снижает шанс провала в "Темках" на 2% за уровень.', maxLevel: 10, baseExpCost: 100, icon: '🧠' },
  { id: 'skill_anon', name: 'Анонимность', description: 'Снижает скорость роста риска на 5% за уровень.', maxLevel: 10, baseExpCost: 150, icon: '🕵️' },
  { id: 'skill_coding', name: 'Кодинг', description: 'Увеличивает пассивный доход софта на 10% за уровень.', maxLevel: 10, baseExpCost: 200, icon: '💻' },
  { id: 'skill_negotiator', name: 'Переговорщик', description: 'Уменьшает кулдауны на повышение на 10% за уровень.', maxLevel: 10, baseExpCost: 300, icon: '🤝' },
];

export const DROPS: DropItem[] = [
  { id: 'drop_student', name: 'Студент Антон', role: 'Микро-отмыв', hireCost: 1500, limitBonus: 25000, baseFearRate: 0.15, icon: '🎓' },
  { id: 'drop_homeless', name: 'Семёныч', role: 'Грязная работа', hireCost: 5000, limitBonus: 100000, baseFearRate: 0.25, icon: '🧔' },
  { id: 'drop_pensioner', name: 'Баба Зина', role: 'Безопасный транзит', hireCost: 25000, limitBonus: 500000, baseFearRate: 0.08, icon: '👵' },
  { id: 'drop_blogger', name: 'Лайфстайл-блогер', role: 'Публичный отмыв', hireCost: 150000, limitBonus: 2500000, baseFearRate: 0.12, icon: '🤳' },
  { id: 'drop_deputy', name: 'Помощник Депутата', role: 'Элитная прачечная', hireCost: 5000000, limitBonus: 100000000, baseFearRate: 0.04, icon: '👔' },
];

export const CHARACTER_STAGES = [
  'https://fiowhfwwefwff.vercel.app/stage1.jpg',
  'https://fiowhfwwefwff.vercel.app/stage2.jpg',
  'https://fiowhfwwefwff.vercel.app/stage3.jpg',
  'https://fiowhfwwefwff.vercel.app/stage4.jpg',
  'https://fiowhfwwefwff.vercel.app/stage5.jpg',
  'https://fiowhfwwefwff.vercel.app/stage6.jpg',
  'https://fiowhfwwefwff.vercel.app/stage7.jpg',
  'https://fiowhfwwefwff.vercel.app/stage8.jpg',
  'https://fiowhfwwefwff.vercel.app/stage9.jpg',
];

export const CAREER_LADDER: JobPosition[] = [
  {
    id: 'job_start',
    title: 'Новичок',
    vertical: 'Мамкин хакер',
    salaryPerClick: 5,
    passiveIncome: 0,
    requiredLevel: 0,
    requiredReputation: 0,
    costToPromote: 0,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    baseRisk: 0,
    description: 'Ты только скачал Tor и думаешь, что ты аноним. Самое время заработать первые копейки.',
    promotionCooldownHours: 0
  },
  {
    id: 'job_worker',
    title: 'Воркер',
    vertical: 'Низшее звено',
    salaryPerClick: 25,
    passiveIncome: 5,
    requiredLevel: 2,
    requiredReputation: 10,
    costToPromote: 1000,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    reqUpgradeId: 'tool_vpn',
    baseRisk: 1,
    description: 'Ты в тиме. Твоя задача — спамить и надеяться на мамонта. VPN обязателен.',
    promotionCooldownHours: 0
  },
  {
    id: 'job_mentor',
    title: 'Наставник',
    vertical: 'Опытный скамер',
    salaryPerClick: 120,
    passiveIncome: 40,
    requiredLevel: 6,
    requiredReputation: 50,
    costToPromote: 15000,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    reqPropertyId: 'prop_iphone',
    baseRisk: 3,
    description: 'Ты учишь новичков обходить антифрод. Твой статус в чате растет.',
    promotionCooldownHours: 0.5
  },
  {
    id: 'job_support',
    title: 'Саппорт',
    vertical: 'Техническая помощь',
    salaryPerClick: 450,
    passiveIncome: 150,
    requiredLevel: 10,
    requiredReputation: 250,
    costToPromote: 100000,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    reqPropertyId: 'prop_macbook',
    baseRisk: 6,
    description: 'Отвечаешь на тикеты и помогаешь заводить мамонтов. Нужно серьезное железо.',
    promotionCooldownHours: 1
  },
  {
    id: 'job_closer',
    title: 'Клоузер',
    vertical: 'Закрытие сделок',
    salaryPerClick: 2000,
    passiveIncome: 800,
    requiredLevel: 16,
    requiredReputation: 1000,
    costToPromote: 1000000,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    reqUpgradeId: 'soft_drainer',
    baseRisk: 10,
    description: 'Когда мамонт готов, приходишь ты и забираешь всё. Твой инструмент - Дрейнер.',
    promotionCooldownHours: 2
  },
  {
    id: 'job_team_lead',
    title: 'Тим Лид',
    vertical: 'Управление командой',
    salaryPerClick: 10000,
    passiveIncome: 5000,
    requiredLevel: 24,
    requiredReputation: 5000,
    costToPromote: 10000000,
    isManager: true,
    reqBusinessStage: BusinessStage.REMOTE_TEAM,
    baseRisk: 15,
    description: 'Ключевой ранг. Теперь у тебя своя тима воркеров. Начинай строить бизнес.',
    promotionCooldownHours: 4
  },
  {
    id: 'job_hr',
    title: 'HR Менеджер',
    vertical: 'Рекрутинг',
    salaryPerClick: 50000,
    passiveIncome: 25000,
    requiredLevel: 34,
    requiredReputation: 25000,
    costToPromote: 100000000,
    isManager: true,
    reqBusinessStage: BusinessStage.REMOTE_TEAM,
    reqWorkers: 5,
    baseRisk: 22,
    description: 'Ты нанимаешь лучших. Масштабируй команду, чтобы захватить рынок.',
    promotionCooldownHours: 8
  },
  {
    id: 'job_admin',
    title: 'Админ (ТС)',
    vertical: 'Владелец сети',
    salaryPerClick: 250000,
    passiveIncome: 150000,
    requiredLevel: 46,
    requiredReputation: 100000,
    costToPromote: 5000000000,
    isManager: true,
    reqBusinessStage: BusinessStage.NETWORK,
    baseRisk: 35,
    description: 'Владелец сети офисов. Твой процент со всех сделок огромен.',
    promotionCooldownHours: 12
  },
  {
    id: 'job_lord',
    title: 'Властелин Скама',
    vertical: 'Теневой Король',
    salaryPerClick: 2000000,
    passiveIncome: 1000000,
    requiredLevel: 60,
    requiredReputation: 500000,
    costToPromote: 100000000000,
    isManager: true,
    reqBusinessStage: BusinessStage.NETWORK,
    reqPropertyId: 'prop_island',
    baseRisk: 50,
    description: 'Ты на вершине. Мировые банки — твоя игровая площадка. Игра окончена?',
    promotionCooldownHours: 0
  }
];

export const OFFICE_CAPACITY = [
  { level: 1, name: 'Квартира', maxWorkers: 5, cost: 0 },
  { level: 2, name: 'Коворкинг', maxWorkers: 20, cost: 500000 }, 
  { level: 3, name: 'Офис B-класс', maxWorkers: 60, cost: 10000000 }, 
  { level: 4, name: 'Офис A-класс', maxWorkers: 200, cost: 500000000 }, 
  { level: 5, name: 'Небоскреб', maxWorkers: 2000, cost: 20000000000 }, 
];

export const TEAM_STRATEGIES = {
  [TeamStrategy.SAFE]: { name: 'Дейтинг', multiplier: 1.0, risk: 1, color: 'text-green-500' },
  [TeamStrategy.BALANCED]: { name: 'Крипто-Скам', multiplier: 4.0, risk: 15, color: 'text-blue-500' },
  [TeamStrategy.AGGRESSIVE]: { name: 'Дрейнеры', multiplier: 15.0, risk: 45, color: 'text-red-500' }
};

export const LAUNDERING_ITEMS: LaunderingItem[] = [
  { id: 'laund_fop', name: 'ФОП 3-группа', baseCost: 500, baseLimit: 100000, baseIncome: 5, description: '+100к Лимит', reqBusinessStage: BusinessStage.NONE, icon: '📄' },
  { id: 'laund_crypto', name: 'P2P Обменник', baseCost: 10000, baseLimit: 2000000, baseIncome: 50, description: '+2М Лимит', reqBusinessStage: BusinessStage.NONE, icon: '💻' },
  { id: 'laund_shawarma', name: 'Шаурма-сеть', baseCost: 250000, baseLimit: 50000000, baseIncome: 1000, description: '+50М Лимит', reqBusinessStage: BusinessStage.REMOTE_TEAM, icon: '🌯' },
  { id: 'laund_carwash', name: 'Мойка самообслуживания', baseCost: 5000000, baseLimit: 1000000000, baseIncome: 15000, description: '+1Млрд Лимит', reqBusinessStage: BusinessStage.OFFICE, icon: '🚗' },
  { id: 'laund_rest', name: 'Ресторанный Холдинг', baseCost: 100000000, baseLimit: 25000000000, baseIncome: 250000, description: '+25Млрд Лимит', reqBusinessStage: BusinessStage.OFFICE, icon: '🍝' },
  { id: 'laund_const', name: 'Девелоперская компания', baseCost: 2000000000, baseLimit: 10000000000000, baseIncome: 5000000, description: '+10Трлн Лимит', reqBusinessStage: BusinessStage.NETWORK, icon: '🏗️' },
];

export const PROPERTIES: PropertyItem[] = [
  { id: 'prop_coffee', name: 'Кофе', baseCost: 150, reputationBonus: 1, description: '+1 Реп', image: '☕' },
  { id: 'prop_iphone', name: 'Айфон 15 Pro', baseCost: 3500, reputationBonus: 20, description: '+20 Реп', image: '📱' },
  { id: 'prop_macbook', name: 'MacBook M3 Max', baseCost: 14000, reputationBonus: 100, description: '+100 Реп', image: '💻' },
  { id: 'prop_rolex', name: 'Rolex Daytona', baseCost: 90000, reputationBonus: 500, description: '+500 Реп', image: '⌚' },
  { id: 'prop_tesla', name: 'Tesla Plaid', baseCost: 450000, reputationBonus: 2000, description: '+2K Реп', image: '🚗' },
  { id: 'prop_apt', name: 'Пентхаус в Дубае', baseCost: 9000000, reputationBonus: 15000, description: '+15K Реп', image: '🏢' },
  { id: 'prop_yacht', name: 'Яхта 50м', baseCost: 90000000, reputationBonus: 100000, description: '+100K Реп', image: '🛥️' },
  { id: 'prop_island', name: 'Личный Остров', baseCost: 1800000000, reputationBonus: 2000000, description: '+2М Реп', image: '🏝️' },
];

export const MARKET_ITEMS: UpgradeItem[] = [
  // RENTAL buffs (tap is intentionally weak now)
  { id: 'tool_vpn', name: 'Приватный VPN', type: UpgradeType.RENTAL, vertical: VerticalType.TRAFFIC, baseCost: 50, baseProfit: 5, level: 0, description: '+5 Тап' },

  // TRAFFIC (main source of scaling)
  { id: 'tool_spam_soft', name: 'AI Спамер', type: UpgradeType.TRAFFIC, vertical: VerticalType.TRAFFIC, baseCost: 1000, baseProfit: 0.12, level: 0, description: '+12% Трафик/доход' },
  { id: 'traf_channels', name: 'Сетка Каналов', type: UpgradeType.TRAFFIC, vertical: VerticalType.TRAFFIC, baseCost: 15000, baseProfit: 0.25, level: 0, description: '+25% Доход' },
  { id: 'traf_influencers', name: 'Биржа Блогеров', type: UpgradeType.TRAFFIC, vertical: VerticalType.TRAFFIC, baseCost: 80000, baseProfit: 1.5, level: 0, description: '+150% Доход' },

  // SOFTWARE (10 items: from cheap to expensive)
  { id: 'soft_dating', name: 'Дейтинг Бот', type: UpgradeType.SOFTWARE, vertical: VerticalType.DATING, baseCost: 500, baseProfit: 15, level: 0, description: 'Базовый софт.', tierNames: ['Бот v1', 'Сайт v2', 'Платформа'] },
  { id: 'soft_caller', name: 'Колл-скрипты', type: UpgradeType.SOFTWARE, vertical: VerticalType.DATING, baseCost: 1200, baseProfit: 60, level: 0, description: 'Скрипты + тренинг для воркеров.', tierNames: ['Скрипты', 'CRM', 'Автоворонка'] },
  { id: 'soft_antifraud', name: 'Антифрод-обход', type: UpgradeType.SOFTWARE, vertical: VerticalType.SHOP, baseCost: 6500, baseProfit: 240, level: 0, description: 'Прокладки и обходы проверок.', tierNames: ['Прокладки', 'Фингерпринт', 'Ферма'] },
  { id: 'soft_shop', name: 'Шоп-витрина', type: UpgradeType.SOFTWARE, vertical: VerticalType.SHOP, baseCost: 22000, baseProfit: 850, level: 0, description: 'Ленд + корзина + прием.', tierNames: ['Ленд', 'Витрина', 'Сеть'] },
  { id: 'soft_sms', name: 'SMS/Email шлюз', type: UpgradeType.SOFTWARE, vertical: VerticalType.DATING, baseCost: 45000, baseProfit: 2800, level: 0, description: 'Массовая рассылка и доставляемость.', tierNames: ['Шлюз', 'Пулы', 'Инфраструктура'] },
  { id: 'soft_escrow', name: 'Фейк-эскроу', type: UpgradeType.SOFTWARE, vertical: VerticalType.TRADE, baseCost: 95000, baseProfit: 9000, level: 0, description: 'Псевдо-сервисы и доверие.', tierNames: ['Ленд', 'Кабинет', 'Экосистема'] },
  { id: 'soft_drainer', name: 'Crypto Drainer', type: UpgradeType.SOFTWARE, vertical: VerticalType.TRADE, baseCost: 110000, baseProfit: 5000, level: 0, description: 'Выкачка кошельков.', tierNames: ['Скрипт', 'Обфускатор', 'Смарт-контракт'] },
  { id: 'soft_stealer', name: 'RedLine Stealer', type: UpgradeType.SOFTWARE, vertical: VerticalType.TRADE, baseCost: 180000, baseProfit: 250000, level: 0, description: 'Сбор логов.', tierNames: ['Билд', 'Панель', 'Серверная часть'] },
  { id: 'soft_banker', name: 'Banking-троян', type: UpgradeType.SOFTWARE, vertical: VerticalType.TRADE, baseCost: 12000000, baseProfit: 1400000, level: 0, description: 'Самый грязный профит.', tierNames: ['Пейлоад', 'Сеть', 'Операция'] },
  { id: 'soft_ransom', name: 'Ransom Suite', type: UpgradeType.SOFTWARE, vertical: VerticalType.TRADE, baseCost: 900000000, baseProfit: 9000000, level: 0, description: 'Максимальный риск, максимальный выхлоп.', tierNames: ['Шифратор', 'Панель', 'Картель'] },

  // SECURITY (more expensive, less "free win")
  { id: 'sec_fsb', name: 'Связи в Управлении', type: UpgradeType.SECURITY, vertical: VerticalType.SECURITY, baseCost: 10000, baseProfit: 4, level: 0, description: '-4 Риска' },
  { id: 'sec_lawyer', name: 'Звездный Адвокат', type: UpgradeType.SECURITY, vertical: VerticalType.SECURITY, baseCost: 2000000, baseProfit: 15, level: 0, description: '-15 Риска' },
  { id: 'sec_cyber', name: 'Кибер-безопасность', type: UpgradeType.SECURITY, vertical: VerticalType.SECURITY, baseCost: 250000000, baseProfit: 60, level: 0, description: '-60 Риска' },
  { id: 'dark_courier', name: 'Сеть курьеров', type: UpgradeType.BLACK_MARKET, vertical: VerticalType.DARK, baseCost: 10000, baseProfit: 250, level: 0, description: '+250/сек' },
  { id: 'dark_guns', name: 'Оружейный хаб', type: UpgradeType.BLACK_MARKET, vertical: VerticalType.DARK, baseCost: 10000000, baseProfit: 50000, level: 0, description: '+50K/сек' },
];

export const ASSETS: AssetItem[] = [
  { id: 'crypto_btc', symbol: 'BTC', name: 'Bitcoin', type: AssetType.CRYPTO, basePrice: 65000, volatility: 0.04, icon: '₿' },
  { id: 'crypto_eth', symbol: 'ETH', name: 'Ethereum', type: AssetType.CRYPTO, basePrice: 3500, volatility: 0.05, icon: 'Ξ' },
  { id: 'crypto_sol', symbol: 'SOL', name: 'Solana', type: AssetType.CRYPTO, basePrice: 150, volatility: 0.08, icon: '◎' },
  { id: 'stock_tsla', symbol: 'TSLA', name: 'Tesla', type: AssetType.STOCK, basePrice: 240, volatility: 0.03, icon: '⚡' },
  { id: 'stock_nvda', symbol: 'NVDA', name: 'Nvidia', type: AssetType.STOCK, basePrice: 120, volatility: 0.04, icon: '🟢' },
];

export const SUPPLIES_ITEMS: SupplyItem[] = [
  { id: 'sup_energy', name: 'Энергетик', description: '+XP сразу. Быстрый буст уровня.', cost: 2500, sellPrice: 1250, effectType: 'XP', effectValue: 120, icon: '🥤' },
  { id: 'sup_status', name: 'Понты', description: '+Репутация сразу. Помогает открыть должности.', cost: 8000, sellPrice: 4000, effectType: 'REPUTATION', effectValue: 80, icon: '💎' },
  { id: 'sup_lawyer', name: 'Консультация адвоката', description: 'Снижает розыск сразу.', cost: 15000, sellPrice: 7500, effectType: 'RISK_REDUCE', effectValue: 10, icon: '⚖️' },
  { id: 'sup_supplies_deal', name: 'Оптовик расходников', description: 'На время удешевляет обязательные расходники.', cost: 12000, sellPrice: 6000, effectType: 'CONSUMABLES_DISCOUNT', effectValue: 0.75, durationMs: 10 * 60 * 1000, icon: '📦' },
];

export const SCHEMES_LIST: SchemeItem[] = [
  { id: 'grey_refund', name: 'Amazon Refund', description: 'Заказ товара с последующим возвратом средств.', category: SchemeCategory.GREY, cost: 300, durationSeconds: 60, riskPercentage: 10, minProfit: 800, maxProfit: 1500, icon: '📦' },
  { id: 'grey_airdrop', name: 'Crypto Airdrop', description: 'Фарминг бесплатных токенов через мультиаккаунты.', category: SchemeCategory.GREY, cost: 2000, durationSeconds: 180, riskPercentage: 5, minProfit: 7000, maxProfit: 12000, icon: '🪂' },
  { id: 'black_goods', name: 'Закуп Стаффа', description: 'Покупка запрещенки для перепродажи. Очень опасно.', category: SchemeCategory.BLACK, cost: 25000, durationSeconds: 300, riskPercentage: 85, minProfit: 60000, maxProfit: 120000, icon: '💊' },
  { id: 'black_carding', name: 'Кардинг', description: 'Вбив чужих карт в шопы. Максимальный риск.', category: SchemeCategory.BLACK, cost: 120000, durationSeconds: 600, riskPercentage: 95, minProfit: 250000, maxProfit: 650000, icon: '💳' },
];
