const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
    // Colors (Light mode) - make them slightly darker (from 700 to 800)
    { regex: /\btext-slate-700\b/g, replacement: 'text-slate-800' },
    // Colors (Dark mode) - make them slightly brighter (from 200 to 100)
    { regex: /\bdark:text-slate-200\b/g, replacement: 'dark:text-slate-100' }
];

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;

            for (const r of replacements) {
                newContent = newContent.replace(r.regex, r.replacement);
            }

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

walkDir(srcDir);
console.log('Text color adjustment completed.');
