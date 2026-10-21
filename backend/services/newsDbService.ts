import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

export interface StoredArticleRecord {
  id: string;
  sourceUrl: string;
  siteName: string;
  title: string;
  description: string;
  totalImages: number;
  totalSections: number;
  fullTextPath: string;
  jsonPath: string;
  createdAt: string;
}

class NewsDbService {
  private db: DatabaseSync;

  constructor() {
    const dbDir = path.resolve(process.cwd(), 'storage');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'saas_factory.db');
    this.db = new DatabaseSync(dbPath);
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        source_url TEXT NOT NULL,
        site_name TEXT,
        title TEXT NOT NULL,
        description TEXT,
        total_images INTEGER DEFAULT 0,
        total_sections INTEGER DEFAULT 0,
        full_text_path TEXT,
        json_path TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS article_sections (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        heading TEXT NOT NULL,
        subheading TEXT,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS article_images (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        url TEXT NOT NULL,
        alt TEXT,
        category TEXT,
        is_cover INTEGER DEFAULT 0,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS video_plans (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        theme_focus TEXT NOT NULL,
        target_duration_minutes INTEGER NOT NULL,
        total_duration_seconds INTEGER NOT NULL,
        style_mode TEXT NOT NULL,
        plan_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS intro_presets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hook_phrase TEXT NOT NULL,
        reading_guide TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS outro_presets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        outro_phrase TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL
      );
    `);
  }

  public saveArticle(article: {
    id: string;
    sourceUrl: string;
    siteName: string;
    title: string;
    description: string;
    fullTextPath: string;
    jsonPath: string;
    sections: Array<{ id?: string; heading: string; subheading?: string; category: string; content: string }>;
    images: Array<{ id: string; url: string; alt: string; category?: string; isCover: boolean }>;
  }) {
    const insertArticle = this.db.prepare(`
      INSERT OR REPLACE INTO articles (id, source_url, site_name, title, description, total_images, total_sections, full_text_path, json_path, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertArticle.run(
      article.id,
      article.sourceUrl,
      article.siteName,
      article.title,
      article.description,
      article.images.length,
      article.sections.length,
      article.fullTextPath,
      article.jsonPath,
      new Date().toISOString()
    );

    // Limpar seções e imagens anteriores caso seja replace
    this.db.prepare(`DELETE FROM article_sections WHERE article_id = ?`).run(article.id);
    this.db.prepare(`DELETE FROM article_images WHERE article_id = ?`).run(article.id);

    // Inserir seções
    const insertSection = this.db.prepare(`
      INSERT INTO article_sections (id, article_id, heading, subheading, category, content, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    article.sections.forEach((sec, idx) => {
      insertSection.run(
        `sec_${article.id}_${idx}`,
        article.id,
        sec.heading,
        sec.subheading || null,
        sec.category,
        sec.content,
        idx
      );
    });

    // Inserir imagens
    const insertImage = this.db.prepare(`
      INSERT INTO article_images (id, article_id, url, alt, category, is_cover, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    article.images.forEach((img, idx) => {
      insertImage.run(
        `img_${article.id}_${idx}`,
        article.id,
        img.url,
        img.alt || null,
        img.category || null,
        img.isCover ? 1 : 0,
        idx
      );
    });
  }

  public listRecentArticles(limit = 20): StoredArticleRecord[] {
    const rows = this.db.prepare(`
      SELECT id, source_url, site_name, title, description, total_images, total_sections, full_text_path, json_path, created_at
      FROM articles
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      sourceUrl: r.source_url,
      siteName: r.site_name,
      title: r.title,
      description: r.description,
      totalImages: r.total_images,
      totalSections: r.total_sections,
      fullTextPath: r.full_text_path,
      jsonPath: r.json_path,
      createdAt: r.created_at,
    }));
  }

  public getArticleById(articleId: string) {
    const article = this.db.prepare(`SELECT * FROM articles WHERE id = ?`).get(articleId) as any;
    if (!article) return null;

    const sections = this.db.prepare(`
      SELECT heading, subheading, category, content, order_index
      FROM article_sections
      WHERE article_id = ?
      ORDER BY order_index ASC
    `).all(articleId) as any[];

    const images = this.db.prepare(`
      SELECT id, url, alt, category, is_cover, order_index
      FROM article_images
      WHERE article_id = ?
      ORDER BY order_index ASC
    `).all(articleId) as any[];

    return {
      id: article.id,
      sourceUrl: article.source_url,
      siteName: article.site_name,
      title: article.title,
      description: article.description,
      fullTextPath: article.full_text_path,
      jsonPath: article.json_path,
      createdAt: article.created_at,
      sections: sections.map((s) => ({
        heading: s.heading,
        subheading: s.subheading,
        category: s.category,
        content: s.content,
      })),
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        category: img.category,
        isCover: img.is_cover === 1,
      })),
    };
  }

  public getIntroPresets(): IntroPreset[] {
    const rows = this.db.prepare(`SELECT * FROM intro_presets ORDER BY is_default DESC, name ASC`).all() as any[];
    if (rows.length === 0) {
      this.seedDefaultPresets();
      return this.getIntroPresets();
    }
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      hookPhrase: r.hook_phrase,
      readingGuide: r.reading_guide,
      isDefault: r.is_default === 1,
      updatedAt: r.updated_at,
    }));
  }

  public saveIntroPreset(preset: {
    id?: string;
    name: string;
    hookPhrase: string;
    readingGuide: string;
    isDefault?: boolean;
  }): IntroPreset {
    const id = preset.id || `preset_${Date.now()}`;
    const updatedAt = new Date().toISOString();
    const isDefaultVal = preset.isDefault ? 1 : 0;

    if (preset.isDefault) {
      this.db.prepare(`UPDATE intro_presets SET is_default = 0`).run();
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO intro_presets (id, name, hook_phrase, reading_guide, is_default, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, preset.name, preset.hookPhrase, preset.readingGuide, isDefaultVal, updatedAt);

    return {
      id,
      name: preset.name,
      hookPhrase: preset.hookPhrase,
      readingGuide: preset.readingGuide,
      isDefault: Boolean(preset.isDefault),
      updatedAt,
    };
  }

  public deleteIntroPreset(id: string): boolean {
    const res = this.db.prepare(`DELETE FROM intro_presets WHERE id = ?`).run(id);
    return (res as any).changes > 0;
  }

  private seedDefaultPresets() {
    const defaults = [
      {
        id: 'preset_gamer',
        name: 'Gamer / Streamer (Stanley Alves)',
        hookPhrase: 'Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo...',
        readingGuide: 'Fala moçada! Segura firme esse controle, pega a pipoca e vem comigo! Sejam muito bem-vindos ao canal! Hoje nós vamos analisar todas as novidades, armas e estratégias do lançamento. Preste bastante atenção em cada detalhe, porque a jogabilidade mudou completamente. Não se esqueça de deixar o seu like e se inscrever no canal para não perder nenhum conteúdo exclusivo!',
        isDefault: 1,
      },
      {
        id: 'preset_noticia',
        name: 'Notícia / Jornalismo / Geral',
        hookPhrase: 'Atenção! Principais destaques e atualizações urgentes de hoje...',
        readingGuide: 'Olá a todos! Sejam muito bem-vindos ao nosso boletim de notícias. Hoje nós trazemos as apurações exclusivas, os fatos mais relevantes e os desdobramentos oficiais dessa matéria. Acompanhe a nossa análise detalhada até o final e deixe a sua opinião nos comentários!',
        isDefault: 0,
      },
      {
        id: 'preset_politica_tech',
        name: 'Opinião / Política / Tech',
        hookPhrase: 'Fala pessoal! Hoje vamos analisar os bastidores e o que ninguém te contou sobre isso...',
        readingGuide: 'Sejam todos muito bem-vindos! No vídeo de hoje nós vamos dissecar os bastidores, as decisões que estão em jogo e como essa pauta impacta diretamente o seu dia a dia. Compartilhe esse vídeo com seus amigos e participe da discussão!',
        isDefault: 0,
      },
    ];

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO intro_presets (id, name, hook_phrase, reading_guide, is_default, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    for (const d of defaults) {
      stmt.run(d.id, d.name, d.hookPhrase, d.readingGuide, d.isDefault, now);
    }
  }

  public getOutroPresets(): OutroPreset[] {
    const rows = this.db.prepare(`SELECT * FROM outro_presets ORDER BY is_default DESC, name ASC`).all() as any[];
    if (rows.length === 0) {
      this.seedDefaultOutroPresets();
      return this.getOutroPresets();
    }
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      outroPhrase: r.outro_phrase,
      isDefault: r.is_default === 1,
      updatedAt: r.updated_at,
    }));
  }

  public saveOutroPreset(preset: {
    id?: string;
    name: string;
    outroPhrase: string;
    isDefault?: boolean;
  }): OutroPreset {
    const id = preset.id || `outro_${Date.now()}`;
    const updatedAt = new Date().toISOString();
    const isDefaultVal = preset.isDefault ? 1 : 0;

    if (preset.isDefault) {
      this.db.prepare(`UPDATE outro_presets SET is_default = 0`).run();
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO outro_presets (id, name, outro_phrase, is_default, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, preset.name, preset.outroPhrase, isDefaultVal, updatedAt);

    return {
      id,
      name: preset.name,
      outroPhrase: preset.outroPhrase,
      isDefault: Boolean(preset.isDefault),
      updatedAt,
    };
  }

  public deleteOutroPreset(id: string): boolean {
    const res = this.db.prepare(`DELETE FROM outro_presets WHERE id = ?`).run(id);
    return (res as any).changes > 0;
  }

  private seedDefaultOutroPresets() {
    const defaults = [
      {
        id: 'outro_gamer',
        name: 'Gamer / Streamer (Stanley Alves)',
        outroPhrase: 'E você, o que achou dessa novidade? Deixa nos comentários qual arma você vai testar primeiro, esmaga o botão de like, se inscreve no canal @stanleyalvesbr e até o próximo vídeo!',
        isDefault: 1,
      },
      {
        id: 'outro_noticia',
        name: 'Notícia / Jornalismo / Geral',
        outroPhrase: 'Qual a sua opinião sobre esse assunto? Comente aqui embaixo, deixe seu like, compartilhe com seus amigos e ative o sininho para acompanhar as próximas atualizações!',
        isDefault: 0,
      },
      {
        id: 'outro_politica_tech',
        name: 'Opinião / Política / Tech',
        outroPhrase: 'O que você acha dessa decisão? Quero ver o seu ponto de vista nos comentários. Inscreva-se no canal para fortalecer o debate e até a próxima análise!',
        isDefault: 0,
      },
    ];

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO outro_presets (id, name, outro_phrase, is_default, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    for (const d of defaults) {
      stmt.run(d.id, d.name, d.outroPhrase, d.isDefault, now);
    }
  }
}

export interface IntroPreset {
  id: string;
  name: string;
  hookPhrase: string;
  readingGuide: string;
  isDefault: boolean;
  updatedAt: string;
}

export interface OutroPreset {
  id: string;
  name: string;
  outroPhrase: string;
  isDefault: boolean;
  updatedAt: string;
}

export const newsDbService = new NewsDbService();
