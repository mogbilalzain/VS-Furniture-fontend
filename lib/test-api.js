/**
 * Test API Integration
 * Run this in browser console to test API connectivity
 */

import { authAPI, productsAPI, categoriesAPI, dashboardAPI } from './api';

export const testAPIIntegration = async () => {
  console.log('🔄 Testing API Integration...');
  
  try {
    // Test 1: Get Categories (public endpoint)
    console.log('1️⃣ Testing Categories API...');
    const categories = await categoriesAPI.getAll();
    console.log('✅ Categories:', categories);
    
    // Test 2: Get Products (public endpoint)
    console.log('2️⃣ Testing Products API...');
    const products = await productsAPI.getAll();
    console.log('✅ Products:', products);
    
    // Test 3: Login
    console.log('3️⃣ Testing Login API...');
    const loginResult = await authAPI.login({
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Login:', loginResult);
    
    // Test 4: Dashboard Stats (protected endpoint)
    if (loginResult.success) {
      console.log('4️⃣ Testing Dashboard API...');
      const dashboardStats = await dashboardAPI.getStats();
      console.log('✅ Dashboard Stats:', dashboardStats);
    }
    
    console.log('🎉 All API tests completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return { success: false, error: error.message };
  }
};

// Test individual endpoints
export const testEndpoints = {
  categories: () => categoriesAPI.getAll(),
  products: () => productsAPI.getAll(),
  login: (credentials = { username: 'admin', password: 'admin123' }) => authAPI.login(credentials),
  dashboard: () => dashboardAPI.getStats(),
};

export default testAPIIntegration;