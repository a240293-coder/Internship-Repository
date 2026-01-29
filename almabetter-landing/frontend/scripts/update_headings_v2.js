const fs = require('fs');
const path = require('path');

const files = [
  'frontend/styles/DigitalMarketing.module.css',
  'frontend/styles/SocialMedia.module.css',
  'frontend/styles/EcommerceGlobal.module.css',
  'frontend/styles/AppDevelopment.module.css',
  'frontend/styles/WebDevelopment.module.css',
  'frontend/styles/Designing.module.css',
  'frontend/styles/Logistics.module.css',
  'frontend/styles/DataScience.module.css',
  'frontend/styles/PROutreach.module.css'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regex to match the block with flexible whitespace
    // We capture the indentation before the first property
    const regexWithIndent = /([ \t]*)font-size:\s*1\.25rem;\s*font-weight:\s*700;\s*color:\s*var\(--text-main\);\s*margin-bottom:\s*1\.5rem;/g;
    
    const newContentWithIndent = content.replace(regexWithIndent, (match, indent) => {
        // We use the captured indentation for all lines
        return `${indent}font-size: 1.5rem;
${indent}font-weight: 700;
${indent}color: var(--text-main);
${indent}margin-bottom: 2rem;`;
    });

    if (content !== newContentWithIndent) {
      fs.writeFileSync(filePath, newContentWithIndent, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`No changes in ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});
