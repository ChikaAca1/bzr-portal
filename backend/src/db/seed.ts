import { db, hazardTypes } from './index';

/**
 * Seed Hazard Types (Reference Data)
 *
 * 45+ standardized hazard codes per Serbian BZR regulations.
 * Based on constitution section 9.1 and Pravilnik requirements.
 *
 * Categories:
 * - Mechanical (Mehanički)
 * - Electrical (Električni)
 * - Chemical (Hemijski)
 * - Biological (Biološki)
 * - Ergonomic (Ergonomski)
 * - Psychosocial (Psihosocijalni)
 * - Organizational (Organizacioni)
 * - Environmental (Faktor radne sredine)
 */

const hazardData = [
  // Mechanical Hazards (Mehanički opasnosti)
  {
    code: 'MECH-01',
    nameSr: 'Оштре ивице и делови',
    nameEn: 'Sharp edges and parts',
    category: 'Mechanical',
    description: 'Опасност од посекотина од оштрих ивица алата, машина или материјала',
    typicalMeasures: 'Заштитне рукавице, обука за безбедно руковање, заштита оштрих делова',
  },
  {
    code: 'MECH-02',
    nameSr: 'Покретни делови машина',
    nameEn: 'Moving machine parts',
    category: 'Mechanical',
    description: 'Ризик од повреда услед контакта са покретним деловима машина',
    typicalMeasures: 'Заштитни поклопци, блокирање приступа, LOTO процедуре',
  },
  {
    code: 'MECH-03',
    nameSr: 'Пад предмета са висине',
    nameEn: 'Falling objects',
    category: 'Mechanical',
    description: 'Опасност од повреде услед пада предмета са висине',
    typicalMeasures: 'Заштитна кацига, обезбеђивање складишних простора, безбедна организација рада',
  },
  {
    code: 'MECH-04',
    nameSr: 'Пад са висине',
    nameEn: 'Falls from height',
    category: 'Mechanical',
    description: 'Ризик од пада радника са висине изнад 2 метра',
    typicalMeasures: 'Сигурносни појас, ограде, платформе, обука за рад на висини',
  },
  {
    code: 'MECH-05',
    nameSr: 'Саобраћајне незгоде',
    nameEn: 'Traffic accidents',
    category: 'Mechanical',
    description: 'Опасност од саобраћајних незгода при вожњи службеним возилима',
    typicalMeasures: 'Обука за безбедну вожњу, одржавање возила, поштовање саобраћајних прописа',
  },
  {
    code: 'MECH-06',
    nameSr: 'Клизање, саплитање, пад на истој равни',
    nameEn: 'Slips, trips, falls on same level',
    category: 'Mechanical',
    description: 'Ризик од пада на истој равни услед клизаве површине или препрека',
    typicalMeasures: 'Противклизне подне облоге, одржавање чистоће, уклањање препрека',
  },

  // Electrical Hazards (Електрични опасности)
  {
    code: 'ELEC-01',
    nameSr: 'Електрична струја',
    nameEn: 'Electric current',
    category: 'Electrical',
    description: 'Опасност од струјног удара при раду са електричним уређајима',
    typicalMeasures: 'Изолација, уземљење, ФИД заштита, обука овлашћеног електричара',
  },
  {
    code: 'ELEC-02',
    nameSr: 'Статички електрицитет',
    nameEn: 'Static electricity',
    category: 'Electrical',
    description: 'Ризик од електростатичког пражњења',
    typicalMeasures: 'Уземљење опреме, антистатичка обућа, контрола влажности ваздуха',
  },
  {
    code: 'ELEC-03',
    nameSr: 'Кварови на електричним инсталацијама',
    nameEn: 'Electrical installation faults',
    category: 'Electrical',
    description: 'Опасност од пожара или струјног удара услед неисправне инсталације',
    typicalMeasures: 'Редовни прегледи, сервисирање од стране овлашћених лица',
  },

  // Chemical Hazards (Хемијске опасности)
  {
    code: 'CHEM-01',
    nameSr: 'Изложеност хемикалијама (удисање)',
    nameEn: 'Chemical exposure (inhalation)',
    category: 'Chemical',
    description: 'Ризик од удисања штетних хемијских супстанци',
    typicalMeasures: 'Респираторна заштита, вентилација, смањење времена изложености',
  },
  {
    code: 'CHEM-02',
    nameSr: 'Контакт коже са хемикалијама',
    nameEn: 'Skin contact with chemicals',
    category: 'Chemical',
    description: 'Опасност од контакта коже са корозивним или токсичним супстанцама',
    typicalMeasures: 'Заштитне рукавице, заштитна одећа, очни туш, хитно прање коже',
  },
  {
    code: 'CHEM-03',
    nameSr: 'Пожар и експлозија',
    nameEn: 'Fire and explosion',
    category: 'Chemical',
    description: 'Ризик од пожара/експлозије услед запаљивих материјала',
    typicalMeasures: 'Безбедно складиштење, елиминација извора паљења, апарати за гашење',
  },

  // Biological Hazards (Биолошке опасности)
  {
    code: 'BIO-01',
    nameSr: 'Изложеност биолошким агенсима',
    nameEn: 'Exposure to biological agents',
    category: 'Biological',
    description: 'Опасност од инфекција услед контакта са биолошким материјалом',
    typicalMeasures: 'Заштитне рукавице, вакцинација, хигијенски протоколи',
  },
  {
    code: 'BIO-02',
    nameSr: 'Контаминација хране/воде',
    nameEn: 'Food/water contamination',
    category: 'Biological',
    description: 'Ризик од тровања услед контаминиране хране или воде',
    typicalMeasures: 'HACCP систем, хигијенски стандарди, редовне контроле',
  },

  // Ergonomic Hazards (Ергономске опасности)
  {
    code: 'ERG-01',
    nameSr: 'Рад у принудном положају',
    nameEn: 'Awkward postures',
    category: 'Ergonomic',
    description: 'Ризик од мускулоскелетних поремећаја услед лошег положаја тела',
    typicalMeasures: 'Ергономски дизајн радног места, паузе, вежбе истезања',
  },
  {
    code: 'ERG-02',
    nameSr: 'Подизање и ношење терета',
    nameEn: 'Manual handling',
    category: 'Ergonomic',
    description: 'Опасност од повреде леђа при подизању тешких предмета',
    typicalMeasures: 'Механизација, обука за правилно подизање, ограничење тежине',
  },
  {
    code: 'ERG-03',
    nameSr: 'Понављајући покрети',
    nameEn: 'Repetitive movements',
    category: 'Ergonomic',
    description: 'Ризик од RSI (синдром поновљеног напрезања)',
    typicalMeasures: 'Ротација послова, паузе, ергономски алати',
  },
  {
    code: 'ERG-04',
    nameSr: 'Рад на компјутеру (VDT)',
    nameEn: 'Computer work (VDT)',
    category: 'Ergonomic',
    description: 'Напрезање вида и мишића услед дуготрајног рада на екрану',
    typicalMeasures: 'Ергономска столица, паузе сваких 50 минута, правилна осветљеност',
  },
  {
    code: 'ERG-05',
    nameSr: 'Статички рад (дуготрајно стајање)',
    nameEn: 'Prolonged standing',
    category: 'Ergonomic',
    description: 'Оптерећење ногу и кичме услед дуготрајног стајања',
    typicalMeasures: 'Антифатигуе постеље, могућност седења, ротација послова',
  },

  // Psychosocial Hazards (Психосоцијалне опасности)
  {
    code: 'PSY-01',
    nameSr: 'Радни стрес',
    nameEn: 'Work-related stress',
    category: 'Psychosocial',
    description: 'Психолошко оптерећење услед високих захтева и рокова',
    typicalMeasures: 'Одговарајући распоред рада, психолошка подршка, јасна комуникација',
  },
  {
    code: 'PSY-02',
    nameSr: 'Насиље и узнемиравање на раду',
    nameEn: 'Violence and harassment',
    category: 'Psychosocial',
    description: 'Опасност од вербалног или физичког насиља',
    typicalMeasures: 'Политика нулте толеранције, обука запослених, процедуре пријављивања',
  },
  {
    code: 'PSY-03',
    nameSr: 'Монотонија рада',
    nameEn: 'Work monotony',
    category: 'Psychosocial',
    description: 'Ментална исцрпљеност услед понављајућих једноличних задатака',
    typicalMeasures: 'Обогаћивање посла, ротација, могућност паузе',
  },
  {
    code: 'PSY-04',
    nameSr: 'Рад у изолацији',
    nameEn: 'Isolated work',
    category: 'Psychosocial',
    description: 'Психичко оптерећење услед рада у изолацији',
    typicalMeasures: 'Системи комуникације, редовне провере, радио веза',
  },

  // Organizational Hazards (Организационе опасности)
  {
    code: 'ORG-01',
    nameSr: 'Недовољна обука',
    nameEn: 'Inadequate training',
    category: 'Organizational',
    description: 'Опасност од незгоде услед недостатка обуке',
    typicalMeasures: 'Обавезна обука пре почетка рада, редовна рефрешер обука',
  },
  {
    code: 'ORG-02',
    nameSr: 'Недостатак надзора',
    nameEn: 'Lack of supervision',
    category: 'Organizational',
    description: 'Ризик од неправилног извршавања послова',
    typicalMeasures: 'Дефинисање одговорности, редовни надзор, процедуре извештавања',
  },
  {
    code: 'ORG-03',
    nameSr: 'Прековремени рад',
    nameEn: 'Overtime work',
    category: 'Organizational',
    description: 'Повећана стопа грешака и незгода услед преморености',
    typicalMeasures: 'Ограничење прековременог рада, одговарајући одмори између смена',
  },
  {
    code: 'ORG-04',
    nameSr: 'Ноћни рад',
    nameEn: 'Night shift work',
    category: 'Organizational',
    description: 'Опасност од умора и поремећаја биоритма',
    typicalMeasures: 'Ротација смена, здравствени прегледи, додатне паузе',
  },

  // Environmental Factors (Фактори радне средине)
  {
    code: 'ENV-01',
    nameSr: 'Бука',
    nameEn: 'Noise',
    category: 'Environmental',
    description: 'Изложеност штетним нивоима буке (>85 dB)',
    typicalMeasures: 'Заштитници слуха, редукција буке на извору, ограничење времена изложености',
  },
  {
    code: 'ENV-02',
    nameSr: 'Недовољна осветљеност',
    nameEn: 'Poor lighting',
    category: 'Environmental',
    description: 'Напрезање вида услед неадекватне осветљености',
    typicalMeasures: 'Адекватно осветљење према стандарду (минимум 500 lux за канцеларијски рад)',
  },
  {
    code: 'ENV-03',
    nameSr: 'Вибрације',
    nameEn: 'Vibrations',
    category: 'Environmental',
    description: 'Изложеност механичким вибрацијама алата или возила',
    typicalMeasures: 'Антивибрационе рукавице, ограничење времена изложености, редовно одржавање',
  },
  {
    code: 'ENV-04',
    nameSr: 'Екстремне температуре (топлота)',
    nameEn: 'Extreme temperatures (heat)',
    category: 'Environmental',
    description: 'Ризик од топлотног удара при раду на високим температурама',
    typicalMeasures: 'Климатизација, хидратација, паузе у хладу, одговарајућа одећа',
  },
  {
    code: 'ENV-05',
    nameSr: 'Екстремне температуре (хладноћа)',
    nameEn: 'Extreme temperatures (cold)',
    category: 'Environmental',
    description: 'Опасност од хипотермије при раду на ниским температурама',
    typicalMeasures: 'Топла заштитна одећа, грејање, топли напици, ограничено време изложености',
  },
  {
    code: 'ENV-06',
    nameSr: 'Нејонизујуће зрачење',
    nameEn: 'Non-ionizing radiation',
    category: 'Environmental',
    description: 'Изложеност УВ, ИР или ЕМ зрачењу',
    typicalMeasures: 'Заштитне наочаре, заштитни екрани, ограничење изложености',
  },
  {
    code: 'ENV-07',
    nameSr: 'Јонизујуће зрачење',
    nameEn: 'Ionizing radiation',
    category: 'Environmental',
    description: 'Изложеност Х-зрацима или радиоактивним материјама',
    typicalMeasures: 'Оловна заштита, дозиметри, строго поштовање протокола, минимизација изложености',
  },
  {
    code: 'ENV-08',
    nameSr: 'Неадекватна вентилација',
    nameEn: 'Poor ventilation',
    category: 'Environmental',
    description: 'Ризик од недостатка кисеоника или акумулације загађујућих материја',
    typicalMeasures: 'Принудна вентилација, мерење квалитета ваздуха, респиратори',
  },
  {
    code: 'ENV-09',
    nameSr: 'Влажност ваздуха',
    nameEn: 'Air humidity',
    category: 'Environmental',
    description: 'Дискомфор или здравствени проблеми услед неодговарајуће влажности',
    typicalMeasures: 'Контрола влажности (оптимално 40-60%), овлаживачи/одвлаживачи',
  },

  // Additional Specific Hazards
  {
    code: 'SPEC-01',
    nameSr: 'Рад у затвореном простору',
    nameEn: 'Confined space work',
    category: 'Environmental',
    description: 'Опасност од гушења, пожара или токсичних гасова у затвореном простору',
    typicalMeasures: 'Дозвола за рад, мерење атмосфере, вентилација, спасилачка опрема',
  },
  {
    code: 'SPEC-02',
    nameSr: 'Рад под притиском',
    nameEn: 'Pressurized work',
    category: 'Mechanical',
    description: 'Ризик од експлозије или повреде при раду са посудама под притиском',
    typicalMeasures: 'Редовни прегледи судова, сигурносни вентили, обука оператера',
  },
  {
    code: 'SPEC-03',
    nameSr: 'Рад на висини изнад 5 метара',
    nameEn: 'Work at height over 5m',
    category: 'Mechanical',
    description: 'Екстремна опасност од пада са велике висине',
    typicalMeasures: 'Двоструки сигурносни систем, специјализована обука, спасилачки план',
  },
  {
    code: 'SPEC-04',
    nameSr: 'Руковање средствима рада са високим ризиком',
    nameEn: 'High-risk equipment operation',
    category: 'Mechanical',
    description: 'Рад са кранovima, виљушкарима, дизалицама',
    typicalMeasures: 'Овлашћење за управљање, редовни прегледи, дневна провера исправности',
  },
];

async function seed() {
  console.log('🌱 Seeding hazard types...');

  try {
    for (const hazard of hazardData) {
      await db.insert(hazardTypes).values(hazard).onConflictDoNothing();
    }

    console.log(`✅ Successfully seeded ${hazardData.length} hazard types`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
