const fs = require('fs');
const s = fs.readFileSync('src/components/Registration.jsx','utf8');
const lines = s.split('\n');
let brace=0, paren=0, angle=0;
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  for(let j=0;j<line.length;j++){
    const ch=line[j];
    if(ch==='{') brace++;
    if(ch==='}') brace--;
    if(ch==='(') paren++;
    if(ch===')') paren--;
    if(ch==='<') angle++;
    if(ch==='>') angle--;
    if(brace<0) { console.log('Unmatched } at', i+1, j+1); process.exit(0); }
    if(paren<0) { console.log('Unmatched ) at', i+1, j+1); process.exit(0); }
    if(angle<0) { console.log('Unmatched > at', i+1, j+1); process.exit(0); }
  }
}
console.log('End counts:',{brace,paren,angle});
for(let i=lines.length-1;i>=0;i--){
  const l=lines[i];
  for(let j=l.length-1;j>=0;j--){
    const ch=l[j];
    if(ch==='}') { if(brace>0) brace--; else continue; }
    if(ch==='{') { if(brace<0) brace++; else continue; }
  }
}
console.log('Final counts after scan:',{brace,paren,angle});
