export interface Project {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  featured?: boolean;
  pullRequest?: { number: number; url: string };
  details: { title: string; text: string }[];
  preview?: { src: string; alt: string; caption: string; width: number; height: number };
  links: { label: string; href: string; download?: boolean }[];
}

export const projects: Project[] = [
  {
    slug: "sglang-fp8-kv-cache",
    title: "FP8 KV-cache writes",
    summary: "Fusing quantization and writes for valid KV-cache prefixes in SGLang, with attention to storage dtypes and numerical parity.",
    category: "SGLang · Merged contribution",
    pullRequest: { number: 40785, url: "https://github.com/sgl-project/sglang/pull/40785" },
    tags: ["Triton", "FP8", "KV cache"],
    featured: true,
    details: [
      { title: "The problem", text: "Quantizing key and value tensors before writing them to the cache can require separate operations and temporary results. Combining those steps creates an opportunity to reduce memory movement." },
      { title: "What I contributed", text: "A fused path that quantizes and writes only the valid prefix for each request. The surrounding integration has to preserve the distinction between the requested cache dtype and its physical storage, respect scale semantics, and keep the existing fallback available." },
      { title: "What makes it interesting", text: "Matching an eager reference requires more than reproducing the formula. Intermediate rounding, scalar versus tensor scales, pointer types, and destination indexing all affect correctness." },
    ],
    links: [{ label: "Read merged PR #40785", href: "https://github.com/sgl-project/sglang/pull/40785" }],
  },
  {
    slug: "sglang-swiglu-fp8",
    title: "Dense SwiGLU + FP8 fusion",
    summary: "Combining activation and block-FP8 quantization along the decode path, while keeping the consumer’s layout and scale requirements in view.",
    category: "SGLang · Merged contribution",
    pullRequest: { number: 45219, url: "https://github.com/sgl-project/sglang/pull/45219" },
    tags: ["CUDA", "SwiGLU", "DeepGEMM"],
    featured: true,
    details: [
      { title: "The opportunity", text: "A dense MLP computes an activation before passing it to a down projection. When the matrix multiplication consumes block-FP8 activations, fusing activation and quantization can avoid materializing and rereading an intermediate tensor." },
      { title: "Integration matters", text: "My contribution includes the fused operation, the dispatch conditions, and focused correctness and benchmark coverage. The supported decode path has specific hardware, dtype, layout, and quantization requirements; other configurations retain the normal activation path." },
      { title: "How I evaluate it", text: "I separate kernel timing from the cost of dispatch and the surrounding MLP. A faster isolated operation is a useful signal, but a serving-performance claim requires measurements in the full inference path." },
    ],
    links: [{ label: "Read merged PR #45219", href: "https://github.com/sgl-project/sglang/pull/45219" }],
  },
  {
    slug: "mersenne-cluster",
    title: "GIMPS Watch",
    summary: "A Rust observer that follows worker output, saves events and checkpoints atomically in SQLite, and exposes the last observed state through a CLI and local dashboard.",
    category: "Personal project · Fixture-tested MVP",
    tags: ["Rust", "SQLite", "GIMPS"],
    preview: { src: "/images/gimps-watch-dashboard.png", alt: "GIMPS Watch showing two synthetic workers, source health, and raw record provenance", caption: "The runnable fixture demo: two synthetic workers with progress, completion, and error observations. Live mprime compatibility still needs validation against my home-machine logs.", width: 1280, height: 1884 },
    details: [
      { title: "What it does", text: "GIMPS Watch reads a documented subset of Prime95-style worker logs and JSON results without changing the underlying installation. Replay, watch, status, events, and serve commands share one SQLite event store. The dashboard shows the last observed assignment and progress, source health, errors, and the raw evidence behind each observation." },
      { title: "Reliable observation", text: "Events, worker state, and file checkpoints commit together. The reader handles partial lines, restart, file rotation, and truncation. Explicit assignment IDs support result deduplication; exponent-only matches remain labeled ambiguous. Quiet output does not automatically mean a stalled worker, and local counts are not account-wide GIMPS totals." },
      { title: "Tested scope", text: "Eleven integration tests cover parsing, transaction rollback, restart, rotation, deduplication, and API behavior. Desktop and mobile dashboard checks pass. A two-worker synthetic workload used 8.49 MiB RSS and 0.30% of one CPU core while idle, with appended records visible within 205 ms at a 200 ms polling interval. Compatibility with real home-machine logs remains the next validation step." },
    ],
    links: [
      { label: "View source on GitHub", href: "https://github.com/JiaFengYu/gimps-watch" },
      { label: "Download source and setup guide", href: "/downloads/gimps-watch-source.zip", download: true },
      { label: "Download validation report", href: "/downloads/gimps-watch-validation.md", download: true },
      { label: "Why I contribute to GIMPS", href: "/gimps" },
    ],
  },
  {
    slug: "orbit-simulator",
    title: "Satellite Orbit Explorer",
    summary: "A Rust SGP4 service with an offline interactive map, reproducible ground tracks, explicit orbital-element provenance, and a cached CelesTrak adapter.",
    category: "Personal project · Tested MVP",
    tags: ["Rust", "SGP4", "Orbital mechanics"],
    preview: { src: "/images/orbit-track-explorer.png", alt: "Satellite Orbit Explorer showing a predicted ISS ground track and selected position on a world map", caption: "A historical ISS fixture propagated from its July 2020 element epoch. The map displays predictions and their source data, not live satellite telemetry.", width: 1280, height: 1652 },
    details: [
      { title: "From elements to a ground track", text: "The CLI and local API validate TLE input, propagate it with SGP4, convert TEME positions to WGS84 geodetic coordinates, and export JSON or GeoJSON. An offline browser map supports satellite selection, UTC time controls, a sampled-position slider, source metadata, and element-age warnings. Tracks split at the date line." },
      { title: "Numerical checks", text: "The implementation pins SGP4 2.4.0 with WGS72 gravity constants and AFSPC compatibility mode. Tests compare 668 reference states and expected failures from the Vallado verification dataset, then check coordinate conversion independently. Ten integration tests cover numerical conventions, malformed input, request limits, provenance, provider-cache failures, and API behavior; desktop and mobile browser checks also pass." },
      { title: "Measured scope and limits", text: "A warm 181-sample track averaged 0.46 ms over local HTTP on an AMD EPYC 9654 development host, excluding provider downloads. Earth orientation uses an approximate GMST rotation, so this is an exploration tool rather than a navigation service. The provider adapter is tested against a local HTTP server; live CelesTrak access was unavailable during implementation." },
    ],
    links: [
      { label: "View source on GitHub", href: "https://github.com/JiaFengYu/orbit-track" },
      { label: "Download source and setup guide", href: "/downloads/orbit-track-source.zip", download: true },
      { label: "Download validation report", href: "/downloads/orbit-track-validation.md", download: true },
    ],
  },
];
