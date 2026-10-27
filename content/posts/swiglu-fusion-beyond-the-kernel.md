> Working outline for a future article. Replace these prompts with your own explanation, code, and measurements before publishing.

## Where fusion fits in the MLP

Introduce [SGLang PR #45219](https://github.com/sgl-project/sglang/pull/45219). Sketch the activation, quantization, and down-projection path and identify the intermediate memory traffic that fusion can remove.

## The consumer defines the contract

Explain the FP8 activation and scale layouts required by the downstream matrix multiplication. Discuss why the producer and consumer need to agree before a local kernel improvement is useful.

## Choosing when to use the fused path

Describe the supported hardware, decode mode, dtypes, and layouts. Show how unsupported configurations return to the existing path.

## Measuring more than a kernel

Compare the isolated operation with the surrounding MLP. Record batch shapes, warmup, CUDA graph use, and the measurement environment alongside any results.

## What review changed

Add a concrete example of feedback that improved the implementation, tests, or interface.

## The lesson I’m taking forward

Summarize what this contribution taught you about optimizing an inference system, and link to the relevant code and benchmarks.
