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

const oldString = `  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 1.5rem;`;

const newString = `  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 2rem;`;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace all occurrences
    const regex = new RegExp(oldString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, newString);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`No changes in ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});
