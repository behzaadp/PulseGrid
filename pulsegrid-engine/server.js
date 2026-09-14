const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ 
    status: 'success', 
    message: 'PulseGrid CI/CD Pipeline is Live!', 
    timestamp: new Date().toISOString() 
  }));
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});