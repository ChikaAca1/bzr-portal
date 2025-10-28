/**
 * DOCX Template Validation Utility (Phase 2: T036)
 *
 * Validates DOCX templates before deployment to catch errors early.
 * Per spec.md FR-034-042: All 8 mandatory sections must be present.
 */

import { validateTemplate as validateDocx, loadTemplate } from './docx';

/**
 * Required Mustache placeholders for BZR Act document
 */
const REQUIRED_PLACEHOLDERS = {
  // Company information (FR-036)
  company: [
    'company.name',
    'company.pib',
    'company.activityCode',
    'company.address',
    'company.director',
    'company.bzrResponsiblePerson',
  ],

  // Position information (FR-038)
  position: ['position.positionName', 'position.positionCode', 'position.department', 'position.jobDescription'],

  // Document metadata
  document: ['document.generationDate', 'document.version'],

  // Risk assessment loops (FR-039)
  loops: ['#risks', '/risks', '#ppe', '/ppe', '#training', '/training', '#medical', '/medical'],
};

/**
 * Required sections (FR-034 through FR-042)
 */
const REQUIRED_SECTIONS = [
  'АКТ О ПРОЦЕНИ РИЗИКА', // Cover page
  'УВОД', // Introduction
  'ПОДАЦИ О ПОСЛОДАВЦУ', // Employer data
  'ОРГАНИЗАЦИОНА СТРУКТУРА', // Org structure
  'СИСТЕМАТИЗАЦИЈА РАДНИХ МЕСТА', // Position systematization
  'ПРОЦЕНА РИЗИКА', // Risk assessment
  'ЗАКЉУЧАК', // Summary
  'ВЕРИФИКАЦИЈА', // Signatures
];

/**
 * Comprehensive template validation result
 */
export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  placeholders: {
    found: string[];
    missing: string[];
  };
  sections: {
    found: string[];
    missing: string[];
  };
  fileSize: number;
  estimatedGenerationTime?: number;
}

/**
 * Validate DOCX template comprehensively
 *
 * @returns Validation result with errors, warnings, and recommendations
 *
 * @example
 * ```ts
 * const result = await validateTemplateComprehensive();
 * if (!result.valid) {
 *   console.error('Template errors:', result.errors);
 *   process.exit(1);
 * }
 * console.log(`✅ Template valid with ${result.warnings.length} warnings`);
 * ```
 */
export async function validateTemplateComprehensive(): Promise<TemplateValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const foundPlaceholders: string[] = [];
  const foundSections: string[] = [];

  try {
    // Load template
    const template = await loadTemplate();
    const fileSize = template.length;

    // File size check (>5MB may cause slow generation)
    if (fileSize > 5 * 1024 * 1024) {
      warnings.push(`Template size ${Math.round(fileSize / 1024 / 1024)}MB exceeds 5MB. Consider optimizing.`);
    }

    // Extract text content
    const text = template.toString('utf8');

    // Check for required placeholders
    const allRequiredPlaceholders = [
      ...REQUIRED_PLACEHOLDERS.company,
      ...REQUIRED_PLACEHOLDERS.position,
      ...REQUIRED_PLACEHOLDERS.document,
    ];

    for (const placeholder of allRequiredPlaceholders) {
      if (text.includes(`{{${placeholder}}}`)) {
        foundPlaceholders.push(placeholder);
      } else {
        errors.push(`Missing required placeholder: {{${placeholder}}}`);
      }
    }

    // Check for loop sections
    for (const loop of REQUIRED_PLACEHOLDERS.loops) {
      if (text.includes(`{{${loop}}}`)) {
        foundPlaceholders.push(loop);
      } else {
        warnings.push(`Loop section not found: {{${loop}}} - Multi-item rendering may fail`);
      }
    }

    // Check for required sections (Serbian Cyrillic text)
    for (const section of REQUIRED_SECTIONS) {
      if (text.includes(section)) {
        foundSections.push(section);
      } else {
        errors.push(`Missing required section: "${section}" (FR-034-042 compliance)`);
      }
    }

    // Estimate generation time based on file size
    // Rule of thumb: 1MB = ~1s generation time
    const estimatedGenerationTime = Math.ceil(fileSize / (1024 * 1024)) * 1000; // ms

    if (estimatedGenerationTime > 8000) {
      warnings.push(
        `Estimated generation time ${estimatedGenerationTime}ms exceeds 8s target. Optimize template or implement split strategy.`
      );
    }

    // Check for common issues
    if (!text.includes('Arial')) {
      warnings.push('Font "Arial" not detected. Ensure Serbian Cyrillic characters render correctly.');
    }

    // Check for table structures (risk assessment table is critical)
    if (!text.includes('<w:tbl')) {
      warnings.push('No tables detected. Risk assessment table (FR-039) may be missing.');
    }

    // Validate result
    const missingPlaceholders = allRequiredPlaceholders.filter((p) => !foundPlaceholders.includes(p));
    const missingSections = REQUIRED_SECTIONS.filter((s) => !foundSections.includes(s));

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      placeholders: {
        found: foundPlaceholders,
        missing: missingPlaceholders,
      },
      sections: {
        found: foundSections,
        missing: missingSections,
      },
      fileSize,
      estimatedGenerationTime,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Template validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      placeholders: { found: [], missing: [] },
      sections: { found: [], missing: [] },
      fileSize: 0,
    };
  }
}

/**
 * CLI command for template validation
 *
 * Run: npm run validate:template
 */
export async function validateTemplateCLI(): Promise<void> {
  console.log('🔍 Validating DOCX template...\n');

  const result = await validateTemplateComprehensive();

  console.log(`File size: ${Math.round(result.fileSize / 1024)}KB`);
  if (result.estimatedGenerationTime) {
    console.log(`Estimated generation time: ${result.estimatedGenerationTime}ms\n`);
  }

  // Display sections
  console.log('📄 Sections (8 required per FR-034-042):');
  console.log(`  ✅ Found: ${result.sections.found.length}/${REQUIRED_SECTIONS.length}`);
  if (result.sections.missing.length > 0) {
    console.log(`  ❌ Missing: ${result.sections.missing.join(', ')}`);
  }

  // Display placeholders
  console.log(`\n🔖 Placeholders:`);
  console.log(`  ✅ Found: ${result.placeholders.found.length}`);
  if (result.placeholders.missing.length > 0) {
    console.log(`  ❌ Missing: ${result.placeholders.missing.join(', ')}`);
  }

  // Display errors
  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach((err) => console.log(`  - ${err}`));
  }

  // Display warnings
  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warn) => console.log(`  - ${warn}`));
  }

  // Final result
  console.log('\n' + '='.repeat(60));
  if (result.valid) {
    console.log('✅ Template validation PASSED');
    process.exit(0);
  } else {
    console.log('❌ Template validation FAILED');
    console.log('Fix errors above and re-run validation.');
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  validateTemplateCLI().catch((error) => {
    console.error('Validation error:', error);
    process.exit(1);
  });
}

export const templateValidator = {
  validateTemplateComprehensive,
  validateTemplateCLI,
};
