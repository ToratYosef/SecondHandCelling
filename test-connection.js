#!/usr/bin/env node

/**
 * Test script to verify frontend-backend connection
 * Run with: node test-connection.js
 */

const API_URL = process.env.VITE_API_URL || 'https://api.new.secondhandcell.com';

console.log('Testing connection to:', API_URL);
console.log('-----------------------------------\n');

async function testEndpoint(name, endpoint) {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`Testing ${name}...`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    const status = response.status;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ ${name} - Status: ${status}`);
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log(`✗ ${name} - Status: ${status}`);
      console.log('Error:', text);
    }
  } catch (error) {
    console.log(`✗ ${name} - Connection failed`);
    console.log('Error:', error.message);
  }
  console.log('-----------------------------------\n');
}

async function runTests() {
  console.log('Starting API connection tests...\n');
  
  // Test 1: Health check
  await testEndpoint('Health Check', '/api/health');
  
  // Test 2: Public categories
  await testEndpoint('Public Categories', '/api/public/categories');
  
  // Test 3: Public catalog
  await testEndpoint('Public Catalog', '/api/public/catalog');
  
  console.log('Tests completed!');
  console.log('\nIf all tests passed, the backend is accessible.');
  console.log('If tests failed, check:');
  console.log('  1. Backend is running at', API_URL);
  console.log('  2. CORS is configured correctly');
  console.log('  3. Network connectivity');
}

runTests().catch(console.error);
