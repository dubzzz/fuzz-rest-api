const http = require('http');

const asyncHttp = (options, payload) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          data: Buffer.concat(chunks).toString('utf8'),
          status: res.statusCode
        });
      });
      req.on('error', reject);
    });
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
};

const builOptionsForUri = (server, uri) => ({
  host: server.host,
  port: server.port,
  path: uri,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-cache'
  }
});

export const httpGet = async (server, uri) =>
  asyncHttp(Object.assign(builOptionsForUri(server, uri), { method: 'GET' }));
export const httpPost = async (server, uri, payload) =>
  asyncHttp(Object.assign(builOptionsForUri(server, uri), { method: 'POST' }), payload);

export const throwIfHttpFailed = async requestPromise => {
  const out = await requestPromise;
  if (out.status === 500) throw new Error(`Internal Server Error, got: ${JSON.stringify(out)}`);
  return out;
};
