import * as assert from 'assert';
import * as fc from 'fast-check';
import { httpGet, httpPost, throwIfHttpFailed } from './asyncHttp';

const server = {
  host: 'localhost',
  port: 8080
};
describe('Fuzzing REST API', () => {
  it('/api/login', async () =>
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string(),
          password: fc.string()
        }),
        async payload => {
          await throwIfHttpFailed(httpPost(server, '/api/login', payload));
        }
      )
    ));
  it('/api/profile/:uid', async () =>
    await fc.assert(
      fc.asyncProperty(fc.fullUnicodeString(), async uid => {
        await throwIfHttpFailed(httpGet(server, `/api/profile/${encodeURIComponent(uid)}`));
      })
    ));
});
