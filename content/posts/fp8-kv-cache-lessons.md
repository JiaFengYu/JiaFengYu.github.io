> Working outline for a future article. Replace these prompts with your own explanation, code, and measurements before publishing.

## The problem I set out to solve

Introduce [SGLang PR #40785](https://github.com/sgl-project/sglang/pull/40785): fusing FP8 KV-cache quantization into the prefix-valid commit kernel. Describe where the old path spent work and what the fused operation changes.

## Logical dtype versus storage dtype

Explain the difference between the requested FP8 cache format and the backing allocation. Show a small example of a typed view, and distinguish reinterpreting storage from converting values.

## The same formula can produce different bits

Walk through the eager reference’s operation order. Explain why intermediate rounding and scalar-versus-tensor scale behavior matter, with a concrete case from the implementation.

## Testing the boundaries

Describe how you tested partial prefixes, untouched cache locations, dtype combinations, and scale behavior. Include one example that caught a mistake.

## What the measurements say

Add reproducible results with the commit, GPU, software versions, shapes, and timing method. Separate an isolated kernel improvement from a full serving result.

## What I would carry into the next contribution

Close with the lesson you found most surprising, and a link to the final implementation or relevant review discussion.
