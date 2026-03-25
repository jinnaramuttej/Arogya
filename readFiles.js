const fs = require('fs');
console.log('### git log --oneline -20\\n' + fs.readFileSync('out1.txt', 'utf16le'));
console.log('### git status\\n' + fs.readFileSync('out2.txt', 'utf16le'));
console.log('### git diff HEAD~3 --name-only\\n' + fs.readFileSync('out3.txt', 'utf16le'));
