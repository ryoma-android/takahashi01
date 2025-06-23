import request from 'supertest';

describe('GET /api/properties', () => {
  it('should return 200 and an array', async () => {
    // Next.js APIルートは通常devサーバー経由でテストするため、
    // baseURLをhttp://localhost:3000に仮定
    const res = await request('http://localhost:3000').get('/api/properties');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 