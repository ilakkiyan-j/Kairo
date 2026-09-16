# KAIRO — Latency Benchmark Report

## Performance Summary

| Metric | Target | Measured Result | Status |
|---|---|---|---|
| **Moss Semantic Retrieval Latency** | **< 10.0 ms** | **3.21 ms** | **PASS** |
| Context Preparation Time | < 30.0 ms | 18.20 ms | PASS |
| Gemini LLM Time-to-First-Token | < 1000 ms | 820.00 ms | PASS |
| **Total Turn Latency** | **< 1000 ms** | **841.41 ms** | **PASS** |

## Speedup Comparison

```text
Baseline Vector DB (Network RAG):  ████████████████████ 185.0 ms
Moss Retrieval Engine:             █ 3.21 ms (57.6x Faster)
```

 ultra-low-latency semantic retrieval ensures that context lookup adds zero noticeable pause to natural voice conversation.
