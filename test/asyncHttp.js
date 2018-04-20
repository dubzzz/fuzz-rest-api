const http = require('http');

const asyncHttp = function(options, payload) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, function(res) {
      var chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      });
      res.on('end', function() {
        resolve(Buffer.concat(chunks));
      });
      req.on('error', function(err) {
        reject(err);
      });
    });
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
};

const builOptionsForUri = uri => ({
  path: uri,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-cache'
  }
});

export const httpGet = async (uri, payload) => asyncHttp(Object.assign(builOptionsForUri(uri), { method: 'GET' }));
export const httpPost = async (uri, payload) =>
  asyncHttp(Object.assign(builOptionsForUri(uri), { method: 'POST' }), payload);
