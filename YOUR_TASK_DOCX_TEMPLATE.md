# Your Task: Create DOCX Template

**Time**: 1-2 hours
**Difficulty**: Medium (copy-paste from spec)
**Blocks**: Document generation feature

---

## Quick Start

### 1. Open Template Specification
📄 **File**: `backend/templates/DOCX_TEMPLATE_SPECIFICATION.md`

This file has EVERYTHING you need:
- Exact text to copy (Serbian Cyrillic)
- All Mustache placeholders
- Table structures
- Font settings

### 2. Create Document

**Option A: Microsoft Word**
1. New document
2. Font → Noto Sans
3. Language → Serbian (Cyrillic)
4. Copy-paste sections from spec
5. Add placeholders: `{{company.name}}`, etc.
6. Save as: `backend/templates/akt-procena-rizika-template.docx`

**Option B: LibreOffice Writer**
1. New document
2. Format → Character → Noto Sans
3. Tools → Options → Languages → Serbian (Cyrillic)
4. Copy-paste sections from spec
5. Add placeholders
6. Save as .docx

### 3. Test It Works

```bash
cd bzr-portal/backend
npm test -- tests/unit/services/document.service.test.ts
```

**Expected**: All tests pass ✅

---

## The 8 Sections (Copy from Spec)

### 1️⃣ Naslovna strana (Cover)
```
РЕПУБЛИКА СРБИЈА

АКТ О ПРОЦЕНИ РИЗИКА

{{company.name}}
{{company.address}}, {{company.city}}
ПИБ: {{company.pib}}

Датум израде: {{metadata.generatedDate}}
```

### 2️⃣ Увод (Introduction)
```
1. УВОД

Овај Акт о процени ризика израђен је у складу са:
- Законом о безбедности и здрављу на раду...
```

### 3️⃣ Подаци о послодавцу (Company Data)
```
2. ПОДАЦИ О ПОСЛОДАВЦУ

Пун назив: {{company.name}}
ПИБ: {{company.pib}}
Директор: {{company.director}}
...
```

### 4️⃣-8️⃣ See Full Spec
All text is ready to copy-paste from `DOCX_TEMPLATE_SPECIFICATION.md`

---

## Important Placeholders

### Company Data
- `{{company.name}}` - Company name
- `{{company.pib}}` - Tax ID
- `{{company.address}}` - Address
- `{{company.director}}` - Director name
- `{{company.bzrResponsiblePerson}}` - BZR officer

### Loops (Important!)
```
{{#positions}}
  Радно место: {{positionName}}
  Број запослених: {{totalCount}}

  {{#risks}}
  | {{hazardName}} | {{ei}} | {{pi}} | {{fi}} | {{ri}} | ... |
  {{/risks}}
{{/positions}}
```

### Metadata
- `{{metadata.generatedDate}}` - Current date
- `{{summary.totalPositions}}` - Total positions
- `{{summary.totalRisks}}` - Total risks

---

## Critical Items

### ✅ Must Have:
- Font: Noto Sans (with Cyrillic)
- All 8 sections
- Table for risk assessment (Section 6)
- Proper Mustache syntax: `{{variable}}`
- Loop syntax: `{{#array}}...{{/array}}`

### ❌ Common Mistakes:
- Using `${variable}` instead of `{{variable}}`
- Forgetting closing tags: `{{#positions}}` needs `{{/positions}}`
- Wrong font (must support Cyrillic)
- Missing table borders in risk section

---

## File Location

**Save as**: `backend/templates/akt-procena-rizika-template.docx`

**NOT**:
- ~~akt-procena-rizika-template.doc~~ (wrong format)
- ~~Akt_Procena_Rizika_Template.docx~~ (wrong name)
- ~~templates/akt-procena-rizika-template.docx~~ (wrong path)

**Correct Path**: `bzr-portal/backend/templates/akt-procena-rizika-template.docx`

---

## Testing

### Step 1: Basic Test
```bash
cd bzr-portal/backend
npm test -- tests/unit/services/document.service.test.ts
```

### Step 2: Visual Check
If tests pass, check the generated document:
1. Run the app: `npm run dev`
2. Create a test company
3. Add a position with risks
4. Generate document
5. Download and open in Word
6. Verify all data appears correctly

---

## Help

**If template doesn't work**:
1. Check file is exactly: `backend/templates/akt-procena-rizika-template.docx`
2. Verify all placeholders use `{{}}` not `${}`
3. Check loops have closing tags
4. Test in Word: Insert → Field → MergeField to verify placeholders

**If you get stuck**:
- Full spec has examples for every section
- Tests will tell you exactly what's wrong
- I can debug once you create initial version

---

## What Happens When Done

✅ Document generation fully works
✅ Tests pass (300 → 325 passing)
✅ MVP is 100% functional
✅ Ready for production deployment

Then we merge with AI agent work and have:
- Traditional form-based document creation ✅
- AI conversational document creation ✅ (my work)
- Hybrid UX (users choose) ✅

---

## Time Estimate

- **30 min**: Copy-paste sections 1-5
- **30 min**: Create risk assessment table (section 6)
- **15 min**: Add summary + signatures (sections 7-8)
- **15 min**: Test and fix issues

**Total**: 1.5 hours realistic, 2 hours with testing

---

**Ready?** Open `DOCX_TEMPLATE_SPECIFICATION.md` and start creating! 🚀

I'll be implementing AI services in parallel. We'll merge end of week!
