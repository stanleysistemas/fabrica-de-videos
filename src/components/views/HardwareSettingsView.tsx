import React, { useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Cpu, HardDrive, Key, Sliders, ShieldCheck, RefreshCw, Sparkles, Check } from 'lucide-react';

export const HardwareSettingsView: React.FC = () => {
  const { 
    hardware, isLoadingHardware, fetchHardware, setHardwareMode,
    apiKeys, setApiKeys, defaultEngine, setDefaultEngine
  } = useSettingsStore();

  useEffect(() => {
    if (!hardware) fetchHardware();
  }, [hardware, fetchHardware]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Infraestrutura & IA
            </span>
            <span className="text-xs text-slate-400">• Painel de Controle de Motores</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Hardware, Aceleração & Chaves de API</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Monitore os recursos da sua máquina, escolha o modo de aceleração local (GGUF ou CUDA) e conecte suas chaves de inteligência artificial opcionais.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchHardware()}
          disabled={isLoadingHardware}
          className="shrink-0 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingHardware ? 'animate-spin' : ''}`} />
          <span>Redetectar Hardware</span>
        </button>
      </div>

      {/* Grid de Hardware Detectado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Processador Central (CPU)</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {hardware?.cpu ? hardware.cpu.model : 'Detectando...'}
          </div>
          <div className="text-[11px] text-slate-400">
            {hardware?.cpu ? `${hardware.cpu.cores} Núcleos Físicos • ${hardware.cpu.threads} Threads Lógicos` : '-'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Acelerador Gráfico (GPU)</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {hardware?.gpus && hardware.gpus.length > 0 ? hardware.gpus[0].name : 'GPU Integrada'}
          </div>
          <div className="text-[11px] text-slate-400">
            {hardware?.hasNvidiaCuda ? 'NVIDIA CUDA Ativo' : 'Intel UHD Graphics 770 (2048 MB)'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Memória do Sistema (RAM)</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {hardware ? `${hardware.ramGB} GB RAM Instalados` : 'Detectando...'}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            Amplo espaço para modelos quantizados GGUF
          </div>
        </div>
      </div>

      {/* Seletor de Modo de Aceleração */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Modo de Execução do Motor de Voz e IA
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {hardware?.options.map((opt) => {
            const isSelected = hardware.activeMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={!opt.available}
                onClick={() => setHardwareMode(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : opt.available
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    : 'bg-slate-950/30 border-slate-800/40 opacity-40 cursor-not-allowed text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs">{opt.label}</span>
                  {opt.recommended && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulário de Chaves de API */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            Chaves de API para Modelos Remotos (Opcionais)
          </label>
          <span className="text-[10px] text-slate-400">Gravadas apenas no seu navegador</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Google Gemini API Key</label>
            <input
              type="password"
              value={apiKeys.geminiApiKey}
              onChange={(e) => setApiKeys({ geminiApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Anthropic Claude API Key</label>
            <input
              type="password"
              value={apiKeys.claudeApiKey}
              onChange={(e) => setApiKeys({ claudeApiKey: e.target.value })}
              placeholder="sk-ant-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">ElevenLabs API Key</label>
            <input
              type="password"
              value={apiKeys.elevenLabsApiKey}
              onChange={(e) => setApiKeys({ elevenLabsApiKey: e.target.value })}
              placeholder="xi-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">OpenAI API Key</label>
            <input
              type="password"
              value={apiKeys.openaiApiKey}
              onChange={(e) => setApiKeys({ openaiApiKey: e.target.value })}
              placeholder="sk-proj-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
