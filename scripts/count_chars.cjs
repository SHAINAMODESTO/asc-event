const fs = require('fs');
const path = 'src/components/Registration.jsx';
const s = fs.readFileSync(path, 'utf8');
const counts = { '"': 0, "'": 0, '`': 0 };
for (const ch of s) {
  if (Object.prototype.hasOwnProperty.call(counts, ch)) counts[ch]++;
}
console.log('counts:', counts);
