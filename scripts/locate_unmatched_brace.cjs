const fs = require('fs');
const lines = fs.readFileSync('src/components/Registration.jsx', 'utf8').split('\n');
const stack = [];

for (let i = 0; i < lines.length; i++) {
	const line = lines[i];
	for (let j = 0; j < line.length; j++) {
		const ch = line[j];
		if (ch === '{') stack.push({ line: i + 1, col: j + 1 });
		if (ch === '}') {
			if (stack.length === 0) {
				console.log('Unmatched } at', i + 1, j + 1);
				process.exit(0);
			}
			stack.pop();
		}
	}
}

if (stack.length > 0) {
	console.log('Unmatched { count', stack.length, 'top at', stack[stack.length - 1]);
} else {
	console.log('No unmatched {');
}
