import request from 'supertest';

describe('POST /api/ocr', () => {
  it('should return 400 if no file is uploaded', async () => {
    const res = await request('http://localhost:3000')
      .post('/api/ocr')
      .set('Content-Type', 'multipart/form-data');
    expect(res.status).toBe(400);
  });
}); 