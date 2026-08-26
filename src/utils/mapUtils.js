/**
 * Safely extracts the optimal Google Maps embed URL for an iframe.
 * Handles various mapLink formats including search URLs, place URLs, embed links, and direct queries.
 * Falls back to formatting the primary location string if mapLink is invalid or omitted.
 *
 * @param {string} location - The raw location string (e.g. 'Wembley Stadium • London')
 * @param {string} mapLink - An optional explicit Google Maps link or query from the admin
 * @returns {string} The fully constructed iframe src URL
 */
export const getMapIframeSrc = (location, mapLink) => {
  if (mapLink) {
    if (mapLink.includes('output=embed') || mapLink.includes('/embed')) {
      const srcMatch = mapLink.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : mapLink;
    }
    try {
      const url = new URL(mapLink);
      let query = '';
      if (url.searchParams.has('query')) query = url.searchParams.get('query');
      else if (url.searchParams.has('q')) query = url.searchParams.get('q');
      else if (url.pathname.includes('/place/')) {
        const match = url.pathname.match(/\/place\/([^\/]+)/);
        if (match) query = decodeURIComponent(match[1].replace(/\+/g, ' '));
      }
      if (query) return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    } catch (e) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(mapLink)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent((location || 'New York').replace(/ • /g, ', '))}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
};
