const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
    // Shadows
    { regex: /\bdrop-shadow-2xl\b/g, replacement: '' },
    { regex: /\bdrop-shadow-xl\b/g, replacement: '' },
    { regex: /\bdrop-shadow-lg\b/g, replacement: '' },
    { regex: /\bdrop-shadow-md\b/g, replacement: '' },
    { regex: /\bdrop-shadow-sm\b/g, replacement: '' },
    { regex: /\bdrop-shadow\b/g, replacement: '' },
    // Fonts
    { regex: /\bfont-black\b/g, replacement: 'font-semibold' },
    { regex: /\bfont-extrabold\b/g, replacement: 'font-semibold' },
    { regex: /\bfont-bold\b/g, replacement: 'font-medium' },
    // Colors (Light mode)
    { regex: /\btext-gray-900\b/g, replacement: 'text-slate-700' },
    { regex: /\btext-slate-900\b/g, replacement: 'text-slate-700' },
    { regex: /\btext-slate-800\b/g, replacement: 'text-slate-700' },
    { regex: /\btext-black\b/g, replacement: 'text-slate-700' },
    // Colors (Dark mode)
    { regex: /\bdark:text-white\b/g, replacement: 'dark:text-slate-200' },
    { regex: /\bdark:text-slate-100\b/g, replacement: 'dark:text-slate-200' }
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

            // Cleanup multiple spaces that might have been created by removing shadows
            newContent = newContent.replace(/  +/g, ' ');

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

walkDir(srcDir);
console.log('Smooth UI refactoring completed.');
