const https = require('https');
https.get('https://rashed-mecha.netlify.app/api/portfolio', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    for (const key of Object.keys(json.data)) {
      console.log(key, JSON.stringify(json.data[key]).length);
    }
  });
});
