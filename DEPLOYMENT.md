# KAIRO — Production Deployment Guide

This document provides step-by-step instructions to publish the KAIRO web application and Python voice agent to production cloud environments.

---

## 🏗️ Application Architecture

KAIRO consists of two core components:
1. **Frontend UI & API Routes (`frontend/`)**: Built with Next.js 14, React 19, TypeScript, and LiveKit WebRTC client.
2. **Voice Agent Worker (`agent/agent.py`)**: Python worker process running `livekit-agents` (Deepgram STT + Moss Retriever + Gemini LLM + Cartesia TTS).

---

## 🚀 Option 1: Vercel + Render / Railway (Recommended & Easiest)

### Step 1: Deploy Frontend to Vercel
1. Push your repository to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Import Repository**.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variables:
   - `LIVEKIT_URL`: `wss://your-livekit-project.livekit.cloud`
   - `LIVEKIT_API_KEY`: `your_livekit_api_key`
   - `LIVEKIT_API_SECRET`: `your_livekit_api_secret`
5. Click **Deploy**. Your web app will be live at `https://kairo-app.vercel.app`.

### Step 2: Deploy Python Agent Worker to Render / Railway
#### On Render:
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Background Worker**.
2. Connect your GitHub repository.
3. Build Command: `pip install -r agent/requirements.txt`
4. Start Command: `python agent/agent.py start`
5. Add Environment Variables:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `DEEPGRAM_API_KEY`
   - `GEMINI_API_KEY`
   - `CARTESIA_API_KEY`
6. Deploy Worker.

---

## 🐳 Option 2: Docker Compose (Single Cloud VPS / AWS EC2)

Deploy the entire stack with container orchestration on any Linux server:

```bash
# 1. Clone your repo on server
git clone https://github.com/your-org/kairo.git
cd kairo

# 2. Configure environment variables in .env
cp .env.example .env
nano .env

# 3. Build and launch containers in background
docker-compose up -d --build
```

Access the app at `http://your-server-ip:3000`.

---

## 🔑 Environment Variables Checklist

Ensure these variables are set in production:

| Variable | Description | Where Required |
|---|---|---|
| `LIVEKIT_URL` | WebSocket URL for LiveKit Cloud room | Frontend + Agent |
| `LIVEKIT_API_KEY` | LiveKit Project API Key | Frontend + Agent |
| `LIVEKIT_API_SECRET` | LiveKit Project Secret | Frontend + Agent |
| `GEMINI_API_KEY` | Google Gemini LLM API Key | Agent |
| `DEEPGRAM_API_KEY` | Deepgram STT API Key | Agent |
| `CARTESIA_API_KEY` | Cartesia TTS Voice Key | Agent |
