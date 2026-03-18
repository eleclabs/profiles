// Test login with the provided credentials
const testLogin = async () => {
  try {
    console.log('Testing login with credentials:');
    console.log('Email: s@s.com');
    console.log('Password: s12345');
    
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 's@s.com',
        password: 's12345'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('Login successful:', data);
    } else {
      console.error('Login failed:', responseText);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run in browser console
if (typeof window !== 'undefined') {
  testLogin();
}
