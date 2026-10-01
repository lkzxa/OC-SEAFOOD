const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const prisma = require('../src/config/prisma');
const { sanitizeHtml } = require('../src/utils/sanitizeHtml');

const heroImages = {
  'cach-bao-quan-hai-san-tuoi-song': '/uploads/articles/cach-bao-quan-hai-san-tuoi-song.png',
  'cach-ra-dong-hai-san-dung-cach': '/uploads/articles/cach-ra-dong-hai-san-dung-cach.png',
  'cach-chon-tom-tuoi-ngon': '/uploads/articles/cach-chon-tom-tuoi-ngon.png',
  'cach-che-bien-ca-hoi-don-gian': '/uploads/articles/cach-che-bien-ca-hoi-don-gian.png',
  'cach-so-che-oc-sach-khong-tanh': '/uploads/articles/cach-so-che-oc-sach-khong-tanh.png',
  'cach-nau-lau-hai-san-tai-nha': '/uploads/articles/cach-nau-lau-hai-san-tai-nha.png',
  'cach-che-bien-tom-hum-alaska': '/uploads/articles/cach-che-bien-tom-hum-alaska.png',
  'cach-chon-combo-hai-san-theo-so-nguoi': '/uploads/articles/cach-chon-combo-hai-san-theo-so-nguoi.png',
};

function assertLocalDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const databaseUrl = new URL(process.env.DATABASE_URL);
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  if (!localHosts.has(databaseUrl.hostname)) {
    throw new Error(`Refusing to import reviewed posts into non-local host: ${databaseUrl.hostname}`);
  }
  return databaseUrl;
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error('Draft is missing YAML front matter.');

  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    values[key] = value;
  }
  return { values, body: markdown.slice(match[0].length) };
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

function isTableSeparator(line) {
  return /^\|(?:\s*:?-+:?\s*\|)+$/.test(line.trim());
}

function splitTableRow(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
}

function markdownToHtml(markdown) {
  const { body } = parseFrontMatter(markdown);
  const withoutEditorialNotes = body.trimStart().split(/^## Nguồn tham khảo\s*$/m)[0];
  const lines = withoutEditorialNotes
    .replace(/^# .+\r?\n+/, '')
    .trim()
    .split(/\r?\n/);
  const html = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.startsWith('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = splitTableRow(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      html.push('<div class="overflow-x-auto"><table><thead><tr>');
      html.push(headers.map((cell) => `<th>${renderInline(cell)}</th>`).join(''));
      html.push('</tr></thead><tbody>');
      for (const row of rows) {
        html.push(`<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`);
      }
      html.push('</tbody></table></div>');
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(/^[-*]\s+(.+)$/);
        if (!item) break;
        items.push(`<li>${renderInline(item[1])}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(/^\d+\.\s+(.+)$/);
        if (!item) break;
        items.push(`<li>${renderInline(item[1])}</li>`);
        index += 1;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (/^(#{2,4})\s+/.test(next) || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next) || next.startsWith('|')) break;
      paragraph.push(next);
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return sanitizeHtml(html.join('\n'));
}

function loadArticles() {
  const draftRoot = path.join(projectRoot, 'content', 'drafts');
  const manifests = ['task-0051-manifest.json', 'task-0052-manifest.json']
    .map((name) => JSON.parse(fs.readFileSync(path.join(draftRoot, name), 'utf8')));

  return manifests.flatMap((manifest) => manifest.articles.map((entry) => {
    const sourcePath = path.join(projectRoot, entry.file);
    const source = fs.readFileSync(sourcePath, 'utf8');
    const { values } = parseFrontMatter(source);
    const image = heroImages[entry.slug];
    const imagePath = path.join(backendRoot, decodeURIComponent(image.replace(/^\/uploads\//, 'uploads/')));

    if (!fs.existsSync(imagePath)) throw new Error(`Missing hero image for ${entry.slug}: ${imagePath}`);
    if (values.slug !== entry.slug || values.title !== entry.title || values.excerpt.length !== entry.excerptLength) {
      throw new Error(`Draft and manifest metadata differ for ${entry.slug}.`);
    }

    return {
      title: entry.title,
      slug: entry.slug,
      content: markdownToHtml(source),
      excerpt: values.excerpt,
      image,
      isVisible: true,
      metaTitle: entry.metaTitle,
      metaDescription: entry.metaDescription,
      metaKeywords: values.metaKeywords || entry.primaryKeyword,
      imageAlt: entry.imageAlt,
    };
  }));
}

async function main() {
  const databaseUrl = assertLocalDatabase();
  const articles = loadArticles();
  if (articles.length !== 8 || new Set(articles.map((article) => article.slug)).size !== 8) {
    throw new Error('Expected exactly eight uniquely slugged reviewed articles.');
  }

  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'dry-run', database: databaseUrl.pathname.slice(1), articles: articles.map(({ slug, image }) => ({ slug, image })) }, null, 2));
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { id: 'asc' } });
  if (!admin) throw new Error('A local ADMIN user is required before importing posts.');

  const imported = await prisma.$transaction(articles.map((article) => prisma.blogPost.upsert({
    where: { slug: article.slug },
    create: { ...article, authorId: admin.id },
    update: article,
  })));

  console.log(JSON.stringify({ mode: 'applied', database: databaseUrl.pathname.slice(1), count: imported.length, posts: imported.map(({ id, slug, image }) => ({ id, slug, image })) }, null, 2));
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { assertLocalDatabase, parseFrontMatter, markdownToHtml, loadArticles };
