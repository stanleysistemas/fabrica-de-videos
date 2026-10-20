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
        sec.id || `sec_${article.id}_${idx}`,
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
        img.id,
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
}

export const newsDbService = new NewsDbService();
