export const site = {
  name: "Jayden Yu",
  description: "Software engineer and SGLang contributor working on LLM inference, GPU kernels, and performance engineering.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://jiafengyu.github.io").replace(/\/$/, ""),
  github: "https://github.com/JiaFengYu",
  contributions: "https://github.com/sgl-project/sglang/pulls?q=is%3Apr+author%3AJiaFengYu",
};

// Next Link handles basePath; files in public/ need it explicitly.
export function assetPath(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}

export function absoluteUrl(path: string) {
  return `${site.url}${path}`;
}
