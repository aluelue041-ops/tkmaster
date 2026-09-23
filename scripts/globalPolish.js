const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      // Fix specific known corruptions
      content = content.replace(/label: '\?\? USDT'/g, "label: '💵 USDT'");
      content = content.replace(/label: '\? Bitcoin'/g, "label: '₿ Bitcoin'");
      content = content.replace(/'\?\? Copy'/g, "'📋 Copy'");
      content = content.replace(/'\? Waking up server/g, "'⏳ Waking up server");
      content = content.replace(/'\? Reset link sent!/g, "'✅ Reset link sent!");
      content = content.replace(/'\? Invalid reset link/g, "'❌ Invalid reset link");
      content = content.replace(/'\? Failed to send/g, "'❌ Failed to send");
      content = content.replace(/'\? STAGE/g, "'🏟️ STAGE");
      
      // Fix generic remaining  or ??
      content = content.replace(/\uFFFD/g, ''); // Remove replacement characters
      content = content.replace(//g, '');      // Alternate replacement char
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir('C:/Users/Benard/Downloads/Desktop/tkmaster/src');
console.log('Global polish complete');
