'use client';

import React from 'react';
import { Mic, MicOff, Volume2, Radio, Activity, Zap, VolumeX } from 'lucide-react';

interface VoiceControllerProps {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  audioLevel: number; // 0 to 1
  agentState: 'disconnected' | 'connecting' | 'listening' | 'retrieving' | 'speaking';
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  isConnected,
  isConnecting,
  isMuted,
  audioLevel,
  agentState,
  onConnect,
  onDisconnect,
  onToggleMute,
}) => {
  // Compute height for equalizer bars based on audio level
  const bar1Height = Math.min(100, Math.max(15, audioLevel * 120 + Math.random() * 10));
  const bar2Height = Math.min(100, Math.max(25, audioLevel * 180 + Math.random() * 15));
  const bar3Height = Math.min(100, Math.max(20, audioLevel * 150 + Math.random() * 10));
  const bar4Height = Math.min(100, Math.max(15, audioLevel * 110 + Math.random() * 10));

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Background Pulse Ambient Effect */}
      {isConnected && (
        <div
          className={`absolute inset-0 opacity-15 transition-all duration-700 pointer-events-none ${
            agentState === 'retrieving'
              ? 'bg-amber-500 animate-pulse'
              : agentState === 'speaking'
              ? 'bg-cyan-500 animate-pulse'
              : 'bg-emerald-500'
          }`}
        />
      )}

      {/* Main Interactive Mic Button */}
      <div className="relative z-10 my-4 flex flex-col items-center">
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-xl relative ${
            !isConnected
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/40 hover:shadow-cyan-500/50 ring-4 ring-cyan-500/20'
              : agentState === 'speaking'
              ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 ring-8 ring-cyan-400/30 scale-105 animate-pulse'
              : agentState === 'retrieving'
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 ring-8 ring-amber-400/30 scale-105 animate-bounce'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 ring-4 ring-slate-800/40'
          }`}
        >
          {isConnecting ? (
            <Activity className="w-12 h-12 animate-spin text-cyan-300" />
          ) : !isConnected ? (
            <Mic className="w-12 h-12" />
          ) : agentState === 'speaking' ? (
            <Volume2 className="w-12 h-12 animate-pulse" />
          ) : agentState === 'retrieving' ? (
            <Zap className="w-12 h-12" />
          ) : (
            <Radio className="w-12 h-12 text-cyan-400 animate-pulse" />
          )}
        </button>

        {/* Mute toggle button if connected */}
        {isConnected && (
          <button
            onClick={onToggleMute}
            className={`absolute -bottom-2 -right-2 p-2.5 rounded-full border transition-all ${
              isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Live Audio Equalizer Waveform Bars when Microphone is Receiving Sound */}
      {isConnected && (
        <div className="flex items-center gap-1.5 h-8 my-2 px-4 py-1 rounded-full bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Mic Input:</span>
          {isMuted ? (
            <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
              <VolumeX className="w-3 h-3" /> Muted
            </span>
          ) : (
            <div className="flex items-end gap-1 h-5">
              <div
                className="w-1.5 bg-emerald-400 rounded-full transition-all duration-100"
                style={{ height: `${bar1Height}%` }}
              />
              <div
                className="w-1.5 bg-emerald-400 rounded-full transition-all duration-100"
                style={{ height: `${bar2Height}%` }}
              />
              <div
                className="w-1.5 bg-emerald-400 rounded-full transition-all duration-100"
                style={{ height: `${bar3Height}%` }}
              />
              <div
                className="w-1.5 bg-emerald-400 rounded-full transition-all duration-100"
                style={{ height: `${bar4Height}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-1 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium tracking-wide">
          <span
            className={`w-2 h-2 rounded-full ${
              !isConnected
                ? 'bg-slate-500'
                : agentState === 'speaking'
                ? 'bg-cyan-400 animate-ping'
                : agentState === 'retrieving'
                ? 'bg-amber-400 animate-ping'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="uppercase text-slate-300 font-mono">
            {!isConnected
              ? 'Ready to Connect'
              : agentState === 'speaking'
              ? 'KAIRO Responding...'
              : agentState === 'retrieving'
              ? '⚡ Moss Retrieving Context...'
              : audioLevel > 0.08
              ? '🎙️ Microphone Receiving Sound...'
              : 'Listening for Field Query'}
          </span>
        </div>
      </div>
    </div>
  );
};
