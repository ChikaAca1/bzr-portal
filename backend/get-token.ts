import 'dotenv/config';
import { db } from './src/db';
import { emailVerificationTokens } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';

async function getToken() {
  const tokens = await db
    .select()
    .from(emailVerificationTokens)
    .orderBy(desc(emailVerificationTokens.createdAt))
    .limit(1);

  if (tokens.length > 0) {
    console.log('Token:', tokens[0].token);
    console.log('User ID:', tokens[0].userId);
    console.log('Expires:', tokens[0].expiresAt);
  } else {
    console.log('No tokens found');
  }
  process.exit(0);
}

getToken();
