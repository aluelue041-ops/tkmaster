/**
 * Safely extracts the optimal Google Maps embed URL for an iframe.
 * Handles: embed links, place URLs, search URLs, short links, and plain location strings.
 *
 * @param {string} location - Raw location string e.g. 'Wembley Stadium, London'
 * @param {string} mapLink  - Optional Google Maps link from the admin
 * @returns {string} A fully constructed Google Maps embed URL
 */
export const getMapIframeSrc = (location, mapLink) => {
  const base = (q) =>
    `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  if (mapLink && mapLink.trim()) {
    const link = mapLink.trim();

    // Already an embed link — extract src if wrapped in HTML
    if (link.includes('output=embed') || link.includes('/embed')) {
      const srcMatch = link.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : link;
    }

    try {
      const url = new URL(link);
      let query = '';

      // Standard search params
      if (url.searchParams.has('query')) {
        query = url.searchParams.get('query');
      } else if (url.searchParams.has('q')) {
        query = url.searchParams.get('q');
      }
      // Place URL: /place/Venue+Name/...
      else if (url.pathname.includes('/place/')) {
        const match = url.pathname.match(/\/place\/([^\/]+)/);
        if (match) query = decodeURIComponent(match[1].replace(/\+/g, ' '));
      }
      // @ coordinates: /@lat,lng,...
      else if (url.pathname.includes('/@')) {
        const match = url.pathname.match(/\/@(-?[\d.]+),(-?[\d.]+)/);
        if (match) query = `${match[1]},${match[2]}`;
      }

      if (query) return base(query);

      // Short URL or unrecognised format — use the full link as search term
      return base(link);
    } catch (e) {
      // Not a valid URL — treat it as a plain query string
      return base(link);
    }
  }

  // No mapLink: format location string
  const loc = (location || 'New York').replace(/\s*[\u2022\u2023\u00b7|]+\s*/g, ', ').trim();
  return base(loc);
};
