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
      if (query) return \https://maps.google.com/maps?q=\&t=&z=13&ie=UTF8&iwloc=&output=embed\;
    } catch (e) {
      return \https://maps.google.com/maps?q=\&t=&z=13&ie=UTF8&iwloc=&output=embed\;
    }
  }
  const locString = location || 'New York';
  const formattedLoc = locString.replace(/\s*[•?-]+\s*/g, ', ').replace(/\s{2,}/g, ', ');
  return \https://maps.google.com/maps?q=\&t=&z=13&ie=UTF8&iwloc=&output=embed\;
};
