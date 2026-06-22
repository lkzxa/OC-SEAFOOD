const request = require('supertest');
const app = require('../app');

describe('Shared API Validation Layer', () => {
  describe('POST /test-validate-phone (Vietnamese Phone Numbers)', () => {
    it('should accept valid Vietnamese mobile formats', async () => {
      const validNumbers = ['0987654321', '+84987654321', '84987654321', '0312345678'];
      for (const phone of validNumbers) {
        const res = await request(app)
          .post('/test-validate-phone')
          .send({ phone })
          .expect(200);

        expect(res.body.status).toBe('success');
        expect(res.body.phone).toBe(phone);
      }
    });

    it('should reject invalid Vietnamese mobile formats with 400', async () => {
      const invalidNumbers = ['123456789', '0123456789', '091234567', '09123456789', ''];
      for (const phone of invalidNumbers) {
        const res = await request(app)
          .post('/test-validate-phone')
          .send({ phone })
          .expect(400);

        expect(res.body.error).toBeDefined();
        expect(res.body.error.message).toBe('Validation failed');
        expect(res.body.error.details.phone).toBeDefined();
      }
    });
  });

  describe('POST /test-validate-address (3-Level Address Structure)', () => {
    it('should accept address with all 4 fields populated', async () => {
      const validAddress = {
        province: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        streetAddress: '123 Đường Lê Lợi'
      };

      const res = await request(app)
        .post('/test-validate-address')
        .send({ address: validAddress })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.address).toEqual(validAddress);
    });

    it('should reject address with missing fields with 400', async () => {
      const invalidAddress = {
        province: 'Hồ Chí Minh',
        district: 'Quận 1'
        // ward and streetAddress are missing
      };

      const res = await request(app)
        .post('/test-validate-address')
        .send({ address: invalidAddress })
        .expect(400);

      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toBe('Validation failed');
    });

    it('should reject address with empty strings with 400', async () => {
      const invalidAddress = {
        province: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: '',
        streetAddress: '123 Đường Lê Lợi'
      };

      const res = await request(app)
        .post('/test-validate-address')
        .send({ address: invalidAddress })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });
});
