/**
 * MVP End-to-End Test Flow
 *
 * Tests the complete flow for creating an "Akt o proceni rizika":
 * 1. Register new user
 * 2. Login
 * 3. Create company
 * 4. Create work position
 * 5. Create risk assessments
 * 6. Generate document
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { createCallerFactory } from '@trpc/server';
import { createContext } from './src/api/trpc/context';
import { appRouter } from './src/api/trpc/router';

// Create a mock request for testing
const createMockRequest = (token?: string): Request => {
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return new Request('http://localhost:3000/trpc', {
    method: 'POST',
    headers,
  });
};

async function testMVPFlow() {
  console.log('🧪 Starting MVP End-to-End Test Flow\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Register new user
    console.log('\n📝 Step 1: Registering new test user...');
    const uniqueEmail = `test-${Date.now()}@example.com`;

    const publicContext = await createContext({
      req: createMockRequest(),
      resHeaders: new Headers(),
    });

    const caller = appRouter.createCaller(publicContext);

    const registerResult = await caller.auth.register({
      email: uniqueEmail,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Korisnik',
    });

    console.log('✅ User registered successfully');
    console.log(`   Email: ${uniqueEmail}`);
    console.log(`   User ID: ${registerResult.user.userId}`);

    const { accessToken } = registerResult;
    const userId = registerResult.user.userId;

    // Step 2: Create authenticated context
    console.log('\n🔐 Step 2: Creating authenticated session...');
    const authContext = await createContext({
      req: createMockRequest(accessToken),
      resHeaders: new Headers(),
    });

    const authCaller = appRouter.createCaller(authContext);
    console.log('✅ Authenticated successfully');

    // Step 3: Create company
    console.log('\n🏢 Step 3: Creating test company...');
    const company = await authCaller.companies.create({
      name: 'TEST Предузеће д.о.о.',
      pib: '100123143', // Valid PIB (Telekom Srbija)
      activityCode: '6201',
      activityDescription: 'Рачунарско програмирање',
      address: 'Тестна улица 123',
      city: 'Београд',
      postalCode: '11000',
      director: 'Петар Петровић',
      directorJmbg: '1234567890123',
      bzrResponsiblePerson: 'Марко Марковић',
      bzrResponsibleJmbg: '9876543210987',
      employeeCount: '10',
    });

    console.log('✅ Company created successfully');
    console.log(`   Company ID: ${company.id}`);
    console.log(`   Name: ${company.name}`);
    console.log(`   PIB: ${company.pib}`);

    // Step 4: Create work position
    console.log('\n👷 Step 4: Creating work position...');
    const position = await authCaller.positions.create({
      companyId: company.id,
      positionName: 'Софтверски инжењер',
      positionCode: 'SE-001',
      department: 'IT Одељење',
      requiredEducation: 'VII степен - Факултет техничких наука',
      requiredExperience: '2 године искуства',
      jobDescription: 'Развој софтверских решења, програмирање, тестирање',
      workEnvironment: 'Канцеларијски рад са рачунаром',
      equipmentUsed: 'Рачунар, монитори, тастатура, миш',
      maleCount: 3,
      femaleCount: 2,
    });

    console.log('✅ Work position created successfully');
    console.log(`   Position ID: ${position.id}`);
    console.log(`   Name: ${position.positionName}`);
    console.log(`   Total employees: ${position.totalCount}`);

    // Step 5: Create risk assessments
    console.log('\n⚠️  Step 5: Creating risk assessments...');

    // Risk 1: Ergonomic hazard (prolonged sitting)
    const risk1 = await authCaller.risks.create({
      positionId: position.id,
      hazardId: 1, // Assuming hazard ID 1 exists
      ei: 3,
      pi: 4,
      fi: 4,
      correctiveMeasures: 'Ергономска столица, паузе сваких 2 сата, вежбе истезања',
      implementationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      responsiblePerson: 'Марко Марковић',
      e: 2,
      p: 2,
      f: 3,
    });

    console.log('✅ Risk assessment 1 created');
    console.log(`   Initial Risk (Ri): ${risk1.ri}`);
    console.log(`   Residual Risk (R): ${risk1.r}`);

    // Risk 2: Visual strain from monitors
    const risk2 = await authCaller.risks.create({
      positionId: position.id,
      hazardId: 2, // Assuming hazard ID 2 exists
      ei: 2,
      pi: 5,
      fi: 4,
      correctiveMeasures: 'Анти-рефлексни монитори, адекватно осветљење, паузе за очи',
      implementationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      responsiblePerson: 'Марко Марковић',
      e: 1,
      p: 3,
      f: 3,
    });

    console.log('✅ Risk assessment 2 created');
    console.log(`   Initial Risk (Ri): ${risk2.ri}`);
    console.log(`   Residual Risk (R): ${risk2.r}`);

    // Step 6: Generate document
    console.log('\n📄 Step 6: Generating "Akt o proceni rizika" document...');
    const document = await authCaller.documents.generate({
      companyId: company.id,
    });

    console.log('✅ Document generated successfully');
    console.log(`   Document ID: ${document.id}`);
    console.log(`   Document type: ${document.documentType}`);
    console.log(`   File path: ${document.filePath}`);
    console.log(`   File size: ${(document.fileSize / 1024).toFixed(2)} KB`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ MVP TEST FLOW COMPLETED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log(`  ✓ User registered: ${uniqueEmail}`);
    console.log(`  ✓ Company created: ${company.name} (PIB: ${company.pib})`);
    console.log(`  ✓ Position created: ${position.positionName}`);
    console.log(`  ✓ Risk assessments: 2`);
    console.log(`  ✓ Document generated: ${document.filePath}`);
    console.log('='.repeat(60));

    return {
      success: true,
      user: { email: uniqueEmail, userId },
      company,
      position,
      risks: [risk1, risk2],
      document,
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testMVPFlow()
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testMVPFlow };
