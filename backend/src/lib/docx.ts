/**
 * DOCX Template Library Setup (Phase 2: T035)
 *
 * Wrapper around docx-templates for generating Serbian BZR Act documents.
 * Per spec.md:
 * - FR-034-042: 8 mandatory document sections
 * - Performance: <8s generation time for single position (Vercel Free 10s timeout)
 * - Serbian Cyrillic character support
 */

import { createReport } from 'docx-templates';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Template file path
 */
const TEMPLATE_PATH = process.env.DOCX_TEMPLATE_PATH || './templates/Akt_Procena_Rizika_Template.docx';

/**
 * Load DOCX template from filesystem
 *
 * @returns Template buffer
 * @throws Error if template file not found
 *
 * @example
 * ```ts
 * const template = await loadTemplate();
 * console.log(`Template size: ${template.length} bytes`);
 * ```
 */
export async function loadTemplate(): Promise<Buffer> {
  try {
    const templatePath = path.resolve(TEMPLATE_PATH);
    const buffer = await fs.readFile(templatePath);

    console.log(`✅ Loaded DOCX template from ${templatePath} (${buffer.length} bytes)`);
    return buffer;
  } catch (error) {
    console.error(`❌ Failed to load DOCX template from ${TEMPLATE_PATH}:`, error);
    throw new Error(`DOCX template not found at ${TEMPLATE_PATH}. Please create template per TEMPLATE_SPECIFICATION.md`);
  }
}

/**
 * Generate DOCX document from template and data
 *
 * @param data Document data with Mustache placeholders
 * @returns Generated DOCX buffer
 *
 * @example
 * ```ts
 * const data = {
 *   company: { name: 'ЈКП Зеленило', pib: '123456785' },
 *   position: { positionName: 'Рачуновођа' },
 *   risks: [{ hazardNameSr: 'Рад са екраном', ri: 60, r: 24 }],
 * };
 *
 * const docxBuffer = await generateDocumentFromTemplate(data);
 * // Save or upload to S3
 * ```
 */
export async function generateDocumentFromTemplate(data: any): Promise<Buffer> {
  const startTime = Date.now();

  try {
    // Load template
    const template = await loadTemplate();

    // Generate document using docx-templates
    const buffer = await createReport({
      template,
      data,
      cmdDelimiter: ['{{', '}}'], // Mustache syntax
      literalXmlDelimiter: '||', // For raw XML insertion if needed
      processLineBreaks: true, // Convert \n to line breaks in Word
      noSandbox: false, // Security: run in sandbox
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Document generated in ${duration}ms (${buffer.length} bytes)`);

    // Warn if generation took longer than 8s (Vercel Free timeout constraint)
    if (duration > 8000) {
      console.warn(`⚠️  Document generation took ${duration}ms (>8s). Optimize template or implement split strategy.`);
    }

    return buffer;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Document generation failed after ${duration}ms:`, error);

    // Provide helpful error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('template')) {
        throw new Error('DOCX template error: Check Mustache placeholders match data fields');
      }
      if (error.message.includes('timeout')) {
        throw new Error(`Document generation timeout (${duration}ms). Consider split strategy for multi-position documents.`);
      }
    }

    throw new Error(`Document generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate template structure without generating document
 *
 * @returns Validation result with placeholder list
 *
 * @example
 * ```ts
 * const validation = await validateTemplate();
 * console.log(`Template valid: ${validation.valid}`);
 * console.log(`Placeholders found: ${validation.placeholders.length}`);
 * ```
 */
export async function validateTemplate(): Promise<{
  valid: boolean;
  placeholders: string[];
  errors: string[];
}> {
  try {
    const template = await loadTemplate();

    // Extract text content to find Mustache placeholders
    // Note: This is a simple validation. Full validation requires docx parsing.
    const text = template.toString('utf8');
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(text)) !== null) {
      placeholders.push(match[1].trim());
    }

    const errors: string[] = [];

    // Check for required placeholders
    const requiredPlaceholders = [
      'company.name',
      'company.pib',
      'company.director',
      'company.bzrResponsiblePerson',
      'position.positionName',
      'document.generationDate',
    ];

    for (const required of requiredPlaceholders) {
      if (!placeholders.some((p) => p.includes(required))) {
        errors.push(`Missing required placeholder: {{${required}}}`);
      }
    }

    // Check for loop sections
    const loopSections = ['#risks', '#ppe', '#training', '#medical'];
    for (const section of loopSections) {
      if (!text.includes(`{{${section}}}`)) {
        console.warn(`⚠️  Loop section not found: {{${section}}} - Multi-item rendering may not work`);
      }
    }

    return {
      valid: errors.length === 0,
      placeholders: Array.from(new Set(placeholders)), // Remove duplicates
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      placeholders: [],
      errors: [`Template load error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Format Serbian date (DD.MM.YYYY format)
 *
 * @param date Date object
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatSerbianDate(new Date('2025-10-27')) // "27.10.2025"
 * ```
 */
export function formatSerbianDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Prepare document data for template rendering
 *
 * Transforms database records into template-friendly format.
 *
 * @param rawData Raw data from database
 * @returns Formatted data with Serbian date formatting
 */
export function prepareDocumentData(rawData: any): any {
  return {
    ...rawData,
    document: {
      ...rawData.document,
      generationDate: formatSerbianDate(new Date()),
      assessmentDate: rawData.document?.assessmentDate
        ? formatSerbianDate(new Date(rawData.document.assessmentDate))
        : formatSerbianDate(new Date()),
      nextRevisionDate: formatSerbianDate(
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // +1 year
      ),
    },
  };
}

export const docxService = {
  loadTemplate,
  generateDocumentFromTemplate,
  validateTemplate,
  formatSerbianDate,
  prepareDocumentData,
};
