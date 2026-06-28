/**
 * Simple HTML sanitizer to prevent XSS attacks.
 * Strips dangerous tags and attributes (script, iframe, on* handlers, javascript: hrefs).
 * BUG-H01 fix: used in ProductDetailContent.tsx to sanitize detailDescription before render.
 */

// Tags that are completely disallowed
const BLOCKED_TAGS = /(<\s*(script|iframe|object|embed|form|input|button|select|textarea|meta|link|base|style|svg|math|noscript|xmp|plaintext|frameset|frame)[^>]*>.*?<\/\s*\2\s*>|<\s*(script|iframe|object|embed|form|input|button|select|textarea|meta|link|base|style|svg|math|noscript|xmp|plaintext|frameset|frame)[^>]*\/?>)/gis;

// Self-closing dangerous tags
const BLOCKED_SELF_CLOSING = /(<\s*(script|iframe|object|embed|form|input|button|select|textarea|meta|link|base|style|svg|math|noscript)[^>]*>)/gis;

// Dangerous event handler attributes (onclick, onload, onerror, etc.)
const DANGEROUS_ATTRS = /\s+on\w+\s*=\s*(['"])[^'"]*\1/gis;

// javascript: and data: in href/src attributes
const DANGEROUS_PROTO = /(href|src|action)\s*=\s*(['"])\s*(javascript:|data:|vbscript:)/gis;

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return html
    .replace(BLOCKED_TAGS, '')
    .replace(BLOCKED_SELF_CLOSING, '')
    .replace(DANGEROUS_ATTRS, '')
    .replace(DANGEROUS_PROTO, '$1=$2#');
}
