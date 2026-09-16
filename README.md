# KAIRO — Context at the Speed of Conversation

> **Real-time voice AI copilot for industrial field workers powered by Moss ultra-low-latency semantic retrieval.**

---

## ⚡ Overview

**KAIRO** gives field technicians instant, hands-free voice access to operational knowledge without forcing them to stop working or navigate complex enterprise manuals. 

When a technician speaks (e.g. *"I'm at Site 12. Pump P-204 is showing error E17. What should I check first?"*), KAIRO retrieves exact equipment specs, error diagnostic steps, recent maintenance logs, and mandatory electrical safety procedures via **Moss** in **3.21 ms** and delivers actionable voice guidance over **LiveKit**.

---

## ✨ Features

- 🎙️ **Hands-Free Real-Time Voice Agent**: Streaming STT + Gemini LLM + TTS via LiveKit Agents.
- ⚡ **Moss Ultra-Low-Latency Retrieval**: Sub-10ms semantic indexing over operational datasets (`3.21 ms` average).
- 🛡️ **Grounded Safety & Diagnostics**: Direct grounding in equipment manuals, error codes (E17), and electrical isolation standards (ISO-S12-04).
- 🧪 **Testing Scenarios**: Includes field test prompts in [docs/testing-scenarios.md](file:///d:/Projects/1-active/Kairo/docs/testing-scenarios.md).
- 📊 **Real-Time Latency Dashboard**: Live visual telemetry of Moss retrieval speed and context injection.
- 💻 **Industrial Cyber Dark UI**: Built with Next.js 14, Tailwind CSS, Lucide Icons, and LiveKit WebRTC client.

---

## 🏗️ Architecture

```text
                     🎙️ Field Worker
                          │
                          ▼
               ┌─────────────────────┐
               │  LiveKit Voice Room │
               └──────────┬──────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │ KAIRO Python Agent  │
               └──────────┬──────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      ⚡ Moss Retrieval         🧠 Gemini LLM
     (3.21 ms Index Search)     (Grounded Reasoning)
             │                         │
             └────────────┬────────────┘
                          ▼
               🔊 Grounded Voice Output
```

---

## 🚀 Quick Start & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
CARTESIA_API_KEY=your_cartesia_api_key
```

### 3. Run Python LiveKit Voice Agent
```bash
pip install -r agent/requirements.txt
python agent/agent.py dev
```

### 4. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Performance & Benchmarks

Run the automated benchmark suite:
```bash
python scripts/benchmark.py
```

### Results
- **Moss Retrieval Latency**: **3.21 ms** (Target: < 10 ms)
- **Baseline Vector DB**: 185.0 ms
- **Performance Improvement**: **57.6x Faster**

---

## 📄 License
MIT License.
