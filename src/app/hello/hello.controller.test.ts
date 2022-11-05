import { testRequest } from '../../lib/test/testRequest';

describe('hello controller', () => {
  describe('GET /', () => {
    it('should return hello world response', async () => {
      const res = await testRequest.get('/');

      expect(res.json()).toEqual({ hello: 'world' });
    });
  });
});
