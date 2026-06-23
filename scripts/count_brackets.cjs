const fs = require('fs');
const s = fs.readFileSync('src/components/Registration.jsx','utf8');
const counts = { '{':0, '}':0, '(':0, ')':0, '<':0, '>':0 };
for(const ch of s){ if(Object.prototype.hasOwnProperty.call(counts,ch)) counts[ch]++; }
console.log(counts);