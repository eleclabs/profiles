const http = require('http');

// Test direct connection to backend
const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('🔍 Testing direct connection to backend...');

const req = http.request(options, (res) => {
    console.log('✅ Response received!');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📡 Response body:', data);
        console.log('🎉 Backend is working!');
    });
});

req.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
    console.log('💡 Possible causes:');
    console.log('   - Server not running');
    console.log('   - Port blocked by firewall');
    console.log('   - Server hanging on request');
});

req.on('timeout', () => {
    console.error('❌ Request timeout');
    req.destroy();
});

req.setTimeout(5000); // 5 second timeout
req.end();
