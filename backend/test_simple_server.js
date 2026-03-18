const http = require('http');
const url = require('url');

// Simple HTTP server to test if Node.js can handle requests
const server = http.createServer(async (req, res) => {
    console.log('📡 Request received:', req.method, req.url);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    try {
        if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: '✅ Simple server is working',
                timestamp: new Date().toISOString()
            }));
        } else if (req.url === '/test') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: '✅ Test endpoint working',
                method: req.method
            }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Route not found' }));
        }
    } catch (error) {
        console.error('❌ Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false,
            message: 'Server error',
            error: error.message 
        }));
    }
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`🚀 Simple test server running on port ${PORT}`);
    console.log(`📡 Test at: http://localhost:${PORT}`);
});
