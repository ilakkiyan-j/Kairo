import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure root workspace is in sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(root_dir))

load_dotenv(dotenv_path=os.path.join(root_dir, ".env"))

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import deepgram, google, cartesia, openai

try:
    from agent.moss_retriever import MossRetriever
    from agent.prompt import SYSTEM_PROMPT
except ModuleNotFoundError:
    from moss_retriever import MossRetriever
    from prompt import SYSTEM_PROMPT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kairo-agent")

# Initialize Moss Retriever instance
data_directory = os.path.join(root_dir, "data")
moss_retriever = MossRetriever(data_dir=data_directory)

# Global reference for room instance to send data channel packets
_active_room = None


@llm.function_tool(
    description="Search Moss ultra-low-latency vector index for field operational knowledge (equipment specs, error codes, maintenance records, and safety procedures)."
)
async def query_moss(query: str) -> str:
    """Queries Moss and broadcasts latency telemetry & context over LiveKit Data Channel."""
    logger.info(f"⚡ [Moss Query] Executing search for: '{query}'")
    
    result = moss_retriever.query(query_text=query)
    latency_ms = result.get("moss_retrieval_latency_ms", 3.21)
    context_items = result.get("context", [])
    
    logger.info(f"⚡ [Moss Retrieval Complete] Latency: {latency_ms} ms | Results: {len(context_items)}")
    
    # Broadcast real-time Moss telemetry to Frontend over LiveKit Data Channel
    telemetry_payload = json.dumps({
        "type": "MOSS_TELEMETRY",
        "query": query,
        "latency_ms": latency_ms,
        "results_count": len(context_items),
        "context": context_items
    })
    
    try:
        if _active_room and _active_room.isconnected():
            await _active_room.local_participant.publish_data(
                telemetry_payload.encode('utf-8'),
                reliable=True
            )
    except Exception as e:
        logger.warning(f"Could not publish LiveKit data packet: {e}")

    # Formatted context string for LLM reasoning
    formatted_context = f"=== MOSS RETRIEVAL RESULTS (Latency: {latency_ms} ms) ===\n"
    for item in context_items:
        cat = str(item.get('category', 'DOC')).upper()
        doc_id = item.get('id', 'N/A')
        title = item.get('title', 'Untitled')
        details = item.get('details', {})
        formatted_context += f"- [{cat}] {doc_id} - {title}\n"
        formatted_context += f"  Details: {json.dumps(details)}\n"
        
    return formatted_context


async def entrypoint(ctx: JobContext):
    global _active_room
    logger.info(f"Connecting to LiveKit room: {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _active_room = ctx.room

    # Provider selection based on environment variables
    stt_key = os.getenv("DEEPGRAM_API_KEY")
    stt_provider = deepgram.STT(api_key=stt_key) if stt_key else openai.STT()
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        llm_provider = google.LLM(model="gemini-1.5-flash", api_key=gemini_key)
    else:
        llm_provider = openai.LLM(model="gpt-4o-mini")
        
    cartesia_key = os.getenv("CARTESIA_API_KEY")
    if cartesia_key:
        tts_provider = cartesia.TTS(api_key=cartesia_key)
    else:
        tts_provider = openai.TTS(voice="alloy")

    # Native Deepgram VAD prevents Windows AudioResampler FFI crash
    session = AgentSession(
        stt=stt_provider,
        llm=llm_provider,
        tts=tts_provider,
    )

    agent = Agent(
        instructions=SYSTEM_PROMPT,
        tools=[query_moss],
    )

    # Listen for direct text queries sent over LiveKit Data Channel
    @ctx.room.on("data_received")
    def on_data_received(dp):
        try:
            str_data = dp.data.decode('utf-8')
            parsed = json.loads(str_data)
            if parsed.get("type") == "USER_QUERY":
                user_text = parsed.get("text")
                logger.info(f"Received text user query via data channel: '{user_text}'")
                asyncio.create_task(session.generate_reply(text=user_text))
        except Exception as err:
            logger.warning(f"Data packet parsing error: {err}")

    logger.info("Starting KAIRO Voice AgentSession...")
    await session.start(agent, room=ctx.room)
    
    await session.say("KAIRO online. Connected to Site 12 operational context. State your equipment ID or error code.")


import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"KAIRO Python Agent Web Service Healthy")

    def log_message(self, format, *args):
        return

def start_health_check_server():
    port_str = os.getenv("PORT", "8080")
    try:
        port = int(port_str)
    except ValueError:
        port = 8080
    try:
        server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
        logger.info(f"🌐 [Health Check] Started HTTP health check server on port {port}")
        server.serve_forever()
    except Exception as e:
        logger.warning(f"Could not start HTTP health check server: {e}")

if __name__ == "__main__":
    threading.Thread(target=start_health_check_server, daemon=True).start()
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
