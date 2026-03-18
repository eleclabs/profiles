// Test direct connection to backend
const net = require('net');

const testConnection = () => {
    console.log('Testing direct connection to backend...');
    
    const client = net.createConnection({
        host: 'localhost',
        port: 8000
    });
    
    client.on('connect', () => {
        console.log('✅ Direct connection successful');
        client.write('GET / HTTP/1.1\r\nHost: localhost:8000\r\n\r\n');
    });
    
    client.on('data', (data) => {
        console.log('📡 Response:', data.toString());
    });
    
    client.on('error', (err) => {
        console.error('❌ Connection error:', err.message);
    });
    
    client.on('close', () => {
        console.log('🔌 Connection closed');
    });
    
    setTimeout(() => {
        client.end();
    }, 5000);
};

// Run if this is executed with Node.js
if (typeof module !== 'undefined' && module.exports) {
    testConnection();
}
