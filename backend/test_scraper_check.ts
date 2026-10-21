import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';

const htmlPath = path.resolve('storage', 'cod_page.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

const imgs: { src: string; alt: string }[] = [];
const seen = new Set<string>();

$('img, picture source').each((_, el) => {
  const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset')?.split(' ')[0];
  const alt = $(el).attr('alt') || '';
  if (src && !src.includes('.svg') && !src.includes('favicon') && !src.includes('nav-logos') && !src.includes('profile')) {
    if (!seen.has(src)) {
      seen.add(src);
      imgs.push({ src, alt });
    }
  }
});

const weaponsAndOps: { tag: string; text: string }[] = [];
$('h3, h4').each((_, el) => {
  const t = $(el).text().replace(/\s+/g, ' ').trim();
  if (t.length > 2 && !t.includes('Região') && !t.includes('Cookies')) {
    weaponsAndOps.push({ tag: el.tagName, text: t });
  }
});

console.log('Total de fotos exclusivas encontradas:', imgs.length);
console.log('Total de títulos de armas/operadores/equipamentos:', weaponsAndOps.length);
console.log('Amostra de 15 títulos encontrados:');
weaponsAndOps.slice(0, 15).forEach((w, idx) => console.log(`  ${idx + 1}. [${w.tag}] ${w.text}`));
