// 将 vite 构建产物内联为离线单文件 HTML（双击即可观看，无需服务器）
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const outDir = path.join(root, 'dist-single');
fs.mkdirSync(outDir, { recursive: true });

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// 内联 JS
html = html.replace(
  /<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/,
  (_, p) => {
    const code = fs.readFileSync(path.join(dist, p), 'utf8');
    if (code.includes('</script')) throw new Error('bundle 中含 </script>，需转义处理');
    return `<script type="module">\n${code}\n</script>`;
  }
);

// 内联 CSS
html = html.replace(
  /<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/,
  (_, p) => `<style>\n${fs.readFileSync(path.join(dist, p), 'utf8')}\n</style>`
);

if (html.includes('assets/')) console.warn('⚠ 仍存在外部资源引用，请检查');

const out = path.join(outDir, '故宫体素_单文件.html');
fs.writeFileSync(out, html);
console.log(`✓ 已生成离线单文件: ${out} (${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
