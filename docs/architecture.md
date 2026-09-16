# KAIRO — Technical Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Tech as 🎙️ Field Worker
    participant Web as 💻 Next.js Frontend UI
    participant LK as 🌐 LiveKit Cloud Voice Layer
    participant Agent as 🤖 KAIRO Agent (Python)
    participant Moss as ⚡ Moss Retrieval Engine
    participant LLM as 🧠 Gemini 1.5 Flash

    Tech->>Web: Speaks Query ("Pump P-204 error E17")
    Web->>LK: Streams Audio Track
    LK->>Agent: Deepgram STT Transcribes Audio Stream
    Agent->>Moss: query_moss("P-204 E17")
    Note over Moss: Sub-10ms Semantic Index Search
    Moss-->>Agent: Returns Grounded Specs, E17 Error & ISO-S12-04 Safety Rule (3.21ms)
    Agent-->>LK: Publishes MOSS_TELEMETRY Packet over Data Channel
    LK-->>Web: Renders Moss Latency & Grounded Context Card
    Agent->>LLM: Ingests System Prompt + Moss Context
    LLM-->>Agent: Actionable Grounded Guidance
    Agent->>LK: Cartesia/TTS Synthesizes Speech
    LK-->>Tech: 🔊 Plays Voice Response
```

## System Components
1. **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS, `@livekit/components-react`.
2. **Voice & Media Transport**: LiveKit Cloud WebSocket audio streaming room (`kairo-field-room`).
3. **Voice Agent Worker**: Python `livekit-agents`, `silero` VAD, `deepgram` STT, `google` Gemini LLM, `cartesia` TTS.
4. **Retrieval Layer**: `MossRetriever` sub-millisecond semantic search engine over structured field dataset (`data/`).
