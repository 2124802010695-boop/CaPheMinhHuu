const fs = require('fs');
const path = require('path');

const ignoreDirs = new Set(['node_modules', 'bin', 'obj', '.git', '.vs', 'dist', 'build', 'TestResults', '.idea']);
const ignoreExts = new Set(['.md', '.docx', '.ppt', '.txt', '.csv', '.mpp', '.zip', '.pptx', '.pdf']);

function generateTree(dirPath, prefix = '', outStream) {
    let entries;
    try {
        entries = fs.readdirSync(dirPath);
    } catch (e) {
        return;
    }
    
    // Sort entries alphabetically
    entries.sort();
    
    const filteredEntries = [];
    for (const e of entries) {
        const fullPath = path.join(dirPath, e);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                if (ignoreDirs.has(e)) continue;
                filteredEntries.push({ name: e, isDir: true, fullPath });
            } else {
                const ext = path.extname(e).toLowerCase();
                if (ignoreExts.has(ext)) continue;
                filteredEntries.push({ name: e, isDir: false, fullPath });
            }
        } catch (e) {
            // Ignore
        }
    }
    
    for (let i = 0; i < filteredEntries.length; i++) {
        const e = filteredEntries[i];
        const isLast = (i === filteredEntries.length - 1);
        const connector = isLast ? '\\---' : '+---';
        
        outStream.write(`${prefix}${connector}${e.name}\n`);
        
        if (e.isDir) {
            const newPrefix = prefix + (isLast ? '    ' : '|   ');
            generateTree(e.fullPath, newPrefix, outStream);
        }
    }
}

const outPath = path.join(__dirname, 'clean_tree.txt');
const outStream = fs.createWriteStream(outPath, { encoding: 'utf8' });

outStream.write('D:\\BaoCaoTotNghiep_2026\\CaPheMinhHuu\n');

const folders = ['.github', 'CaPheMinhHuu', 'capheminhhuu.ui', 'capheminhhuu-customer', 'diagrams'];
const existingFolders = folders.filter(d => fs.existsSync(path.join(__dirname, d)));

for (let i = 0; i < existingFolders.length; i++) {
    const d = existingFolders[i];
    const isLast = (i === existingFolders.length - 1);
    const connector = isLast ? '\\---' : '+---';
    outStream.write(`${connector}${d}\n`);
    const prefix = isLast ? '    ' : '|   ';
    generateTree(path.join(__dirname, d), prefix, outStream);
}

outStream.end();
