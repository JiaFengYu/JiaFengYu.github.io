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
  demo?: { href: string; label: string };
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
    demo: process.env.NEXT_PUBLIC_ORBIT_API_URL ? { href: "/orbit-explorer/index.html", label: "Open interactive explorer" } : undefined,
    summary: "A Rust orbit explorer with ground-station pass analysis, custom satellite inputs, and measured speedups from reusing SGP4 predictions.",
    category: "Personal project · Tested MVP",
    tags: ["Rust", "Axum", "SGP4", "Orbital mechanics"],
    preview: { src: "/images/orbit-track-explorer.png", alt: "Rust satellite explorer showing an ISS ground track, a selected ground station, and the corresponding elevation chart and pass window", caption: "A historical ISS orbit with a ground observer beneath one sample. Rust computes the track, look angles, and sampled pass; the browser renders and navigates the results.", width: 1208, height: 1628 },
    details: [
      { title: "Explore from the ground", text: "Choose among six historical orbit examples or paste a custom TLE, pick a ground station on the map, and inspect elevation, azimuth, and slant range. An interactive elevation chart and sampled pass windows let you jump to an overhead pass. Resolution controls, six-hour windows, orbital-period jumps, and variable-speed playback make it possible to compare very different orbit shapes." },
      { title: "Rust under the hood", text: "The browser displays results from an Axum/Tokio service. Rust handles TLE validation, SGP4 propagation, TEME-to-WGS84 conversion, observer geometry, pass analysis, and GeoJSON. Initialized SGP4 constants and a bounded LRU cache of immutable orbit samples avoid repeating propagation when only the observer changes. Custom TLEs are processed for the request without being saved or cached." },
      { title: "Measured performance gains", text: "In a local release benchmark on an AMD EPYC 9654, reusing orbit results reduced median Rust handler-plus-JSON time by 40.7–43.3% across 181, 721, and 2,161 positions. The 181-position case fell from 0.402 ms to 0.238 ms. Each workload used 400 paired requests with identical output checks. These measurements compare two Rust execution paths and exclude HTTP, cloud startup, and browser time; the explorer displays live server timings separately from its browser round trip." },
      { title: "Validation and scope", text: "Twenty integration tests include 668 SGP4 reference states and expected failures, independent observer geometry, cache isolation/eviction, custom-input validation, and API behavior. Desktop/mobile browser checks cover the interactive controls and a static frontend using a separate Rust service. Bundled inputs are historical, pass windows use sampled geometric clearance, and Earth orientation uses an approximate GMST rotation. Sunlight, terrain, refined rise/set events, and live satellite telemetry are outside the model." },
    ],
    links: [
      { label: "View source on GitHub", href: "https://github.com/JiaFengYu/orbit-track" },
      { label: "Read the Rust benchmark methodology", href: "https://github.com/JiaFengYu/orbit-track/blob/main/docs/performance.md" },
      { label: "Download source and setup guide", href: "/downloads/orbit-track-source.zip", download: true },
      { label: "Download validation report", href: "/downloads/orbit-track-validation.md", download: true },
    ],
  },
];
