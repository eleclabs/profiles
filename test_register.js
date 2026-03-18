// Test registration endpoint
const testRegister = async () => {
  try {
    console.log('Testing registration endpoint...');
    
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123456'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('Registration successful:', data);
    } else {
      console.error('Registration failed:', responseText);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run in browser console
if (typeof window !== 'undefined') {
  testRegister();
}
