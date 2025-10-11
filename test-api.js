#!/usr/bin/env node
// Test script to verify all functionality works

const axios = require('axios');
const API_URL = 'http://localhost:5000';

console.log('🧪 Testing Community Connect API...\n');

async function testLogin() {
  try {
    console.log('Testing login with admin@demo.com...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@demo.com',
      password: 'demo123'
    });
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('   User:', response.data.data.user.name);
      console.log('   Role:', response.data.data.user.role);
      return response.data.data.token;
    } else {
      console.log('❌ Login failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testIssues() {
  try {
    console.log('\nTesting issues API...');
    const response = await axios.get(`${API_URL}/api/issues`);
    
    if (response.data.success) {
      console.log('✅ Issues API working!');
      console.log(`   Found ${response.data.count} issues`);
      console.log('   Sample issue:', response.data.data.issues[0].title);
      return true;
    } else {
      console.log('❌ Issues API failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Issues API error:', error.message);
    return false;
  }
}

async function testCreateIssue(token) {
  try {
    console.log('\nTesting issue creation...');
    const response = await axios.post(`${API_URL}/api/issues`, {
      title: 'Test Issue from API Test',
      description: 'This is a test issue created by the test script',
      category: 'Testing',
      priority: 'low',
      location: { lat: 40.7128, lng: -74.0060 },
      address: {
        street: '123 Test Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Issue creation successful!');
      console.log('   Issue ID:', response.data.data._id || response.data.data.id);
      return true;
    } else {
      console.log('❌ Issue creation failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Issue creation error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive API tests...\n');
  
  // Test 1: Login
  const token = await testLogin();
  if (!token) {
    console.log('\n❌ Login failed - stopping tests');
    return;
  }
  
  // Test 2: Get Issues
  const issuesWork = await testIssues();
  if (!issuesWork) {
    console.log('\n❌ Issues API failed - stopping tests');
    return;
  }
  
  // Test 3: Create Issue
  const createWorks = await testCreateIssue(token);
  
  console.log('\n🎉 TEST SUMMARY:');
  console.log('   ✅ Backend Server: Running');
  console.log('   ✅ Login System: Working');
  console.log('   ✅ Issues API: Working');
  console.log('   ' + (createWorks ? '✅' : '❌') + ' Issue Creation: ' + (createWorks ? 'Working' : 'Failed'));
  
  if (token && issuesWork && createWorks) {
    console.log('\n🎊 ALL TESTS PASSED! Your Community Connect app is fully functional!');
    console.log('\n📱 You can now:');
    console.log('   • Open http://localhost:3000 in your browser');
    console.log('   • Login with admin@demo.com / demo123');
    console.log('   • View and create community issues');
    console.log('   • Test all features');
  } else {
    console.log('\n⚠️  Some tests failed - check the errors above');
  }
}

// Run tests
runAllTests().catch(console.error);