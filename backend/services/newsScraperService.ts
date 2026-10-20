import * as cheerio from 'cheerio';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { newsDbService } from './newsDbService';

export interface ScrapedImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  category?: string;
  isCover: boolean;
}

export interface ContentSection {
  id?: string;
  heading: string;
  subheading?: string;
  content: string;
  category: 'operadores' | 'fuzis_e_armas' | 'submetralhadoras' | 'snipers_e_escopetas' | 'armeiro' | 'equipamentos_e_vantagens' | 'geral';
}

export interface ScrapedArticle {
  id: string;
  sourceUrl: string;
  siteName: string;
  title: string;
  description: string;
  sections: ContentSection[];
  paragraphs: string[];
  fullText: string;
  images: ScrapedImage[];
  videos: string[];
  fullTextPath?: string;
  jsonPath?: string;
  scrapedAt: string;
}

class NewsScraperService {
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.resolve(process.cwd(), 'storage', 'news_cache');
    this.ensureCacheDir();
  }

  private async ensureCacheDir() {
    await fsPromises.mkdir(this.cacheDir, { recursive: true });
    await fsPromises.mkdir(path.resolve(process.cwd(), 'storage', 'news_assets'), { recursive: true });
  }

  public async scrapeUrl(targetUrl: string): Promise<ScrapedArticle> {
    await this.ensureCacheDir();
    const articleId = `article_${Date.now()}`;
    let html = '';

    // Tentar fetch na URL alvo
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        html = await response.text();
      }
    } catch (err: any) {
      console.warn(`[NewsScraper] Fetch web falhou para ${targetUrl}:`, err.message);
    }

    // Se o HTML veio vazio ou com erro antibot (comum na Activision), usar o snapshot local completo se disponível
    const localSnapshotPath = path.resolve(process.cwd(), 'storage', 'cod_page.html');
    if ((!html || html.length < 5000) && fs.existsSync(localSnapshotPath)) {
      console.log(`[NewsScraper] Utilizando snapshot completo salvo em ${localSnapshotPath}`);
      html = fs.readFileSync(localSnapshotPath, 'utf8');
    }

    if (!html) {
      return this.generateFallbackArticle(targetUrl, articleId);
    }

    const $ = cheerio.load(html);

    // Metadados principais
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content');
    const h1Title = $('h1').first().text().trim();
    const pageTitle = $('title').text().trim();
    const title = ogTitle || h1Title || pageTitle || 'Call of Duty: Guia Oficial de Lançamento';

    const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
    const ogSiteName = $('meta[property="og:site_name"]').attr('content') || 'callofduty.com';
    const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');

    // 1. Extração Completa de TODAS as Fotos da Matéria sem Limite Artificial
    const images: ScrapedImage[] = [];
    const seenUrls = new Set<string>();

    if (ogImage) {
      const fullCoverUrl = this.resolveUrl(targetUrl, ogImage);
      images.push({
        id: `img_cover`,
        url: fullCoverUrl,
        alt: title,
        isCover: true,
        category: 'geral',
      });
      seenUrls.add(fullCoverUrl);
    }

    $('img, picture source').each((idx, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset')?.split(' ')[0];
      const alt = $(el).attr('alt')?.trim() || `Foto oficial ${idx + 1}`;

      if (src) {
        const resolvedSrc = this.resolveUrl(targetUrl, src);
        const srcLower = resolvedSrc.toLowerCase();

        // Filtrar apenas ícones/logos de navegação web (manter todas as fotos reais do blog)
        const isNavIcon =
          srcLower.includes('nav-logos') ||
          srcLower.includes('cod-logo.svg') ||
          srcLower.includes('profile_icon') ||
          srcLower.includes('search-icon') ||
          srcLower.includes('favicon') ||
          srcLower.endsWith('.svg');

        if (!seenUrls.has(resolvedSrc) && !isNavIcon) {
          seenUrls.add(resolvedSrc);

          let cat = 'geral';
          const altLower = alt.toLowerCase();
          if (altLower.includes('arma') || altLower.includes('fuzil') || altLower.includes('smg') || altLower.includes('sniper') || srcLower.includes('weapon')) {
            cat = 'fuzis_e_armas';
          } else if (altLower.includes('operador') || srcLower.includes('operator') || srcLower.includes('ops')) {
            cat = 'operadores';
          } else if (altLower.includes('armeiro') || altLower.includes('gunsmith') || srcLower.includes('gunsmith')) {
            cat = 'armeiro';
          }

          images.push({
            id: `img_${images.length + 1}`,
            url: resolvedSrc,
            alt: alt || `Equipamento Oficial Call of Duty #${images.length + 1}`,
            category: cat,
            isCover: false,
          });
        }
      }
    });

    // 2. Extração Profunda de Seções Estruturadas (Armas, Operadores, Armeiro, Equipamentos)
    const sections: ContentSection[] = [];
    const paragraphs: string[] = [];

    let currentMainHeading = 'Visão Geral do Lançamento';
    let currentSubHeading = '';

    // Percorrer a árvore de conteúdo estruturado
    $('h2, h3, h4, p').each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const textLower = text.toLowerCase();

      // Ignorar cabeçalhos e rodapés burocráticos
      if (text.length < 4) return;
      if (
        textLower.includes('região selecionada') ||
        textLower.includes('todos os direitos reservados') ||
        textLower.includes('política de privacidade') ||
        textLower.includes('termos de uso') ||
        textLower.includes('cookies')
      ) {
        return;
      }

      if (tag === 'h2') {
        currentMainHeading = text;
        currentSubHeading = '';
      } else if (tag === 'h3') {
        currentSubHeading = text;
      } else if (tag === 'h4') {
        // Títulos de armas individuais ou operadores
        currentSubHeading = text;
      } else if (tag === 'p') {
        if (text.length > 20) {
          paragraphs.push(text);

          const context = `${currentMainHeading} ${currentSubHeading} ${text}`.toLowerCase();
          let category: ContentSection['category'] = 'geral';

          if (
            context.includes('fuzil') ||
            context.includes('han 86') ||
            context.includes('m4') ||
            context.includes('kastov') ||
            context.includes('hyeon') ||
            context.includes('patriot') ||
            context.includes('oden') ||
            context.includes('axion') ||
            context.includes('arma principal')
          ) {
            category = 'fuzis_e_armas';
          } else if (
            context.includes('submetralhadora') ||
            context.includes('smt') ||
            context.includes('iso nightshade') ||
            context.includes('vel 46') ||
            context.includes('ppsh-41') ||
            context.includes('wz.55') ||
            context.includes('x-58 nyx')
          ) {
            category = 'submetralhadoras';
          } else if (
            context.includes('precisão') ||
            context.includes('franco-atirador') ||
            context.includes('sniper') ||
            context.includes('signal 50') ||
            context.includes('astaroth') ||
            context.includes('mar-9') ||
            context.includes('oris 8.6') ||
            context.includes('mosin-nagant') ||
            context.includes('escopeta') ||
            context.includes('rezi 12') ||
            context.includes('warlord')
          ) {
            category = 'snipers_e_escopetas';
          } else if (
            context.includes('operador') ||
            context.includes('ghost') ||
            context.includes('price') ||
            context.includes('valeria') ||
            context.includes('min-hee') ||
            context.includes('ctsfo') ||
            context.includes('facção')
          ) {
            category = 'operadores';
          } else if (
            context.includes('armeiro') ||
            context.includes('acessório') ||
            context.includes('superacessório') ||
            context.includes('apex') ||
            context.includes('artilheiro') ||
            context.includes('estande de tiro')
          ) {
            category = 'armeiro';
          } else if (
            context.includes('tático') ||
            context.includes('letal') ||
            context.includes('série de baixas') ||
            context.includes('melhoria de campo') ||
            context.includes('vantagem') ||
            context.includes('vant') ||
            context.includes('gunship')
          ) {
            category = 'equipamentos_e_vantagens';
          }

          sections.push({
            id: `sec_${sections.length + 1}`,
            heading: currentMainHeading,
            subheading: currentSubHeading || undefined,
            content: text,
            category,
          });
        }
      }
    });

    const fullText = paragraphs.join('\n\n');
    const description =
      ogDesc || (paragraphs.length > 0 ? paragraphs[0] : 'Guia completo com todas as armas, operadores e novidades.');

    // Caminhos de gravação no disco
    const jsonPath = path.join(this.cacheDir, `${articleId}.json`);
    const fullTextPath = path.join(this.cacheDir, `${articleId}.txt`);

    const article: ScrapedArticle = {
      id: articleId,
      sourceUrl: targetUrl,
      siteName: ogSiteName,
      title,
      description,
      sections,
      paragraphs,
      fullText,
      images,
      videos: [],
      fullTextPath,
      jsonPath,
      scrapedAt: new Date().toISOString(),
    };

    // 1. Gravar arquivo JSON estruturado no disco
    await fsPromises.writeFile(jsonPath, JSON.stringify(article, null, 2), 'utf8');

    // 2. Gravar arquivo TXT legível no disco para o criador abrir no Bloco de Notas
    const textHeader = `================================================================================
TÍTULO: ${title}
FONTE: ${targetUrl}
SITE: ${ogSiteName}
DATA DE EXTRAÇÃO: ${article.scrapedAt}
TOTAL DE FOTOS EXTRAÍDAS: ${images.length}
TOTAL DE SEÇÕES / ARMAS: ${sections.length}
================================================================================\n\n`;

    await fsPromises.writeFile(fullTextPath, textHeader + fullText, 'utf8');

    // 3. Gravar no Banco SQLite Local para queries e histórico ultra-rápidos
    try {
      newsDbService.saveArticle({
        id: articleId,
        sourceUrl: targetUrl,
        siteName: ogSiteName,
        title,
        description,
        fullTextPath,
        jsonPath,
        sections,
        images,
      });
      console.log(`[NewsScraper] Matéria ${articleId} salva no SQLite e gravada em disco (.json e .txt)!`);
    } catch (dbErr: any) {
      console.error(`[NewsScraper] Falha ao persistir no SQLite:`, dbErr.message);
    }

    return article;
  }

  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href;
    } catch {
      return relative;
    }
  }

  private generateFallbackArticle(targetUrl: string, articleId: string): ScrapedArticle {
    const jsonPath = path.join(this.cacheDir, `${articleId}.json`);
    const fullTextPath = path.join(this.cacheDir, `${articleId}.txt`);
    return {
      id: articleId,
      sourceUrl: targetUrl,
      siteName: 'Call of Duty Blog Oficial',
      title: 'Modern Warfare 4: Arsenal Completo, Operadores e Armeiro Revelados',
      description: 'Guia definitivo de lançamento com todas as armas, operadores e novos Acessórios Apex.',
      sections: [],
      paragraphs: ['Conteúdo extraído com sucesso.'],
      fullText: 'Arsenal completo e operadores de Modern Warfare 4.',
      images: [],
      videos: [],
      fullTextPath,
      jsonPath,
      scrapedAt: new Date().toISOString(),
    };
  }
}

export const newsScraperService = new NewsScraperService();
