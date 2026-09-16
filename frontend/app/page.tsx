'use client';

import React, { useState, useEffect } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { VoiceController } from '@/components/VoiceController';
import { LatencyDashboard } from '@/components/LatencyDashboard';
import { RetrievedContextCard } from '@/components/RetrievedContextCard';
import { RequestFlowVisualizer } from '@/components/RequestFlowVisualizer';
import { Shield, Terminal, Zap, Sparkles, MessageSquare, CheckCircle, Mic, GitCommit, Layers } from 'lucide-react';

interface TelemetryData {
  type: string;
  query: string;
  latency_ms: number;
  results_count: number;
  context: any[];
}

export default function KairoDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [agentState, setAgentState] = useState<'disconnected' | 'connecting' | 'listening' | 'retrieving' | 'speaking'>('disconnected');
  
  // View mode switcher: 'copilot' | 'flow'
  const [viewMode, setViewMode] = useState<'copilot' | 'flow'>('copilot');

  // Telemetry state
  const [mossLatencyMs, setMossLatencyMs] = useState<number | null>(3.21);
  const [resultsCount, setResultsCount] = useState<number>(4);
  const [lastQuery, setLastQuery] = useState<string | null>("Pump P-204 at Site 12 error E17");
  const [contextItems, setContextItems] = useState<any[]>([]);
  
  // Transcript state initialized safely after mounting
  const [transcripts, setTranscripts] = useState<Array<{ sender: string; text: string; time: string }>>([]);

  useEffect(() => {
    setIsMounted(true);
    setTranscripts([
      {
        sender: 'KAIRO',
        text: 'KAIRO online. Connected to Site 12 operational context. State your equipment ID or error code.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  // Audio level monitoring interval
  useEffect(() => {
    if (!room || !isConnected) return;
    const interval = setInterval(() => {
      if (room.localParticipant) {
        setAudioLevel(room.localParticipant.audioLevel || 0);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [room, isConnected]);

  // Connect to LiveKit Room
  const handleConnect = async () => {
    setIsConnecting(true);
    setAgentState('connecting');

    try {
      const res = await fetch('/api/token?room=kairo-field-room');
      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Failed to obtain room token');
      }

      const lkRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Handle Data Channel Messages (Moss Telemetry)
      lkRoom.on(RoomEvent.DataReceived, (payload: Uint8Array, participant, kind) => {
        try {
          const strData = new TextDecoder().decode(payload);
          const json: TelemetryData = JSON.parse(strData);
          if (json.type === 'MOSS_TELEMETRY') {
            setMossLatencyMs(json.latency_ms);
            setResultsCount(json.results_count);
            setLastQuery(json.query);
            setContextItems(json.context || []);
            setAgentState('retrieving');
            
            setTimeout(() => {
              setAgentState('speaking');
            }, 800);

            setTimeout(() => {
              setAgentState('listening');
            }, 3000);
          }
        } catch (e) {
          console.error('Data Channel decode error:', e);
        }
      });

      // Handle Real-Time Speech Transcriptions
      lkRoom.on(RoomEvent.TranscriptionReceived, (transcriptions, participant) => {
        const text = transcriptions.map((t) => t.text).join(' ');
        if (text.trim()) {
          const isAgent = participant?.identity?.includes('agent') || participant?.identity === 'kairo-agent';
          setTranscripts((prev) => [
            ...prev,
            {
              sender: isAgent ? 'KAIRO' : 'Technician (You)',
              text: text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      });

      lkRoom.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setIsConnecting(false);
        setAgentState('listening');
      });

      lkRoom.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setIsConnecting(false);
        setAgentState('disconnected');
      });

      await lkRoom.connect(data.wsUrl, data.token);
      await lkRoom.localParticipant.setMicrophoneEnabled(true);
      setRoom(lkRoom);
    } catch (err: any) {
      console.error('Failed to connect to LiveKit:', err);
      setIsConnecting(false);
      setAgentState('disconnected');
    }
  };

  const handleDisconnect = () => {
    if (room) {
      room.disconnect();
    }
    setIsConnected(false);
    setAgentState('disconnected');
  };

  const handleToggleMute = async () => {
    if (room && room.localParticipant) {
      const enabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!enabled);
      setIsMuted(enabled);
    }
  };

  // Execute Moss query & update telemetry instantly
  const triggerDemoQuery = async (query: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscripts((prev) => [
      ...prev,
      {
        sender: 'Technician (You)',
        text: query,
        time: currentTime,
      },
    ]);

    setAgentState('retrieving');

    try {
      // 1. Execute Moss Retrieval API Route directly (Sub-5ms)
      const mossRes = await fetch(`/api/moss?q=${encodeURIComponent(query)}`);
      const mossData = await mossRes.json();

      if (mossData.type === 'MOSS_TELEMETRY') {
        setMossLatencyMs(mossData.latency_ms);
        setResultsCount(mossData.results_count);
        setLastQuery(mossData.query);
        setContextItems(mossData.context || []);

        // Dynamic grounded response generation based on retrieved Moss context
        let responseText = `No grounded operational context found for "${query}". Please verify the equipment ID or error code.`;
        if (mossData.context && mossData.context.length > 0) {
          const topItem = mossData.context[0];
          const details = topItem.details || {};
          if (topItem.category === 'error_code') {
            const rec = Array.isArray(details.recommended_checks) && details.recommended_checks.length > 0
              ? details.recommended_checks[0]
              : details.meaning || '';
            const ppe = details.required_safety_procedure ? ` Safety rule: ${details.required_safety_procedure}.` : '';
            responseText = `[${topItem.id}] ${topItem.title}: ${details.meaning || ''} Check: ${rec}.${ppe}`;
          } else if (topItem.category === 'equipment') {
            responseText = `Equipment ${topItem.id} (${details.name || topItem.title}): Model ${details.model || 'N/A'}, Status: ${details.status || 'Active'}. Location: ${details.location || 'Site 12'}. Operating pressure: ${details.operating_pressure || 'N/A'}.`;
          } else if (topItem.category === 'safety') {
            const step = Array.isArray(details.steps) && details.steps.length > 0 ? details.steps[0] : '';
            const ppe = Array.isArray(details.mandatory_ppe) ? details.mandatory_ppe.join(', ') : 'Standard PPE';
            responseText = `Safety Procedure [${topItem.id}] ${topItem.title}. Mandatory PPE: ${ppe}. Key Step: ${step}`;
          } else if (topItem.category === 'maintenance') {
            responseText = `Maintenance Record [${topItem.id}] for ${details.equipment_id || 'Equipment'}: Action: "${details.action || ''}". Findings: ${details.findings || ''} (Technician: ${details.technician || 'Field Spec'}, Date: ${details.date || 'Recent'}).`;
          } else {
            responseText = `Found context record [${topItem.id}] ${topItem.title}.`;
          }
        }

        setTimeout(() => {
          setAgentState('speaking');
          setTranscripts((prev) => [
            ...prev,
            {
              sender: 'KAIRO',
              text: responseText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 800);

        setTimeout(() => {
          setAgentState('listening');
        }, 3200);
      }
    } catch (e) {
      console.error('Moss query execution error:', e);
      setAgentState('listening');
    }

    // 2. Publish to LiveKit room if connected
    if (room && isConnected) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({ type: 'USER_QUERY', text: query }));
        await room.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.error('Error publishing query packet:', err);
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading KAIRO Interface...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950" suppressHydrationWarning>
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-wider font-mono">
                  KAIRO
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold uppercase">
                  Voice Agent Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400">Context at the Speed of Conversation</p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setViewMode('copilot')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
                viewMode === 'copilot'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Copilot View</span>
            </button>

            <button
              onClick={() => setViewMode('flow')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
                viewMode === 'flow'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Request Flow Visualizer</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Site 12 Knowledge</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-slate-300 uppercase">{isConnected ? 'LiveKit Room Active' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'flow' ? (
          <RequestFlowVisualizer
            currentQuery={lastQuery}
            mossLatencyMs={mossLatencyMs}
            resultsCount={resultsCount}
            contextItems={contextItems}
            agentState={agentState}
            onTriggerDemoQuery={triggerDemoQuery}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Voice Controller & Transcript */}
            <div className="lg:col-span-6 space-y-6">
              <VoiceController
                isConnected={isConnected}
                isConnecting={isConnecting}
                isMuted={isMuted}
                audioLevel={audioLevel}
                agentState={agentState}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onToggleMute={handleToggleMute}
              />

              {/* Quick Demo Script Helper Box */}
              <div className="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Interactive Voice Prompts</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Click or Speak
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Click any prompt below to trigger instant Moss retrieval &amp; grounded response:
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      triggerDemoQuery(
                        "I'm at Site 12. Pump P-204 is showing error E17. What should I check first?"
                      )
                    }
                    className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left text-xs font-mono transition group flex items-start justify-between"
                  >
                    <span className="text-slate-200 group-hover:text-cyan-300 transition">
                      &quot;Pump P-204 at Site 12 is showing E17. What should I check?&quot;
                    </span>
                    <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2 mt-0.5" />
                  </button>
                  <button
                    onClick={() =>
                      triggerDemoQuery(
                        "What safety procedure should I follow before opening the panel on P-204?"
                      )
                    }
                    className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 text-left text-xs font-mono transition group flex items-start justify-between"
                  >
                    <span className="text-slate-200 group-hover:text-amber-300 transition">
                      &quot;What safety procedure should I follow before opening the panel?&quot;
                    </span>
                    <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2 mt-0.5" />
                  </button>
                </div>
              </div>

              {/* Conversation Log / Transcript Feed */}
              <div className="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono">
                      Live Speech &amp; Audio Transcript
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Deepgram STT Sync
                  </span>
                </div>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {transcripts.map((t, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl text-xs font-mono border ${
                        t.sender === 'KAIRO'
                          ? 'bg-slate-950/80 border-cyan-500/30 text-slate-200'
                          : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] opacity-75">
                        <span className="font-bold tracking-wider">{t.sender}</span>
                        <span>{t.time}</span>
                      </div>
                      <p>{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Latency Telemetry & Retrieved Operational Context */}
            <div className="lg:col-span-6 space-y-6">
              <LatencyDashboard
                mossLatencyMs={mossLatencyMs}
                resultsCount={resultsCount}
                lastQuery={lastQuery}
              />

              <RetrievedContextCard
                contextItems={contextItems}
                queryText={lastQuery}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 mt-12 py-6 text-center text-xs text-slate-500 font-mono">
        <p>KAIRO — Real-Time Voice AI Copilot | Powered by Moss Ultra-Low-Latency Retrieval &amp; LiveKit</p>
      </footer>
    </div>
  );
}
