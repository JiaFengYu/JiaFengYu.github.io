![Yours truly](/images/blog/sglang_1.webp)
![My attendee badge!](/images/blog/sglang_2.webp)
![the start of a great journey 🙏](/images/blog/sglang-rings-JiaFengYu.webp)

![The main stage](/images/blog/sglang_3.webp)
![SGLang 🐐](/images/blog/sglang_4.webp)

## LLM background knowledge refresh

Here are some of the terms/concepts mentioned in the summit that I wasn't very familiar with and are general good to know in this industry:

### Weights vs harness based training

This came up during Thinking Machine's CTO Soumith Chintala's talk and is actually quite intuitive:

1. **Weights based training** is the "traditional" way to improve an LLM: you improve a model by performing "weights based" updates:

   the classic example is SFT so supervised fined tuning. By feeding the pretrained model more specific, labelled data, you teach it how to respond
   to the workload it will likely receive in production.

   The emphasis here is on **"you improve the model by making the weights better"**.

2. **Harness based training** is the opposite: the model weights and core remains identical, but you improve how that core model is used/prompted.

   This could include changes to the system prompts, MCP tool calling, retry policey, safety models, tokenization etc.

   Essentially, improve the supporting scaffholding around the model based on evals or load tests.

3. **How they compare**: **Weights based training** is a more general and "higher ceiling" approach where the model actually gets smarter, but the cost is quite steep:
you need large amounts of compute, time, and data to increase the overall intelligence of the model.

    On the other hand, **harness based training** is equivalent to picking the low hanging fruits: quick, convenient, near instantaeneous reflection of changes,
    but at the cost of only being surface level fixes.

    The good news is, and which is also the one of the conclusion from the fireside chat, is that there's
    no restriction as to why we can't do both. Frontier labs routinely do both to extract the most gains from their models.

### Not all attentions are equivalent

While it's tempting to visualize the attention mechanism as "try to understand how this token relates to the others", there are multiple different ways
to implement such mechanisms. I'll give a quick breakdown of three of the more common ones mentioned at this summit.

1. **Full KV attention**: this is the classic attention mechanism described in "attention is all you need".

   You compute the current token's attention output by the following formula:

   ```math
   \operatorname{Attention}(Q, K, V)
   = \operatorname{softmax}\!\left(\frac{QK^{\mathsf{T}}}{\sqrt{d_k}} + M\right)V
   ```

   Here, `d_k` is the key-vector dimension and `M` is the causal mask: zero for allowed positions and negative infinity for future positions.

   This takes into consideration the KV of all previously seen token and appends the current token's KV to the KV cache, making it comprehensive but also grow indefinitely.

2. **Sliding window attention**: mathematically identical way to compute attention score as full KV, but instead of storing every new token's KV,
   we only keep a predetermined amount of it, usually denomiated *W* tokens, and the cache is evicted FIFO.

   This has the benefit of not having an ever growing KV cache but also costs the loss of long term recall.

3. **Linear attention**: linear attention is quite a deep topic and the mathematical details are beyond the scope of this blog.

   For that, I'd recommend watching [Jia-Bin Huang's video](https://www.youtube.com/watch?v=pUCWwGR5WmQ) on the topic.

   However, the good news is that the intuition is straightforward: KV attention computes the current attention score based on **all** the previous tokens.
   This is a feature, not a bug: this gives ua comprehensive view on the entire prompt.

   But this also costs us a lot: as context window grows, the calculation gets quadratically more expensive **for prefill**.

   Linear attention addresses to fix this problem: the key is in the softmax function.
   Softmax, intuitively, takes the distribution of KV attention scores and turns them into a probability distribution.
   This function leverages exponential fn's, which are NOT linear.

   Linear attention drops this softmax completely, and instead updates the state matrix autoregressively.
   The state matrix is an attention cache that is fixed in size and that is updated with a linear recurrent relation.

   What this means in non matheamtical terms, is that we update a **fixed-size state** with the current token's key and value, then use its query to produce the attention output from that accumulated summary of key–value information.

   **Crucially, we do NOT need to look back at EVERY previous token.**

   This is also a problem though, this means the cache is lossy: we are not able to retrieve the original KV's for previously seen tokens as they are continuously
   incremented with the deltas to future tokens.

   This means we gradually lose context from the start of the prompts as context window grows: this is only exacerbated by the fact that the state matrix is fixed size as well.

4. **Flash attention**: this is **not** a different mathematical function but rather a GPU kernel to perform KV computations more efficiently.

   Again, the specific implementation details are deep and beyond the scope of this blog:
   the core issue is because of the large weight matrices often needing access to HBM memory, which is slow but large.

   By cleverly splitting the matrices into smaller blocks, everything can be done on fast SRAM.

   Flash attention is an implementation method: it can and **is** often combined with the aforementioned attention types.

### Parallel Parallelisms

In performance engineering, one common methodology is to never compute in serial unless you have to. GPU's are most useful when you leverage their ability to parallelize computations.

Here are some of the common parallelisms used:

1. **Data parallelism**: The simplest and probably most common form of parallelism. In inference, this is illustrated with scaling up a tier.

   Instead of having accelerator #1 process request A,B,C, we can have accelerator #1 process request A, #2 process request B, and #3 process request C.

   Obviously, this is in the ideal case where each accelerator is able to serve a complete replica of the LLM and you have 3 accelerators to spare.
   If you do, you've **tripled** your throughput.

2. **Tensor parallelism**: As the name implies, you parallelize the tensors here.

   A common example would be to split a weight matrix into multiple submatrices: each accelerator would perform a GEMM on a smaller weight matrix, and then we perform a concatenation or
   a redution with the 4 subresults to recreate what the result of the matrix multiplication.

   Why do this? In inference, this is most useful for the decode stage, which is memory bound.
   Loading large weight matrices is quite costly for the amount of compute we perform with them.
   Loading smaller matrices saves time, and that directly causes a decrease in latency.

   Yes, you still have to pay a penalty at the end to aggregate the results, but this penalty is much smaller than the time saved by splitting the computation.
   Therefore, tensor parallelism is an effective method to reduce latency.

3. **Pipeline parallelism**: Instead of splitting the weights across all accelerators, we split *layers* across the accelerators.

   Let's take an example of 32 layer deep LLM. An example of pipeline parallelism would be to process layers 0-7 on accelerator 1, and then send the intermediate result which is to be
   processed through layers 8-15 on accelerator 2 etc.

   This does come at the cost of the later layers needing the result from previous layers to be able to do their computations.
   In a poorly scheduled runtime, it's possible for accelerators to be idle while waiting for other acceleraots to finish their work.

   From my understanding, this is usually why tensor parallelism is prefered to pipeline parallelism, which is usually used if a model is so large it can't fit on a one accelerator.
   Pipeline parallelism will increase overall throughput, but will cost some latency, as there needs communication between each accelerators.

4. **Context parallelism**: We split not the model, but the input now. For a 200k token long prompt, we might split it into 4 50k subprompts.

   We'd have 4 accelerators each assigned to the 4 sub prompts: there is a unidirectional dependency though.
   Accelerator 1 needs accelerator 0 to finish processing it's prompt and pass its KV for the first 50k tokens to accelerator 1 before accelerator 1 can **finish** its work.
   The same for accelerator 2, who needs the KV from accelerator 0 AND 1 to finish its work.

   Emphasis on finish, not **start**: the later accelerators can still start working on their subprompts indepedently.
   For example, they can start computing their Q,K,V projections since this is a prerequisite to attention, which is the step that needs all the previously seen tokens.

   The interesting point for inference is that context parallelism is only useful in prefill: since we are generating new tokens autoregressively, there is no large prompt to split to apply CP.

5. **PD disaggregated inference**: Probably the most commonly used parallelism in inference.

   Prefill and decode have significantly different constraints despite both being the same fundamental operation in a pass through the layers of a transformer.
   Splitting them onto different acceelerators is intuitive as we can optimize each accelerators with prefill or decode specific parallelisms.

6. The final point, is that just like weights and harness based training, none of these are mutually exclusive, and you **should** try to combine them to obtain a more performant runtime flow.

## Accuracy

### Training and inference on the same format

This sounds obvious at first glance, but it's something that I as an inference developer never thought about too much.
It's not uncommon in inference scope to modify a model to fit specific serving requirements, such as quantizing the KV cache to a lower precision like FP8.

However, changing the numerical precision or model settings between training and serving can introduce differences or regressions the model owner didn't expect.
This is particularly relevant in the field of reinforcement learning, although this is still relevant in standard inference.

I'll just list some of the potential regressions that might happen if inference is served on different parameters than in training.

1. **Lower answer quality after quantization**: Reducing the precision of weights, activations, or the KV cache introduces rounding error and, with unsuitable scales, can clip values. This changes the model's token probabilities and can reduce accuracy, so the deployed quantization configuration needs its own quality evaluation.

2. **Different outputs across batch sizes or kernels**: Batch shapes and attention backends can change how floating-point operations are grouped and accumulated. Small numerical differences can change the selected token when candidates have similar probabilities, causing different continuations even with greedy decoding.

3. **Worse instruction following or malformed responses**: Changing the tokenizer, chat template, or special tokens can make inputs differ from the format the model learned. The model may misinterpret role boundaries, produce incorrectly formatted tool calls, or stop at the wrong point.

4. **Weaker long-context recall**: Extending the context beyond the lengths seen during training, changing positional-encoding settings, or replacing full attention with a smaller sliding window can alter the information the model can use. Earlier details may become harder to retrieve or fall outside the attention window entirely.

5. **A mismatch between rollout and training policies in RL**: Different precision or kernels can make the rollout engine and trainer assign different probabilities to the same tokens, even with identical weights. If this mismatch is ignored, algorithms that assume the responses came from the training policy can produce unintended updates.

**The goal is to validate the behavior we deploy, not to force training and inference to use identical batch sizes.** Small numerical differences can affect reproducibility without necessarily reducing task accuracy; exact token-probability alignment is a separate requirement, especially relevant to on-policy RL.

## Performance

### Megakernels

A megakernel is exactly what it sounds like: **a massive kernel**. Usually every operation has their own kernel, which we can optimize
and tune to be as general and as performant as possible: an attention kernel has vastly different needs compared to a KV cache quantization one.

However, this causes fragmentation, and particularly in decode, this can cause performance drops because of repeated kernel launches.
I explained this problem in more detail in my [previous blog article](https://jiafengyu.github.io/blog/fp8-kv-cache-lessons/), so I won't explain it
in too much detail here.

A megakernel solves these problems: by glueing all of these kernels together into one, we launch a kernel once and perform all the necessary
work without interruption, necessitating as little extra launches or storing intermediates on HBM as possible. We can also tune the kernel to be even more performant
since we are essentially specializing for a specific sequence we control.

This of course, is at the cost of specificity, a megakernel is tuned to work extremely well for one specific model on one specific hardware.
It might not even work for other model architectures or hardware types.

However, Chengze Fan from MSL gave a talk about megakernels and pointed out an interesting distinction that I want to highlight:

- Megakernels indeed do provide sizeable performance gains at low batch sizes, ideally one megakernel per decode layer
- **BUT**, at larger batch sizes, they are actually outperformed or become non interesting compared to stock kernels.

#### The obvious followup is why?

If megakernels are more specialized, shouldn't they be winning at all batch sizes? Otherwise why bother?

The answer to this question comes back to the fundamental differences of being **memory or compute bound**.
Ideally, we'd be bound by neither and we can infinitely scale up throughput by allocating more ressources equally: alas, reality is often dissapointing.

**At lower batch sizes,** each batch contains less request, which is obvious, but this means that less of the overall compute (measured is FLOPS) is used per batch.
This means that we are a lot less likely to be compute bound.
On the other hand, for each of these small batches, we are loading big weight matrices, which takes time, to do little amounts of mathematical work.

This is intutive because each of the individual kernels we launch requires its own scheduling, synchronizatyions, and then
read/write to HBM the intermediate results as a kernel finishes its work.

This creates an almost stuttering like process where each of those micro delays adds up over time.

This is also why a megakernel fixes precisely this performance bottleneck: by fusing all these kernels together, we are removing as much of this scheduling and micro delays
as possible, in addition to minimizing the amount of read/write operations.

#### Let's look at the converse now:

**at large batch sizes,** each batch we process contains much more requests and the overall batch takes more time to be processed.

By batching more requests, we naturally ammortize the cost of each individual kernel launch since we launch them for multiple requests simultaneously, making the cost
much cheaper comparatively.

Furthermore, the time it takes the accelerator to process increases to the point it actually surpasses the delays caused by the additional
kernel launches. This makes the potential winnings by fusing a megakernel much less relevant if at all.

To be absolutely clear, the delays caused by launching stock
kernels still exist and in a strict sense, but **a megakernel will not always overperform stock kernel launches** because those bottlenecks are less significant at higher batches.

Furthermore, fusing kernels can introduce new problems: by increasing register or shared memory usage, there are often new synchronization and scheduling tradeoffs
that you wouldn't have with stock kernels.

This is without mentioning the cost and difficulty to develop and maintain these megakernels.

### Unified memory management

This directly builds upon our previous analysis of different attention types.

It should be obvious that different attention types require **different cache management strategies**: full KV and sliding window may share a prefix based Radix tree if the sliding window matches,
but if we want to use linear attention, it is not obvious at all how we'd obtain the attention scores from the state matrix or how to go from prefixes to the state matrix.

This is just to mention some of the different attention types we covered above, this is not even mentioning more complicated forms of attention such as DeepSeek's MLA or sparse attention variations, as well
as different eviction policies etc.

However, this doesn't mean there is no way to unify the trees.
The common point between all these attention trees is that they start from the same shared prefixes: we should therefore be able to use those **prefix tokens as a key** to store different attention components.

Indeed, this is what SGLang implements in the `UnifiedTreeNode.component_data` attribute to remove duplicate trees.

However, this means that **a shared prefix does not necessarily mean a cache hit**, as the specific attention type we are calculating might have restrictions that make the previously computed value not in cache anymore.
This is best illustrated with sliding window attention: the tokens might be out of the sliding window so they are evicted from the sliding window KV component of those tokens.

This is then mitigated with the addition of validators such as the `_match_prefix_helper` in `sglang/python/srt/mem_cache/unified_cache/unified_tree_core.py`.

Finally, this is all glued together with the unified memory allocation framework, which lets the different cache components share a GPU memory budget, 
so one component can use capacity that would otherwise sit unused in another component’s fixed pool. 
These memory optimizations are complex and deserve their own breakdown, so I'll leave that as a future followup for myself.

### HiCache: Hierarchical KV caching in SGLang

On the topic of memory optimization, one that was bringed up during the summit is the HiCache project by Zhiqiang Xie from MSL.

The problem HiCache is trying to solve is how to preserve the everincreasing KV cache without hogging all HBM.

To explain this project more, we need to make a distinction between L1, L2, L3 cache, but not the standard GPU on die caches.

From HiCache's perspective, **L1 is GPU native memory**, so this usually refers to HBM (the overwhelming majority of GPU available memory).
**L2 is CPU DRAM**, and **L3 is disk storage (usually SSD)**.

HiCache's premise can be resumed by its `buffer_only`, which uses L2 cache as a **buffer between L1 <-> L3** instead of using it as a cache itself.
This is often because DRAM capacity is smaller than HBM or SSD storage and to prevent further fragmentation of the KV cache.

Specifically, GPU HBM would only contain the indexes and L3 (SSD storage) would store terabytes of full KV values, allowing us to keep large amounts of KV cache without hogging all the precious GPU HBM, 
thus solving the problem at hand.

### (CUDA) Rust in SGlang

This is probably the least "LLM" centric point in this entry, but this is equally as important to the overall performance of the runtime engine.

Rain Jiang ([rainj-me on Github](https://github.com/rainj-me)) gave a talk about the overall effort to migrate SGLang's **core CPU orchestrator from Python to Rust**.

Some of the notable PR's he made include the following:

1. **[PR #32358: Rust tokenizer manager, queues, and runtime](https://github.com/sgl-project/sglang/pull/32358)** — Introduces the Rust request-management foundation: lifecycle transitions, runtime configuration, and bounded queues connecting Rust workers to the Python scheduler.

   The queues provide backpressure and let Rust workers exchange request and response data without manipulating Python objects.

2. **[PR #32872: Rust tokenization, detokenization, and response dispatch](https://github.com/sgl-project/sglang/pull/32872)** — Adds Rust workers for prompt tokenization and incremental decoding of generated tokens into text.

   A response dispatcher routes scheduler output to the appropriate detokenizer worker, which owns each request's streaming state.

3. **[PR #29799: Integrating the embedded Rust server](https://github.com/sgl-project/sglang/pull/29799)** — Connects the Rust API server, tokenizer manager, and detokenizer to SGLang's startup and scheduler paths, enabled through `SGLANG_RUST_SERVER`.

   These components run as Rust threads inside the scheduler process, replacing the Python frontend stack on this path.

In this integration, the Rust frontend prepares requests and handles responses while SGLang's **Python scheduler** continues to manage batching and model execution.

This is an important reminder that not all performance improvements have to be related to kernel development, but there are also many opportunities in the **orchestration layer**.

Another detail is that this is an active effort and at the time of writing, not all features are migrated to Rust, but there is no limitation that says the core scheduler has to be in Python for example.

---

The conference also mentioned Nvidia's effort to modernize CUDA to include **Rust as a natively supported language alongside CUDA C++** for kernel work.

This is particularly interesting, but not for the same reasons as for the Python -> Rust migration.

C++ and Rust deliver comparable performance as they both allow for low level manipulation of threads and memory, but Rust really outshines C++ in the **memory safety** layer.

Instead of relying on the skill of the kernel engineer to juggle complex pointer arithmetic, Rust's ownership rules and compile time checks deliver a binary that's much
less likely to cause memory leaks, random segmentation faults, dangling pointers, or overall swilent runtime bugs.

It would be interesting to speculate on the place Rust will occupy in the future for runtime engines:

> a rustacean (like myself!) might dream that one day we might have an **end to end (from orchestrator to kernel) Rust stack**.

## TPU and systolic arrays
Systolic array based accelerators are gaining significant traction: the obvious example is Google's TPU.
AWS's Trainium is also a good example of this type of architecture.
However, developing on these accelerators used to have a significant bottleneck: there was no PyTorch native development stack for TPU's, which was and is still the primary runtime library reserchers built around.
Fortunately, we now have the `torchtpu` plugin which greatly reduces this problem:

### SGLang-torchtpu

Running PyTorch models on TPUs is not new: PyTorch/XLA already supported this, and projects such as SGL-JAX provided a JAX-based serving path. The challenge was bringing an
existing GPU-oriented serving engine onto TPU while preserving its execution behavior, optimized operations, and development workflow.

TorchTPU changes how PyTorch connects to TPU. Traditional PyTorch/XLA centered on lazy execution: recording operations into a graph, then compiling and executing that graph at
particular boundaries. TorchTPU provides an eager-first backend, allowing ordinary PyTorch execution while supporting fusion and compilation for performance. It still uses XLA
underneath; the change is in the integration developers interact with.

SGLang-TorchTPU connects that backend to the serving engine. It combines existing SGLang serving logic with TPU-specific execution and kernels, including kernels written in
Pallas. Request scheduling, batching, and KV-cache management can remain closer to the existing implementation, while hardware-specific work sits behind the TPU backend.

Compared with a JAX-based port, this preserves more of the PyTorch model implementation and workflow. Compared with traditional PyTorch/XLA, the intended advantage is closer
alignment with the eager and compiled execution patterns that PyTorch serving engines already use. This reduces the need to accommodate a different execution model throughout
the runtime.

This matters as models and serving features evolve. Every separate implementation creates work: porting new architectures, reproducing bug fixes, validating correctness, and
maintaining optimizations. Sharing more of that implementation can shorten the path from a new PyTorch model to a usable TPU deployment.

Hardware-specific optimization still matters. CUDA kernels do not automatically run on TPU, compilation still has costs, and feature coverage depends on the backend. The
significance is making TPU adoption require less duplicated engineering—not guaranteeing that it outperforms an optimized JAX or PyTorch/XLA implementation.

Overall, TorchTPU aims to make TPU behave more like a conventional PyTorch device backend, reducing TPU-specific changes to model and serving code. 
Its eager-first execution model is an important part of that goal, alongside integration with PyTorch’s compilation, custom-operator, and runtime interfaces. 
SGLang-TorchTPU builds on this foundation to reuse more of SGLang’s existing implementation.



## Closing thoughts
Wow. What a summit.

It's very easy to get caught up in the mundane day to day life as a big tech engineer in the Bay.

But at these types of conferences, is when you realize the sheer talent density in the Bay, and also that "the Bay" **really** is Silicon Valley, the innovation capital of the world.

The intellectual effervescence, passion, and sheer density is really something to be amazed at.

RadixArk's and SGLang core contributor Liangsheng Yin has [his GitHub status as "Grateful I am educated"](https://github.com/hnyls2002): that's also the note I'd like to end my brain dump on.

**Grateful** to have the opportunity to attend the SGLang summit.

**Grateful** to have the opportunity to meet all these exceptional people.

**Grateful** to SGLang and its community for making it happen.

Thank you SGLang summit! I've learned so much and I'm not kidding when I say it's quite possibly a life changing opportunity. 

See you next year 😇!

## References

- Summit agenda:
https://www.lmsys.org/blog/2026-11-17-sglang-summit-recap
- Slides and recordings: https://www.sglang.io/summit
