## Why I started this
- What SGLang PR / issue made you look at FP8 KV?

I found issue 30815 (https://github.com/sgl-project/sglang/issues/30815) while browsing the repo for learning opportunities and noticed someone already starting on the decode fix.
While this is a little unfortunate timing, I noticed there's an unclaimed followup for the same issue but for prefill.
However, due to the nature of this optimization, the performance gains will be a lot more noticeable on decode than prefill.
Since prefill expected gain is less significant, I thought this would be a great opportunity for me to get my hands dirty and apply the same optimization techniques to a kernel with less eyes.

- Before starting, I was aware of KV cache, FP8 being floating point with 8 bits of precision, prefill being where you process the input prompt, decode being where you generate the output prompt,etc.
However, tying all these concepts together at inference time, and with the lense of performance optimizations, is a completely new concept to me.

## The problem in one line
- The problem boils down to 2 words: **kernel launches.**
- For GPUs, a kernel is GPU kernels not being "kernels" in the traditional OS sense, but more akin to "user space programs" in this analogy.
- I'm not sure if this is fully accurate of an analogy, but from what I undestand,
a GPU kernel is just a program that the GPU scheduler will launch. In that sense, there isn't really a "GPU OS kernel" in the traditional sense: the GPU just launches kernels and there are no system calls etc.
- However, launching each of these kernels has a cost. The CPU orchestrating this layer has to get the right code/instruction to the GPU: this process is a lot less efficient than the actual GPU kernel math itself.
- Normally, this takes fractions of a seconds, probably in the range of microseconds. But when each decode iteration launches multiple kernels which take microseconds, in an iteration which is also in microseconds,
these delays add up.
- This is where the concept of a kernel fusion comes in:

## What fusion actually means
Kernel fusion is a very simple concept: you literally combine two or more kernels together into a single kernel.
Concretely, this means gluing two or more functions together into one.
In the changes breakdown, I will breakdown which kernels specifically and how I fused them to solve the aforementioned problem.

## Prefill vs Decode
- If you paid attention to the previous explanations, I mentioned that kernel launches really start to hurt in decode iterations.
This makes sense since you have to pay the penalty of having your CPU talk to the NVIDIA or any other GPU driver and pass the instruction to launch which kernel to the GPU multiple times.
Prefill, by nature, being a single pass, means you only pay the penalty once, and the penalty is trivial compared to the time it takes to process the entire prompt accross very large GEMM's.
So why is this work still relevant? Where is the real winning?
- We need to add another word to the problem description: **separate**. **Separate kernel launches**.
- To illustrate this better, let's start looking at the actual changes:


## Changes breakdown
1. Why the old flow was inefficient:
   - Entry point for our purposes is the `set_kv_buffer_prefix_valid` fn in `python/sglang/srt/mem_cache/memory_pool.py`
   - The root of the issue is the following code:
```python
        if cache_k.dtype != self.dtype:
            if k_scale is not None:
                cache_k.div_(k_scale)
            if v_scale is not None:
                cache_v.div_(v_scale)
            cache_k = cache_k.to(self.dtype)
            cache_v = cache_v.to(self.dtype)

        if self.store_dtype != self.dtype:
            cache_k = cache_k.contiguous().view(self.store_dtype)
            cache_v = cache_v.contiguous().view(self.store_dtype)
        else:
            cache_k = cache_k.contiguous()
            cache_v = cache_v.contiguous()
```
   - The code above checks the data type of the KV cache, and if it isn't the same as the desired data type, then we need to quantiggze.
   - The problem arises: we first launch the `.div(k_scale)` kernel, which scales down the floating point values to the desired range.
   This is needed since when we quantize down and lose precision, the range that can be expressed also shrinks. By dividing by a certain scale,
   we preserve the proportional distance between values while shrinking the absolute distance.
   Then we cast it via the `to(self.dtype)` kernel, which is where we allocate the smaller floating point type the KV cache will be stored in.
   - We already have 2 separate kernel launches on the same `cache_k` and `cache_v` objects, and we still aren't done.
   Later in this fn, we finally call the `_set_kv_buffer_prefix_valid_impl(` fn, which is just a wrapper to validate and pass them to the actual Triton kernel,
   which is the `set_kv_buffer_prefix_valid_tiled` fn in `python/sglang/kernels/ops/kvcache/cache_move.py`.
   Here, after loading in the appropriate values and doing some pointer arithmetic, we finally store the quantized KV cache at the desired location.
   - Just in this one run, we have **5 separate kernel launches**.
   - Not only that, after the 4 kernel launches to scale down and cast the KV cache, we need to store the intermediate values in HBM to then pass it to the
   final Triton kernel to store it.
   - For prefill purposes, the 5 separate kernel launches isn't very problematic since the time it takes to compute prefill across the whole prompt usually dwarfs
   the separate kernel launches, but what **is** a problem is the fact we have to write it to HBM and then read from it in the kernel.

2. GPU memory hierarchy:
   - Just like CPU's, not all GPU memory is the same. In fact, the concepts are pretty similar if not isomorphic.
   - Inside the actual GPU chip, there are registers and SRAM/L1/L2 shared cache.
   As far as my current understanding, this is pretty much equivalent to the same concepts for CPU memory.
   - Crucially, HBM is **NOT** inside the GPU chip itself with all the SM's and warps, but it is physically on the GPU card itself, just connected to the chip, not inside it.
   - Each time a kernel must fetch data from HBM, it has to "leave the GPU" chip and read from HBM. It's pretty anologous to CPU reading from RAM/disk instead of from registers/shared cache.
   - Here's a diagram to showcase this memory hierarchy:
![GPU memory hierarchy, from registers through shared memory and L1, L2, HBM, and system RAM.](/images/blog/fp8-kv-memory-hierarchy.svg)

3. Proposed new flow:
   - Instead of performing this in separate functions and kernels, we should encapsulate all these mathematical operations into a single, unified, **fused** kernel,
   that we call once from `set_kv_buffer_prefix_valid`. We should NOT compute some intermediate value by launching PyTorch kernels, in the Python orchestration layer,
   write it to HBM when context switch to launch the `set_kv_buffer_prefix_valid_tiled` Triton kernel at the end of the original `set_kv_buffer_prefix_valid` fn,
   and then READ from HBM inside the Triton kernel.
   - We SHOULD just pass everything `set_kv_buffer_prefix_valid_tiled` needs so we can do the scaling down and casting and writing inside the one kernel itself.
   - This will not only save us kernel launches, but crucially, save us from the costly write and read from HBM, which is really what matters for prefill.
   - From my current understanding, KV cache are almost always generated in BF16 or FP16, but this often causes the KV cache to be too large, hence the need to quantize (ie downsize) the cache itself.
   - The natural quantized type is FP8. While it is possible and sometimes FP4 is used too, I think FP4 might have too limited range and accuracy lost is too much.
   - As of writing (Q4 2026) and my understanding at this time, it seems most KV cache quantization do BF16->FP8. This is therefore the workflow I decided to optimize for this PR.

4. Fused kernel:
```python
@triton.jit
def set_kv_buffer_prefix_valid_tiled_fp8(
    src_k_ptr,
    src_v_ptr,
    dst_k_ptr,
    dst_v_ptr,
    loc_2d_ptr,
    commit_len_ptr,
    k_scale,
    v_scale,
    src_k_row_stride,
    src_v_row_stride,
    dst_k_row_stride,
    dst_v_row_stride,
    block_size,
    ROW_ELEMS: tl.constexpr,
    ELEMS_PER_TILE: tl.constexpr,
    K_SCALE_IS_TENSOR: tl.constexpr = False,
    V_SCALE_IS_TENSOR: tl.constexpr = False,
):
    bid = tl.program_id(0)
    row = tl.program_id(1)
    tid = tl.program_id(2)

    commit_len = tl.load(commit_len_ptr + bid)
    if row >= commit_len:
        return

    elem_off = tid * ELEMS_PER_TILE + tl.arange(0, ELEMS_PER_TILE)
    mask_elem = elem_off < ROW_ELEMS

    loc = tl.load(loc_2d_ptr + bid * block_size + row)
    src_row = bid * block_size + row

    src_k_row_ptr = src_k_ptr + src_row * src_k_row_stride + elem_off
    src_v_row_ptr = src_v_ptr + src_row * src_v_row_stride + elem_off
    dst_k_row_ptr = dst_k_ptr + loc * dst_k_row_stride + elem_off
    dst_v_row_ptr = dst_v_ptr + loc * dst_v_row_stride + elem_off

    # Tensor division rounds the divisor first and uses correctly rounded division.
    k_val = tl.load(src_k_row_ptr, mask=mask_elem, other=0).to(tl.float32)
    if K_SCALE_IS_TENSOR:
        k_scale = k_scale.to(src_k_ptr.dtype.element_ty).to(tl.float32)
        k_val = tl.div_rn(k_val, k_scale)
    else:
        # Eager host-scalar division multiplies by a rounded FP32 reciprocal.
        k_val = k_val * tl.div_rn(1.0, k_scale)
    k_val = k_val.to(src_k_ptr.dtype.element_ty).to(dst_k_ptr.dtype.element_ty)

    v_val = tl.load(src_v_row_ptr, mask=mask_elem, other=0).to(tl.float32)
    if V_SCALE_IS_TENSOR:
        v_scale = v_scale.to(src_v_ptr.dtype.element_ty).to(tl.float32)
        v_val = tl.div_rn(v_val, v_scale)
    else:
        v_val = v_val * tl.div_rn(1.0, v_scale)
    v_val = v_val.to(src_v_ptr.dtype.element_ty).to(dst_v_ptr.dtype.element_ty)

    tl.store(dst_k_row_ptr, k_val, mask=mask_elem)
    tl.store(dst_v_row_ptr, v_val, mask=mask_elem)
```
- This is the actual fused kernel, which is basically a clone from the original `set_kv_buffer_prefix_valid_tiled` fn.
- Here's the major changes broken down:
- Adding `k_scale, v_scale`: obvious. We want to do the scaling work inside the same kernel to avoid intermediates.
- `ROW_BYTES` to `ROW_ELEMS`: Previously, we took in an already casted in FP8 KV cache and then stored it, since the datatype is the same, we can count in bytes natively.
However, since we want to do the casting inside the same kernel, we now have two datatypes to keep track off and the previous offset math fails, so we need to count in elements instead.
This is the same reason why we want from `byte_off` to `elem_off`
- `K_SCALE_IS_TENSOR` flag: The original scales can be either tensors or scalars, the math changes depending on the case.
If it is a tensor, we need to divide every item in the KV vector by the scale's value. If it is a scalar, then it is much simpler and faster actually.
However, emphasis on the **original** tensor. In our implementation, we actually force the input scale parameters to be floats via the fused scales: more details later.
- Let's take `k_val` as an example:
```python
    if K_SCALE_IS_TENSOR:
        k_scale = k_scale.to(src_k_ptr.dtype.element_ty).to(tl.float32)
        k_val = tl.div_rn(k_val, k_scale)
    else:
        # Eager host-scalar division multiplies by a rounded FP32 reciprocal.
        k_val = k_val * tl.div_rn(1.0, k_scale)
    k_val = k_val.to(src_k_ptr.dtype.element_ty).to(dst_k_ptr.dtype.element_ty)
```
- We are saying, if `k_scale` is a tensor, then we first cast the scale to it's source datatype (most often BF16/FP16), and then cast it again to FP32.
This is actually subtle, and to be honest, despite digging deep on this, it's still not immediately obvious to why this is implemented in such a manner.
- From what I understand, we do this because PyTorch set the convention that we want to do the cast in two steps.
Since rounding is not associative, to preserve accuracy or what the engine expects, we need to match the convention used.
- Why do we cast to FP32? I think this is to capture more of the granularities since FP32 has a higher numerical range.
- Finally, we simply call Triton's divide and round fn.
    - **NOTE:** Despite this being VERY similar to the operation we did before in the old flow, this is **NOT** a kernel launch.
    The reason is because we are launching this from within a kernel, so this is **already** launching on a GPU, and we are simply calling Triton's mathematical divide and round fn.
    The previous call to `div_(k_scale)` is done at the Python orchestration layer. This means this was launched on **CPU**, therefore needing to communicate with the CUDA driver and
    do the journey all the way to the GPU and then launch the actual mathematical operation we are doing here. This enqueuing process is what makes a kernel launch expensive.
    Meanwhile here, we are just doing math after we are already fully settled in a GPU. Hence the performance gain.
- For the scalar case, it is much simpler. Since we only have one scalar scale, we can apply it to all the values equally.
We use a reciprocal trick here: by diving 1 by the scale value, we create the reciprocal of it and then multiply it to the entire vector.
Why is this cheaper? Multiplication is significantly cheaper than division, and from the little research I've done on this, division is just multiplication with extra steps.
I think this efficiency gain is rooted at the hardware level.
- Crucially, this also matches the behavior in the fallback eager kernel: creating a coherent and matching control flow is much more important.
- The last important point to mention: when do we call this kernel?
    - We previously said we optimized this for BF16->FP8 quantization. This is true, but there's no one saying we can only quantize this direction.
    In fact, we never restrict the input datatype to be BF16: we can proceed just as well if it isn't. We just assume it is because that's the most common setup.
- Finally, after all this work, we just need to call our new kernel correctly: we preserve the old, eager flow as a fallback for cases where our kernel isn't leveraged.
We simply check the following conditions, if they all map to true, then we can leverage our fused kernel:
```python
        if (
            cache_k.dtype != self.dtype
            and self.dtype == fp8_dtype
            and fused_k_scale is not None
            and fused_v_scale is not None
        ):
```
- There's one final detail here worth mentioning: we not only check if we need to quantize (ie, the cache's dataype doesn't match the desired datatype) to FP8, but also check if the **fused** scales exist.
This is also where we close the aforementioned detail about the original vs provided scales to the kernel. The kernel always receives floats no matter what via the fused scale.
Why fused? We introduced a small helper function `_resolve_fused_scale()`, which basically extracts the actual scale value from the scales. This is mostly relevant when the original scale is a tensor.
Else, we just pass the original scale value casted to float. Since we lose the original tensor structure via this helper, we preserve that information with the aforementioned `SCALE_IS_TENSOR` flag.
Then in the kernel, we recreate the operation as if we passed the original tensor instead of just the extracted float scalar.
- There's just one question that remains: why? Why do all this work instead of just passing the original tensor? There are two rasons:
    - SGLang already caches the values of the float scales form previous weight loading ops. We do not need to re-read the tensor one more time if its contents are already cached.
    - This allows us to simplify the input arguments to the kernel, where we force the scales to be floats and not sometimes floats sometimes tensors. This keeps it simple and unambiguous.



## Performance
| Variant | Kernel sequence | Median GPU time per layer |
| --- | --- | ---: |
| Eager fallback | K division + V division + K FP8 cast + V FP8 cast + byte-copy store | 14.528 us |
| Fused | Required source-layout copy + fused FP8 quantize/store | 4.864 us |
| **Speedup** |  | **2.99x** |

- As expected, fusing these operations and most importantly, removing the intermediate HBM wrote significantly reduced the overall latency for this operation during prefill.
- While a speedup of 2.99x is impressive, this is just for the FP8 quantization of the KV cache during prefill, it is **not** a 3x latency reduction on prefill overall.
- In fact, I ran this end to end accross a few requests and recorded only a 0.25ms in terms of total savings for workloads which require a FP8 quantization of the KV cache.
- While this is only a modest improvement, I'd like to think that the cumulation of these improvements is what gives SGLang its performance edge.


## Open ended questions/areas to explore more after
- This has been an extremely formative and rewarding learning opportunity. The level of intricacy and detail needed to tune these kernels is incredible.
- Despite all this work, I still feel like my understanding of how the KV cache is generated is lackluster. I only worked on quantizing an existing KV cache in this PR.
- Maybe in the next PR, I'd like to focus more on the KV cache generation itself and the overall `(Radix)Attention mechanism`: so q,k,v etc.

## Next step(s)
- We can probably generalize this kernel even further, so it's not just limited to FP8 KV cache quantization. But then, we'd probably have to merge the fallback kernel with this new approach.
This is probably an interesting followup to further deepen my understanding of the control flow/details in the quantization process.
But for now, I think this is a good place to stop and absorb all I learned during this work.
I'll leave this problem for future me or someone else.
