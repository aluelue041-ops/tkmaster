const fs = require('fs');
const path = 'C:/Users/Benard/Downloads/Desktop/tkmaster/src/utils/mapUtils.js';

const content = `/**
 * Converts any mapLink/location value into a valid Google Maps embed URL.
 *
 * Supported mapLink formats:
 *  - Plain text  : "National Stadium Cosmos"          → searches Google Maps
 *  - Full URL    : "https://maps.google.com/maps?q=..." → extracts query
 *  - Place URL   : "https://www.google.com/maps/place/Venue+Name/..." → extracts name
 *  - Coords URL  : "https://www.google.com/maps/@1.2345,103.8765,..."  → uses lat/lng
 *  - Embed HTML  : "<iframe src='...'>"               → extracts src
 *  - Embed URL   : "https://...output=embed..."       → passes through directly
 *  - Short URL   : "https://maps.app.goo.gl/..."     → falls back to location text
 *
 * @param {string} location - Raw location string e.g. "National Stadium Cosmos"
 * @param {string} mapLink  - Optional Google Maps link or plain venue name from admin
 * @returns {string} A fully constructed Google Maps embed URL
 */
export const getMapIframeSrc = (location, mapLink) => {
  const embedBase = (q) =>
    \`https://maps.google.com/maps?q=\${encodeURIComponent(q)}&t=&z=14&ie=UTF8&iwloc=&output=embed\`;

  // Clean up the location fallback: strip bullet/pipe separators
  const cleanLocation = (location || 'New York')
    .replace(/\\s*[\\u2022\\u2023\\u00b7|]+\\s*/g, ', ')
    .trim();

  const raw = (mapLink || '').trim();

  // Nothing provided — use location text
  if (!raw) return embedBase(cleanLocation);

  // Already an embed HTML snippet — extract src attribute
  if (raw.includes('output=embed') || raw.includes('/embed')) {
    const srcMatch = raw.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];
    // It IS the embed URL already
    if (raw.startsWith('http')) return raw;
  }

  // Try to parse as a URL
  let isUrl = false;
  let parsed;
  try {
    parsed = new URL(raw);
    isUrl = true;
  } catch (_) {
    // Not a URL — treat as plain text venue name
    return embedBase(raw);
  }

  // It's a URL — handle known formats
  if (isUrl && parsed) {
    const host = parsed.hostname; // e.g. "www.google.com", "maps.app.goo.gl"

    // Short/redirect URLs — cannot embed directly; fall back to location text
    const shortHosts = ['maps.app.goo.gl', 'goo.gl', 'g.co'];
    if (shortHosts.some(h => host === h || host.endsWith('.' + h))) {
      return embedBase(cleanLocation);
    }

    let query = '';

    // ?query= or ?q= param
    if (parsed.searchParams.has('query')) {
      query = parsed.searchParams.get('query');
    } else if (parsed.searchParams.has('q')) {
      query = parsed.searchParams.get('q');
    }
    // /place/Venue+Name/
    else if (parsed.pathname.includes('/place/')) {
      const m = parsed.pathname.match(/\\/place\\/([^\\/]+)/);
      if (m) query = decodeURIComponent(m[1].replace(/\\+/g, ' '));
    }
    // /@lat,lng
    else if (parsed.pathname.includes('/@')) {
      const m = parsed.pathname.match(/\\/@(-?[\\d.]+),(-?[\\d.]+)/);
      if (m) query = \`\${m[1]},\${m[2]}\`;
    }

    if (query) return embedBase(query);

    // Unrecognised Google Maps URL — fall back to location text
    return embedBase(cleanLocation);
  }

  return embedBase(cleanLocation);
};
`;

fs.writeFileSync(path, content, 'utf8');
console.log('mapUtils.js written OK');
