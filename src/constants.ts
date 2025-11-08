import { Item, ItemType } from './types';

// Note: stackId and quantity will be added dynamically in the App component.
// The quantity here is for initial setup.
// FIX: Added parentheses around the type definition to ensure the array type `[]` applies to the entire `Omit` and intersection type.
export const INITIAL_ITEMS: (Omit<Item, 'stackId' | 'quantity'> & { quantity?: number })[] = [
  { id: 1, name: 'Железный меч', type: ItemType.WEAPON, icon: '⚔️', description: 'Простой, но надежный меч. Подходит для начинающих воинов.', damage: 5, price: 10 },
  { id: 2, name: 'Стальная броня', type: ItemType.ARMOR, icon: '🛡️', description: 'Тяжелая броня, обеспечивающая отличную защиту от физических атак.', armor: 10, price: 10 },
  { id: 3, name: 'Деревянный лук', type: ItemType.WEAPON, icon: '🏹', description: 'Простой лук для охоты и базовой самообороны.', damage: 3, price: 10 },
  { id: 4, name: 'Кожаная туника', type: ItemType.ARMOR, icon: '🎽', description: 'Легкая броня, не сковывающая движения. Идеальна для разведчиков.', armor: 4, price: 10 },
  { id: 5, name: 'Магический посох', type: ItemType.WEAPON, icon: '🪄', description: 'Посох, усиливающий магические заклинания своего владельца.', damage: 8, price: 10 },
  { id: 6, name: 'Железный шлем', type: ItemType.ARMOR, icon: '🪖', description: 'Защищает голову от прямых попаданий.', armor: 5, price: 10 },
  { id: 7, name: 'Арбалет', type: ItemType.WEAPON, icon: '🎯', description: 'Мощное оружие дальнего боя, способное пробивать легкую броню.', damage: 7, price: 10},
  { id: 8, name: 'Кольчуга', type: ItemType.ARMOR, icon: '⛓️', description: 'Гибкая металлическая броня, предлагающая хороший баланс между защитой и подвижностью.', armor: 8, price: 10 },
  { id: 9, name: 'Кинжал', type: ItemType.WEAPON, icon: '🔪', description: 'Быстрое и бесшумное оружие для скрытных атак.', damage: 4, price: 10 },
  { id: 10, name: 'Боевой топор', type: ItemType.WEAPON, icon: '🪓', description: 'Тяжелый топор, наносящий сокрушительные удары.', damage: 12, price: 10 },
  { id: 11, name: 'Латная броня', type: ItemType.ARMOR, icon: '🥋', description: 'Полный комплект металлических пластин, обеспечивающий максимальную защиту.', armor: 15, price: 10},
  { id: 12, name: 'Огненный жезл', type: ItemType.WEAPON, icon: '🔥', description: 'Позволяет метать огненные шары во врагов.', damage: 10, price: 10 },
  { id: 13, name: 'Ледяной щит', type: ItemType.ARMOR, icon: '❄️', description: 'Магический щит, который может заморозить атакующих.', armor: 7, price: 10 },
  { id: 14, name: 'Зелье здоровья', type: ItemType.MISCELLANEOUS, icon: '🧪', description: 'Восстанавливает небольшое количество здоровья.', effect: 'Лечит 25 HP', quantity: 5, price: 10 },
  { id: 15, name: 'Железная руда', type: ItemType.RESOURCE, icon: '🪨', description: 'Основной материал для ковки железного оружия и брони.', effect: 'Материал для крафта', quantity: 20, price: 10 },
  { id: 16, name: 'Чешуя дракона', type: ItemType.QUEST, icon: '🐲', description: 'Редкий и ценный ингредиент, необходимый для выполнения особого задания.', effect: 'Квестовый предмет' },
];

export const BATTLE_REWARDS_POOL: (Omit<Item, 'stackId' | 'quantity'> & { quantity?: number })[] = [
    // --- 50 Weapons ---
    // Daggers (Damage 3-8)
    { id: 101, name: 'Ржавый кинжал', type: ItemType.WEAPON, icon: '🔪', description: 'Лучше, чем ничего.', damage: 3, price: 10 },
    { id: 102, name: 'Железный стилет', type: ItemType.WEAPON, icon: '🔪', description: 'Острый и быстрый.', damage: 4, price: 10 },
    { id: 103, name: 'Орочий тесак', type: ItemType.WEAPON, icon: '🔪', description: 'Грубый, но эффективный.', damage: 5, price: 10 },
    { id: 104, name: 'Эльфийский клинок', type: ItemType.WEAPON, icon: '🔪', description: 'Изящный и смертоносный.', damage: 6, price: 10 },
    { id: 105, name: 'Кинжал ассасина', type: ItemType.WEAPON, icon: '🔪', description: 'Пропитан ядом.', damage: 7, price: 10 },
    { id: 106, name: 'Мифриловый кортик', type: ItemType.WEAPON, icon: '🔪', description: 'Легкий и невероятно прочный.', damage: 8, price: 10 },
    // Swords (Damage 5-15)
    { id: 107, name: 'Короткий меч', type: ItemType.WEAPON, icon: '⚔️', description: 'Стандартное оружие пехотинца.', damage: 5, price: 10 },
    { id: 108, name: 'Длинный меч', type: ItemType.WEAPON, icon: '⚔️', description: 'Требует сноровки.', damage: 7, price: 10 },
    { id: 109, name: 'Скимитар', type: ItemType.WEAPON, icon: '⚔️', description: 'Изогнутый клинок для рубящих ударов.', damage: 8, price: 10 },
    { id: 110, name: 'Рыцарский меч', type: ItemType.WEAPON, icon: '⚔️', description: 'Символ чести и доблести.', damage: 10, price: 10 },
    { id: 111, name: 'Клеймор', type: ItemType.WEAPON, icon: '⚔️', description: 'Двуручный меч для сокрушительных атак.', damage: 12, price: 10 },
    { id: 112, name: 'Рунический клинок', type: ItemType.WEAPON, icon: '⚔️', description: 'Светится в присутствии магии.', damage: 15, price: 10 },
    // Axes (Damage 6-18)
    { id: 113, name: 'Топорик', type: ItemType.WEAPON, icon: '🪓', description: 'Удобен в быту и в бою.', damage: 6, price: 10 },
    { id: 114, name: 'Боевой топор', type: ItemType.WEAPON, icon: '🪓', description: 'Пробивает легкую броню.', damage: 9, price: 10 },
    { id: 115, name: 'Секира', type: ItemType.WEAPON, icon: '🪓', description: 'Оружие варваров.', damage: 11, price: 10 },
    { id: 116, name: 'Гномий топор', type: ItemType.WEAPON, icon: '🪓', description: 'Идеально сбалансирован.', damage: 14, price: 10 },
    { id: 117, name: 'Поллекс', type: ItemType.WEAPON, icon: '🪓', description: 'Двуручный топор палача.', damage: 16, price: 10 },
    { id: 118, name: 'Топор Повелителя Битв', type: ItemType.WEAPON, icon: '🪓', description: 'Жаждет крови.', damage: 18, price: 10 },
    // Bows (Damage 4-14)
    { id: 119, name: 'Короткий лук', type: ItemType.WEAPON, icon: '🏹', description: 'Для быстрой стрельбы.', damage: 4, price: 10 },
    { id: 120, name: 'Длинный лук', type: ItemType.WEAPON, icon: '🏹', description: 'Бьет на большое расстояние.', damage: 6, price: 10 },
    { id: 121, name: 'Охотничий лук', type: ItemType.WEAPON, icon: '🏹', description: 'Надежный и точный.', damage: 8, price: 10 },
    { id: 122, name: 'Композитный лук', type: ItemType.WEAPON, icon: '🏹', description: 'Мощный и компактный.', damage: 10, price: 10 },
    { id: 123, name: 'Лук снайпера', type: ItemType.WEAPON, icon: '🏹', description: 'Никогда не промахивается.', damage: 12, price: 10 },
    { id: 124, name: 'Шепчущий лук', type: ItemType.WEAPON, icon: '🏹', description: 'Тетива поет песнь смерти.', damage: 14, price: 10 },
    // Staffs & Maces (Damage 4-16)
    { id: 125, name: 'Деревянная дубина', type: ItemType.WEAPON, icon: '몽', description: 'Просто и эффективно.', damage: 4, price: 10 },
    { id: 126, name: 'Булава', type: ItemType.WEAPON, icon: '🔨', description: 'Дробит кости.', damage: 7, price: 10 },
    { id: 127, name: 'Моргенштерн', type: ItemType.WEAPON, icon: '🔗', description: 'Шипастый шар на цепи.', damage: 10, price: 10 },
    { id: 128, name: 'Посох ученика', type: ItemType.WEAPON, icon: '🪄', description: 'Слабый магический заряд.', damage: 6, price: 10 },
    { id: 129, name: 'Посох адепта', type: ItemType.WEAPON, icon: '🪄', description: 'Концентрирует ману.', damage: 9, price: 10 },
    { id: 130, name: 'Посох архимага', type: ItemType.WEAPON, icon: '🪄', description: 'Источник невероятной силы.', damage: 16, price: 10 },
    // More Weapons
    { id: 131, name: 'Глефа', type: ItemType.WEAPON, icon: '🔱', description: 'Древковое оружие с длинным клинком.', damage: 11, price: 10 },
    { id: 132, name: 'Копье', type: ItemType.WEAPON, icon: '-V', description: 'Держи врага на расстоянии.', damage: 6, price: 10 },
    { id: 133, name: 'Трезубец', type: ItemType.WEAPON, icon: '🔱', description: 'Оружие морских воителей.', damage: 9, price: 10 },
    { id: 134, name: 'Боевой молот', type: ItemType.WEAPON, icon: '🔨', description: 'Сминает доспехи.', damage: 13, price: 10 },
    { id: 135, name: 'Катана', type: ItemType.WEAPON, icon: '⚔️', description: 'Клинок из далеких земель.', damage: 10, price: 10 },
    { id: 136, name: 'Ятаган', type: ItemType.WEAPON, icon: '⚔️', description: 'Изогнутый меч пустынных кочевников.', damage: 8, price: 10 },
    { id: 137, name: 'Боевые когти', type: ItemType.WEAPON, icon: '🐾', description: 'Для ближнего боя.', damage: 5, price: 10 },
    { id: 138, name: 'Цеп', type: ItemType.WEAPON, icon: '🔗', description: 'Трудно предсказать траекторию.', damage: 8, price: 10 },
    { id: 139, name: 'Тяжелый арбалет', type: ItemType.WEAPON, icon: '🎯', description: 'Пробивает даже стены.', damage: 11, price: 10 },
    { id: 140, name: 'Метательные ножи', type: ItemType.WEAPON, icon: '🔪', description: 'Набор из трех ножей.', damage: 4, price: 10 },
    { id: 141, name: 'Посох природы', type: ItemType.WEAPON, icon: '🌿', description: 'Опутывает врагов корнями.', damage: 7, price: 10 },
    { id: 142, name: 'Кристальный меч', type: ItemType.WEAPON, icon: '💎', description: 'Хрупкий, но очень острый.', damage: 17, price: 10 },
    { id: 143, name: 'Демонический клинок', type: ItemType.WEAPON, icon: '👹', description: 'Поглощает души.', damage: 19, price: 10 },
    { id: 144, name: 'Святой молот', type: ItemType.WEAPON, icon: '🔨', description: 'Изгоняет нежить.', damage: 12, price: 10 },
    { id: 145, name: 'Ледяная игла', type: ItemType.WEAPON, icon: '❄️', description: 'Замораживает прикосновением.', damage: 9, price: 10 },
    { id: 146, name: 'Огненный фальшион', type: ItemType.WEAPON, icon: '🔥', description: 'Всегда горячий на ощупь.', damage: 13, price: 10 },
    { id: 147, name: 'Шестопер', type: ItemType.WEAPON, icon: '🔨', description: 'Булава с шестью перьями.', damage: 8, price: 10 },
    { id: 148, name: 'Парные клинки', type: ItemType.WEAPON, icon: '⚔️', description: 'Удар в каждой руке.', damage: 11, price: 10 },
    { id: 149, name: 'Лук из тиса', type: ItemType.WEAPON, icon: '🏹', description: 'Гибкий и мощный.', damage: 9, price: 10 },
    { id: 150, name: 'Посох молний', type: ItemType.WEAPON, icon: '⚡', description: 'Призывает гнев небес.', damage: 15, price: 10 },
    
    // --- 50 Armors ---
    // Helms (Armor 2-8)
    { id: 151, name: 'Кожаный капюшон', type: ItemType.ARMOR, icon: '🪖', description: 'Защита от ветра и любопытных глаз.', armor: 2, price: 10 },
    { id: 152, name: 'Железный шлем', type: ItemType.ARMOR, icon: '🪖', description: 'Простая и надежная защита.', armor: 4, price: 10 },
    { id: 153, name: 'Стальной шлем', type: ItemType.ARMOR, icon: '🪖', description: 'Отлично держит удар.', armor: 6, price: 10 },
    { id: 154, name: 'Великий шлем', type: ItemType.ARMOR, icon: '🪖', description: 'Полностью закрывает голову.', armor: 7, price: 10 },
    { id: 155, name: 'Драконий шлем', type: ItemType.ARMOR, icon: '🪖', description: 'Сделан из черепа дракона.', armor: 8, price: 10 },
    // Chestplates (Armor 5-20)
    { id: 156, name: 'Стеганая куртка', type: ItemType.ARMOR, icon: '🎽', description: 'Лучше, чем ходить голым.', armor: 5, price: 10 },
    { id: 157, name: 'Кольчужная рубаха', type: ItemType.ARMOR, icon: '⛓️', description: 'Защищает от режущих ударов.', armor: 8, price: 10 },
    { id: 158, name: 'Железная кираса', type: ItemType.ARMOR, icon: '🛡️', description: 'Надежная защита торса.', armor: 12, price: 10 },
    { id: 159, name: 'Стальные латы', type: ItemType.ARMOR, icon: '🥋', description: 'Полная защита корпуса.', armor: 16, price: 10 },
    { id: 160, name: 'Адамантитовая броня', type: ItemType.ARMOR, icon: '💎', description: 'Практически нерушима.', armor: 20, price: 10 },
    // Gauntlets (Armor 1-5)
    { id: 161, name: 'Тканевые перчатки', type: ItemType.ARMOR, icon: '🧤', description: 'Для ловкости рук.', armor: 1, price: 10 },
    { id: 162, name: 'Кожаные перчатки', type: ItemType.ARMOR, icon: '🧤', description: 'Укрепляют хват.', armor: 2, price: 10 },
    { id: 163, name: 'Кольчужные рукавицы', type: ItemType.ARMOR, icon: '🧤', description: 'Защита кистей рук.', armor: 3, price: 10 },
    { id: 164, name: 'Стальные рукавицы', type: ItemType.ARMOR, icon: '🧤', description: 'Позволяют парировать удары.', armor: 4, price: 10 },
    { id: 165, name: 'Рукавицы силы', type: ItemType.ARMOR, icon: '🧤', description: 'Увеличивают силу удара.', armor: 5, price: 10 },
    // Leggings (Armor 3-12)
    { id: 166, name: 'Шерстяные штаны', type: ItemType.ARMOR, icon: '👖', description: 'Тепло и удобно.', armor: 3, price: 10 },
    { id: 167, name: 'Кожаные поножи', type: ItemType.ARMOR, icon: '👖', description: 'Защита ног.', armor: 5, price: 10 },
    { id: 168, name: 'Кольчужные поножи', type: ItemType.ARMOR, icon: '👖', description: 'Гибкая защита.', armor: 8, price: 10 },
    { id: 169, name: 'Стальные наголенники', type: ItemType.ARMOR, icon: '👖', description: 'Полная защита ног.', armor: 10, price: 10 },
    { id: 170, name: 'Поножи скорости', type: ItemType.ARMOR, icon: '👖', description: 'Позволяют двигаться быстрее.', armor: 12, price: 10 },
    // Boots (Armor 1-6)
    { id: 171, name: 'Сандалии', type: ItemType.ARMOR, icon: '👢', description: 'Для жаркой погоды.', armor: 1, price: 10 },
    { id: 172, name: 'Кожаные сапоги', type: ItemType.ARMOR, icon: '👢', description: 'Удобны для долгих походов.', armor: 2, price: 10 },
    { id: 173, name: 'Армейские ботинки', type: ItemType.ARMOR, icon: '👢', description: 'Защищают лодыжки.', armor: 4, price: 10 },
    { id: 174, name: 'Стальные сабатоны', type: ItemType.ARMOR, icon: '👢', description: 'Часть латного доспеха.', armor: 5, price: 10 },
    { id: 175, name: 'Сапоги-скороходы', type: ItemType.ARMOR, icon: '👢', description: 'Увеличивают скорость передвижения.', armor: 6, price: 10 },
    // Shields and Robes
    { id: 176, name: 'Деревянный щит', type: ItemType.ARMOR, icon: '🛡️', description: 'Блокирует слабые атаки.', armor: 3, price: 10 },
    { id: 177, name: 'Железный щит', type: ItemType.ARMOR, icon: '🛡️', description: 'Надежный спутник воина.', armor: 6, price: 10 },
    { id: 178, name: 'Башенный щит', type: ItemType.ARMOR, icon: '🛡️', description: 'Закрывает почти все тело.', armor: 10, price: 10 },
    { id: 179, name: 'Мантия ученика', type: ItemType.ARMOR, icon: '👘', description: 'Слабая магическая защита.', armor: 2, price: 10 },
    { id: 180, name: 'Мантия мага', type: ItemType.ARMOR, icon: '👘', description: 'Сопротивление стихиям.', armor: 5, price: 10 },
    // More Armor
    { id: 181, name: 'Бригантина', type: ItemType.ARMOR, icon: '🎽', description: 'Кожаная куртка с металлическими пластинами.', armor: 9, price: 10 },
    { id: 182, name: 'Чешуйчатый доспех', type: ItemType.ARMOR, icon: '⛓️', description: 'Гибкий и прочный.', armor: 11, price: 10 },
    { id: 183, name: 'Эльфийская броня', type: ItemType.ARMOR, icon: '🌿', description: 'Легкая и прочная.', armor: 13, price: 10 },
    { id: 184, name: 'Гномья броня', type: ItemType.ARMOR, icon: '🪨', description: 'Тяжелая, но невероятно крепкая.', armor: 17, price: 10 },
    { id: 185, name: 'Доспех Тени', type: ItemType.ARMOR, icon: '👤', description: 'Делает владельца невидимым в тени.', armor: 10, price: 10 },
    { id: 186, name: 'Огненная мантия', type: ItemType.ARMOR, icon: '🔥', description: 'Защищает от огня.', armor: 6, price: 10 },
    { id: 187, name: 'Ледяная мантия', type: ItemType.ARMOR, icon: '❄️', description: 'Защищает от холода.', armor: 6, price: 10 },
    { id: 188, name: 'Зеркальный щит', type: ItemType.ARMOR, icon: '🪞', description: 'Отражает заклинания.', armor: 8, price: 10 },
    { id: 189, name: 'Шлем прозрения', type: ItemType.ARMOR, icon: '🧠', description: 'Повышает интеллект.', armor: 4, price: 10 },
    { id: 190, name: 'Наручи берсерка', type: ItemType.ARMOR, icon: '💪', description: 'Чем меньше здоровья, тем больше урон.', armor: 3, price: 10 },
    { id: 191, name: 'Сапоги левитации', type: ItemType.ARMOR, icon: '🕊️', description: 'Позволяют парить над землей.', armor: 2, price: 10 },
    { id: 192, name: 'Плащ-невидимка', type: ItemType.ARMOR, icon: '👻', description: 'Скрывает от врагов.', armor: 1, price: 10 },
    { id: 193, name: 'Корона короля', type: ItemType.ARMOR, icon: '👑', description: 'Символ власти.', armor: 5, price: 10 },
    { id: 194, name: 'Броня из костей', type: ItemType.ARMOR, icon: '🦴', description: 'Внушает ужас.', armor: 14, price: 10 },
    { id: 195, name: 'Доспех паладина', type: ItemType.ARMOR, icon: '🌟', description: 'Сияет святым светом.', armor: 18, price: 10 },
    { id: 196, name: 'Маска чумы', type: ItemType.ARMOR, icon: '💀', description: 'Защищает от ядов и болезней.', armor: 3, price: 10 },
    { id: 197, name: 'Наплечники титана', type: ItemType.ARMOR, icon: '🪨', description: 'Невероятно тяжелые.', armor: 9, price: 10 },
    { id: 198, name: 'Щит из чешуи дракона', type: ItemType.ARMOR, icon: '🐲', description: 'Не горит в огне.', armor: 11, price: 10 },
    { id: 199, name: 'Одеяние архилича', type: ItemType.ARMOR, icon: '💀', description: 'Пропитано темной магией.', armor: 7, price: 10 },
    { id: 200, name: 'Броня падшего ангела', type: ItemType.ARMOR, icon: '🕊️', description: 'Дарует и защищает.', armor: 22, price: 10 },
    
    // Healing Items
    { id: 201, name: 'Травяной порошок', type: ItemType.MISCELLANEOUS, icon: '🌿', description: 'Порошок из целебных трав. Восстанавливает 2 HP всем членам отряда.', effect: 'Лечит 2 HP (отряд)', price: 25, use: 'HEAL_SQUAD_2', quantity: 1 },
    { id: 202, name: 'Лечебная мазь', type: ItemType.MISCELLANEOUS, icon: '🩹', description: 'Густая мазь с сильным запахом. Восстанавливает 5 HP всем членам отряда.', effect: 'Лечит 5 HP (отряд)', price: 60, use: 'HEAL_SQUAD_5', quantity: 1 },
    { id: 203, name: 'Аптечка первой помощи', type: ItemType.MISCELLANEOUS, icon: '⛑️', description: 'Набор для экстренной помощи. Восстанавливает 10 HP всем членам отряда.', effect: 'Лечит 10 HP (отряд)', price: 120, use: 'HEAL_SQUAD_10', quantity: 1 },
    { id: 204, name: 'Стимулятор \'Возрождение\'', type: ItemType.MISCELLANEOUS, icon: '💉', description: 'Военный стимулятор. Восстанавливает 20 HP всем членам отряда.', effect: 'Лечит 20 HP (отряд)', price: 250, use: 'HEAL_SQUAD_20', quantity: 1 },
    
    // Main Quest Item
    { id: 301, name: 'Водный чип', type: ItemType.QUEST, icon: '💧', description: 'Сложное устройство для очистки воды. Жизненно важно для выживания Оазиса.', effect: 'Квестовый предмет' },
];

export const QUEST_ITEM_POOL_IDS = [
    101, // Ржавый кинжал
    107, // Короткий меч
    113, // Топорик
    119, // Короткий лук
    151, // Кожаный капюшон
    156, // Стеганая куртка
    201, // Травяной порошок
    15,  // Железная руда
];

export const MAX_LEVEL = 30;
export const XP_PER_LEVEL = 1000;
export const MAP_WIDTH = 200;
export const MAP_HEIGHT = 200;

export const CITIES = [
    { id: 'oasis', name: 'Оазис', position: { x: 150, y: 50 }, merchantName: 'Хасан', color: '#4ade80' },
    { id: 'trash_city', name: 'Город-Свалка', position: { x: 50, y: 170 }, merchantName: 'Ржавый Пит', color: '#f59e0b' },
    { id: 'fountain', name: 'Фонтан', position: { x: 30, y: 40 }, merchantName: 'Аква', color: '#38bdf8' },
];