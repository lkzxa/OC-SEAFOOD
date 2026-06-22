const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

// Mock Prisma client singleton
jest.mock('../config/prisma', () => ({
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  blogPost: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

describe('Business CRUD API - Categories, Products, BlogPosts', () => {
  let customerToken;
  let adminToken;

  beforeAll(() => {
    customerToken = signToken({ id: 10, email: 'customer@example.com', role: 'CUSTOMER' });
    adminToken = signToken({ id: 2, email: 'admin@example.com', role: 'ADMIN' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Categories Endpoints', () => {
    it('GET /categories should be public', async () => {
      prisma.category.findMany.mockResolvedValue([{ id: 1, name: 'Seafood', slug: 'seafood' }]);
      prisma.category.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/categories')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Seafood');
      expect(res.body.pagination.total).toBe(1);
    });

    it('POST /categories should reject unauthenticated request with 401', async () => {
      await request(app)
        .post('/categories')
        .send({ name: 'Seafood', slug: 'seafood' })
        .expect(401);
    });

    it('POST /categories should reject CUSTOMER role with 403', async () => {
      await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Seafood', slug: 'seafood' })
        .expect(403);
    });

    it('POST /categories should accept ADMIN role and return 201', async () => {
      const mockCategory = { id: 1, name: 'Seafood', slug: 'seafood' };
      prisma.category.create.mockResolvedValue(mockCategory);

      const res = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Seafood', slug: 'seafood' })
        .expect(201);

      expect(res.body).toEqual(mockCategory);
    });
  });

  describe('Products Endpoints', () => {
    it('GET /products should support categoryId query filtering', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await request(app)
        .get('/products?categoryId=2')
        .expect(200);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { isVisible: true, categoryId: 2 },
        skip: 0,
        take: 100,
        orderBy: { createdAt: 'desc' }
      });
    });

    it('GET /products should only list visible products', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await request(app)
        .get('/products')
        .expect(200);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isVisible: true }
        })
      );
      expect(prisma.product.count).toHaveBeenCalledWith({
        where: { isVisible: true }
      });
    });

    it('POST /products should block invalid payloads with 400', async () => {
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', priceReference: -100 }) // Invalid name and price
        .expect(400);
    });

    it('GET /products/slug/:slug should successfully fetch a product by slug', async () => {
      const mockProduct = { id: 1, name: 'Cua Huynh De', slug: 'cua-huynh-de', isVisible: true };
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const res = await request(app)
        .get('/products/slug/cua-huynh-de')
        .expect(200);

      expect(res.body).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'cua-huynh-de', isVisible: true },
        include: { category: true }
      });
    });

    it('GET /products/slug/:slug should return 404 if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await request(app)
        .get('/products/slug/non-existent')
        .expect(404);
    });
  });

  describe('BlogPosts Endpoints', () => {
    it('POST /posts should resolve authorId securely using admin token claims', async () => {
      const mockPost = { id: 10, title: 'Fresh Shrimp', slug: 'fresh-shrimp', content: 'Shrimp content', authorId: 2 };
      prisma.blogPost.create.mockResolvedValue(mockPost);

      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Fresh Shrimp', slug: 'fresh-shrimp', content: 'Shrimp content' })
        .expect(201);

      expect(res.body.authorId).toBe(2);
      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: {
          title: 'Fresh Shrimp',
          slug: 'fresh-shrimp',
          content: 'Shrimp content',
          authorId: 2, // Checked that it resolves from JWT id
          isVisible: true
        }
      });
    });
  });
});
