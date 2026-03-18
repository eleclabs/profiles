// Simple backend test
const testBackend = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test basic connection
    const response = await fetch('http://localhost:8000/', {
      method: 'GET'
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
  } catch (error) {
    console.error('Backend test error:', error);
    console.log('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
};

// Run in browser console
if (typeof window !== 'undefined') {
  testBackend();
}
