import React, { useState } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Key, ShieldCheck, X, Check, ExternalLink, Sparkles } from 'lucide-react';

export const ApiSettingsModal: React.FC = () => {
  const { apiKeys, isApiSettingsOpen, closeApiSettings, setApiKeys } = useSettingsStore();

  const [gemini, setGemini] = useState(apiKeys.geminiApiKey);
  const [claude, setClaude] = useState(apiKeys.claudeApiKey);
  const [openai, setOpenai] = useState(apiKeys.openaiApiKey);
  const [elevenlabs, setElevenlabs] = useState(apiKeys.elevenLabsApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isApiSettingsOpen) return null;

  const handleSave = () => {
    setApiKeys({
      geminiApiKey: gemini,
      claudeApiKey: claude,
      openaiApiKey: openai,
      elevenLabsApiKey: elevenlabs,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeApiSettings();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Chaves de API das IAs</h3>
              <p className="text-[11px] text-slate-400">Armazenamento local seguro para acionar os motores</p>
            </div>
          </div>
          <button
            onClick={closeApiSettings}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Google Gemini API Key</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Visão Multimodal
                </span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Obter Chave <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={gemini}
              onChange={(e) => setGemini(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500">Usado para "assistir" ao vídeo de referência do YouTube quadro a quadro.</p>
          </div>

          {/* Claude API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Anthropic Claude API Key</span>
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                  Roteirista do Diretor
                </span>
              </label>
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Obter Chave <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={claude}
              onChange={(e) => setClaude(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500">Usado para criar o roteiro autoral de alta retenção com a regra dos +15% de margem.</p>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">OpenAI API Key (Opcional)</label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Obter Chave <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={openai}
              onChange={(e) => setOpenai(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* ElevenLabs API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">ElevenLabs API Key (Opcional)</label>
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Obter Chave <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={elevenlabs}
              onChange={(e) => setElevenlabs(e.target.value)}
              placeholder="xi-api-key-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500">
              * Nota: Você não precisa pagar ElevenLabs se usar as vozes clonadas locais do <strong>VoiceStudio</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Salvas localmente no seu computador</span>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <span>Salvar Chaves</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
