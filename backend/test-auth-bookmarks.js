import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Bookmark from './models/Bookmark.js';

const JWT_SECRET = process.env.JWT_SECRET || 'news_aggregator_jwt_secret_dev_key';

async function runUnitTests() {
  console.log('--- Starting Auth & Bookmark Unit Tests ---');

  try {
    const testEmailA = `test_user_a_${Date.now()}@example.com`;
    const password = 'Password123!';

    // 1. Password Hashing Test
    console.log('\n[1] Testing Bcrypt Password Hashing & Verification...');
    const hash = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hash);
    console.log(`Password hash comparison: ${match ? 'PASSED (Match)' : 'FAILED'}`);
    if (!match) throw new Error('Bcrypt hash comparison failed');

    const wrongMatch = await bcrypt.compare('WrongPassword', hash);
    console.log(`Wrong password comparison rejected: ${!wrongMatch ? 'PASSED' : 'FAILED'}`);
    if (wrongMatch) throw new Error('Bcrypt failed to reject incorrect password');

    // 2. User Document Schema Test
    console.log('\n[2] Testing User Schema Validation & Password Masking...');
    const mockUser = new User({
      name: 'Test User',
      email: testEmailA,
      passwordHash: hash
    });
    const userJson = mockUser.toJSON();
    console.log(`User JSON object keys: ${Object.keys(userJson).join(', ')}`);
    if (userJson.passwordHash) throw new Error('Password hash leaked in user toJSON output!');
    console.log('Password hash masking: PASSED');

    // 3. JWT Signing & Verification
    console.log('\n[3] Testing JWT Generation & Payload Decoding...');
    const token = jwt.sign({ userId: mockUser._id, email: mockUser.email }, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`JWT verified successfully! Decoded User ID: ${decoded.userId}`);
    if (decoded.email !== testEmailA.toLowerCase()) throw new Error('JWT payload email mismatch');

    // 4. Invalid Token Rejection
    console.log('\n[4] Testing Invalid JWT Token Rejection...');
    let tokenRejected = false;
    try {
      jwt.verify(token + 'corrupted', JWT_SECRET);
    } catch (err) {
      tokenRejected = true;
      console.log(`Corrupted JWT token successfully rejected: ${err.message}`);
    }
    if (!tokenRejected) throw new Error('Corrupted JWT token was improperly accepted');

    // 5. Bookmark Schema Validation
    console.log('\n[5] Testing Bookmark Schema Validation...');
    const mockBookmark = new Bookmark({
      userId: mockUser._id,
      articleId: 'art-12345',
      title: 'Breaking Headline News',
      url: 'https://example.com/article/12345',
      source: 'Global Times',
      category: 'top-stories'
    });
    console.log(`Bookmark instance created successfully for Article ID: ${mockBookmark.articleId}`);

    console.log('\n=== ALL AUTH & BOOKMARK UNIT TESTS PASSED ===\n');

  } catch (err) {
    console.error('TEST FAILED:', err.message);
    process.exitCode = 1;
  }
}

runUnitTests();
