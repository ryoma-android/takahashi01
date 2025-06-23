import request from 'supertest';

describe('GET /api/expenses', () => {
  it('should return 200 and an array', async () => {
    const res = await request('http://localhost:3000').get('/api/expenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 