const fs = require('fs');

const filesToFix = [
  'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/Pricing.jsx',
  'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/ResetPassword.jsx',
  'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/SeatSelection.jsx',
  'C:/Users/Benard/Downloads/Desktop/tkmaster/src/pages/SignIn.jsx'
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Pricing
    content = content.replace(/label: '[^\w']+\s+USDT'/g, "label: '💵 USDT'");
    content = content.replace(/label: '[^\w']+\s+Bitcoin'/g, "label: '₿ Bitcoin'");
    content = content.replace(/'[^\w']+\s+Copy'/g, "'📋 Copy'");
    
    // Auth & Status msgs
    content = content.replace(/'[^\w']+\s+Waking up server/g, "'⏳ Waking up server");
    content = content.replace(/'[^\w']+\s+Reset link sent!/g, "'✅ Reset link sent!");
    content = content.replace(/'[^\w']+\s+Invalid reset/g, "'❌ Invalid reset");
    content = content.replace(/'[^\w']+\s+Failed to send/g, "'❌ Failed to send");
    
    // SeatSelection
    content = content.replace(/\/\*\s*[^\w\s]+\s*STAGE/g, "/* 🏟️ STAGE");
    content = content.replace(/Upgrade\s+[^\w\s]+\s*</g, "Upgrade ✨ <");
    
    // Clean up generic unicode corruptions
    content = content.replace(/\uFFFD/g, ''); // Replacement char
    content = content.replace(/\u0092/g, "'"); // Windows smart quote
    content = content.replace(/\u0093|\u0094/g, '"'); // Smart quotes
    content = content.replace(/\u0096|\u0097/g, '-'); // Dashes

    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log('Final polish complete');
