/**
 * notionDB.ts — Raw Notion REST API client
 *
 * All requests go to /api/notion/v1/... which is:
 *  - In dev: proxied by Vite (vite.config.ts) with the auth header injected server-side
 *  - In prod: handled by api/notion/[...path].ts (Vercel serverless function)
 *
 * The Notion token NEVER appears in the browser bundle.
 */

const API_BASE = '/api/notion/v1';

// ─── Types ────────────────────────────────────────────────────────

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  properties: Record<string, NotionPropValue>;
}

export type NotionFileItem =
  | { type: 'file';     name: string; file:     { url: string; expiry_time: string } }
  | { type: 'external'; name: string; external: { url: string } };

export type NotionPropValue =
  | { type: 'title'; title: RichTextItem[] }
  | { type: 'rich_text'; rich_text: RichTextItem[] }
  | { type: 'email'; email: string | null }
  | { type: 'select'; select: { name: string } | null }
  | { type: 'multi_select'; multi_select: { name: string }[] }
  | { type: 'number'; number: number | null }
  | { type: 'url'; url: string | null }
  | { type: 'date'; date: { start: string; end?: string | null } | null }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'files'; files: NotionFileItem[] }
  | { type: 'created_time'; created_time: string }
  | { type: 'last_edited_time'; last_edited_time: string };

interface RichTextItem {
  plain_text: string;
  text: { content: string };
}

interface QueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

// ─── Core fetch wrapper ───────────────────────────────────────────

async function notionRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Notion ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Database operations ──────────────────────────────────────────

/** Query all pages from a database, handling pagination automatically. */
export async function queryDatabase(
  dbId: string,
  filter?: object,
  sorts?: object[],
): Promise<NotionPage[]> {
  const all: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (cursor) body.start_cursor = cursor;

    const res = await notionRequest<QueryResponse>(
      `/databases/${dbId}/query`,
      'POST',
      body,
    );

    all.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);

  return all;
}

/** Create a new page (row) in a database. */
export async function createPage(
  dbId: string,
  properties: Record<string, unknown>,
): Promise<NotionPage> {
  return notionRequest<NotionPage>('/pages', 'POST', {
    parent: { database_id: dbId },
    properties,
  });
}

/** Update an existing page's properties. */
export async function updatePage(
  pageId: string,
  properties: Record<string, unknown>,
): Promise<NotionPage> {
  return notionRequest<NotionPage>(`/pages/${pageId}`, 'PATCH', { properties });
}

/** Archive (soft-delete) a page. */
export async function archivePage(pageId: string): Promise<void> {
  await notionRequest(`/pages/${pageId}`, 'PATCH', { archived: true });
}

// ─── Property readers ─────────────────────────────────────────────

export const read = {
  title: (p?: NotionPropValue): string =>
    p?.type === 'title'
      ? p.title.map(t => t.plain_text).join('')
      : '',

  /** Concatenates ALL rich_text chunks — handles strings split across multiple items. */
  richText: (p?: NotionPropValue): string =>
    p?.type === 'rich_text'
      ? p.rich_text.map(t => t.plain_text).join('')
      : '',

  email: (p?: NotionPropValue): string =>
    p?.type === 'email' ? (p.email ?? '') : '',

  select: (p?: NotionPropValue): string =>
    p?.type === 'select' ? (p.select?.name ?? '') : '',

  number: (p?: NotionPropValue): number =>
    p?.type === 'number' ? (p.number ?? 0) : 0,

  url: (p?: NotionPropValue): string =>
    p?.type === 'url' ? (p.url ?? '') : '',

  dateStart: (p?: NotionPropValue): string =>
    p?.type === 'date' ? (p.date?.start ?? '') : '',

  checkbox: (p?: NotionPropValue): boolean =>
    p?.type === 'checkbox' ? p.checkbox : false,

  /** First hosted/external file URL from a files property. */
  files: (p?: NotionPropValue): string => {
    if (p?.type !== 'files' || !p.files.length) return '';
    const f = p.files[0];
    return f.type === 'file' ? f.file.url : f.type === 'external' ? f.external.url : '';
  },

  /** All URLs from a files property (for multi-image fields). */
  allFiles: (p?: NotionPropValue): string[] => {
    if (p?.type !== 'files') return [];
    return p.files
      .map(f => f.type === 'file' ? f.file.url : f.type === 'external' ? f.external.url : '')
      .filter(Boolean);
  },
};

// ─── Property builders ────────────────────────────────────────────

const CHUNK = 2000; // Notion rich_text max chars per item

/** Split long strings into 2000-char chunks so they survive round-trips through Notion. */
function chunkString(str: string): { text: { content: string } }[] {
  if (!str) return [{ text: { content: '' } }];
  const chunks: { text: { content: string } }[] = [];
  for (let i = 0; i < str.length; i += CHUNK) {
    chunks.push({ text: { content: str.slice(i, i + CHUNK) } });
  }
  return chunks;
}

export const build = {
  title: (v: string) => ({
    title: [{ text: { content: (v ?? '').slice(0, 2000) } }],
  }),

  /** Stores strings of any length by splitting into 2000-char chunks. */
  richText: (v: string) => ({
    rich_text: chunkString(v ?? ''),
  }),

  email: (v: string) => ({ email: v || null }),

  select: (v: string) => ({ select: v ? { name: v } : null }),

  number: (v: number) => ({ number: v }),

  url: (v: string) => ({ url: v || null }),

  date: (v: string) => ({ date: v ? { start: v } : null }),

  checkbox: (v: boolean) => ({ checkbox: !!v }),

  /** Single Notion-hosted file by file_upload_id (use after uploadFileToNotion). */
  fileUpload: (fileUploadId: string, name = 'upload') => ({
    files: [{ type: 'file_upload', name, file_upload: { id: fileUploadId } }],
  }),

  /** Multiple file_upload_ids. */
  fileUploads: (uploads: Array<{ id: string; name?: string }>) => ({
    files: uploads.map(u => ({
      type: 'file_upload',
      name: u.name ?? 'upload',
      file_upload: { id: u.id },
    })),
  }),

  /** External URL stored as a files property (alternative to url field). */
  externalFile: (url: string, name = 'file') => ({
    files: url ? [{ type: 'external', name, external: { url } }] : [],
  }),
};

// ─── File upload to Notion ────────────────────────────────────────
// Requires the Vite proxy (dev) or Vercel serverless fn (prod) to inject
// the Authorization header.  The /send step uses FormData — no JSON encoding.

/**
 * Upload a file to Notion.
 * Returns the file_upload_id which can be used in build.fileUpload().
 *
 * @param file             The File object to upload.
 * @param parentDatabaseId The database this file belongs to (for authorization).
 */
export async function uploadFileToNotion(
  file: File,
  parentDatabaseId: string,
): Promise<string> {
  // Step 1 — create upload object
  const obj = await notionRequest<{ id: string }>('/files', 'POST', {
    parent: { type: 'database_id', database_id: parentDatabaseId },
    filename: file.name,
    content_type: file.type || 'application/octet-stream',
    mode: 'single_part',
  });

  // Step 2 — send binary content (must NOT use notionRequest which forces JSON)
  const formData = new FormData();
  formData.append('file', file, file.name);

  const res = await fetch(`${API_BASE}/files/${obj.id}/send`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — browser sets multipart/form-data + boundary
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Notion file send ${res.status}: ${text}`);
  }

  return obj.id;
}

// ─── Helpers for the "notion_file::" interim format ───────────────
// While a record hasn't been re-synced yet, image_url stores:
//   "notion_file::{fileUploadId}::{objectUrlForPreview}"
// Components call getDisplayUrl() to get a renderable src.

/** Encode a pending Notion file reference into a compact string. */
export function encodeNotionFileRef(fileUploadId: string, previewObjectUrl: string): string {
  return `notion_file::${fileUploadId}::${previewObjectUrl}`;
}

/** Returns { fileUploadId, previewUrl } or null if it's a regular URL. */
export function decodeNotionFileRef(
  value: string,
): { fileUploadId: string; previewUrl: string } | null {
  if (!value?.startsWith('notion_file::')) return null;
  const parts = value.split('::');
  return { fileUploadId: parts[1] ?? '', previewUrl: parts[2] ?? '' };
}

/** Always returns a src usable in <img> or <video>. */
export function getDisplayUrl(value: string): string {
  const ref = decodeNotionFileRef(value);
  return ref ? ref.previewUrl : (value ?? '');
}
