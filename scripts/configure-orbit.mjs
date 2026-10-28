import { writeFileSync } from 'node:fs';

let origin = process.env.NEXT_PUBLIC_ORBIT_API_URL || null;
if (origin) {
  const url = new URL(origin);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw Error('NEXT_PUBLIC_ORBIT_API_URL must be an HTTPS backend origin; localhost HTTP is allowed for preview.');
  }
  origin = url.origin;
}
writeFileSync(new URL('../public/orbit-explorer/config.js', import.meta.url), `// Generated public API origin. No credentials belong in this file.\nexport const apiBase = ${JSON.stringify(origin)};\n`);
console.log(origin ? `Orbit explorer API: ${origin}` : 'Orbit explorer API is not configured; launch link stays hidden.');
