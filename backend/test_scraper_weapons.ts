import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';

const htmlPath = path.resolve('storage', 'cod_page.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('--- BUSCANDO ARMAS (FUZIS, SMGS, SNIPERS, ESCOPETAS) ---');
$('h3, h4').each((_, el) => {
  const t = $(el).text().replace(/\s+/g, ' ').trim();
  const nextP = $(el).next('p').text().replace(/\s+/g, ' ').trim();
  if (
    t.includes('Han') ||
    t.includes('Kastov') ||
    t.includes('Hyeon') ||
    t.includes('Patriot') ||
    t.includes('ISO') ||
    t.includes('VEL') ||
    t.includes('Signal') ||
    t.includes('PPSh') ||
    t.includes('M4') ||
    t.includes('Axion') ||
    t.includes('Oden') ||
    t.includes('Rezi')
  ) {
    console.log(`[${el.tagName}] ${t} -> Detalhe: ${nextP.slice(0, 100)}...`);
  }
});
