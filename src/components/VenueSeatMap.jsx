import React, { useState } from 'react';
import { STADIUM_LAYOUTS, getLayoutById } from '../utils/stadiumLayouts';

/**
 * VenueSeatMap - Renders vector interactive stadium layouts matching real-world concert venues:
 * 1. Singapore Indoor Stadium - Runway & Catwalk (Stray Kids style)
 * 2. Singapore National Stadium - 360° Central Stage (BTS style)
 * 3. Singapore Indoor Stadium - Diamond Center Stage (BOYNEXTDOOR style)
 * 4. Singapore Indoor Stadium - T-Stage & Seated Floor (BABYMONSTER style)
 * 5. APEX @ EXPO - Exhibition Arena (LE SSERAFIM style)
 * 6. Standard Concert Oval
 */
export default function VenueSeatMap({
  layout = 'indoor-runway',
  activeZone = 'All',
  onZoneClick = () => {},
  interactive = true,
  seatConfig = null,
  showLegend = true,
  basePrice = 80,
  currency = '$',
  style = {}
}) {
  const [hoveredZone, setHoveredZone] = useState(null);
  const layoutData = getLayoutById(layout);

  const getZoneOpacity = (zoneId) => {
    if (activeZone === 'All' && !hoveredZone) return 1;
    if (hoveredZone && hoveredZone === zoneId) return 1;
    if (activeZone !== 'All') {
      return activeZone === zoneId ? 1 : 0.22;
    }
    return hoveredZone ? 0.35 : 1;
  };

  const handleZoneClick = (zoneId) => {
    if (!interactive) return;
    if (activeZone === zoneId) {
      onZoneClick('All');
    } else {
      onZoneClick(zoneId);
    }
  };

  // Render SVG based on layout
  const renderLayoutSvg = () => {
    switch (layout) {
      case 'national-360':
        return renderNational360();
      case 'indoor-diamond':
        return renderIndoorDiamond();
      case 'indoor-tstage':
        return renderIndoorTStage();
      case 'expo-hall':
        return renderExpoHall();
      case 'concert-oval':
        return renderConcertOval();
      case 'indoor-runway':
      default:
        return renderIndoorRunway();
    }
  };

  // 1. Singapore Indoor Stadium — Runway & Catwalk (Stray Kids Style)
  const renderIndoorRunway = () => (
    <svg viewBox="0 0 540 380" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <radialGradient id="stadiumGlow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      {/* Background Arena Shell */}
      <rect x="0" y="0" width="540" height="380" rx="16" fill="url(#stadiumGlow1)" />

      {/* Arena Orientation Labels */}
      <text x="270" y="24" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3">NORTH</text>
      <text x="35" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(-90, 35, 195)">WEST</text>
      <text x="505" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(90, 505, 195)">EAST</text>

      {/* 🏟️ MAIN STAGE & EXTENDED RUNWAY */}
      <g>
        {/* Main Stage Base */}
        <polygon points="170,335 370,335 390,290 150,290" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <text x="270" y="318" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900" letterSpacing="3">STAGE</text>

        {/* Extended Catwalk Runway */}
        <rect x="250" y="165" width="40" height="125" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        {/* Satellite Stage Platform at Runway Tip */}
        <polygon points="270,135 305,165 235,165" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      </g>

      {/* VIP STANDING PEN A (East of Runway - Magenta) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_standing')}
        onClick={() => handleZoneClick('vip_standing')}
        onMouseEnter={() => setHoveredZone('vip_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="298,172 375,172 360,285 298,285" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
        <text x="334" y="225" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">STANDING</text>
        <text x="334" y="238" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">PEN A</text>
      </g>

      {/* VIP STANDING PEN B (West of Runway - Magenta) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_standing')}
        onClick={() => handleZoneClick('vip_standing')}
        onMouseEnter={() => setHoveredZone('vip_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="165,172 242,172 242,285 180,285" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
        <text x="206" y="225" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">STANDING</text>
        <text x="206" y="238" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">PEN B</text>
      </g>

      {/* CAT 1 STANDING (Front/Surrounding Strip - Yellow) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat1_standing')}
        onClick={() => handleZoneClick('cat1_standing')}
        onMouseEnter={() => setHoveredZone('cat1_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="298,168 382,168 392,142 308,142" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
        <polygon points="242,168 158,168 148,142 232,142" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
        <text x="350" y="157" textAnchor="middle" fill="#713f12" fontSize="8" fontWeight="800">CAT 1</text>
        <text x="190" y="157" textAnchor="middle" fill="#713f12" fontSize="8" fontWeight="800">CAT 1</text>
      </g>

      {/* FOH SOUND & LIGHT MIXER BOOTH */}
      <rect x="245" y="85" width="50" height="26" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="270" y="102" textAnchor="middle" fill="#f1f5f9" fontSize="8" fontWeight="800" letterSpacing="1">FOH</text>

      {/* VIP SEATED (Inner Horseshoe Blocks - Cyan) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_seated')}
        onClick={() => handleZoneClick('vip_seated')}
        onMouseEnter={() => setHoveredZone('vip_seated')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        {/* West inner blocks 228-231 */}
        <polygon points="120,165 142,130 185,130 155,175" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <polygon points="145,128 178,88 220,95 188,128" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        {/* East inner blocks 218-221 */}
        <polygon points="385,175 355,130 398,130 420,165" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <polygon points="352,128 320,95 362,88 395,128" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <text x="160" y="112" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">VIP 229</text>
        <text x="380" y="112" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">VIP 219</text>
      </g>

      {/* CAT 2 (Mid Horseshoe Bowl - Blue) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat2')}
        onClick={() => handleZoneClick('cat2')}
        onMouseEnter={() => setHoveredZone('cat2')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        {/* North curve blocks */}
        <rect x="225" y="48" width="42" height="28" rx="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <rect x="273" y="48" width="42" height="28" rx="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        {/* East mid curve */}
        <polygon points="405,132 445,170 422,175 385,135" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <polygon points="425,175 460,215 440,220 405,180" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        {/* West mid curve */}
        <polygon points="135,132 155,135 118,175 95,170" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <polygon points="115,180 80,220 100,220 135,175" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <text x="246" y="65" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">222</text>
        <text x="294" y="65" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">221</text>
      </g>

      {/* CAT 3 (North Upper Tier - Red) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat3')}
        onClick={() => handleZoneClick('cat3')}
        onMouseEnter={() => setHoveredZone('cat3')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="180" y="32" width="40" height="26" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="320" y="32" width="40" height="26" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <polygon points="440,225 478,265 455,270 420,230" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <polygon points="100,225 120,230 85,270 62,265" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <text x="200" y="48" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">CAT 3</text>
        <text x="340" y="48" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">CAT 3</text>
      </g>

      {/* CAT 4 (Outer Horseshoe Tier 300s - Green) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat4')}
        onClick={() => handleZoneClick('cat4')}
        onMouseEnter={() => setHoveredZone('cat4')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="135" y="38" width="40" height="24" rx="3" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <rect x="365" y="38" width="40" height="24" rx="3" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <polygon points="480,268 495,295 470,300 455,273" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <polygon points="60,268 85,273 70,300 45,295" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <text x="155" y="53" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">328</text>
        <text x="385" y="53" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">314</text>
      </g>

      {/* CAT 5 & CAT 6 (Side & Corner Restricted Views - Orange & Purple) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat5')}
        onClick={() => handleZoneClick('cat5')}
        onMouseEnter={() => setHoveredZone('cat5')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="440,305 475,325 450,340 420,315" fill="#f97316" stroke="#ea580c" strokeWidth="1.2" />
        <polygon points="100,305 120,315 90,340 65,325" fill="#f97316" stroke="#ea580c" strokeWidth="1.2" />
        <text x="450" y="325" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 5</text>
        <text x="90" y="325" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 5</text>
      </g>

      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat6')}
        onClick={() => handleZoneClick('cat6')}
        onMouseEnter={() => setHoveredZone('cat6')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="475,328 495,340 475,355 455,342" fill="#a855f7" stroke="#9333ea" strokeWidth="1.2" />
        <polygon points="65,328 85,342 65,355 45,340" fill="#a855f7" stroke="#9333ea" strokeWidth="1.2" />
        <text x="475" y="344" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="700">CAT 6</text>
        <text x="65" y="344" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="700">CAT 6</text>
      </g>
    </svg>
  );

  // 2. Singapore National Stadium — 360° Central Stage (BTS Style)
  const renderNational360 = () => (
    <svg viewBox="0 0 540 380" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <radialGradient id="stadiumGlow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b1120" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="540" height="380" rx="16" fill="url(#stadiumGlow2)" />

      {/* Compass Directions */}
      <text x="270" y="24" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3">NORTH</text>
      <text x="270" y="366" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3">SOUTH</text>
      <text x="35" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(-90, 35, 195)">WEST ZONE</text>
      <text x="505" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(90, 505, 195)">EAST ZONE</text>

      {/* ── CONCENTRIC STADIUM TIERS (Outer to Inner) ── */}

      {/* CAT 5 & 6 (Upper Bowl Rings - Orange & Violet) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat5')}
        onClick={() => handleZoneClick('cat5')}
        onMouseEnter={() => setHoveredZone('cat5')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <path d="M 120,45 Q 270,18 420,45 Q 400,68 270,45 Q 140,68 120,45 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.2" />
        <path d="M 120,335 Q 270,362 420,335 Q 400,312 270,335 Q 140,312 120,335 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.2" />
        <text x="270" y="38" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">CAT 5 UPPER BOWL</text>
        <text x="270" y="352" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">CAT 5 UPPER BOWL</text>
      </g>

      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat6')}
        onClick={() => handleZoneClick('cat6')}
        onMouseEnter={() => setHoveredZone('cat6')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <path d="M 425,48 Q 470,80 480,115 Q 460,115 440,85 Q 425,70 425,48 Z" fill="#a855f7" stroke="#9333ea" strokeWidth="1" />
        <path d="M 115,48 Q 70,80 60,115 Q 80,115 100,85 Q 115,70 115,48 Z" fill="#a855f7" stroke="#9333ea" strokeWidth="1" />
        <text x="458" y="90" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 6</text>
        <text x="82" y="90" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 6</text>
      </g>

      {/* CAT 4 (Green Mid Ring Bowl) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat4')}
        onClick={() => handleZoneClick('cat4')}
        onMouseEnter={() => setHoveredZone('cat4')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        {/* West Side arc */}
        <path d="M 72,125 Q 52,190 72,255 L 94,245 Q 76,190 94,135 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        {/* East Side arc */}
        <path d="M 468,125 Q 488,190 468,255 L 446,245 Q 464,190 446,135 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <text x="75" y="195" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800" transform="rotate(-90, 75, 195)">CAT 4</text>
        <text x="465" y="195" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800" transform="rotate(90, 465, 195)">CAT 4</text>
      </g>

      {/* CAT 3 (Red Lower Bowl 100s Ring) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat3')}
        onClick={() => handleZoneClick('cat3')}
        onMouseEnter={() => setHoveredZone('cat3')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        {/* North curve */}
        <path d="M 145,72 Q 270,55 395,72 L 385,92 Q 270,78 155,92 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
        {/* South curve */}
        <path d="M 145,308 Q 270,325 395,308 L 385,288 Q 270,302 155,288 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
        {/* West inner curve */}
        <path d="M 100,140 Q 88,190 100,240 L 120,232 Q 110,190 120,148 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
        {/* East inner curve */}
        <path d="M 440,140 Q 452,190 440,240 L 420,232 Q 430,190 420,148 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
        <text x="270" y="86" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">CAT 3 (100 LEVEL)</text>
        <text x="270" y="304" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">CAT 3 (100 LEVEL)</text>
      </g>

      {/* CAT 2 (Floor Mid Blocks - Blue) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat2')}
        onClick={() => handleZoneClick('cat2')}
        onMouseEnter={() => setHoveredZone('cat2')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="175" y="102" width="45" height="20" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <rect x="320" y="102" width="45" height="20" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <rect x="175" y="258" width="45" height="20" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <rect x="320" y="258" width="45" height="20" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <text x="197" y="115" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="800">CAT 2</text>
        <text x="342" y="115" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="800">CAT 2</text>
        <text x="197" y="271" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="800">CAT 2</text>
        <text x="342" y="271" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="800">CAT 2</text>
      </g>

      {/* CAT 1 (Inner Floor Blocks - Yellow) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat1')}
        onClick={() => handleZoneClick('cat1')}
        onMouseEnter={() => setHoveredZone('cat1')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="225" y="102" width="90" height="20" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        <rect x="225" y="258" width="90" height="20" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        <rect x="145" y="155" width="22" height="70" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        <rect x="373" y="155" width="22" height="70" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        <text x="270" y="115" textAnchor="middle" fill="#713f12" fontSize="8" fontWeight="800">CAT 1 FLOOR</text>
        <text x="270" y="271" textAnchor="middle" fill="#713f12" fontSize="8" fontWeight="800">CAT 1 FLOOR</text>
      </g>

      {/* VIP SURROUND FLOOR (Magenta) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip')}
        onClick={() => handleZoneClick('vip')}
        onMouseEnter={() => setHoveredZone('vip')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="180,140 230,140 215,170 180,165" fill="#d946ef" stroke="#c026d3" strokeWidth="1.2" />
        <polygon points="310,140 360,140 360,165 325,170" fill="#d946ef" stroke="#c026d3" strokeWidth="1.2" />
        <polygon points="180,240 230,240 215,210 180,215" fill="#d946ef" stroke="#c026d3" strokeWidth="1.2" />
        <polygon points="310,240 360,240 360,215 325,210" fill="#d946ef" stroke="#c026d3" strokeWidth="1.2" />
        <text x="202" y="155" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">VIP</text>
        <text x="338" y="155" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">VIP</text>
        <text x="202" y="230" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">VIP</text>
        <text x="338" y="230" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">VIP</text>
      </g>

      {/* 🏟️ 360° CENTER STAGE & 4-WAY CROSS CATWALKS */}
      <g>
        {/* Center Stage Ring */}
        <circle cx="270" cy="190" r="34" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
        {/* 4 Diagonal Runway Wings */}
        <line x1="245" y1="165" x2="195" y2="125" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
        <line x1="295" y1="165" x2="345" y2="125" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
        <line x1="245" y1="215" x2="195" y2="255" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
        <line x1="295" y1="215" x2="345" y2="255" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
        <text x="270" y="195" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900" letterSpacing="2">STAGE</text>
      </g>
    </svg>
  );

  // 3. Singapore Indoor Stadium — Diamond Center Stage (BOYNEXTDOOR Style)
  const renderIndoorDiamond = () => (
    <svg viewBox="0 0 540 380" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <radialGradient id="stadiumGlow3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="540" height="380" rx="16" fill="url(#stadiumGlow3)" />

      <text x="270" y="24" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3">NORTH</text>
      <text x="35" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(-90, 35, 195)">WEST</text>
      <text x="505" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(90, 505, 195)">EAST</text>

      {/* MAIN END STAGE AT BOTTOM */}
      <polygon points="180,338 360,338 375,300 165,300" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <text x="270" y="324" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" letterSpacing="3">STAGE</text>

      {/* Runway Connecting to Diamond Stage */}
      <rect x="256" y="240" width="28" height="60" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Central Diamond Stage */}
      <polygon points="270,165 315,210 270,255 225,210" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />

      {/* STANDING PENS A & B (Lower flanking pens) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_standing')}
        onClick={() => handleZoneClick('vip_standing')}
        onMouseEnter={() => setHoveredZone('vip_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="185,235 240,245 240,288 185,288" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <polygon points="300,245 355,235 355,288 300,288" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <text x="212" y="265" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">PEN B</text>
        <text x="328" y="265" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">PEN A</text>

        {/* STANDING PENS C & D (Upper flanking pens) */}
        <polygon points="185,165 245,175 245,225 195,225" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <polygon points="295,175 355,165 345,225 295,225" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <text x="215" y="198" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">PEN D</text>
        <text x="325" y="198" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">PEN C</text>
      </g>

      {/* FOH SOUND MIXER BOOTH */}
      <rect x="235" y="125" width="70" height="24" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="270" y="141" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="800">FOH</text>

      {/* VIP SEATED (Inner Horseshoe lower bowl - Cyan) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_seated')}
        onClick={() => handleZoneClick('vip_seated')}
        onMouseEnter={() => setHoveredZone('vip_seated')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="220" y="80" width="32" height="28" rx="3" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <rect x="254" y="80" width="32" height="28" rx="3" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <rect x="288" y="80" width="32" height="28" rx="3" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        {/* Flanking blocks */}
        <polygon points="140,190 175,190 175,235 140,240" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <polygon points="365,190 400,190 400,240 365,235" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <text x="270" y="97" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">VIP SEATED 220</text>
      </g>

      {/* CAT 1 (Yellow Corners) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat1')}
        onClick={() => handleZoneClick('cat1')}
        onMouseEnter={() => setHoveredZone('cat1')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="180,75 215,80 215,108 170,105" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
        <polygon points="325,80 360,75 370,105 325,108" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
        <polygon points="145,150 180,155 175,185 140,185" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
        <polygon points="360,155 395,150 400,185 365,185" fill="#eab308" stroke="#ca8a04" strokeWidth="1.2" />
        <text x="195" y="95" textAnchor="middle" fill="#713f12" fontSize="7" fontWeight="800">224</text>
        <text x="345" y="95" textAnchor="middle" fill="#713f12" fontSize="7" fontWeight="800">218</text>
      </g>

      {/* CAT 2 (Mid Tiers 216-225 - Blue) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat2')}
        onClick={() => handleZoneClick('cat2')}
        onMouseEnter={() => setHoveredZone('cat2')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="135,105 170,110 160,140 120,135" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <polygon points="370,110 405,105 420,135 380,140" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <text x="145" y="125" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700">225</text>
        <text x="395" y="125" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700">217</text>
      </g>

      {/* CAT 3 (Upper Tier 300s - Red) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat3')}
        onClick={() => handleZoneClick('cat3')}
        onMouseEnter={() => setHoveredZone('cat3')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="185" y="45" width="28" height="25" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="216" y="45" width="28" height="25" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="247" y="45" width="28" height="25" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="278" y="45" width="28" height="25" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="309" y="45" width="28" height="25" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <text x="270" y="60" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">CAT 3 (318 - 324)</text>
      </g>

      {/* CAT 4 (Restricted View - Green) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat4')}
        onClick={() => handleZoneClick('cat4')}
        onMouseEnter={() => setHoveredZone('cat4')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="100,285 130,285 130,305 90,305" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <polygon points="410,285 440,285 450,305 410,305" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <text x="110" y="298" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">331</text>
        <text x="430" y="298" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">311</text>
      </g>
    </svg>
  );

  // 4. Singapore Indoor Stadium — T-Stage & Seated Floor (BABYMONSTER Style)
  const renderIndoorTStage = () => (
    <svg viewBox="0 0 540 380" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <radialGradient id="stadiumGlow4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b0f19" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="540" height="380" rx="16" fill="url(#stadiumGlow4)" />

      <text x="270" y="24" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3">NORTH</text>
      <text x="35" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(-90, 35, 195)">WEST</text>
      <text x="505" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3" transform="rotate(90, 505, 195)">EAST</text>

      {/* MAIN END STAGE AT BOTTOM */}
      <polygon points="175,340 365,340 385,295 155,295" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <text x="270" y="322" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900" letterSpacing="3">STAGE</text>

      {/* T-THRUST CATWALK & HEAD */}
      <rect x="254" y="210" width="32" height="85" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="210" y="192" width="120" height="24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

      {/* VIP STANDING PENS A & B (Flanking T-Catwalk - Magenta) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_standing')}
        onClick={() => handleZoneClick('vip_standing')}
        onMouseEnter={() => setHoveredZone('vip_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="170,225 240,225 240,285 180,285" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <polygon points="300,225 370,225 360,285 300,285" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <text x="205" y="258" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">PEN B</text>
        <text x="335" y="258" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">PEN A</text>
      </g>

      {/* CAT 1 STANDING (Yellow strip) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat1_standing')}
        onClick={() => handleZoneClick('cat1_standing')}
        onMouseEnter={() => setHoveredZone('cat1_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="170" y="195" width="36" height="24" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        <rect x="334" y="195" width="36" height="24" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        <text x="188" y="210" textAnchor="middle" fill="#713f12" fontSize="7" fontWeight="800">CAT 1</text>
        <text x="352" y="210" textAnchor="middle" fill="#713f12" fontSize="7" fontWeight="800">CAT 1</text>
      </g>

      {/* VIP SEATED (Floor PA1, PA2, PA3 Blocks - Cyan) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_seated')}
        onClick={() => handleZoneClick('vip_seated')}
        onMouseEnter={() => setHoveredZone('vip_seated')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="210" y="135" width="38" height="50" rx="3" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <rect x="252" y="135" width="36" height="50" rx="3" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <rect x="292" y="135" width="38" height="50" rx="3" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <text x="229" y="162" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800">PA3</text>
        <text x="270" y="162" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800">PA2</text>
        <text x="311" y="162" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800">PA1</text>
      </g>

      {/* FOH SOUND BOOTH */}
      <rect x="235" y="98" width="70" height="24" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="270" y="114" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="800">FOH</text>

      {/* CAT 3 (Lower Bowl Tiers - Red) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat3')}
        onClick={() => handleZoneClick('cat3')}
        onMouseEnter={() => setHoveredZone('cat3')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="120,160 160,160 145,230 110,225" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <polygon points="380,160 420,160 430,225 395,230" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="220" y="60" width="48" height="28" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="272" y="60" width="48" height="28" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <text x="270" y="77" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">CAT 3</text>
      </g>

      {/* CAT 2 (Mid Curve Tiers - Blue) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat2')}
        onClick={() => handleZoneClick('cat2')}
        onMouseEnter={() => setHoveredZone('cat2')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <polygon points="140,110 180,115 170,150 130,145" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <polygon points="360,115 400,110 410,145 370,150" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <text x="155" y="132" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700">CAT 2</text>
        <text x="385" y="132" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700">CAT 2</text>
      </g>

      {/* CAT 4 (Outer Tier - Green) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat4')}
        onClick={() => handleZoneClick('cat4')}
        onMouseEnter={() => setHoveredZone('cat4')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="175" y="35" width="42" height="25" rx="3" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <rect x="323" y="35" width="42" height="25" rx="3" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <text x="196" y="51" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700">CAT 4</text>
        <text x="344" y="51" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700">CAT 4</text>
      </g>
    </svg>
  );

  // 5. APEX @ EXPO — Exhibition Arena Hall (LE SSERAFIM Style)
  const renderExpoHall = () => (
    <svg viewBox="0 0 540 380" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <radialGradient id="stadiumGlow5" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#080c14" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="540" height="380" rx="16" fill="url(#stadiumGlow5)" />

      {/* Arena Title Badge */}
      <text x="270" y="24" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700" letterSpacing="3">APEX @ EXPO ARENA</text>

      {/* MAIN STAGE AT TOP */}
      <polygon points="170,40 370,40 350,85 190,85" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <text x="270" y="66" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900" letterSpacing="3">STAGE</text>

      {/* Thrust Catwalk to Hexagonal Satellite Stage */}
      <rect x="256" y="85" width="28" height="35" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Hexagonal Satellite Stage */}
      <polygon points="270,120 295,135 295,160 270,175 245,160 245,135" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

      {/* VIP STANDING PEN A & B (Flanking runway - Cyan) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_standing')}
        onClick={() => handleZoneClick('vip_standing')}
        onMouseEnter={() => setHoveredZone('vip_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="155" y="95" width="80" height="60" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <rect x="305" y="95" width="80" height="60" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <text x="195" y="128" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">STANDING PEN A</text>
        <text x="345" y="128" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">STANDING PEN B</text>
      </g>

      {/* CAT 1 STANDING (Pen C - Yellow strip behind) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat1_standing')}
        onClick={() => handleZoneClick('cat1_standing')}
        onMouseEnter={() => setHoveredZone('cat1_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="155" y="165" width="230" height="45" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.2" />
        <rect x="155" y="196" width="230" height="14" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
        <text x="270" y="184" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">STANDING PEN C</text>
        <text x="270" y="206" textAnchor="middle" fill="#713f12" fontSize="7.5" fontWeight="800">CAT 1 STANDING</text>
      </g>

      {/* FOH SOUND CONSOLE */}
      <rect x="245" y="230" width="50" height="55" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <text x="270" y="262" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="800">FOH</text>

      {/* VIP SEATED (Side Bleachers & Rear Front - Magenta) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_seated')}
        onClick={() => handleZoneClick('vip_seated')}
        onMouseEnter={() => setHoveredZone('vip_seated')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="100" y="100" width="40" height="25" rx="3" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <rect x="400" y="100" width="40" height="25" rx="3" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <rect x="190" y="230" width="45" height="28" rx="3" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <rect x="305" y="230" width="45" height="28" rx="3" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
        <text x="120" y="115" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">VIP 216</text>
        <text x="420" y="115" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="800">VIP 203</text>
      </g>

      {/* CAT 2 (Mid Bleachers - Blue) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat2')}
        onClick={() => handleZoneClick('cat2')}
        onMouseEnter={() => setHoveredZone('cat2')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="100" y="130" width="40" height="25" rx="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <rect x="400" y="130" width="40" height="25" rx="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <rect x="190" y="262" width="45" height="28" rx="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <rect x="305" y="262" width="45" height="28" rx="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.2" />
        <text x="120" y="145" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 2</text>
        <text x="420" y="145" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 2</text>
      </g>

      {/* CAT 3 (Rear Bleachers - Red) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat3')}
        onClick={() => handleZoneClick('cat3')}
        onMouseEnter={() => setHoveredZone('cat3')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="100" y="160" width="40" height="25" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="400" y="160" width="40" height="25" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="90" y="230" width="45" height="30" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="140" y="230" width="45" height="30" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="355" y="230" width="45" height="30" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <rect x="405" y="230" width="45" height="30" rx="3" fill="#ef4444" stroke="#dc2626" strokeWidth="1.2" />
        <text x="120" y="175" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 3</text>
        <text x="420" y="175" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 3</text>
      </g>

      {/* CAT 4 & CAT 5 (Green & Orange Bleacher ends) */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat4')}
        onClick={() => handleZoneClick('cat4')}
        onMouseEnter={() => setHoveredZone('cat4')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="100" y="70" width="40" height="25" rx="3" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <rect x="400" y="70" width="40" height="25" rx="3" fill="#22c55e" stroke="#16a34a" strokeWidth="1.2" />
        <text x="120" y="85" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 4</text>
        <text x="420" y="85" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">CAT 4</text>
      </g>
    </svg>
  );

  // 6. Classic Concert Oval
  const renderConcertOval = () => (
    <svg viewBox="0 0 480 310" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <ellipse cx="240" cy="155" rx="225" ry="140" fill="#1e1e2e" stroke="#444" strokeWidth="1.5" />
      <text x="240" y="16" textAnchor="middle" fill="#666" fontSize="9" fontWeight="700" letterSpacing="2">NORTH</text>
      <text x="240" y="304" textAnchor="middle" fill="#666" fontSize="9" fontWeight="700" letterSpacing="2">SOUTH</text>
      <text x="11" y="159" textAnchor="middle" fill="#666" fontSize="9" fontWeight="700" letterSpacing="2" transform="rotate(-90,11,159)">WEST</text>
      <text x="469" y="159" textAnchor="middle" fill="#666" fontSize="9" fontWeight="700" letterSpacing="2" transform="rotate(90,469,159)">EAST</text>

      {/* STAGE */}
      <rect x="62" y="122" width="100" height="62" rx="4" fill="#f0f0f0" />
      <rect x="162" y="137" width="130" height="32" rx="3" fill="#f0f0f0" />
      <text x="112" y="157" textAnchor="middle" fill="#333" fontSize="10" fontWeight="900" letterSpacing="1.5">STAGE</text>

      {/* VIP STANDING PEN */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('vip_standing')}
        onClick={() => handleZoneClick('vip_standing')}
        onMouseEnter={() => setHoveredZone('vip_standing')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="296" y="133" width="38" height="46" rx="4" fill="#e040fb" stroke="#e040fb" strokeWidth="1.5" />
        <rect x="174" y="107" width="32" height="28" rx="3" fill="#e040fb" stroke="#e040fb" strokeWidth="1.5" />
        <rect x="174" y="175" width="32" height="28" rx="3" fill="#e040fb" stroke="#e040fb" strokeWidth="1.5" />
        <text x="315" y="153" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="700">PEN A</text>
        <text x="190" y="120" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="700">PEN B</text>
      </g>

      {/* CAT 1 */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat1')}
        onClick={() => handleZoneClick('cat1')}
        onMouseEnter={() => setHoveredZone('cat1')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="174" y="90" width="162" height="16" rx="3" fill="#fdd835" stroke="#fdd835" strokeWidth="1.2" />
        <rect x="174" y="204" width="162" height="16" rx="3" fill="#fdd835" stroke="#fdd835" strokeWidth="1.2" />
        <text x="255" y="101" textAnchor="middle" fill="#333" fontSize="6" fontWeight="700">CAT 1</text>
      </g>

      {/* CAT 2 */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat2')}
        onClick={() => handleZoneClick('cat2')}
        onMouseEnter={() => setHoveredZone('cat2')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="160" y="71" width="180" height="17" rx="3" fill="#42a5f5" stroke="#42a5f5" strokeWidth="1.2" />
        <rect x="160" y="222" width="180" height="17" rx="3" fill="#42a5f5" stroke="#42a5f5" strokeWidth="1.2" />
        <text x="250" y="83" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="700">CAT 2</text>
      </g>

      {/* CAT 3 */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat3')}
        onClick={() => handleZoneClick('cat3')}
        onMouseEnter={() => setHoveredZone('cat3')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="144" y="51" width="198" height="18" rx="3" fill="#ef5350" stroke="#ef5350" strokeWidth="1.2" />
        <rect x="144" y="241" width="198" height="18" rx="3" fill="#ef5350" stroke="#ef5350" strokeWidth="1.2" />
        <text x="240" y="63" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="700">CAT 3</text>
      </g>

      {/* CAT 4 */}
      <g
        cursor={interactive ? 'pointer' : 'default'}
        opacity={getZoneOpacity('cat4')}
        onClick={() => handleZoneClick('cat4')}
        onMouseEnter={() => setHoveredZone('cat4')}
        onMouseLeave={() => setHoveredZone(null)}
      >
        <rect x="54" y="100" width="88" height="30" rx="4" fill="#66bb6a" stroke="#66bb6a" strokeWidth="1.2" />
        <rect x="346" y="100" width="78" height="30" rx="4" fill="#66bb6a" stroke="#66bb6a" strokeWidth="1.2" />
        <text x="98" y="118" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">CAT 4</text>
        <text x="385" y="118" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">CAT 4</text>
      </g>
    </svg>
  );

  return (
    <div style={{ width: '100%', position: 'relative', ...style }}>
      {/* Venue Header Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '1px' }}>
            {layoutData.venueName}
          </span>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
            {layoutData.name}
          </div>
        </div>
        <span style={{ 
          fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', 
          background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' 
        }}>
          {layoutData.badge}
        </span>
      </div>

      {/* SVG Container */}
      <div style={{ 
        position: 'relative', borderRadius: '12px', overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.1)', background: '#0b1120' 
      }}>
        {renderLayoutSvg()}
      </div>

      {/* Color Legend & Category List */}
      {showLegend && layoutData.categories && (
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', gap: '8px 14px', justifyContent: 'center', 
          marginTop: '14px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' 
        }}>
          {layoutData.categories.map((cat) => {
            const isSelected = activeZone === cat.id;
            const price = Math.round((Number(basePrice) || 80) * (cat.multiplier || 1));
            const formattedPrice = cat.priceLabel ? cat.priceLabel : `${currency}${price}`;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleZoneClick(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600,
                  padding: '4px 8px', borderRadius: '6px', border: isSelected ? '1px solid #6366f1' : '1px solid transparent',
                  background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: isSelected ? '#ffffff' : '#cbd5e1', cursor: interactive ? 'pointer' : 'default',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: cat.color }} />
                <span>{cat.name}</span>
                <span style={{ color: '#94a3b8', fontSize: '10px' }}>• {formattedPrice}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
