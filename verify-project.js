const fs = require('fs');
const path = require('path');

console.log('🔍 Checking learnBetter Landing Page Project Structure...\n');

const files = [
  'app/page.js',
  'app/layout.js',
  'app/globals.css',
  'components/Navbar.js',
  'components/Navbar.module.css',
  'components/Hero.js',
  'components/Hero.module.css',
  'components/BatchInfo.js',
  'components/BatchInfo.module.css',
  'components/Highlights.js',
  'components/Highlights.module.css',
  'components/Stats.js',
  'components/Stats.module.css',
  'components/ProgramValue.js',
  'components/ProgramValue.module.css',
  'components/Mentors.js',
  'components/Mentors.module.css',
  'components/Testimonials.js',
  'components/Testimonials.module.css',
  'components/HiringPartners.js',
  'components/HiringPartners.module.css',
  'components/Footer.js',
  'components/Footer.module.css',
  'next.config.mjs',
  'package.json',
  'README.md'
];

let allPresent = true;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allPresent) {
  console.log('✅ All files are present! Project is complete.');
  console.log('\nTo run the project:');
  console.log('1. npm install');
  console.log('2. npm run dev');
  console.log('3. Open http://localhost:3000');
} else {
  console.log('❌ Some files are missing. Please check above.');
}
console.log('='.repeat(50));
