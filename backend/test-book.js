const http = require('http');

const data = JSON.stringify({
  fullName: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  preferredDate: "2026-01-20",
  preferredTime: "10:00 AM"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/live-session/book',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
