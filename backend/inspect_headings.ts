import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('storage/cod_page.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- SEÇÕES E TÍTULOS ---');
$('h2, h3, h4').each((_, el) => {
  const text = $(el).text().trim();
  if (text.length > 5) {
    console.log(`[${el.tagName.toUpperCase()}] ${text}`);
  }
});

console.log('\n--- PARÁGRAFOS COM ARMAS E OPERADORES ---');
let count = 0;
$('p').each((_, el) => {
  const text = $(el).text().replace(/\s+/g, ' ').trim();
  if (text.length > 80 && (text.includes('Arma') || text.includes('Fuzil') || text.includes('Operador') || text.includes('Armamento') || text.includes('Classe') || text.includes('Multijogador'))) {
    count++;
    if (count <= 15) {
      console.log(`\n(${count}) ${text}`);
    }
  }
});
console.log('\nTotal de parágrafos ricos sobre o jogo:', count);
