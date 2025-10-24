# Legal Compliance Requirements Quality Checklist

**Purpose**: Validate requirements quality for legal compliance with Serbian BZR regulations (Zakon o bezbednosti i zdravlju na radu)

**Focus**: Legal Compliance Requirements Quality
**Depth**: Detailed (Team Review / PR Gate)
**Coverage**: All scenario classes (Primary, Exception, Recovery, Non-Functional)
**Created**: 2025-10-21
**Last Updated**: 2025-10-21

---

## Requirement Completeness - Regulatory Framework

- [ ] CHK001 - Are all referenced Serbian BZR laws explicitly cited with full legal references (Sl. glasnik RS numbers)? [Completeness, Traceability]
- [ ] CHK002 - Is Zakon 101/05, 91/15, 113/17 compliance requirement mapped to specific articles (Član) in the spec? [Traceability, Gap]
- [ ] CHK003 - Are requirements defined for all mandatory document sections per Pravilnik o preventivnim merama (Sl. glasnik RS 5/2018)? [Completeness, Spec §FR-009]
- [ ] CHK004 - Is the requirement for document structure compliance with Član 9 (Zakon o BZR) measurable and verifiable? [Measurability, Plan §Legal Compliance Gate]
- [ ] CHK005 - Are periodic document update requirements specified per legal obligations (minimum every 2 years or upon changes)? [Gap]
- [ ] CHK006 - Are requirements defined for what constitutes "legally compliant" document output? [Clarity, Spec §FR-008]
- [ ] CHK007 - Is the legal definition of "Akt o proceni rizika" explicitly referenced and requirements aligned to it? [Completeness]

## Requirement Completeness - Mandatory Document Sections

- [ ] CHK008 - Are requirements specified for all 8 mandatory document sections per constitution section 9.1? [Completeness, Spec §FR-009]
- [ ] CHK009 - Are "company info" requirements explicitly defined with all legally required fields (PIB, matični broj, activity code)? [Completeness, Spec §FR-001]
- [ ] CHK010 - Are "organizational structure" requirements complete (šema organizacije, radne jedinice)? [Completeness, Spec §FR-009]
- [ ] CHK011 - Are "position systematization" table requirements fully specified (all required columns per legal template)? [Completeness, Spec §FR-009]
- [ ] CHK012 - Are risk assessment table requirements defined to include all mandatory columns (E, P, F, Ri, corrective measures, R, responsible person)? [Completeness, Spec §FR-009]
- [ ] CHK013 - Are PPE list requirements specified to comply with EN standard referencing obligations? [Completeness, Spec §FR-010]
- [ ] CHK014 - Are training schedule requirements complete per legal training frequency mandates? [Completeness, Spec §FR-011]
- [ ] CHK015 - Are medical exam requirements aligned with legal medical examination regulations? [Completeness, Spec §FR-012]
- [ ] CHK016 - Are "verification signature" requirements defined (BZR officer, director, date, stamp)? [Gap]

## Requirement Clarity - Risk Calculation Methodology

- [ ] CHK017 - Is the E×P×F risk calculation formula explicitly and unambiguously defined? [Clarity, Spec §FR-004, §FR-005]
- [ ] CHK018 - Are the value ranges for E, P, F parameters clearly specified as integers 1-6? [Clarity, Spec §FR-004]
- [ ] CHK019 - Are the meanings of E (consequences), P (probability), F (frequency) defined with measurable criteria? [Clarity, Gap]
- [ ] CHK020 - Is the interpretation of each E value (1-6) documented (e.g., 1=neznatne povrede, 6=smrtni ishod)? [Gap]
- [ ] CHK021 - Is the interpretation of each P value (1-6) documented (e.g., 1=praktično nemoguće, 6=gotovo sigurno)? [Gap]
- [ ] CHK022 - Is the interpretation of each F value (1-6) documented (e.g., 1=retko godišnje, 6=stalno)? [Gap]
- [ ] CHK023 - Are risk level thresholds clearly defined (R ≤ 36 = low, 36 < R ≤ 70 = medium, R > 70 = high)? [Clarity, Spec §FR-019]
- [ ] CHK024 - Is the requirement that "residual risk must be lower than initial risk" (R < Ri) unambiguous? [Clarity, Spec §FR-006]
- [ ] CHK025 - Is the special handling requirement for R > 70 ("increased risk") clearly defined? [Clarity, Spec §FR-007]
- [ ] CHK026 - Are rounding rules specified if E, P, F calculations result in decimals? [Gap]

## Requirement Consistency - Risk Validation Rules

- [ ] CHK027 - Are risk validation requirements consistent across spec (§FR-006) and plan (§Data Quality Gate)? [Consistency]
- [ ] CHK028 - Do requirements for "increased risk" flagging (R > 70) align with legal definitions of "radna mesta sa povećanim rizikom"? [Consistency, Spec §FR-007]
- [ ] CHK029 - Are initial risk (Ri) and residual risk (R) calculation requirements using the same formula? [Consistency, Spec §FR-004, §FR-005]
- [ ] CHK030 - Are validation error message requirements consistent with legal terminology (Serbian Cyrillic)? [Consistency, Gap]
- [ ] CHK031 - Are requirements for "immediate action" when R > 70 consistent with legal response obligations? [Consistency, Spec §FR-007]

## Requirement Completeness - Hazard Code Standardization

- [ ] CHK032 - Are requirements defined for hazard code reference data source (based on Serbian BZR regulations)? [Completeness, Spec §FR-003]
- [ ] CHK033 - Is the complete list of standardized hazard codes (45+ codes) specified or referenced? [Completeness, Gap]
- [ ] CHK034 - Are hazard category requirements defined (mechanical, electrical, ergonomic, psychosocial, organizational)? [Completeness, Spec Key Entities]
- [ ] CHK035 - Are requirements specified for hazard code naming in Serbian (hazard_name_sr)? [Completeness, Gap]
- [ ] CHK036 - Are requirements defined for typical corrective measures per hazard type? [Gap]
- [ ] CHK037 - Is the requirement that hazard codes are immutable reference data clearly stated? [Gap]

## Requirement Clarity - Document Format & Compatibility

- [ ] CHK038 - Is "compatible with Microsoft Word 2016+" quantified with specific DOCX format version (Office Open XML)? [Clarity, Plan §Constraints]
- [ ] CHK039 - Are Serbian Cyrillic UTF-8 encoding requirements explicitly stated for all text fields? [Clarity, Plan §Constraints]
- [ ] CHK040 - Are document template formatting requirements specified (fonts, spacing, table borders)? [Gap]
- [ ] CHK041 - Are page layout requirements defined (margins, headers, footers, page numbering)? [Gap]
- [ ] CHK042 - Are table formatting requirements specified to match legal template examples? [Gap]
- [ ] CHK043 - Is the requirement for "legal template structure" defined with reference to specific template file or example? [Clarity, Spec §FR-008]

## Exception Flow Requirements - Validation Errors

- [ ] CHK044 - Are validation error requirements defined when user inputs E, P, or F outside 1-6 range? [Coverage, Edge Case]
- [ ] CHK045 - Are validation error requirements defined when R ≥ Ri (residual not lower than initial)? [Coverage, Spec Edge Cases]
- [ ] CHK046 - Are error message requirements specified to be legally clear and in Serbian Cyrillic? [Clarity, Gap]
- [ ] CHK047 - Are requirements defined for handling missing mandatory company fields (PIB, activity code)? [Coverage, Exception Flow]
- [ ] CHK048 - Are requirements specified for validation of Serbian activity code format (4-digit šifra delatnosti)? [Gap]
- [ ] CHK049 - Are requirements defined for validation of JMBG format (13 digits, checksum)? [Coverage, Gap]
- [ ] CHK050 - Are requirements specified for handling invalid EN standard format in PPE items? [Coverage, Exception Flow]

## Exception Flow Requirements - Document Generation Failures

- [ ] CHK051 - Are requirements defined for what happens when document generation fails mid-process? [Coverage, Spec Edge Cases]
- [ ] CHK052 - Are retry requirements specified for transient document generation failures? [Gap]
- [ ] CHK053 - Are requirements defined for user notification when document generation fails? [Coverage, Gap]
- [ ] CHK054 - Are requirements specified for error logging and job ID provision for support troubleshooting? [Coverage, Spec Edge Cases]
- [ ] CHK055 - Are requirements defined for handling documents exceeding expected size (>100 pages)? [Coverage, Spec Edge Cases]
- [ ] CHK056 - Are requirements specified for template rendering errors (Mustache syntax errors)? [Coverage, Gap]

## Recovery Flow Requirements - Data Integrity

- [ ] CHK057 - Are requirements defined for rolling back incomplete risk assessments if user abandons wizard? [Recovery Flow, Gap]
- [ ] CHK058 - Are soft delete requirements specified with audit trail for compliance? [Completeness, Spec §FR-015]
- [ ] CHK059 - Are requirements defined for cascade delete behavior (company → positions → risks)? [Coverage, Spec Edge Cases]
- [ ] CHK060 - Are confirmation requirements specified before deleting companies with existing positions/documents? [Coverage, Spec Edge Cases]
- [ ] CHK061 - Are requirements defined for data export (GDPR right to data portability)? [Completeness, Spec §FR-032]
- [ ] CHK062 - Are requirements specified for data deletion (GDPR right to erasure)? [Completeness, Spec §FR-032]
- [ ] CHK063 - Are requirements defined for handling concurrent edit conflicts (optimistic locking)? [Coverage, Spec Edge Cases]

## Recovery Flow Requirements - Document Lifecycle

- [ ] CHK064 - Are document storage duration requirements defined (90 days per quickstart, or indefinite)? [Gap]
- [ ] CHK065 - Are requirements specified for document retrieval after generation job completion? [Completeness, Gap]
- [ ] CHK066 - Are requirements defined for regenerating documents after data updates? [Coverage, Gap]
- [ ] CHK067 - Are document versioning requirements specified for audit trail? [Gap]
- [ ] CHK068 - Are requirements defined for purging expired documents (auto-cleanup after retention period)? [Gap]

## Non-Functional Requirements - Performance

- [ ] CHK069 - Is the "under 10 minutes" document generation requirement measurable and realistic? [Measurability, Spec §SC-001]
- [ ] CHK070 - Are API response time requirements (<200ms p95) defined for all CRUD operations? [Completeness, Plan §Performance Goals]
- [ ] CHK071 - Is the document generation time requirement (<60 seconds) specified for typical document size? [Clarity, Plan §Performance Goals]
- [ ] CHK072 - Are concurrent user requirements (100+ simultaneous users) defined with performance degradation thresholds? [Completeness, Plan §Performance Goals]
- [ ] CHK073 - Are frontend load time requirements (<3 seconds initial load) measurable? [Measurability, Plan §Performance Goals]
- [ ] CHK074 - Are requirements defined for virtual scrolling activation threshold (50+ items)? [Clarity, Spec §FR-021]
- [ ] CHK075 - Are requirements specified for handling slow document generation (progress indicators, timeouts)? [Coverage, Gap]

## Non-Functional Requirements - Security & Privacy

- [ ] CHK076 - Are JMBG encryption requirements specified with encryption standard (e.g., AES-256)? [Clarity, Spec §FR-031]
- [ ] CHK077 - Are requirements defined for key management for encrypted personal data? [Gap]
- [ ] CHK078 - Are row-level security requirements clearly specified (users can only see own company data)? [Clarity, Spec §FR-030]
- [ ] CHK079 - Are RBAC role requirements (Admin, BZR Officer, HR Manager, Viewer) completely defined with permissions? [Completeness, Spec §FR-029]
- [ ] CHK080 - Are JWT token requirements specified (expiration time, refresh token strategy)? [Gap]
- [ ] CHK081 - Are requirements defined for session timeout and forced re-authentication? [Gap]
- [ ] CHK082 - Are audit log requirements specified with retention period and logged events? [Completeness, Spec §FR-033]
- [ ] CHK083 - Are requirements defined for GDPR compliance verification and data protection impact assessment? [Gap]

## Non-Functional Requirements - Accessibility & Usability

- [ ] CHK084 - Are keyboard navigation requirements specified for multi-step wizards? [Gap]
- [ ] CHK085 - Are screen reader compatibility requirements defined for visually impaired users? [Gap]
- [ ] CHK086 - Are color contrast requirements specified for risk level indicators (green/yellow/red)? [Gap]
- [ ] CHK087 - Are requirements defined for error message accessibility (ARIA labels, screen reader announcements)? [Gap]
- [ ] CHK088 - Are requirements specified for form validation feedback (inline errors, focus management)? [Gap]

## Ambiguities & Conflicts - Terms Requiring Quantification

- [ ] CHK089 - Is "legally compliant" defined with objective verification criteria or reference to specific inspectorate checklist? [Ambiguity, Spec §SC-002]
- [ ] CHK090 - Is "increased risk requiring immediate action" quantified with specific response timeframe? [Ambiguity, Spec §FR-007]
- [ ] CHK091 - Is "gracefully handle errors" defined with specific error handling behavior? [Ambiguity, Spec §FR-027]
- [ ] CHK092 - Is "preview before download" specified with required preview fidelity (exact DOCX rendering or summary)? [Ambiguity, Spec §FR-020]
- [ ] CHK093 - Is "soft delete" clearly defined (flag vs move to archive table)? [Ambiguity, Spec §FR-015]

## Traceability & Assumptions

- [ ] CHK094 - Are requirements traceable to specific legal articles (Član) for all compliance-critical features? [Traceability]
- [ ] CHK095 - Is the assumption that "Serbian labor inspectors accept DOCX format" validated with legal references? [Assumption, Spec §FR-008]
- [ ] CHK096 - Is the assumption that "E, P, F methodology is legally accepted" validated with legal/regulatory references? [Assumption, Spec §FR-004]
- [ ] CHK097 - Are requirements defined for legal update handling when BZR laws are amended? [Gap, Future-Proofing]
- [ ] CHK098 - Is the assumption that "Pravilnik 5/2018 structure is current" validated with latest legal version? [Assumption]
- [ ] CHK099 - Are requirements specified for multi-language support if Latin script (sr-Latn-RS) is needed alongside Cyrillic? [Gap]
- [ ] CHK100 - Is a requirement & acceptance criteria ID scheme established for traceability to legal obligations? [Traceability]

---

## Summary

**Total Items**: 100
**Focus Areas**: Legal compliance, risk calculation, document structure, data protection, regulatory traceability
**Critical Gaps Identified**: ~35 items marked [Gap] require requirements definition
**Ambiguities**: ~5 terms need quantification for objective verification
**Missing Scenario Coverage**: Recovery flows, accessibility requirements, legal update handling

**Next Steps**:
1. Address all [Gap] items by adding missing requirements to spec.md
2. Clarify all [Ambiguity] items with measurable criteria
3. Validate all [Assumption] items with legal references or stakeholder confirmation
4. Ensure all requirements have traceability to legal obligations (Član references)

**Checklist Usage**:
- Review during: Requirements writing, team PR review, pre-implementation validation
- Mark items [X] when requirements pass quality check
- Track open [Gap] items as follow-up requirements tasks
- Use as release gate: All items must pass before production deployment
