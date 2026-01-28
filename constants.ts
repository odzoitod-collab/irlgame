
import { UpgradeItem, JobPosition, VerticalType, UpgradeType, PropertyItem, BusinessStage, LaunderingItem, TeamStrategy, AssetItem, AssetType, SchemeItem, SchemeCategory, Skill, DropItem } from './types';

export const CREATE_TEAM_COST = 50000; 
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
    requiredReputation: 10,
    costToPromote: 2500,
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
    requiredReputation: 100,
    costToPromote: 30000,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    reqPropertyId: 'prop_iphone',
    baseRisk: 3,
    description: 'Ты учишь новичков обходить антифрод. Твой статус в чате растет.',
    promotionCooldownHours: 1
  },
  {
    id: 'job_support',
    title: 'Саппорт',
    vertical: 'Техническая помощь',
    salaryPerClick: 450,
    passiveIncome: 150,
    requiredReputation: 500,
    costToPromote: 250000,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    reqPropertyId: 'prop_macbook',
    baseRisk: 6,
    description: 'Отвечаешь на тикеты и помогаешь заводить мамонтов. Нужно серьезное железо.',
    promotionCooldownHours: 2
  },
  {
    id: 'job_closer',
    title: 'Клоузер',
    vertical: 'Закрытие сделок',
    salaryPerClick: 2000,
    passiveIncome: 800,
    requiredReputation: 2500,
    costToPromote: 2000000,
    isManager: false,
    reqBusinessStage: BusinessStage.NONE,
    reqUpgradeId: 'soft_drainer',
    baseRisk: 10,
    description: 'Когда мамонт готов, приходишь ты и забираешь всё. Твой инструмент - Дрейнер.',
    promotionCooldownHours: 4
  },
  {
    id: 'job_team_lead',
    title: 'Тим Лид',
    vertical: 'Управление командой',
    salaryPerClick: 10000,
    passiveIncome: 5000,
    requiredReputation: 10000,
    costToPromote: 25000000,
    isManager: true,
    reqBusinessStage: BusinessStage.REMOTE_TEAM,
    baseRisk: 15,
    description: 'Ключевой ранг. Теперь у тебя своя тима воркеров. Начинай строить бизнес.',
    promotionCooldownHours: 8
  },
  {
    id: 'job_hr',
    title: 'HR Менеджер',
    vertical: 'Рекрутинг',
    salaryPerClick: 50000,
    passiveIncome: 25000,
    requiredReputation: 50000,
    costToPromote: 500000000,
    isManager: true,
    reqBusinessStage: BusinessStage.REMOTE_TEAM,
    reqWorkers: 10,
    baseRisk: 22,
    description: 'Ты нанимаешь лучших. Масштабируй команду, чтобы захватить рынок.',
    promotionCooldownHours: 12
  },
  {
    id: 'job_admin',
    title: 'Админ (ТС)',
    vertical: 'Владелец сети',
    salaryPerClick: 250000,
    passiveIncome: 150000,
    requiredReputation: 250000,
    costToPromote: 15000000000,
    isManager: true,
    reqBusinessStage: BusinessStage.NETWORK,
    baseRisk: 35,
    description: 'Владелец сети офисов. Твой процент со всех сделок огромен.',
    promotionCooldownHours: 24
  },
  {
    id: 'job_lord',
    title: 'Властелин Скама',
    vertical: 'Теневой Король',
    salaryPerClick: 2000000,
    passiveIncome: 1000000,
    requiredReputation: 1000000,
    costToPromote: 500000000000,
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
  { level: 2, name: 'Коворкинг', maxWorkers: 20, cost: 1000000 }, 
  { level: 3, name: 'Офис B-класс', maxWorkers: 60, cost: 50000000 }, 
  { level: 4, name: 'Офис A-класс', maxWorkers: 200, cost: 1000000000 }, 
  { level: 5, name: 'Небоскреб', maxWorkers: 2000, cost: 50000000000 }, 
];

export const TEAM_STRATEGIES = {
  [TeamStrategy.SAFE]: { name: 'Дейтинг', multiplier: 1.0, risk: 1, color: 'text-green-500' },
  [TeamStrategy.BALANCED]: { name: 'Крипто-Скам', multiplier: 4.0, risk: 15, color: 'text-blue-500' },
  [TeamStrategy.AGGRESSIVE]: { name: 'Дрейнеры', multiplier: 15.0, risk: 45, color: 'text-red-500' }
};

export const LAUNDERING_ITEMS: LaunderingItem[] = [
  { id: 'laund_fop', name: 'ФОП 3-группа', baseCost: 1000, baseLimit: 100000, baseIncome: 5, description: '+100к Лимит', reqBusinessStage: BusinessStage.NONE, icon: '📄' },
  { id: 'laund_crypto', name: 'P2P Обменник', baseCost: 50000, baseLimit: 2000000, baseIncome: 50, description: '+2М Лимит', reqBusinessStage: BusinessStage.NONE, icon: '💻' },
  { id: 'laund_shawarma', name: 'Шаурма-сеть', baseCost: 1000000, baseLimit: 50000000, baseIncome: 1000, description: '+50М Лимит', reqBusinessStage: BusinessStage.REMOTE_TEAM, icon: '🌯' },
  { id: 'laund_carwash', name: 'Мойка самообслуживания', baseCost: 25000000, baseLimit: 1000000000, baseIncome: 15000, description: '+1Млрд Лимит', reqBusinessStage: BusinessStage.OFFICE, icon: '🚗' },
  { id: 'laund_rest', name: 'Ресторанный Холдинг', baseCost: 500000000, baseLimit: 25000000000, baseIncome: 250000, description: '+25Млрд Лимит', reqBusinessStage: BusinessStage.OFFICE, icon: '🍝' },
  { id: 'laund_const', name: 'Девелоперская компания', baseCost: 10000000000, baseLimit: 10000000000000, baseIncome: 5000000, description: '+10Трлн Лимит', reqBusinessStage: BusinessStage.NETWORK, icon: '🏗️' },
];

export const PROPERTIES: PropertyItem[] = [
  { id: 'prop_coffee', name: 'Кофе', baseCost: 100, reputationBonus: 1, description: '+1 Реп', image: '☕' },
  { id: 'prop_iphone', name: 'Айфон 15 Pro', baseCost: 3000, reputationBonus: 20, description: '+20 Реп', image: '📱' },
  { id: 'prop_macbook', name: 'MacBook M3 Max', baseCost: 12000, reputationBonus: 100, description: '+100 Реп', image: '💻' },
  { id: 'prop_rolex', name: 'Rolex Daytona', baseCost: 150000, reputationBonus: 500, description: '+500 Реп', image: '⌚' },
  { id: 'prop_tesla', name: 'Tesla Plaid', baseCost: 600000, reputationBonus: 2000, description: '+2K Реп', image: '🚗' },
  { id: 'prop_apt', name: 'Пентхаус в Дубае', baseCost: 25000000, reputationBonus: 15000, description: '+15K Реп', image: '🏢' },
  { id: 'prop_yacht', name: 'Яхта 50м', baseCost: 500000000, reputationBonus: 100000, description: '+100K Реп', image: '🛥️' },
  { id: 'prop_island', name: 'Личный Остров', baseCost: 25000000000, reputationBonus: 2000000, description: '+2М Реп', image: '🏝️' },
];

export const MARKET_ITEMS: UpgradeItem[] = [
  { id: 'tool_vpn', name: 'Приватный VPN', type: UpgradeType.RENTAL, vertical: VerticalType.TRAFFIC, baseCost: 100, baseProfit: 10, level: 0, description: '+10 Тап' },
  { id: 'tool_spam_soft', name: 'AI Спамер', type: UpgradeType.RENTAL, vertical: VerticalType.DATING, baseCost: 15000, baseProfit: 150, level: 0, description: '+150 Тап' },
  { id: 'soft_dating', name: 'Дейтинг Бот', type: UpgradeType.SOFTWARE, vertical: VerticalType.DATING, baseCost: 5000, baseProfit: 15, level: 0, description: 'Базовый софт.', tierNames: ['Бот v1', 'Сайт v2', 'Платформа'] },
  { id: 'soft_drainer', name: 'Crypto Drainer', type: UpgradeType.SOFTWARE, vertical: VerticalType.TRADE, baseCost: 2000000, baseProfit: 5000, level: 0, description: 'Выкачка кошельков.', tierNames: ['Скрипт', 'Обфускатор', 'Смарт-контракт'] },
  { id: 'soft_stealer', name: 'RedLine Stealer', type: UpgradeType.SOFTWARE, vertical: VerticalType.TRADE, baseCost: 250000000, baseProfit: 250000, level: 0, description: 'Сбор логов.', tierNames: ['Билд', 'Панель', 'Серверная часть'] },
  { id: 'traf_channels', name: 'Сетка Каналов', type: UpgradeType.TRAFFIC, vertical: VerticalType.TRAFFIC, baseCost: 1000000, baseProfit: 0.1, level: 0, description: '+10% Доход' },
  { id: 'traf_influencers', name: 'Биржа Блогеров', type: UpgradeType.TRAFFIC, vertical: VerticalType.TRAFFIC, baseCost: 1000000000, baseProfit: 1.0, level: 0, description: '+100% Доход' },
  { id: 'sec_fsb', name: 'Связи в Управлении', type: UpgradeType.SECURITY, vertical: VerticalType.SECURITY, baseCost: 50000, baseProfit: 5, level: 0, description: '-5 Риска' },
  { id: 'sec_lawyer', name: 'Звездный Адвокат', type: UpgradeType.SECURITY, vertical: VerticalType.SECURITY, baseCost: 5000000, baseProfit: 20, level: 0, description: '-20 Риска' },
  { id: 'sec_cyber', name: 'Кибер-безопасность', type: UpgradeType.SECURITY, vertical: VerticalType.SECURITY, baseCost: 250000000, baseProfit: 100, level: 0, description: '-100 Риска' },
  { id: 'dark_courier', name: 'Сеть курьеров', type: UpgradeType.BLACK_MARKET, vertical: VerticalType.DARK, baseCost: 50000, baseProfit: 250, level: 0, description: '+250/сек' },
  { id: 'dark_guns', name: 'Оружейный хаб', type: UpgradeType.BLACK_MARKET, vertical: VerticalType.DARK, baseCost: 50000000, baseProfit: 50000, level: 0, description: '+50K/сек' },
];

export const ASSETS: AssetItem[] = [
  { id: 'crypto_btc', symbol: 'BTC', name: 'Bitcoin', type: AssetType.CRYPTO, basePrice: 65000, volatility: 0.04, icon: '₿' },
  { id: 'crypto_eth', symbol: 'ETH', name: 'Ethereum', type: AssetType.CRYPTO, basePrice: 3500, volatility: 0.05, icon: 'Ξ' },
  { id: 'crypto_sol', symbol: 'SOL', name: 'Solana', type: AssetType.CRYPTO, basePrice: 150, volatility: 0.08, icon: '◎' },
  { id: 'stock_tsla', symbol: 'TSLA', name: 'Tesla', type: AssetType.STOCK, basePrice: 240, volatility: 0.03, icon: '⚡' },
  { id: 'stock_nvda', symbol: 'NVDA', name: 'Nvidia', type: AssetType.STOCK, basePrice: 120, volatility: 0.04, icon: '🟢' },
];

export const SCHEMES_LIST: SchemeItem[] = [
  { id: 'grey_refund', name: 'Amazon Refund', description: 'Заказ товара с последующим возвратом средств.', category: SchemeCategory.GREY, cost: 500, durationSeconds: 600, riskPercentage: 10, minProfit: 800, maxProfit: 1500, icon: '📦' },
  { id: 'grey_airdrop', name: 'Crypto Airdrop', description: 'Фарминг бесплатных токенов через мультиаккаунты.', category: SchemeCategory.GREY, cost: 5000, durationSeconds: 1800, riskPercentage: 5, minProfit: 7000, maxProfit: 12000, icon: '🪂' },
  { id: 'black_goods', name: 'Закуп Стаффа', description: 'Покупка запрещенки для перепродажи.', category: SchemeCategory.BLACK, cost: 10000, durationSeconds: 3600, riskPercentage: 35, minProfit: 25000, maxProfit: 45000, icon: '💊' },
  { id: 'black_carding', name: 'Кардинг', description: 'Вбив чужих карт в шопы.', category: SchemeCategory.BLACK, cost: 50000, durationSeconds: 7200, riskPercentage: 50, minProfit: 150000, maxProfit: 300000, icon: '💳' },
];
