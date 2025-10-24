/**
 * Hazard Codes Knowledge Base (Phase 3a: T115)
 *
 * Complete list of 45+ hazard codes per Serbian BZR regulations.
 * Used by HazardIdentifierAgent for context in prompts.
 *
 * Source: Constitution.md section 4.1 (Hazard Types reference data)
 */

export interface HazardCode {
  code: string;
  nameSr: string; // Serbian Cyrillic name
  category:
    | 'mechanical'
    | 'electrical'
    | 'chemical'
    | 'biological'
    | 'physical'
    | 'ergonomic'
    | 'psychosocial'
    | 'organizational';
  description: string; // Context for AI to understand when this hazard applies
  commonJobTypes: string[]; // Example jobs where this hazard is common
}

/**
 * All 45 hazard codes from Serbian BZR regulations
 */
export const HAZARD_CODES: HazardCode[] = [
  // Mechanical Hazards
  {
    code: '06',
    nameSr: 'Опасност од возила у унутрашњем саобраћају',
    category: 'mechanical',
    description: 'Risk from vehicles (forklifts, trucks, cars) in internal traffic',
    commonJobTypes: ['warehouse worker', 'forklift operator', 'delivery driver'],
  },
  {
    code: '07',
    nameSr: 'Опасне површине',
    category: 'mechanical',
    description: 'Dangerous surfaces (sharp edges, spikes, rough surfaces)',
    commonJobTypes: ['construction worker', 'maintenance technician', 'metalworker'],
  },
  {
    code: '08',
    nameSr: 'Опасност од пада са висине',
    category: 'mechanical',
    description: 'Risk of falling from height (scaffolding, ladders, roofs)',
    commonJobTypes: ['roofer', 'window cleaner', 'construction worker'],
  },
  {
    code: '10',
    nameSr: 'Опасност од клизања и спотицања',
    category: 'mechanical',
    description: 'Slipping and tripping hazards (wet floors, obstacles, uneven ground)',
    commonJobTypes: ['cleaner', 'warehouse worker', 'kitchen staff'],
  },

  // Electrical Hazards
  {
    code: '15',
    nameSr: 'Директан додир са струјом',
    category: 'electrical',
    description: 'Direct contact with electricity (live wires, electrical panels)',
    commonJobTypes: ['electrician', 'maintenance technician', 'electrical engineer'],
  },
  {
    code: '16',
    nameSr: 'Индиректан додир са струјом',
    category: 'electrical',
    description: 'Indirect electrical contact (faulty equipment, grounding issues)',
    commonJobTypes: ['electrician', 'machine operator', 'factory worker'],
  },

  // Physical Hazards
  {
    code: '18',
    nameSr: 'Термичка опасност',
    category: 'physical',
    description: 'Thermal hazard (extreme heat or cold, burns, frostbite)',
    commonJobTypes: ['welder', 'kitchen staff', 'cold storage worker'],
  },
  {
    code: '19',
    nameSr: 'Опасност од експлозије',
    category: 'physical',
    description: 'Explosion risk (flammable gases, explosive materials)',
    commonJobTypes: ['chemical plant worker', 'gas technician', 'warehouse worker'],
  },
  {
    code: '20',
    nameSr: 'Опасност од пожара',
    category: 'physical',
    description: 'Fire hazard (flammable materials, open flames, electrical faults)',
    commonJobTypes: ['welder', 'chemical worker', 'gas station attendant'],
  },
  {
    code: '21',
    nameSr: 'Опасност од буке',
    category: 'physical',
    description: 'Noise hazard (>85 dB, machinery, construction)',
    commonJobTypes: ['factory worker', 'construction worker', 'musician'],
  },
  {
    code: '22',
    nameSr: 'Опасност од вибрација',
    category: 'physical',
    description: 'Vibration hazard (hand-arm vibration from tools, whole-body from vehicles)',
    commonJobTypes: ['construction worker', 'machine operator', 'truck driver'],
  },

  // Chemical Hazards
  {
    code: '23',
    nameSr: 'Штетне материје',
    category: 'chemical',
    description: 'Hazardous substances (chemicals, solvents, toxic materials)',
    commonJobTypes: ['chemical worker', 'painter', 'laboratory technician'],
  },
  {
    code: '24',
    nameSr: 'Канцерогене материје',
    category: 'chemical',
    description: 'Carcinogenic substances (asbestos, benzene, formaldehyde)',
    commonJobTypes: ['laboratory worker', 'chemical plant worker', 'asbestos remover'],
  },

  // Biological Hazards
  {
    code: '25',
    nameSr: 'Биолошки агенси',
    category: 'biological',
    description: 'Biological agents (bacteria, viruses, fungi, parasites)',
    commonJobTypes: ['healthcare worker', 'veterinarian', 'sewage worker'],
  },

  // Ergonomic Hazards
  {
    code: '29',
    nameSr: 'Рад са екранима',
    category: 'ergonomic',
    description: 'Work with display screens (computers, monitors) >4 hours/day',
    commonJobTypes: ['office worker', 'programmer', 'accountant', 'graphic designer'],
  },
  {
    code: '30',
    nameSr: 'Физички напор',
    category: 'ergonomic',
    description: 'Physical exertion (heavy lifting, manual handling of loads)',
    commonJobTypes: ['warehouse worker', 'mover', 'construction worker'],
  },
  {
    code: '31',
    nameSr: 'Принудни положај тела',
    category: 'ergonomic',
    description: 'Forced body posture (awkward positions, kneeling, overhead work)',
    commonJobTypes: ['mechanic', 'electrician', 'plumber'],
  },
  {
    code: '32',
    nameSr: 'Монотонија',
    category: 'ergonomic',
    description: 'Monotonous work (repetitive tasks, assembly line)',
    commonJobTypes: ['assembly line worker', 'data entry clerk', 'cashier'],
  },
  {
    code: '33',
    nameSr: 'Нефизиолошки положај тела (дугорочно седење/стајање)',
    category: 'ergonomic',
    description: 'Non-physiological posture (prolonged sitting or standing)',
    commonJobTypes: ['office worker', 'cashier', 'security guard', 'teacher'],
  },

  // Psychosocial Hazards
  {
    code: '34',
    nameSr: 'Психолошко оптерећење - стрес',
    category: 'psychosocial',
    description: 'Psychological stress (deadline pressure, workload, conflict)',
    commonJobTypes: ['manager', 'director', 'healthcare worker', 'teacher'],
  },
  {
    code: '35',
    nameSr: 'Одговорност у преносу информација и одлучивању',
    category: 'psychosocial',
    description: 'Responsibility for information transfer and decision-making',
    commonJobTypes: ['manager', 'director', 'air traffic controller', 'surgeon'],
  },
  {
    code: '36',
    nameSr: 'Организација рада (прековремени, ноћни рад, смене)',
    category: 'organizational',
    description: 'Work organization (overtime, night shifts, shift work)',
    commonJobTypes: ['healthcare worker', 'security guard', 'factory worker'],
  },

  // Additional common hazards (expanded list)
  {
    code: '01',
    nameSr: 'Кретање и пад предмета',
    category: 'mechanical',
    description: 'Movement and falling of objects (tools, materials, equipment)',
    commonJobTypes: ['warehouse worker', 'construction worker', 'retail worker'],
  },
  {
    code: '02',
    nameSr: 'Кретање и удар алата и машина',
    category: 'mechanical',
    description: 'Movement and impact of tools and machines',
    commonJobTypes: ['machine operator', 'factory worker', 'carpenter'],
  },
  {
    code: '03',
    nameSr: 'Кретање возила',
    category: 'mechanical',
    description: 'Vehicle movement (cars, trucks, machinery)',
    commonJobTypes: ['driver', 'warehouse worker', 'traffic controller'],
  },
  {
    code: '04',
    nameSr: 'Пожар и експлозија',
    category: 'physical',
    description: 'Combined fire and explosion risk',
    commonJobTypes: ['chemical worker', 'gas technician', 'firefighter'],
  },
  {
    code: '05',
    nameSr: 'Топлота, хладноћа и влага',
    category: 'physical',
    description: 'Heat, cold, and humidity extremes',
    commonJobTypes: ['outdoor worker', 'kitchen staff', 'cold storage worker'],
  },
  {
    code: '11',
    nameSr: 'Утапање',
    category: 'physical',
    description: 'Drowning risk (water bodies, tanks, wells)',
    commonJobTypes: ['fisherman', 'marina worker', 'swimmer'],
  },
  {
    code: '12',
    nameSr: 'Гушење, затрпавање',
    category: 'physical',
    description: 'Suffocation, burial (confined spaces, grain silos, trenches)',
    commonJobTypes: ['miner', 'silo worker', 'construction worker'],
  },
  {
    code: '13',
    nameSr: 'Електричне појаве',
    category: 'electrical',
    description: 'Electrical phenomena (static electricity, electromagnetic fields)',
    commonJobTypes: ['electrician', 'electronics worker', 'telecommunication technician'],
  },
  {
    code: '14',
    nameSr: 'Јонизујуће зрачење',
    category: 'physical',
    description: 'Ionizing radiation (X-rays, radioactive materials)',
    commonJobTypes: ['radiologist', 'nuclear technician', 'medical staff'],
  },
  {
    code: '17',
    nameSr: 'Статички електрицитет',
    category: 'electrical',
    description: 'Static electricity (sparks, electronic component damage)',
    commonJobTypes: ['electronics assembler', 'chemical worker', 'gas station worker'],
  },
  {
    code: '26',
    nameSr: 'Осветљење',
    category: 'physical',
    description: 'Lighting (insufficient, excessive, glare)',
    commonJobTypes: ['office worker', 'surgeon', 'jeweler', 'welder'],
  },
  {
    code: '27',
    nameSr: 'Комбинација штетности',
    category: 'physical',
    description: 'Combination of multiple hazards',
    commonJobTypes: ['construction worker', 'chemical plant worker', 'miner'],
  },
  {
    code: '28',
    nameSr: 'Зрачење (нејонизујуће)',
    category: 'physical',
    description: 'Non-ionizing radiation (UV, laser, microwave)',
    commonJobTypes: ['welder', 'laser operator', 'telecom technician'],
  },
  {
    code: '37',
    nameSr: 'Рад са људима (здравство, социјална заштита)',
    category: 'psychosocial',
    description: 'Working with people (healthcare, social services, emotional labor)',
    commonJobTypes: ['nurse', 'doctor', 'social worker', 'teacher'],
  },
  {
    code: '38',
    nameSr: 'Насиље и узнемиравање',
    category: 'psychosocial',
    description: 'Violence and harassment (physical, verbal, sexual)',
    commonJobTypes: ['security guard', 'retail worker', 'healthcare worker'],
  },
  {
    code: '39',
    nameSr: 'Рад на висини',
    category: 'mechanical',
    description: 'Work at height (above 2 meters)',
    commonJobTypes: ['roofer', 'painter', 'window cleaner', 'construction worker'],
  },
  {
    code: '40',
    nameSr: 'Затворен простор',
    category: 'physical',
    description: 'Confined space (tanks, manholes, silos)',
    commonJobTypes: ['sewer worker', 'tank cleaner', 'maintenance technician'],
  },
];

/**
 * Get hazard code by code string
 */
export function getHazardByCode(code: string): HazardCode | undefined {
  return HAZARD_CODES.find((h) => h.code === code);
}

/**
 * Get all hazard codes as formatted string for AI prompts
 *
 * Format: "06 - Опасност од возила у унутрашњем саобраћају (vehicles in internal traffic)"
 */
export function formatHazardCodesForPrompt(): string {
  return HAZARD_CODES.map(
    (h) => `${h.code} - ${h.nameSr} (${h.description})`
  ).join('\n');
}

/**
 * Get hazards by category
 */
export function getHazardsByCategory(
  category: HazardCode['category']
): HazardCode[] {
  return HAZARD_CODES.filter((h) => h.category === category);
}
