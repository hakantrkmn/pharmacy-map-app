#!/usr/bin/env node

/**
 * Test script to verify the pharmacy map app setup
 * Run with: node test-setup.js
 */

import fetch from 'node-fetch';

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://izmir-nobetci-eczane.vercel.app'
  : 'http://localhost:3001';
const FRONTEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://izmir-nobetci-eczane.vercel.app'
  : 'http://localhost:5173';

async function testBackendHealth() {
  try {
    console.log('🔍 Testing backend health...');
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'OK' && data.redis === true) {
      console.log('✅ Backend health check passed');
      console.log(`   Redis connected: ${data.redis}`);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function testPharmacyAPI() {
  try {
    console.log('🔍 Testing pharmacy API...');
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BACKEND_URL}/api/pharmacies?date=${today}`);
    const data = await response.json();
    
    if (data.count > 0 && Array.isArray(data.data)) {
      console.log('✅ Pharmacy API test passed');
      console.log(`   Found ${data.count} pharmacies`);
      console.log(`   Cached: ${data.cached}`);
      return true;
    } else {
      console.log('❌ Pharmacy API test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Pharmacy API test failed:', error.message);
    return false;
  }
}

async function testCacheStats() {
  try {
    console.log('🔍 Testing cache stats...');
    const response = await fetch(`${BACKEND_URL}/api/cache/stats`);
    const data = await response.json();
    
    if (data.connected === true) {
      console.log('✅ Cache stats test passed');
      console.log(`   Redis connected: ${data.connected}`);
      console.log(`   Cached dates: ${data.cachedDates}`);
      return true;
    } else {
      console.log('❌ Cache stats test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cache stats test failed:', error.message);
    return false;
  }
}

async function testFrontend() {
  try {
    console.log('🔍 Testing frontend...');
    const response = await fetch(FRONTEND_URL);
    
    if (response.ok) {
      console.log('✅ Frontend test passed');
      return true;
    } else {
      console.log('❌ Frontend test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Pharmacy Map App Tests\n');
  
  const results = {
    backend: await testBackendHealth(),
    pharmacyAPI: await testPharmacyAPI(),
    cacheStats: await testCacheStats(),
    frontend: await testFrontend()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Backend Health: ${results.backend ? '✅' : '❌'}`);
  console.log(`Pharmacy API: ${results.pharmacyAPI ? '✅' : '❌'}`);
  console.log(`Cache Stats: ${results.cacheStats ? '✅' : '❌'}`);
  console.log(`Frontend: ${results.frontend ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your app is ready to use.');
    console.log(`\n📱 Frontend: ${FRONTEND_URL}`);
    console.log(`🔧 Backend API: ${BACKEND_URL}`);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the setup.');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure both servers are running: npm run dev');
    console.log('   2. Check Redis connection in backend/.env');
    console.log('   3. Verify all dependencies are installed');
  }
  
  return allPassed;
}

// Run tests
runTests().catch(console.error);
