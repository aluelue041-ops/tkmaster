/**
 * Map Utility functions for Ticketmaster App
 * Handles geocoding, Google Maps iframe generation, URL normalization,
 * and robust cleaning of location strings and character encodings.
 */

/**
 * Sanitizes location strings by stripping corrupted mojibake (â€¢),
 * bullet points (•, \u2022, etc.), and pipe separators, normalizing into "Venue, City".
 */
export const cleanLocationString = (location) => {
  if (!location || typeof location !== 'string') return '';
  return location
    // Fix mojibake / corrupted UTF-8 bullet characters
    .replace(/â€¢/g, ', ')
    .replace(/[\u2022\u2023\u00b7•|]+/g, ', ')
    // Replace " - " between venue and city
    .replace(/\s+-\s+/g, ', ')
    // Collapse spaces around commas and multiple commas
    .replace(/\s*,\s*/g, ', ')
    .replace(/,\s*,+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim();
};

/**
 * Safely splits a combined location string ("Venue • City") into separate fields,
 * handling any encoding errors or custom delimiters gracefully.
 */
export const splitVenueLocation = (location) => {
  if (!location || typeof location !== 'string') {
    return { venue: 'Venue TBA', city: 'Location TBA' };
  }
  const normalized = location.replace(/â€¢/g, '•');
  const parts = normalized
    .split(/\s*[\u2022\u2023\u00b7•|]+\s*/)
    .map(s => s.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { venue: parts[0], city: parts.slice(1).join(', ') };
  }
  if (parts.length === 1) {
    return { venue: parts[0], city: 'Location TBA' };
  }
  return { venue: 'Venue TBA', city: 'Location TBA' };
};

/**
 * Safely splits a combined date string ("Fri, Sep 19 • 7:00 PM") into { day, time }
 */
export const splitEventDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return { day: 'Date TBD', time: 'Time TBD' };
  }
  const normalized = dateStr.replace(/â€¢/g, '•');
  const parts = normalized
    .split(/\s*[\u2022\u2023\u00b7•|]+\s*/)
    .map(s => s.trim())
    .filter(Boolean);

  return {
    day: parts[0] || 'Date TBD',
    time: parts[1] || 'Time TBD'
  };
};

/**
 * Converts any mapLink or location value into a rock-solid Google Maps embed URL.
 *
 * Supported formats:
 *  - Iframe Embed code: `<iframe src="https://www.google.com/maps/embed?...">`
 *  - Direct Embed URL : `https://www.google.com/maps/embed?pb=...`
 *  - Coords URL       : `https://www.google.com/maps/@40.7505,-73.9934,...` -> pinpoints exact lat/lng
 *  - Place URL        : `https://www.google.com/maps/place/Venue+Name/@40.7505,-73.9934...`
 *  - Search URL       : `https://www.google.com/maps/search/Venue+Name...`
 *  - Query URL        : `https://maps.google.com/?q=...` or `?query=...`
 *  - Plain text query : "Madison Square Garden, New York, NY"
 *  - Short links      : Falls back cleanly to sanitized location while admin resolver expands them
 *
 * @param {string} location - Raw location string e.g. "Madison Square Garden • New York, NY"
 * @param {string} mapLink  - Optional Google Maps link, place name, or iframe embed HTML
 * @returns {string} Fully constructed Google Maps embed URL
 */
export const getMapIframeSrc = (location, mapLink) => {
  const embedBase = (q) =>
    `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=14&ie=UTF8&iwloc=&output=embed&hl=en`;

  const cleanLocation = cleanLocationString(location) || 'New York, NY';
  const raw = (mapLink || '').trim();

  // No mapLink provided — use the cleaned location string
  if (!raw) return embedBase(cleanLocation);

  // If already an embed HTML snippet — extract src attribute
  if (raw.includes('output=embed') || raw.includes('/embed')) {
    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) return srcMatch[1];
    // If it's already an embed URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  }

  // Attempt URL parsing
  let parsed = null;
  try {
    parsed = new URL(raw);
  } catch (_) {
    // Not a URL — treat as plain text venue/place name
    return embedBase(raw);
  }

  if (parsed) {
    const host = parsed.hostname.toLowerCase();

    // Short links (maps.app.goo.gl, goo.gl, etc.)
    const shortHosts = ['maps.app.goo.gl', 'goo.gl', 'g.co', 'bit.ly', 'tinyurl.com'];
    if (shortHosts.some(h => host === h || host.endsWith('.' + h))) {
      // In browser, redirect cannot be followed directly; fall back to clean location
      return embedBase(cleanLocation);
    }

    let query = '';

    // Check for coordinates first (lat,lng is 100% precise and never fails to locate)
    if (parsed.pathname.includes('/@')) {
      const coordMatch = parsed.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        query = `${coordMatch[1]},${coordMatch[2]}`;
      }
    }

    // Check ?q= or ?query= query parameter
    if (!query) {
      if (parsed.searchParams.has('q')) {
        query = parsed.searchParams.get('q');
      } else if (parsed.searchParams.has('query')) {
        query = parsed.searchParams.get('query');
      }
    }

    // Check /place/Venue+Name/
    if (!query && parsed.pathname.includes('/place/')) {
      const placeMatch = parsed.pathname.match(/\/place\/([^/@]+)/);
      if (placeMatch && placeMatch[1]) {
        query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }
    }

    // Check /search/Venue+Name/
    if (!query && parsed.pathname.includes('/search/')) {
      const searchMatch = parsed.pathname.match(/\/search\/([^/@]+)/);
      if (searchMatch && searchMatch[1]) {
        query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
      }
    }

    if (query) return embedBase(query);

    // Unrecognized Google Maps URL structure — fall back to clean location
    return embedBase(cleanLocation);
  }

  return embedBase(cleanLocation);
};

/**
 * Returns a direct browser link to open directions / venue in Google Maps in a new tab.
 */
export const getDirectionsUrl = (location, mapLink) => {
  const raw = (mapLink || '').trim();
  if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    // If it's a regular Maps URL (not embed code), use it directly
    if (!raw.includes('output=embed') && !raw.includes('/embed')) {
      return raw;
    }
  }
  const clean = cleanLocationString(location) || 'New York, NY';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`;
};
