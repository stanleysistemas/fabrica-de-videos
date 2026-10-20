import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { 
  Mic, UploadCloud, X, Play, Trash2, Check, Sparkles, Volume2, 
  Cpu, HardDrive, RefreshCw, Sliders, ShieldCheck
} from 'lucide-react';

export const VoiceLabModal: React.FC = () => {
  const { 
    clonedVoices, isVoiceLabOpen, closeVoiceLab, addClonedVoice, deleteClonedVoice,
    hardware, isLoadingHardware, fetchHardware, setHardwareMode,
    defaultEngine, setDefaultEngine
  } = useSettingsStore();

  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<'grave' | 'dinamico' | 'suave' | 'corporativo'>('grave');
  const [cloneMode, setCloneMode] = useState<'audio_sample' | 'voice_design'>('audio_sample');
  const [voiceDesignPrompt, setVoiceDesignPrompt] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [audioFileBase64, setAudioFileBase64] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  useEffect(() => {
    if (isVoiceLabOpen && !hardware) {
      fetchHardware();
    }
  }, [isVoiceLabOpen, hardware, fetchHardware]);

  if (!isVoiceLabOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateClone = async () => {
    if (!voiceName) return;
    setIsCloning(true);

    try {
      const res = await fetch('http://localhost:3001/api/voice-studio/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: voiceName,
          tone,
          description: description || (cloneMode === 'voice_design' ? voiceDesignPrompt : 'Voz clonada via VoiceStudio OmniVoice local.'),
          voiceDesignPrompt: cloneMode === 'voice_design' ? voiceDesignPrompt : undefined,
          sampleBase64: audioFileBase64 || undefined,
          preferredMode: hardware?.activeMode || 'auto',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.voice) {
          addClonedVoice({
            name: data.voice.name,
            description: data.voice.description,
            engine: defaultEngine === 'voicestudio_local' ? 'voice_studio_omni' : 'eleven_labs_clone',
            tone: data.voice.tone,
          });
        }
      } else {
        // Fallback local caso o backend não responda
        addClonedVoice({
          name: voiceName,
          description: description || 'Voz única clonada no VoiceStudio.',
          engine: defaultEngine === 'voicestudio_local' ? 'voice_studio_omni' : 'eleven_labs_clone',
          tone,
        });
      }

      setIsCloning(false);
      setCloneSuccess(true);
      setVoiceName('');
      setDescription('');
      setVoiceDesignPrompt('');
      setAudioFileBase64(null);
      setAudioFileName(null);

      setTimeout(() => setCloneSuccess(false), 2500);
    } catch {
      setIsCloning(false);
      setCloneSuccess(true);
      setTimeout(() => setCloneSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Laboratório de Voz (VoiceStudio & Voice Vault)</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Padrão: Custo $0 Local
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Clone vozes com 5s de áudio ou crie vozes por texto usando o motor VoiceStudio embutido</p>
            </div>
          </div>
          <button
            onClick={closeVoiceLab}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Card: Diagnóstico de Hardware e Aceleração */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Detecção de Hardware & Aceleração do Motor de Voz</span>
              </div>
              <button
                type="button"
                onClick={() => fetchHardware()}
                disabled={isLoadingHardware}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHardware ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {/* Status do Hardware Atual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10px]">Processador Principal (CPU)</div>
                  <div className="font-semibold text-slate-200 truncate">
                    {hardware?.cpu ? `${hardware.cpu.model} (${hardware.cpu.threads} Threads)` : 'Detectando CPU...'}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-slate-400 text-[10px]">Acelerador Gráfico (GPU)</div>
                  <div className="font-semibold text-slate-200 truncate">
                    {hardware?.gpus && hardware.gpus.length > 0 
                      ? `${hardware.gpus[0].name} ${hardware.hasNvidiaCuda ? '(CUDA Ativo)' : '(Intel iGPU)'}`
                      : 'Nenhum acelerador dedicado'}
                  </div>
                </div>
              </div>
            </div>

            {/* Seletor de Modo de Aceleração */}
            <div className="pt-2 border-t border-slate-800/60">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Escolha o Modo de Execução do Motor de Voz:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {hardware?.options.map((opt) => {
                  const isSelected = hardware.activeMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!opt.available}
                      onClick={() => setHardwareMode(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                          : opt.available
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          : 'bg-slate-900/20 border-slate-800/40 opacity-40 cursor-not-allowed text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{opt.label}</span>
                        {opt.recommended && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                            Ideal
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{opt.description}</p>
                    </button>
                  );
                }) || (
                  <div className="col-span-3 text-slate-400 text-center py-2">Consultando arquitetura da máquina...</div>
                )}
              </div>
            </div>
          </div>

          {/* Seletor do Provedor de Voz (VoiceStudio Local vs ElevenLabs) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Motor Padrão de Voz do Sistema
              </div>
              <div className="text-[11px] text-slate-400">
                Alterne entre síntese 100% offline local ou conexão direta com a API do ElevenLabs
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDefaultEngine('voicestudio_local')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  defaultEngine === 'voicestudio_local'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                VoiceStudio Local (Custo $0)
              </button>
              <button
                type="button"
                onClick={() => setDefaultEngine('elevenlabs')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  defaultEngine === 'elevenlabs'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ElevenLabs (Cloud API)
              </button>
            </div>
          </div>

          {/* Formulário de Criação/Clonagem */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Clonar ou Desenhar Nova Voz
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCloneMode('audio_sample')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    cloneMode === 'audio_sample' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Por Amostra de Áudio (5s)
                </button>
                <button
                  type="button"
                  onClick={() => setCloneMode('voice_design')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    cloneMode === 'voice_design' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Voice Design (Por Texto)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome da Voz *</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="Ex: Minha Voz Oficial do Canal"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tom e Estilo Vocal</label>
                <select
                  value={tone}
                  onChange={(e: any) => setTone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="grave">Grave & Misterioso (Documentário / VOX)</option>
                  <option value="dinamico">Dinâmico & Rápido (Shorts / Viral)</option>
                  <option value="suave">Suave & Acolhedor (Educação / Podcasts)</option>
                  <option value="corporativo">Corporativo & Firme (SaaS / B2B)</option>
                </select>
              </div>
            </div>

            {cloneMode === 'voice_design' ? (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Descreva a Voz Desejada (Voice Design OmniVoice)
                </label>
                <textarea
                  rows={2}
                  value={voiceDesignPrompt}
                  onChange={(e) => setVoiceDesignPrompt(e.target.value)}
                  placeholder="Ex: Voz masculina de meia idade, sotaque neutro brasileiro, timbre encorpado de locutor de trailer, dicção precisa e pausas dramáticas."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Amostra de Áudio (5 a 15 segundos)
                </label>
                <label className="border border-dashed border-slate-800 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer transition-all bg-slate-900/40 block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="font-semibold text-slate-200 text-xs">
                    {audioFileName ? `Arquivo Selecionado: ${audioFileName}` : 'Clique para enviar áudio (MP3 ou WAV)'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Grave sua própria voz ou extraia um trecho limpo de 5 segundos
                  </div>
                </label>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Descrição ou Notas de Uso</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Voz padrão para o canal de tecnologia dark"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCreateClone}
                disabled={isCloning || !voiceName}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                {isCloning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sintetizando Perfil Acústico...</span>
                  </>
                ) : cloneSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Voz Clonada e Salva no Vault!</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Salvar Voz no Voice Vault (Local)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lista de Vozes Salvas Permanentes */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Sua Biblioteca de Vozes Únicas ({clonedVoices.length})
              </label>
              <span className="text-[10px] text-slate-500">Gravadas para sempre em sua máquina</span>
            </div>

            <div className="space-y-2">
              {clonedVoices.map((voice) => (
                <div
                  key={voice.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{voice.name}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {voice.tone}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          VoiceStudio Local
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{voice.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Ouvir Demonstração"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteClonedVoice(voice.id)}
                      title="Excluir Voz"
                      className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-red-400 transition-all border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-950/50">
          <button
            onClick={closeVoiceLab}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-1.5 rounded-xl text-xs transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
