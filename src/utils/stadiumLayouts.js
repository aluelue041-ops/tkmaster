// Configuration and presets for different stadium & arena concert layouts
// Based on real-world venue layouts (Singapore National Stadium, Singapore Indoor Stadium, APEX @ EXPO)

export const STADIUM_LAYOUTS = {
  'indoor-runway': {
    id: 'indoor-runway',
    name: 'Singapore Indoor Stadium — Runway & Catwalk',
    subtitle: 'Stray Kids <RUN IT> Style',
    venueName: 'Singapore Indoor Stadium',
    badge: 'End-Stage + Runway',
    description: 'End stage with long thrust catwalk extending into standing pens A & B, surrounded by a tiered horseshoe arena bowl.',
    categories: [
      { id: 'vip_standing', name: 'VIP STANDING (Pen A & B)', color: '#ec4899', isGA: true, multiplier: 4.6, defaultPrice: 368 },
      { id: 'vip_seated', name: 'VIP SEATED (Lower Bowl)', color: '#06b6d4', isGA: false, multiplier: 4.7, defaultPrice: 378 },
      { id: 'cat1_standing', name: 'CAT 1 STANDING', color: '#eab308', isGA: true, multiplier: 3.7, defaultPrice: 298 },
      { id: 'cat2', name: 'CAT 2 (Mid Bowl)', color: '#3b82f6', isGA: false, multiplier: 3.8, defaultPrice: 308 },
      { id: 'cat3', name: 'CAT 3 (Upper Bowl)', color: '#ef4444', isGA: false, multiplier: 3.2, defaultPrice: 258 },
      { id: 'cat4', name: 'CAT 4 (Upper Outer)', color: '#22c55e', isGA: false, multiplier: 2.3, defaultPrice: 188 },
      { id: 'cat5', name: 'CAT 5 (Restricted View)', color: '#f97316', isGA: false, multiplier: 3.2, defaultPrice: 258 },
      { id: 'cat6', name: 'CAT 6 (Restricted View Corner)', color: '#a855f7', isGA: false, multiplier: 2.1, defaultPrice: 168 }
    ],
    defaultSeatConfig: {
      vip_standing: { rows: 0, seats: 0, enabled: true },
      vip_seated: { rows: 10, seats: 24, enabled: true },
      cat1_standing: { rows: 0, seats: 0, enabled: true },
      cat2: { rows: 12, seats: 30, enabled: true },
      cat3: { rows: 12, seats: 35, enabled: true },
      cat4: { rows: 10, seats: 30, enabled: true },
      cat5: { rows: 8, seats: 20, enabled: true },
      cat6: { rows: 6, seats: 15, enabled: true }
    }
  },

  'national-360': {
    id: 'national-360',
    name: 'Singapore National Stadium — 360° Central Stage',
    subtitle: 'BTS World Tour Arirang Style',
    venueName: 'Singapore National Stadium',
    badge: '360° In-the-Round',
    description: 'Full 360-degree oval stadium with central stage and 4-way diagonal X catwalks, surrounded by VIP floor pens and multi-tier concentric bowls.',
    categories: [
      { id: 'vip', name: 'VIP Floor Surround', color: '#d946ef', isGA: false, multiplier: 4.8, defaultPrice: 388 },
      { id: 'cat1', name: 'CAT 1 (Inner Floor PA/PB/PC/PD)', color: '#eab308', isGA: false, multiplier: 4.1, defaultPrice: 328 },
      { id: 'cat2', name: 'CAT 2 (Mid Floor Blocks)', color: '#38bdf8', isGA: false, multiplier: 3.6, defaultPrice: 288 },
      { id: 'cat3', name: 'CAT 3 (Lower Bowl 100s)', color: '#f43f5e', isGA: false, multiplier: 3.0, defaultPrice: 238 },
      { id: 'cat4', name: 'CAT 4 (Mid Bowl 400s)', color: '#22c55e', isGA: false, multiplier: 2.6, defaultPrice: 208 },
      { id: 'cat5', name: 'CAT 5 (Upper Bowl 600s)', color: '#f97316', isGA: false, multiplier: 2.1, defaultPrice: 168 },
      { id: 'cat6', name: 'CAT 6 (Upper Corner 600s)', color: '#a855f7', isGA: false, multiplier: 1.85, defaultPrice: 148 }
    ],
    defaultSeatConfig: {
      vip: { rows: 12, seats: 25, enabled: true },
      cat1: { rows: 12, seats: 30, enabled: true },
      cat2: { rows: 14, seats: 32, enabled: true },
      cat3: { rows: 16, seats: 40, enabled: true },
      cat4: { rows: 14, seats: 35, enabled: true },
      cat5: { rows: 12, seats: 30, enabled: true },
      cat6: { rows: 8, seats: 20, enabled: true }
    }
  },

  'indoor-diamond': {
    id: 'indoor-diamond',
    name: 'Singapore Indoor Stadium — Diamond Center Stage',
    subtitle: 'BOYNEXTDOOR Vol. 2 Style (SGD Price-Led)',
    venueName: 'Singapore Indoor Stadium',
    badge: 'Diamond Stage (SGD Price-Led)',
    defaultCurrency: 'SGD',
    pricingStyle: 'sgd-price',
    description: 'End stage with runway connecting to a central Diamond satellite stage, 4 Standing Pens (A, B, C, D), FOH booth, and tiered stands labeled by SGD price tiers.',
    categories: [
      { id: 'vip_standing', name: 'VIP STANDING (Pens A-D)', priceLabel: 'SGD 328', color: '#ec4899', isGA: true, multiplier: 4.1, defaultPrice: 328 },
      { id: 'vip_seated', name: 'VIP SEATED (210-231)', priceLabel: 'SGD 328', color: '#06b6d4', isGA: false, multiplier: 4.1, defaultPrice: 328 },
      { id: 'cat1', name: 'Tier 1 Seated', priceLabel: 'SGD 288', color: '#eab308', isGA: false, multiplier: 3.6, defaultPrice: 288 },
      { id: 'cat2', name: 'Tier 2 Seated (216-225)', priceLabel: 'SGD 258', color: '#3b82f6', isGA: false, multiplier: 3.2, defaultPrice: 258 },
      { id: 'cat3', name: 'Tier 3 Upper (312-330)', priceLabel: 'SGD 228', color: '#ef4444', isGA: false, multiplier: 2.8, defaultPrice: 228 },
      { id: 'cat4', name: 'Restricted View (311, 331)', priceLabel: 'SGD 188', color: '#22c55e', isGA: false, multiplier: 2.3, defaultPrice: 188 }
    ],
    defaultSeatConfig: {
      vip_standing: { rows: 0, seats: 0, enabled: true },
      vip_seated: { rows: 10, seats: 26, enabled: true },
      cat1: { rows: 12, seats: 30, enabled: true },
      cat2: { rows: 12, seats: 32, enabled: true },
      cat3: { rows: 10, seats: 28, enabled: true },
      cat4: { rows: 8, seats: 20, enabled: true }
    }
  },

  'indoor-tstage': {
    id: 'indoor-tstage',
    name: 'Singapore Indoor Stadium — T-Thrust & Seated Floor',
    subtitle: 'BABYMONSTER CHOOM Style',
    venueName: 'Singapore Indoor Stadium',
    badge: 'T-Stage + Seated Floor',
    description: 'End stage with T-thrust catwalk, VIP Standing Pens + Reserved Floor Seating blocks (PA1, PA2, PA3), FOH console, and horseshoe bowl.',
    categories: [
      { id: 'vip_seated', name: 'VIP SEATED (Floor PA1, PA2, PA3)', color: '#06b6d4', isGA: false, multiplier: 4.5, defaultPrice: 358 },
      { id: 'vip_standing', name: 'VIP STANDING (Pen A & B)', color: '#ec4899', isGA: true, multiplier: 4.3, defaultPrice: 348 },
      { id: 'cat1_standing', name: 'CAT 1 STANDING', color: '#eab308', isGA: true, multiplier: 3.7, defaultPrice: 298 },
      { id: 'cat2', name: 'CAT 2 (Mid Bowl)', color: '#3b82f6', isGA: false, multiplier: 3.8, defaultPrice: 308 },
      { id: 'cat3', name: 'CAT 3 (Lower Bowl Red)', color: '#ef4444', isGA: false, multiplier: 3.7, defaultPrice: 298 },
      { id: 'cat4', name: 'CAT 4 (Upper Bowl Green)', color: '#22c55e', isGA: false, multiplier: 3.2, defaultPrice: 258 },
      { id: 'cat5', name: 'CAT 5 (Orange Restricted)', color: '#f97316', isGA: false, multiplier: 2.8, defaultPrice: 228 },
      { id: 'cat6', name: 'CAT 6 (Violet Restricted)', color: '#a855f7', isGA: false, multiplier: 2.3, defaultPrice: 188 }
    ],
    defaultSeatConfig: {
      vip_seated: { rows: 10, seats: 25, enabled: true },
      vip_standing: { rows: 0, seats: 0, enabled: true },
      cat1_standing: { rows: 0, seats: 0, enabled: true },
      cat2: { rows: 12, seats: 30, enabled: true },
      cat3: { rows: 12, seats: 35, enabled: true },
      cat4: { rows: 10, seats: 28, enabled: true },
      cat5: { rows: 8, seats: 22, enabled: true },
      cat6: { rows: 6, seats: 18, enabled: true }
    }
  },

  'expo-hall': {
    id: 'expo-hall',
    name: 'APEX @ EXPO — Exhibition Arena Hall',
    subtitle: 'LE SSERAFIM PUREFLOW Style',
    venueName: 'APEX @ EXPO',
    badge: 'Exhibition Arena + Satellite',
    description: 'Wide main stage with thrust catwalk into hexagonal satellite stage, Standing Pens A, B, C, FOH console, and surrounding tiered bleachers.',
    categories: [
      { id: 'vip_standing', name: 'VIP STANDING (Pens A & B)', color: '#06b6d4', isGA: true, multiplier: 4.3, defaultPrice: 348 },
      { id: 'vip_seated', name: 'VIP SEATED (Front Bleachers)', color: '#ec4899', isGA: false, multiplier: 4.3, defaultPrice: 348 },
      { id: 'cat1_standing', name: 'CAT 1 STANDING (Pen C)', color: '#eab308', isGA: true, multiplier: 3.8, defaultPrice: 308 },
      { id: 'cat2', name: 'CAT 2 (Mid Bleachers)', color: '#3b82f6', isGA: false, multiplier: 3.7, defaultPrice: 298 },
      { id: 'cat3', name: 'CAT 3 (Rear Bleachers)', color: '#ef4444', isGA: false, multiplier: 3.3, defaultPrice: 268 },
      { id: 'cat4', name: 'CAT 4 (Upper Outer)', color: '#22c55e', isGA: false, multiplier: 2.9, defaultPrice: 238 },
      { id: 'cat5', name: 'CAT 5 (Restricted View)', color: '#f97316', isGA: false, multiplier: 2.4, defaultPrice: 198 }
    ],
    defaultSeatConfig: {
      vip_standing: { rows: 0, seats: 0, enabled: true },
      vip_seated: { rows: 10, seats: 24, enabled: true },
      cat1_standing: { rows: 0, seats: 0, enabled: true },
      cat2: { rows: 12, seats: 30, enabled: true },
      cat3: { rows: 12, seats: 35, enabled: true },
      cat4: { rows: 10, seats: 25, enabled: true },
      cat5: { rows: 8, seats: 20, enabled: true }
    }
  },

  'concert-oval': {
    id: 'concert-oval',
    name: 'Standard Concert Oval Stadium',
    subtitle: 'Classic Oval Arena',
    venueName: 'Concert Stadium',
    badge: 'Classic Oval',
    description: 'Traditional oval concert layout with end stage, catwalk, VIP standing pens, and concentric CAT 1-6 tiered rings.',
    categories: [
      { id: 'vip_standing', name: 'VIP STANDING PEN', color: '#e040fb', isGA: true, multiplier: 4.6, defaultPrice: 368 },
      { id: 'vip_seated', name: 'VIP Seated', color: '#06b6d4', isGA: false, multiplier: 4.7, defaultPrice: 378 },
      { id: 'cat1', name: 'CAT 1', color: '#fdd835', isGA: false, multiplier: 3.7, defaultPrice: 298 },
      { id: 'cat2', name: 'CAT 2', color: '#42a5f5', isGA: false, multiplier: 3.8, defaultPrice: 308 },
      { id: 'cat3', name: 'CAT 3', color: '#ef5350', isGA: false, multiplier: 3.2, defaultPrice: 258 },
      { id: 'cat4', name: 'CAT 4', color: '#66bb6a', isGA: false, multiplier: 2.3, defaultPrice: 188 },
      { id: 'cat5', name: 'CAT 5 (Restricted)', color: '#ff9800', isGA: false, multiplier: 3.2, defaultPrice: 258 },
      { id: 'cat6', name: 'CAT 6 (Restricted)', color: '#ab47bc', isGA: false, multiplier: 2.1, defaultPrice: 168 }
    ],
    defaultSeatConfig: {
      vipStanding: { rows: 0, seats: 0, enabled: true },
      vipSeated: { rows: 8, seats: 20, enabled: true },
      cat1: { rows: 10, seats: 30, enabled: true },
      cat2: { rows: 12, seats: 35, enabled: true },
      cat3: { rows: 13, seats: 40, enabled: true },
      cat4: { rows: 13, seats: 35, enabled: true },
      cat5: { rows: 10, seats: 30, enabled: true },
      cat6: { rows: 8, seats: 25, enabled: false }
    }
  }
};

export const getLayoutById = (layoutId) => {
  return STADIUM_LAYOUTS[layoutId] || STADIUM_LAYOUTS['indoor-runway'];
};

export const generateSectionsForLayout = (layoutId, basePrice, seatConfig) => {
  const layout = getLayoutById(layoutId);
  const base = Number(basePrice) || 80;
  const list = [];

  layout.categories.forEach(cat => {
    // Check if category is enabled in custom seatConfig
    const cfg = (seatConfig && seatConfig[cat.id]) || (seatConfig && seatConfig[cat.id.replace('_', '')]) || { enabled: true, rows: 10, seats: 30 };
    if (cfg.enabled !== false) {
      const price = Math.round(base * (cat.multiplier || 1));
      list.push({
        id: cat.id,
        name: cat.name,
        ticketName: cat.name,
        price: price,
        color: cat.color,
        isGA: !!cat.isGA,
        config: {
          rows: cat.isGA ? 0 : (cfg.rows || 10),
          seats: cat.isGA ? 0 : (cfg.seats || 30)
        }
      });
    }
  });

  return list;
};
