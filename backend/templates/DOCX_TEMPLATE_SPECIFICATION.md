# DOCX Template Specification: Akt o proceni rizika

**File Location**: `backend/templates/akt-procena-rizika-template.docx`

**Purpose**: Legally compliant Serbian "Act on Risk Assessment" document per Pravilnik 5/2018

## Requirements

### Font & Encoding
- **Font**: Noto Sans (with Cyrillic support)
- **Encoding**: UTF-8
- **Language**: Serbian Cyrillic (sr-Cyrl-RS)
- **Page Size**: A4
- **Margins**: 2.5cm (all sides)

### Template Engine
- Uses `docx-templates` library (Mustache syntax)
- Placeholders: `{{variable}}`
- Loops: `{{#array}}...{{/array}}`
- Conditionals: `{{#condition}}...{{/condition}}`

---

## Data Structure Available

```typescript
{
  company: {
    name: string;              // {{company.name}}
    pib: string;               // {{company.pib}}
    address: string;           // {{company.address}}
    city?: string | null;      // {{company.city}}
    activityCode: string;      // {{company.activityCode}}
    activityDescription?: string | null;
    director: string;          // {{company.director}}
    bzrResponsiblePerson: string;
    employeeCount?: string | null;
  };

  positions: Array<{           // {{#positions}}...{{/positions}}
    positionName: string;
    department?: string | null;
    totalCount: number;        // Total employees
    maleCount: number;
    femaleCount: number;
    requiredEducation?: string | null;
    requiredExperience?: string | null;
    risks: Array<{             // {{#risks}}...{{/risks}}
      hazardName: string;      // Serbian name
      hazardCategory: string;
      ei: number;              // Initial exposure
      pi: number;              // Initial probability
      fi: number;              // Initial frequency
      ri: number;              // Initial risk (ei × pi × fi)
      correctiveMeasures: string;
      e: number;               // Residual exposure
      p: number;               // Residual probability
      f: number;               // Residual frequency
      r: number;               // Residual risk (e × p × f)
      riskLevel: string;       // "низак", "средњи", "висок"
      isHighRisk: boolean;     // r > 70
    }>;
  }>;

  summary: {
    totalPositions: number;
    totalRisks: number;
    highRiskPositions: number;
    lowRiskCount: number;      // r ≤ 36
    mediumRiskCount: number;   // 36 < r ≤ 70
    highRiskCount: number;     // r > 70
  };

  metadata: {
    generatedDate: string;     // Format: "31.10.2025."
    validityPeriod: string;    // "2 године" (per Član 32)
  };
}
```

---

## Document Structure (8 Mandatory Sections)

### 1. Naslovna strana (Cover Page)

```
РЕПУБЛИКА СРБИЈА
[Logo if available]

АКТ О ПРОЦЕНИ РИЗИКА

{{company.name}}
{{company.address}}, {{company.city}}
ПИБ: {{company.pib}}

Датум израде: {{metadata.generatedDate}}
Важи до: [2 years from generated date]
```

### 2. Увод (Introduction)

**Required Content**:
- Правни основ (Legal basis):
  - Закон о безбедности и здрављу на раду (Сл. гласник РС 101/2005, 91/2015, 113/2017)
  - Правилник о начину и поступку процене ризика (Сл. гласник РС 5/2018)
- Циљ процене (Purpose of assessment)
- Метод процене (Assessment method): E×P×F формула

```
1. УВОД

Овај Акт о процени ризика израђен је у складу са:
- Законом о безбедности и здрављу на раду („Сл. гласник РС", бр. 101/2005, 91/2015 и 113/2017)
- Правилником о начину и поступку процене ризика на радном месту („Сл. гласник РС", бр. 5/2018)

Процена ризика обављена је за предузеће {{company.name}} коришћењем Е×П×Ф методологије...
```

### 3. Подаци о послодавцу (Company Data)

```
2. ПОДАЦИ О ПОСЛОДАВЦУ

Пун назив: {{company.name}}
ПИБ: {{company.pib}}
Адреса: {{company.address}}, {{company.city}}
Шифра делатности: {{company.activityCode}}
{{#company.activityDescription}}
Опис делатности: {{company.activityDescription}}
{{/company.activityDescription}}
Директор: {{company.director}}
Лице одговорно за БЗР: {{company.bzrResponsiblePerson}}
{{#company.employeeCount}}
Број запослених: {{company.employeeCount}}
{{/company.employeeCount}}
```

### 4. Организациона структура (Organizational Structure)

```
3. ОРГАНИЗАЦИОНА СТРУКТУРА

Предузеће {{company.name}} запошљава укупно {{summary.totalPositions}} радника на {{summary.totalPositions}} радних места.
```

### 5. Систематизација радних места (Position Systematization)

```
4. СИСТЕМАТИЗАЦИЈА РАДНИХ МЕСТА

{{#positions}}
4.{{@index}}. {{positionName}}
   - Организациона јединица: {{department}}
   - Број извршилаца: {{totalCount}} (М: {{maleCount}}, Ж: {{femaleCount}})
   {{#requiredEducation}}- Захтевана школска спрема: {{requiredEducation}}{{/requiredEducation}}
   {{#requiredExperience}}- Потребно искуство: {{requiredExperience}}{{/requiredExperience}}

{{/positions}}
```

### 6. Процена ризика по радним местима (Risk Assessment by Position)

**Table Format** (use Word table with borders):

```
5. ПРОЦЕНА РИЗИКА ПО РАДНИМ МЕСТИМА

{{#positions}}
5.{{@index}}. Радно место: {{positionName}}

| Опасност/Штетност | Еи | Пи | Фи | Ри | Мере | Е | П | Ф | Р | Ниво |
|-------------------|----|----|----|----|------|---|---|---|---|------|
{{#risks}}
| {{hazardName}} | {{ei}} | {{pi}} | {{fi}} | {{ri}} | {{correctiveMeasures}} | {{e}} | {{p}} | {{f}} | {{r}} | {{riskLevel}} |
{{/risks}}

Напомена: Ниво ризика - низак (≤36), средњи (37-70), висок (>70)
{{/positions}}
```

### 7. Зbirni prikaz (Summary)

```
6. ЗБОРНИ ПРИКАЗ ПРОЦЕНЕ

Укупно радних места: {{summary.totalPositions}}
Укупно процењених опасности: {{summary.totalRisks}}

Расподела ризика:
- Низак ниво (Р ≤ 36): {{summary.lowRiskCount}}
- Средњи ниво (36 < Р ≤ 70): {{summary.mediumRiskCount}}
- Висок ниво (Р > 70): {{summary.highRiskCount}}

{{#summary.highRiskPositions}}
⚠️ Радна места са високим ризиком: {{summary.highRiskPositions}}
{{/summary.highRiskPositions}}
```

### 8. Прилози (Appendices)

```
7. ПРИЛОЗИ

[Placeholder for PPE/Training/Medical Exams - Phase 4 User Stories 2-4]
```

### 9. Верификација (Verification & Signatures)

```
8. ВЕРИФИКАЦИЈА И ПОТПИСИ

Овај Акт о процени ризика верификован је и ступа на снагу даном {{metadata.generatedDate}}.

Важи {{metadata.validityPeriod}} од дана доношења.

_____________________
{{company.director}}
Директор

_____________________
{{company.bzrResponsiblePerson}}
Лице за БЗР
```

---

## Color Coding for Risk Levels

Use conditional formatting in table (if docx-templates supports):

- **Низак (Low)**: Green background (#d4edda)
- **Средњи (Medium)**: Yellow background (#fff3cd)
- **Висок (High)**: Red background (#f8d7da)

Or use text markers: ✅ (низак), ⚠️ (средњи), ❌ (висок)

---

## Creation Instructions

### Using Microsoft Word:

1. Create new document with Noto Sans font
2. Set language to Serbian (Cyrillic)
3. Type all static text in Cyrillic
4. Insert Mustache placeholders: `{{company.name}}`
5. For loops, use:
   ```
   {{#positions}}
   Content here with {{positionName}}
   {{/positions}}
   ```
6. Create tables with proper borders
7. Save as: `akt-procena-rizika-template.docx`

### Using LibreOffice Writer:

1. File → New → Text Document
2. Format → Character → Font: Noto Sans
3. Tools → Options → Language Settings → Languages → Serbian (Cyrillic)
4. Follow same placeholder syntax as Word
5. Save as: .docx format

### Testing:

Run the document service test to verify template works:
```bash
cd backend
npm test -- tests/unit/services/document.service.test.ts
```

---

## Legal References

- **Zakon o bezbednosti i zdravlju na radu**: Sl. glasnik RS 101/2005, 91/2015, 113/2017
- **Pravilnik o načinu i postupku procene rizika**: Sl. glasnik RS 5/2018, Član 32 (validity: 2 years)
- **FR-034 through FR-042**: Spec requirements for 8 mandatory sections

---

## Support

For questions about template structure, see:
- `backend/src/services/document-generator.service.ts` (data generation)
- `backend/src/services/document.service.ts` (template loading)
- `specs/main/spec.md` (legal requirements FR-034-FR-042)
