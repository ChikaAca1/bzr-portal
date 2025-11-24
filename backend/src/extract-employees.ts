/**
 * Extract employee data from sistematizacija document
 * Creates structured database linking employees to positions
 */

import { readFileSync, writeFileSync } from 'fs';

interface Employee {
  id: string;
  fullName: string;
  positionNumber: string;
  positionTitle: string;
  coefficient: string;
  sector: string;
  employmentStatus: 'permanent' | 'temporary';
  employmentNotes?: string;
}

interface EmployeeDatabase {
  companyInfo: {
    name: string;
    documentType: string;
    documentNumber: string;
    lastUpdated: string;
  };
  employees: Employee[];
  totalEmployees: number;
  extractionDate: string;
}

console.log('📋 ЕКСТРАКЦИЈА ПОДАТАКА О ЗАПОСЛЕНИМА\n');
console.log('═══════════════════════════════════════════════════════\n');

const filePath = 'D:\\Users\\User\\Dropbox\\POSO\\claudecode\\bzr-portal.com\\sistematizacija sa imenima 032025.md.txt';
const content = readFileSync(filePath, 'utf-8');
const lines = content.split('\n').map(line => line.trim());

const employees: Employee[] = [];
let currentPositionNumber = '';
let currentPositionTitle = '';
let currentCoefficient = '';
let currentSector = 'Нема наведеног сектора';
let employeeCounter = 1;

// Helper function to clean employee name
function cleanName(name: string): string {
  // Remove leading numbers like "1.", "2.", etc.
  let cleaned = name.replace(/^\d+\.\s*/, '').trim();

  // Remove "Одређено време:" prefix
  cleaned = cleaned.replace(/^Одређено време:\s*/i, '').trim();

  // Remove "Замена" prefix
  cleaned = cleaned.replace(/^Замена\s*/i, '').trim();

  return cleaned;
}

// Helper function to extract employment notes
function getEmploymentNotes(line: string, nextLines: string[]): string | undefined {
  const notes: string[] = [];

  if (line.includes('Мировање стажа')) {
    const match = line.match(/Мировање\s*стажа\s*од\s*([\d.]+)/);
    if (match) {
      notes.push(`Мировање стажа од ${match[1]}`);
    }
  }

  return notes.length > 0 ? notes.join(', ') : undefined;
}

// Parse document
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Skip empty lines
  if (!line) continue;

  // Detect sector/department
  if (line.match(/^РЈ\s+[„"]/) || line.match(/^СЕКТОР/) || line.match(/^СЛУЖБА/)) {
    currentSector = line;
    continue;
  }

  // Skip header rows
  if (line.includes('НАЗИВ ПОСЛОВА') && line.includes('ПРЕЗИМЕ И ИМЕ')) {
    continue;
  }

  // Parse position row (starts with number)
  const positionMatch = line.match(/^(\d+)\s+(.+?)\s+([\d,\.]+)\s+(.+)$/);
  if (positionMatch) {
    currentPositionNumber = positionMatch[1];
    currentPositionTitle = positionMatch[2].trim();
    currentCoefficient = positionMatch[3].replace(',', '.');
    const employeesText = positionMatch[4];

    // Extract employees from this line
    const employeeNames = employeesText.split(/\d+\.\s*/).filter(n => n.trim());

    employeeNames.forEach(name => {
      const cleanedName = cleanName(name);
      if (cleanedName && cleanedName.length > 2) {
        const isTemporary = name.includes('Одређено време') ||
                           employeesText.includes('Одређено време:');

        employees.push({
          id: `EMP-${employeeCounter.toString().padStart(4, '0')}`,
          fullName: cleanedName,
          positionNumber: currentPositionNumber,
          positionTitle: currentPositionTitle,
          coefficient: currentCoefficient,
          sector: currentSector,
          employmentStatus: isTemporary ? 'temporary' : 'permanent',
          employmentNotes: getEmploymentNotes(line, lines.slice(i + 1, i + 3)),
        });

        employeeCounter++;
      }
    });

    continue;
  }

  // Parse standalone employee lines (continuation from previous position)
  if (currentPositionNumber && line.match(/^\d+\./)) {
    const employeeNames = line.split(/\d+\.\s*/).filter(n => n.trim());

    employeeNames.forEach(name => {
      const cleanedName = cleanName(name);
      if (cleanedName && cleanedName.length > 2) {
        const isTemporary = line.includes('Одређено време') ||
                           name.includes('Одређено време');

        employees.push({
          id: `EMP-${employeeCounter.toString().padStart(4, '0')}`,
          fullName: cleanedName,
          positionNumber: currentPositionNumber,
          positionTitle: currentPositionTitle,
          coefficient: currentCoefficient,
          sector: currentSector,
          employmentStatus: isTemporary ? 'temporary' : 'permanent',
          employmentNotes: getEmploymentNotes(line, lines.slice(i + 1, i + 3)),
        });

        employeeCounter++;
      }
    });
  }

  // Parse employee names that appear on separate lines without position info
  if (currentPositionNumber && line.match(/^[А-ЯЁЊЉЏЂЖЧШЋа-яёњљџђжчшћ]/)) {
    // Check if it's a name (has both first and last name)
    const nameParts = line.split(/\s+/);
    if (nameParts.length >= 2 && !line.includes('НАЗИВ') && !line.includes('РБ')) {
      const isTemporary = line.includes('Одређено време') ||
                         (i > 0 && lines[i - 1].includes('Одређено време:'));

      const cleanedName = cleanName(line);
      if (cleanedName && cleanedName.length > 2) {
        employees.push({
          id: `EMP-${employeeCounter.toString().padStart(4, '0')}`,
          fullName: cleanedName,
          positionNumber: currentPositionNumber,
          positionTitle: currentPositionTitle,
          coefficient: currentCoefficient,
          sector: currentSector,
          employmentStatus: isTemporary ? 'temporary' : 'permanent',
          employmentNotes: getEmploymentNotes(line, lines.slice(i + 1, i + 3)),
        });

        employeeCounter++;
      }
    }
  }
}

// Create final database
const employeeDatabase: EmployeeDatabase = {
  companyInfo: {
    name: 'ЈКП"ЗЕЛЕНИЛО" ПАНЧЕВО',
    documentType: 'СИСТЕМАТИЗАЦИЈА 2025',
    documentNumber: '92-308',
    lastUpdated: '01.04.2025.',
  },
  employees: employees,
  totalEmployees: employees.length,
  extractionDate: new Date().toISOString().split('T')[0],
};

// Save to file
writeFileSync(
  'D:\\Users\\User\\Dropbox\\POSO\\claudecode\\bzr-portal.com\\bzr-portal\\backend\\employees-database.json',
  JSON.stringify(employeeDatabase, null, 2),
  'utf-8'
);

console.log('✅ ЕКСТРАКЦИЈА ЗАВРШЕНА!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Укупно запослених: ${employeeDatabase.totalEmployees}\n`);

// Statistics by sector
const bySector: Record<string, number> = {};
employees.forEach(emp => {
  const sector = emp.sector || 'Остало';
  bySector[sector] = (bySector[sector] || 0) + 1;
});

console.log('📋 ПО СЕКТОРИМА:\n');
Object.keys(bySector)
  .sort((a, b) => bySector[b] - bySector[a])
  .slice(0, 10)
  .forEach(sector => {
    console.log(`   ${sector}: ${bySector[sector]} запослених`);
  });

// Statistics by employment status
const permanent = employees.filter(e => e.employmentStatus === 'permanent').length;
const temporary = employees.filter(e => e.employmentStatus === 'temporary').length;

console.log(`\n👥 ПО СТАТУСУ ЗАПОСЛЕЊА:\n`);
console.log(`   Стално запослени: ${permanent}`);
console.log(`   Одређено време: ${temporary}\n`);

// Show positions with most employees
const byPosition: Record<string, number> = {};
employees.forEach(emp => {
  const key = `${emp.positionNumber}. ${emp.positionTitle}`;
  byPosition[key] = (byPosition[key] || 0) + 1;
});

console.log('🏆 ПОЗИЦИЈЕ СА НАЈВИШЕ ЗАПОСЛЕНИХ:\n');
Object.entries(byPosition)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([position, count]) => {
    console.log(`   ${position}: ${count} запослених`);
  });

console.log('\n✨ База запослених спремна за коришћење!\n');
console.log('💾 Фајл: employees-database.json\n');
