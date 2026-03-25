const { execSync } = require('child_process');
const fs = require('fs');
fs.writeFileSync('clean_git.txt', '### git log --oneline -20\n' + execSync('git log --oneline -20').toString() + '\n### git status\n' + execSync('git status').toString() + '\n### git diff HEAD~3 --name-only\n' + execSync('git diff HEAD~3 --name-only').toString());
