import { db } from './src/db/index.js';
import { uploadedDocuments } from './src/db/schema/uploaded-documents.js';
import { workPositions } from './src/db/schema/work-positions.js';
import { workers } from './src/db/schema/workers.js';

async function checkDatabase() {
  console.log('\n=== UPLOADED DOCUMENTS ===');
  const docs = await db.select().from(uploadedDocuments);
  console.log('Total documents:', docs.length);
  docs.forEach(doc => {
    console.log(`\nID: ${doc.id}`);
    console.log(`  Filename: ${doc.originalFilename}`);
    console.log(`  Status: ${doc.processingStatus}`);
    console.log(`  Uploaded: ${doc.uploadedAt}`);
    console.log(`  Processed: ${doc.processedAt || 'N/A'}`);
    console.log(`  Error: ${doc.processingError || 'N/A'}`);
    if (doc.extractedData) {
      const data = doc.extractedData as any;
      console.log(`  Extracted - Positions: ${data.createdPositionIds?.length || data.positions?.length || 0}`);
      console.log(`  Extracted - Workers: ${data.createdWorkerIds?.length || data.employees?.length || 0}`);
    }
  });

  console.log('\n=== WORK POSITIONS ===');
  const positions = await db.select().from(workPositions);
  console.log('Total positions:', positions.length);
  positions.forEach(pos => {
    console.log(`  - ${pos.positionName} (ID: ${pos.id}, Company: ${pos.companyId})`);
  });

  console.log('\n=== WORKERS ===');
  const allWorkers = await db.select().from(workers);
  console.log('Total workers:', allWorkers.length);
  allWorkers.forEach(worker => {
    console.log(`  - ${worker.fullName} (ID: ${worker.id}, Position: ${worker.positionId || 'None'}, Company: ${worker.companyId})`);
  });

  process.exit(0);
}

checkDatabase().catch(console.error);
