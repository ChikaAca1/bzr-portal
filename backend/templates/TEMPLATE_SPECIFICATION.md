# Akt o Proceni Rizika - DOCX Template Specification

This document provides detailed instructions for creating the `Akt_Procena_Rizika_Template.docx` template file using Microsoft Word.

## Overview

The template uses **Mustache syntax** (`{{variable}}`) for dynamic content injection via the `docx-templates` library. The document must be created in **Microsoft Word** and saved as `.docx` format.

## Font and Formatting Requirements

- **Font**: Arial or Times New Roman (both support Serbian Cyrillic characters)
- **Size**: 11-12pt for body text, 14-16pt for headings
- **Margins**: 2cm on all sides (top, bottom, left, right)
- **Line spacing**: 1.15 or 1.5
- **Language**: Serbian (Cyrillic script)

## Document Structure

The document must contain the following 8 mandatory sections per Serbian BZR regulations:

---

### 1. NASLOV (Title Page)

```
АКТ О ПРОЦЕНИ РИЗИКА

Радно место: {{position.positionName}}

Предузеће: {{company.name}}
ПИБ: {{company.pib}}
Матични број: {{company.registrationNumber}}

Датум израде: {{generatedDate}}
```

**Formatting**:
- Title "АКТ О ПРОЦЕНИ РИЗИКА" - Bold, 16pt, centered
- Other fields - 12pt, left-aligned

---

### 2. ОПШТИ ПОДАЦИ О ПОСЛОДАВЦУ (General Company Information)

```
I. ОПШТИ ПОДАЦИ О ПОСЛОДАВЦУ

Назив предузећа: {{company.name}}
ПИБ: {{company.pib}}
Матични број: {{company.registrationNumber}}
Адреса седишта: {{company.address}}
Шифра делатности: {{company.activityCode}}
Број запослених: {{company.employeeCount}}

Директор: {{company.director}}
Лице задужено за безбедност и здравље на раду: {{company.bzrResponsiblePerson}}
```

**Formatting**:
- Section heading - Bold, 14pt
- Labels (e.g., "Назив предузећа:") - Bold, 12pt
- Values (Mustache variables) - Regular, 12pt

---

### 3. ПОДАЦИ О РАДНОМ МЕСТУ (Work Position Details)

```
II. ПОДАЦИ О РАДНОМ МЕСТУ

Назив радног места: {{position.positionName}}
Шифра радног места: {{position.positionCode}}

Број запослених:
- Укупно: {{position.totalCount}}
- Мушкараца: {{position.maleCount}}
- Жена: {{position.femaleCount}}

Опис послова:
{{position.jobDescription}}

Потребна стручна спрема: {{position.requiredEducation}}
Радно искуство: {{position.requiredExperience}}
Посебне обуке: {{position.specialTraining}}

Број радних сати недељно: {{position.weeklyWorkHours}}
```

**Formatting**:
- Section heading - Bold, 14pt
- Subsection labels - Bold, 12pt
- Values - Regular, 12pt
- Job description - Italic, 12pt (can be multi-line)

---

### 4. ПРОЦЕНА РИЗИКА (Risk Assessment Table)

This is the **most critical section** containing the E×P×F risk matrix.

```
III. ПРОЦЕНА РИЗИКА

Табела процене ризика:

{{#risks}}
┌────────────────────────────────────────────────────────────────────────────────┐
│ Опасност: {{hazard.nameSr}} ({{hazard.code}})                                  │
│ Категорија: {{hazard.category}}                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ПОЧЕТНА ПРОЦЕНА (пре корективних мера):                                        │
│ • Е (Последице): {{initialE}}                                                  │
│ • П (Вероватноћа): {{initialP}}                                                │
│ • Ф (Учесталост): {{initialF}}                                                 │
│ • Ri (Почетни ризик): {{initialRi}} {{initialRiskLevel}}                       │
│                                                                                 │
│ КОРЕКТИВНЕ МЕРЕ:                                                                │
│ {{correctiveMeasures}}                                                          │
│                                                                                 │
│ РЕЗИДУАЛНА ПРОЦЕНА (након корективних мера):                                   │
│ • Е (Последице): {{residualE}}                                                 │
│ • П (Вероватноћа): {{residualP}}                                               │
│ • Ф (Учесталост): {{residualF}}                                                │
│ • R (Резидуални ризик): {{residualR}} {{residualRiskLevel}}                    │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
{{/risks}}
```

**Alternative Table Format** (if preferred):

```
| Р.Бр. | Опасност | Категорија | E | П | Ф | Ri | Корективне мере | E | П | Ф | R | Ниво ризика |
|-------|----------|------------|---|---|---|----|-----------------|---|---|---|---|-------------|
{{#risks}}
| {{rowNumber}} | {{hazard.nameSr}} | {{hazard.category}} | {{initialE}} | {{initialP}} | {{initialF}} | {{initialRi}} | {{correctiveMeasures}} | {{residualE}} | {{residualP}} | {{residualF}} | {{residualR}} | {{residualRiskLevel}} |
{{/risks}}
```

**Formatting**:
- Table borders - 1pt solid black
- Header row - Bold, 11pt, gray background (#EEEEEE)
- Data cells - Regular, 11pt
- Risk levels:
  - Низак (≤36) - Green text (#28a745)
  - Средњи (37-70) - Yellow/Orange text (#ffc107)
  - Висок (>70) - Red text (#dc3545)

**Risk Level Calculation** (done automatically by DocumentGenerator):
```javascript
Ri = E × П × Ф (initial risk)
R = E × П × Ф (residual risk)

Risk Levels:
- R ≤ 36: "Низак ризик (прихватљив)"
- R 37-70: "Средњи ризик (потребно праћење)"
- R > 70: "Висок ризик (неприхватљив)"
```

---

### 5. ЗАКЉУЧАК (Conclusion)

```
IV. ЗАКЉУЧАК

На основу спроведене процене ризика за радно место {{position.positionName}},
утврђено је следеће:

• Укупан број идентификованих опасности: {{totalHazardsCount}}
• Висок ризик (>70): {{highRiskCount}}
• Средњи ризик (37-70): {{mediumRiskCount}}
• Низак ризик (≤36): {{lowRiskCount}}

{{#hasHighRisks}}
⚠️ НАПОМЕНА: Утврђени су високи ризици који захтевају хитну интервенцију!
{{/hasHighRisks}}

Све идентификоване опасности су проценене према методологији E×П×Ф
(Последице × Вероватноћа × Учесталост) у складу са Законом о безбедности
и здрављу на раду (Сл. гласник РС, бр. 101/2005...91/2015).

За опасности са високим и средњим ризиком дефинисане су корективне мере
које је потребно спровести у предвиђеним роковима.
```

**Formatting**:
- Section heading - Bold, 14pt
- Body text - Regular, 12pt
- Warning (if high risks exist) - Bold, red text, 12pt
- Statistics - Bullet points, 11pt

---

### 6. ПОТПИСНИЦИ (Signatures)

```
V. ПОТПИСНИЦИ

Акт о процени ризика сачинили:

_____________________________
{{company.bzrResponsiblePerson}}
Лице задужено за БЗР


_____________________________
{{company.director}}
Директор предузећа


Извођач процене ризика:

_____________________________
Овлашћено лице
(Име и презиме, звање)
```

**Formatting**:
- Section heading - Bold, 14pt
- Role descriptions - Italic, 11pt
- Signature lines - 3pt underline, 12pt spacing above
- Names - Regular, 12pt

---

### 7. ДАТУМ И ПЕЧАТ (Date and Stamp)

```
VI. ДАТУМ И ПЕЧАТ

Место: _____________________

Датум: {{generatedDate}}

                                        М.П.
                                    ┌─────────┐
                                    │         │
                                    │  ПЕЧАТ  │
                                    │         │
                                    └─────────┘
```

**Formatting**:
- Section heading - Bold, 14pt
- Text - Regular, 12pt
- Stamp placeholder - Centered, light gray border

---

### 8. ПРИЛОЗИ (Attachments)

```
VII. ПРИЛОЗИ

Уз овај акт прилажу се следећа документа:

1. Листа радне опреме и заштитних средстава
2. План спровођења корективних мера
3. План обуке запослених
4. Евиденција о спроведеним здравственим прегледима

_____________________________
(Потпис одговорног лица)
```

**Formatting**:
- Section heading - Bold, 14pt
- List items - Numbered, 12pt
- Signature line - 3pt underline

---

## Mustache Variables Reference

### Company Object
```javascript
{
  name: string              // Назив предузећа
  pib: string              // ПИБ (9 digits)
  registrationNumber: string // Матични број
  address: string          // Адреса седишта
  activityCode: string     // Шифра делатности (4 digits)
  employeeCount: number    // Број запослених
  director: string         // Директор
  bzrResponsiblePerson: string // Лице задужено за БЗР
}
```

### Position Object
```javascript
{
  positionName: string     // Назив радног места
  positionCode: string     // Шифра радног места
  totalCount: number       // Укупан број запослених
  maleCount: number        // Број мушкараца
  femaleCount: number      // Број жена
  jobDescription: string   // Опис послова
  requiredEducation: string // Потребна стручна спрема
  requiredExperience: string // Радно искуство
  specialTraining: string  // Посебне обуке
  weeklyWorkHours: number  // Број радних сати недељно
}
```

### Risks Array (Loop)
```javascript
risks: [
  {
    rowNumber: number              // Редни број
    hazard: {
      code: string                 // Шифра опасности (e.g., "M.01")
      nameSr: string              // Назив опасности (Cyrillic)
      category: string            // Категорија (e.g., "Механичке")
    },
    initialE: number               // 1-6
    initialP: number               // 1-6
    initialF: number               // 1-6
    initialRi: number              // E × П × Ф
    initialRiskLevel: string       // "Низак/Средњи/Висок ризик"
    correctiveMeasures: string     // Корективне мере
    residualE: number              // 1-6
    residualP: number              // 1-6
    residualF: number              // 1-6
    residualR: number              // E × П × Ф
    residualRiskLevel: string      // "Низак/Средњи/Висок ризик"
  }
]
```

### Aggregate Statistics
```javascript
{
  generatedDate: string          // e.g., "23. октобар 2025."
  totalHazardsCount: number
  highRiskCount: number          // R > 70
  mediumRiskCount: number        // R 37-70
  lowRiskCount: number           // R ≤ 36
  hasHighRisks: boolean          // true if any R > 70
}
```

---

## Creating the Template in Microsoft Word

### Step 1: Set Up Document
1. Open Microsoft Word
2. Set page size to A4
3. Set margins to 2cm (all sides)
4. Set default font to Arial 12pt
5. Set language to Serbian (Cyrillic)

### Step 2: Insert Content
1. Copy the structured content from sections 1-8 above
2. Paste into Word document
3. Apply formatting as specified (bold, italic, sizes, colors)
4. Ensure all Mustache variables are plain text (not autocorrected)

### Step 3: Create Table (Section 4)
1. Insert Table → Insert Table
2. Choose appropriate number of columns based on format preference
3. Set borders to 1pt solid black
4. Format header row with gray background
5. Insert Mustache variables in cells
6. Apply conditional formatting for risk levels using Word's "Conditional Formatting" (or leave for DocumentGenerator to handle)

### Step 4: Test Serbian Cyrillic Characters
Ensure these characters render correctly:
- Ђ, ђ (Đ)
- Ћ, ћ (Ć)
- Љ, љ (Lj)
- Њ, њ (Nj)
- Џ, џ (Dž)
- Ж, ж (Ž)
- Ш, ш (Š)
- Ч, ч (Č)

### Step 5: Save Template
1. File → Save As
2. Save to: `backend/templates/Akt_Procena_Rizika_Template.docx`
3. Format: Word Document (*.docx)
4. Ensure compatibility with Word 2016+

---

## Validation Checklist

Before finalizing the template, verify:

- [ ] All 8 mandatory sections are present
- [ ] All Mustache variables use correct syntax `{{variable}}`
- [ ] Loop syntax is correct: `{{#array}}...{{/array}}`
- [ ] Serbian Cyrillic characters display correctly
- [ ] Font is Arial or Times New Roman
- [ ] Margins are 2cm on all sides
- [ ] Table borders are visible and properly formatted
- [ ] File is saved as .docx (not .doc or .docm)
- [ ] Template opens in Microsoft Word 2016+ without errors
- [ ] No tracked changes or comments are present
- [ ] Document is not password-protected

---

## Notes for Developers

1. **docx-templates Compatibility**: This template is designed for use with the `docx-templates` library (v4.11.3+)
2. **Mustache Syntax**: The library uses Mustache templating with custom delimiters `{{` and `}}`
3. **Loop Handling**: Arrays are iterated using `{{#array}}...{{/array}}`
4. **Conditional Rendering**: Use `{{#condition}}...{{/condition}}` for conditional sections
5. **Date Formatting**: Dates should be pre-formatted as strings before injection (e.g., "23. октобар 2025.")
6. **Risk Level Colors**: Can be applied programmatically in DocumentGenerator or via Word's conditional formatting

---

## Example Data for Testing

Use this sample data to test the template:

```json
{
  "company": {
    "name": "Привредно друштво ТЕСТ д.о.о.",
    "pib": "123456789",
    "registrationNumber": "12345678",
    "address": "Београд, Кнез Михаилова 1",
    "activityCode": "4711",
    "employeeCount": 25,
    "director": "Петар Петровић",
    "bzrResponsiblePerson": "Марија Марковић"
  },
  "position": {
    "positionName": "Магационер",
    "positionCode": "MAG-01",
    "totalCount": 5,
    "maleCount": 3,
    "femaleCount": 2,
    "jobDescription": "Пријем, складиштење и издавање робе.",
    "requiredEducation": "Средња стручна спрема",
    "requiredExperience": "Минимум 1 година",
    "specialTraining": "Обука за управљање виљушкаром",
    "weeklyWorkHours": 40
  },
  "risks": [
    {
      "rowNumber": 1,
      "hazard": {
        "code": "M.01",
        "nameSr": "Повреда оштрим предметима",
        "category": "Механичке опасности"
      },
      "initialE": 4,
      "initialP": 5,
      "initialF": 6,
      "initialRi": 120,
      "initialRiskLevel": "Висок ризик (неприхватљив)",
      "correctiveMeasures": "Набавка заштитних рукавица, обука запослених о безбедном руковању.",
      "residualE": 2,
      "residualP": 3,
      "residualF": 4,
      "residualR": 24,
      "residualRiskLevel": "Низак ризик (прихватљив)"
    }
  ],
  "generatedDate": "23. октобар 2025.",
  "totalHazardsCount": 1,
  "highRiskCount": 0,
  "mediumRiskCount": 0,
  "lowRiskCount": 1,
  "hasHighRisks": false
}
```

---

**Last Updated**: 2025-10-23
**Version**: 1.0
**Author**: BZR Portal Development Team
