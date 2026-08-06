/**
 * Simple HTML sanitizer to prevent XSS attacks — mirrors frontend/src/utils/sanitizeHtml.ts.
 * Strips dangerous tags and attributes (script, iframe, on* handlers, javascript: hrefs).
 * Applied server-side before storing rich-text content (e.g. blog posts) so stored
 * content is safe even if a future render path forgets to sanitize on read.
 */

const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'form',
  'input', 'button', 'select', 'textarea', 'meta',
  'link', 'base', 'style', 'svg', 'math', 'noscript',
  'xmp', 'plaintext', 'frameset', 'frame',
];

const tagPattern = DANGEROUS_TAGS.join('|');

const BLOCKED_TAGS = new RegExp(
  `(<\\s*(${tagPattern})[^>]*>[\\s\\S]*?<\\/\\s*\\2\\s*>|<\\s*(${tagPattern})[^>]*\\/?>)`,
  'gi'
);

const DANGEROUS_ATTRS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi;

const DANGEROUS_PROTO = /(href|src|action)\s*=\s*("?\s*(javascript:|data:|vbscript:)|'\s*(javascript:|data:|vbscript:))/gi;

function sanitizeHtml(html) {
  if (!html) return '';

  return html
    .replace(BLOCKED_TAGS, '')
    .replace(DANGEROUS_ATTRS, '')
    .replace(DANGEROUS_PROTO, '$1="#"');
}

module.exports = { sanitizeHtml };
