/**
 * Dev server — `bun run dev` (Bun only, CONVENTIONS §8).
 *
 * Serves public/ and bundles src/presentation/app.ts on demand so the
 * template runs with zero build artifacts checked in:
 *   /            → public/index.html
 *   /app.js      → Bun.build of src/presentation/app.ts (browser target)
 *   /config/*    → public/config/* when present (404 otherwise — app.ts
 *                  falls back to its built-in DEV template config)
 *   /<path>      → public/<path>
 *
 * DEV ONLY: NODE_ENV is compiled to "development" so DevRoundProvider's
 * production guard stays armed in any real build pipeline.
 */

import { join, normalize } from 'node:path';

const projectRoot = join(import.meta.dir, '..');
const publicDir = join(projectRoot, 'public');
// Belladonna's Parlour: boot through the scenario-bank entrypoint (DEV ONLY)
const entrypoint = join(projectRoot, 'src', 'presentation', 'bp-app.ts');

const port = Number(process.env['PORT'] ?? 5173);

interface BundleCache {
  code: string;
  builtAt: number;
}

let cache: BundleCache | null = null;
const CACHE_TTL_MS = 1000; // rebuild at most once per second while iterating

async function bundle(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.builtAt < CACHE_TTL_MS) return cache.code;
  const result = await Bun.build({
    entrypoints: [entrypoint],
    target: 'browser',
    format: 'esm',
    sourcemap: 'inline',
    define: { 'process.env.NODE_ENV': JSON.stringify('development') },
    // pixi.js v8's circular internal imports break under Bun.build scope
    // renaming ("extensions2 is not defined") — keep it external; index.html
    // maps the bare specifier to the single-file ESM build via an import map.
    external: ['pixi.js'],
  });
  if (!result.success) {
    const logs = result.logs.map((l) => String(l)).join('\n');
    throw new Error(`bundle failed:\n${logs}`);
  }
  const artifact = result.outputs[0];
  if (!artifact) throw new Error('bundle produced no output');
  cache = { code: await artifact.text(), builtAt: now };
  return cache.code;
}

function contentType(path: string): string {
  if (path.endsWith('.html')) return 'text/html; charset=utf-8';
  if (path.endsWith('.js') || path.endsWith('.mjs')) return 'text/javascript; charset=utf-8';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.mp3')) return 'audio/mpeg';
  if (path.endsWith('.ogg')) return 'audio/ogg';
  if (path.endsWith('.wav')) return 'audio/wav';
  return 'application/octet-stream';
}

const server = Bun.serve({
  port,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    if (pathname === '/app.js') {
      try {
        const code = await bundle();
        return new Response(code, { headers: { 'content-type': 'text/javascript; charset=utf-8' } });
      } catch (err) {
        console.error(err);
        return new Response(`// ${String(err)}`, {
          status: 500,
          headers: { 'content-type': 'text/javascript; charset=utf-8' },
        });
      }
    }

    // Static files from public/ only — reject path traversal.
    const resolved = normalize(join(publicDir, pathname));
    if (!resolved.startsWith(publicDir)) return new Response('forbidden', { status: 403 });
    const file = Bun.file(resolved);
    if (await file.exists()) {
      return new Response(file, { headers: { 'content-type': contentType(resolved) } });
    }
    return new Response('not found', { status: 404 });
  },
});

console.log(`slot-client-template dev server → http://localhost:${server.port}`);
console.log('DEV ONLY: outcomes come from the seeded DevRoundProvider, never a real RGS.');
