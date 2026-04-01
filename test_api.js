const https = require('https');

https.get('https://translate.ghosnworld.com/public/api/admin/exam-types', {
  headers: {
    'Accept': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
}).on('error', err => console.error(err.message));
