import { newsScraperService } from './services/newsScraperService';
import { newsDirectorService } from './services/newsDirectorService';

async function main() {
  const url = 'https://www.callofduty.com/br/pt/blog/2026/10/call-of-duty-modern-warfare-4-launch-multiplayer-operators-weapons-equipment-create-a-class';
  console.log('--- TESTANDO RASPAGEM DA MATÉRIA ---');
  const article = await newsScraperService.scrapeUrl(url);
  console.log('Título:', article.title);
  console.log('Site:', article.siteName);
  console.log('Parágrafos extraídos:', article.paragraphs.length);
  console.log('Imagens extraídas:', article.images.length);
  article.images.forEach(img => console.log(' -> Foto:', img.url));

  console.log('\n--- GERANDO ROTEIRO E PLANO DE VÍDEO ---');
  const plan = newsDirectorService.generateVideoPlan({ article, styleMode: 'gamer_streamer' });
  console.log('Cenas geradas:', plan.scenes.length);
  console.log('Duração total estimada (com +15% de margem):', plan.totalDurationSeconds, 'segundos');
  plan.scenes.forEach(sc => {
    console.log(`[Cena ${sc.order} - ${sc.heading}] (${sc.durationInSeconds}s) - Efeito: ${sc.kenBurnsEffect}`);
    console.log(`  Narração: "${sc.narration}"`);
  });
}

main().catch(console.error);
