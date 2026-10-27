import { rmSync } from "node:fs";

// Next 14 requires a prerender candidate for an empty dynamic route and writes
// its notFound response as HTML. Omit that reserved candidate from static hosting.
rmSync(new URL("../out/blog/_empty/", import.meta.url), { recursive: true, force: true });
