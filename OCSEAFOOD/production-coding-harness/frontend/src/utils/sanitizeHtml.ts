/**
 * Simple HTML sanitizer to prevent XSS attacks.
 * Strips dangerous tags and attributes (script, iframe, on* handlers, javascript: hrefs).
 * BUG-H01 fix: used in ProductDetailContent.tsx to sanitize detailDescription before render.
 * Note: Uses [\s\S] instead of dotAll 's' flag for broader TypeScript target compatibility.
 */

const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'form',
  'input', 'button', 'select', 'textarea', 'meta',
  'link', 'base', 'style', 'svg', 'math', 'noscript',
  'xmp', 'plaintext', 'frameset', 'frame',
];

// Build pattern without 's' flag — use [\s\S] to match across newlines
const tagPattern = DANGEROUS_TAGS.join('|');

// Match opening + closing tag pairs (with content between)
const BLOCKED_TAGS = new RegExp(
  `(<\\s*(${tagPattern})[^>]*>[\\s\\S]*?<\\/\\s*\\2\\s*>|<\\s*(${tagPattern})[^>]*\\/?>)`,
  'gi'
);

// Dangerous event handler attributes (onclick, onload, onerror, etc.)
const DANGEROUS_ATTRS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi;

// javascript: and data: in href/src/action attributes  
const DANGEROUS_PROTO = /(href|src|action)\s*=\s*("?\s*(javascript:|data:|vbscript:)|'\s*(javascript:|data:|vbscript:))/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return html
    .replace(BLOCKED_TAGS, '')
    .replace(DANGEROUS_ATTRS, '')
    .replace(DANGEROUS_PROTO, '$1="#"');
}
