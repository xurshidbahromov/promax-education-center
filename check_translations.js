const fs = require('fs');
const path = require('path');

const locales = ['en', 'uz', 'ru'];
const localePath = path.join(__dirname, 'src/locales');

function extractKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const keys = new Set();
    const regex = /"([\w\.]+)"\s*:/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.add(match[1]);
    }
    return keys;
}

const keySets = {};
locales.forEach(lang => {
    keySets[lang] = extractKeys(path.join(localePath, `${lang}.ts`));
});

const allKeys = new Set();
Object.values(keySets).forEach(set => {
    set.forEach(key => allKeys.add(key));
});

console.log('--- Missing Keys Report ---');
let hasMissing = false;

allKeys.forEach(key => {
    const missingIn = [];
    locales.forEach(lang => {
        if (!keySets[lang].has(key)) {
            missingIn.push(lang);
        }
    });

    if (missingIn.length > 0) {
        hasMissing = true;
        console.log(`Key "${key}" is missing in: ${missingIn.join(', ')}`);
    }
});

if (!hasMissing) {
    console.log('All locale files have matching keys!');
}
