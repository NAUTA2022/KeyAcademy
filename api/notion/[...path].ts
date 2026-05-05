/**
 * api/notion/[...path].ts — Vercel serverless proxy for Notion API
 *
 * In production the browser cannot call Notion directly (no CORS + key exposure).
 * This function runs on Vercel's Node.js runtime with the NOTION_TOKEN env var,
 * forwards the request to https://api.notion.com, and returns the response.
 *
 * File upload special case:
 *   POST /v1/files/{id}/send  — multipart FormData, NOT JSON.
 *   We detect this path and pipe the raw body with the correct Content-Type
 *   (which Vercel reads from the incoming request headers).
 *
 * Setup: add NOTION_TOKEN to your Vercel project environment variables.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    // Disable Vercel's body parser so we get the raw stream for multipart uploads
    bodyParser: false,
  },
};

const NOTION_API = 'https://api.notion.com';
const NOTION_VERSION = '2022-06-28';

/** Read the raw request body as a Buffer (works with bodyParser: false). */
function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── CORS preflight ───────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'NOTION_TOKEN env var not set on server.' });
  }

  // Build the Notion URL from the catch-all path segments
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path as string];
  const notionPath = segments.join('/');
  const url = `${NOTION_API}/${notionPath}`;

  const method = req.method ?? 'GET';
  const hasBody = ['POST', 'PATCH', 'PUT'].includes(method);

  // Detect multipart file send: POST /v1/files/{id}/send
  const isFileSend =
    method === 'POST' &&
    /^v1\/files\/[^/]+\/send$/.test(notionPath);

  let upstreamBody: BodyInit | undefined;
  const upstreamHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
  };

  if (isFileSend) {
    // Pipe raw multipart body; preserve the browser's Content-Type (includes boundary)
    const rawBody = await readRawBody(req);
    upstreamBody = rawBody;
    const contentType = req.headers['content-type'];
    if (contentType) upstreamHeaders['Content-Type'] = contentType;
  } else if (hasBody) {
    // Regular JSON request — Vercel's body parser already parsed it
    const rawBody = await readRawBody(req);
    upstreamBody = rawBody.length ? rawBody : undefined;
    upstreamHeaders['Content-Type'] = 'application/json';
  }

  const upstream = await fetch(url, {
    method,
    headers: upstreamHeaders,
    ...(upstreamBody !== undefined ? { body: upstreamBody } : {}),
  });

  // Try JSON; fall back to text for non-JSON responses (e.g. 204 No Content)
  const contentType = upstream.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } else {
    const text = await upstream.text();
    return res.status(upstream.status).send(text);
  }
}
