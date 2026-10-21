import * as cheerio from 'cheerio';
import fs from 'fs';

async function inspect() {
  const url = 'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class';
  console.log('Baixando página:', url);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }
  });

  const html = await res.text();
  console.log('Tamanho do HTML baixado:', html.length, 'bytes');

  // Salvar o HTML para análise
  fs.writeFileSync('storage/cod_page.html', html, 'utf8');

  const $ = cheerio.load(html);

  // Contar tags
  const imgTags = $('img');
  console.log('Total de <img> tags encontradas:', imgTags.length);

  const pictureTags = $('picture');
  console.log('Total de <picture> tags:', pictureTags.length);

  const allP = $('p');
  console.log('Total de tags <p>:', allP.length);

  // Listar todas as imagens com src, data-src, srcset
  const allImages: string[] = [];
  $('img, picture source').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset');
    if (src) {
      const cleanSrc = src.split(' ')[0];
      if (!allImages.includes(cleanSrc)) {
        allImages.push(cleanSrc);
      }
    }
  });
  console.log('Imagens únicas encontradas nas tags:', allImages.length);
  allImages.slice(0, 20).forEach((img, i) => console.log(` [${i+1}] ${img}`));

  // Procurar por menções de armas (Fuzil, M4, Submetralhadora, Sniper, etc.)
  console.log('\n--- TEXTO E PARÁGRAFOS ---');
  let weaponCount = 0;
  $('p, h2, h3, h4, li').each((_, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('arma') || text.toLowerCase().includes('fuzil') || text.toLowerCase().includes('operador') || text.toLowerCase().includes('classe')) {
      weaponCount++;
      if (weaponCount <= 10) {
        console.log(`[Tag: ${el.tagName}] -> ${text.slice(0, 100)}...`);
      }
    }
  });
  console.log('Total de trechos com palavras-chave de armas/operadores:', weaponCount);
}

inspect().catch(console.error);
