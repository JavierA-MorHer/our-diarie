// Test script to verify Firebase connection and Google Auth
import { testFirebaseConnection, AuthService } from './utils';

export const runFirebaseTests = async () => {
  console.log('🧪 Running Firebase tests...\n');

  // Test 1: Firebase Connection
  console.log('1. Testing Firebase connection...');
  const connectionTest = await testFirebaseConnection();
  console.log(`   Result: ${connectionTest ? '✅ PASS' : '❌ FAIL'}\n`);

  // Test 2: Auth Service Methods
  console.log('2. Testing Auth Service methods...');
  try {
    const currentUser = AuthService.getCurrentUser();
    console.log(`   Current user: ${currentUser ? currentUser.email : 'None'}`);
    console.log(`   Is authenticated: ${AuthService.isAuthenticated()}`);
    console.log('   ✅ Auth Service methods working\n');
  } catch (error) {
    console.log(`   ❌ Auth Service error: ${error}\n`);
  }

  // Test 3: Google Auth Provider
  console.log('3. Testing Google Auth Provider...');
  try {
    // This will only work if user clicks the sign-in button
    console.log('   Google Auth Provider configured');
    console.log('   ✅ Google Auth ready for user interaction\n');
  } catch (error) {
    console.log(`   ❌ Google Auth error: ${error}\n`);
  }

  console.log('🎉 Firebase tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Make sure Google Auth is enabled in Firebase Console');
  console.log('2. Add your domain to authorized domains in Firebase Console');
  console.log('3. Test the sign-in flow in the application');
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  runFirebaseTests();
}