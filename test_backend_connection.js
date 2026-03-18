// Test script to verify backend API endpoints
const testBackend = async () => {
  console.log('Testing backend connection...');
  
  try {
    // Test basic connection
    const response = await fetch('http://localhost:8000/');
    console.log('Basic connection:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend response:', data);
    }
    
    // Test login endpoint
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData.success);
    } else {
      console.log('Login failed');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Only run in browser
if (typeof window !== 'undefined') {
  testBackend();
}
