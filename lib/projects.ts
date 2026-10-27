export interface Project {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  featured?: boolean;
  pullRequest?: { number: number; url: string };
  details: { title: string; text: string }[];
  links: { label: string; href: string }[];
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
    title: "Mersenne Primes Sidecar",
    summary: "A Rust sidecar for tracking mprime progress, connecting my interests in systems programming and pure mathematics.",
    category: "Personal project · Mathematics",
    tags: ["Rust", "GIMPS"],
    details: [{ title: "Following the search", text: "The Great Internet Mersenne Prime Search brings volunteers together to test candidates for enormous prime numbers. This sidecar project tracks mprime progress across that work. My GIMPS username is jiafengyu." }],
    links: [{ label: "Why I contribute to GIMPS", href: "/gimps" }],
  },
  {
    slug: "orbit-simulator",
    title: "NASA Satellite Orbit Simulator",
    summary: "A Rust project exploring orbital data and satellite trajectory simulation.",
    category: "Personal project · Space",
    tags: ["Rust", "Simulation"],
    details: [{ title: "A systems project with a view of space", text: "This project explores fetching NASA orbital data and simulating satellite trajectories with a Rust backend. It combines an interest in space with hands-on systems programming." }],
    links: [],
  },
];
