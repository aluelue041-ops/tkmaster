import sharp from 'sharp';

// Create the blue rounded square "t" logo as PNG
const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#026cdf"/>
  <text x="256" y="370" font-family="Georgia, serif" font-size="360" font-weight="bold" font-style="italic" text-anchor="middle" fill="white">t</text>
</svg>`;

const svgBuffer = Buffer.from(svgLogo);

await sharp(svgBuffer).resize(192, 192).png().toFile('public/pwa-192x192.png');
console.log('✅ Generated pwa-192x192.png');

await sharp(svgBuffer).resize(512, 512).png().toFile('public/pwa-512x512.png');
console.log('✅ Generated pwa-512x512.png');

console.log('All icons generated successfully!');
