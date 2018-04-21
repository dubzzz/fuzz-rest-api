import * as assert from 'assert';
import * as fc from 'fast-check';
import { httpGet, httpPost, throwIfHttpFailed } from './asyncHttp';
import { inferPayloadArbitrary } from './inferPayloadArbitrary';

const server = {
  host: 'localhost',
  port: 8080
};
describe('Fuzzing REST API', () => {
  it('/api/login', async () =>
    await fc.assert(
      fc.asyncProperty(
        fc.record(
          {
            username: fc.string(),
            password: fc.string()
          },
          { with_deleted_keys: true }
        ),
        async payload => {
          await throwIfHttpFailed(httpPost(server, '/api/login', payload));
        }
      ),
      { timeout: 100 }
    ));
  it('/api/profile/:uid', async () =>
    await fc.assert(
      fc.asyncProperty(fc.fullUnicodeString(), async uid => {
        await throwIfHttpFailed(httpGet(server, `/api/profile/${encodeURIComponent(uid)}`));
      }),
      { timeout: 100 }
    ));
  it('/api/comment', async () =>
    await fc.assert(
      fc.asyncProperty(
        inferPayloadArbitrary(
          {
            user: { login: 'toto' },
            comment: { message: 'lorem ipsum', postId: 5, commentId: 8, public: false, details: ['', 5] }
          },
          true,
          true
        ),
        async payload => {
          await throwIfHttpFailed(httpPost(server, '/api/comment', payload));
        }
      ),
      { timeout: 100 }
    ));
});
