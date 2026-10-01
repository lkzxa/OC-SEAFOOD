const { assertLocalDatabase, loadArticles } = require('../../scripts/import-reviewed-posts');

describe('reviewed content import', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('builds eight public articles without editorial-only sections', () => {
    const articles = loadArticles();

    expect(articles).toHaveLength(8);
    expect(new Set(articles.map((article) => article.slug))).toHaveProperty('size', 8);
    expect(articles.every((article) => article.excerpt && article.imageAlt && article.image.startsWith('/uploads/articles/'))).toBe(true);
    expect(articles.every((article) => !article.content.includes('Nguồn tham khảo'))).toBe(true);
    expect(articles.every((article) => !article.content.includes('Brief ảnh hero'))).toBe(true);
    expect(articles.every((article) => !article.content.includes('<p># '))).toBe(true);
    expect(articles.find((article) => article.slug === 'cach-chon-combo-hai-san-theo-so-nguoi').content).toContain('<table>');
    expect(articles.find((article) => article.slug === 'cach-nau-lau-hai-san-tai-nha').content).toContain('href="/product/tom-su"');
  });

  it('refuses a non-local database target', () => {
    process.env.DATABASE_URL = 'postgresql://user:secret@example.com:5432/production';
    expect(() => assertLocalDatabase()).toThrow('Refusing to import reviewed posts into non-local host');
  });
});
