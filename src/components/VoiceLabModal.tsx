import React, { useState } from 'react';
import { useSettingsStore, ClonedVoice } from '../stores/useSettingsStore';
import { Mic, UploadCloud, X, Play, Trash2, Check, Sparkles, Volume2 } from 'lucide-react';

export const VoiceLabModal: React.FC = () => {
  const { clonedVoices, isVoiceLabOpen, closeVoiceLab, addClonedVoice, deleteClonedVoice } = useSettingsStore();

  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<'grave' | 'dinamico' | 'suave' | 'corporativo'>('grave');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);

  if (!isVoiceLabOpen) return null;

  const handleCreateClone = () => {
    if (!voiceName) return;
    setIsCloning(true);

    setTimeout(() => {
      addClonedVoice({
        name: voiceName,
        description: description || 'Voz única personalizada para projetos de alta retenção.',
        engine: 'voice_studio_omni',
        tone,
      });
      setIsCloning(false);
      setCloneSuccess(true);
      setVoiceName('');
      setDescription('');

      setTimeout(() => setCloneSuccess(false), 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Laboratório de Vozes Únicas (Voice Vault)</h3>
              <p className="text-[11px] text-slate-400">Clone vozes com OmniVoice local e salve para projetos futuros</p>
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
          {/* Formulário de Nova Clonagem */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Clonar Nova Voz Exclusiva
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Zero Custo por Minuto (Local)
              </span>
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

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Descrição ou Notas de Uso</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Usar nos vídeos de curiosidades tecnológicas"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Upload de Amostra de Áudio (5 a 15 segundos) */}
            <div className="border border-dashed border-slate-800 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-900/40">
              <UploadCloud className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <div className="font-semibold text-slate-200 text-xs">Envie uma amostra de áudio (5 a 15 segundos)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">MP3 ou WAV sem ruído de fundo para máxima fidelidade</div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCreateClone}
                disabled={isCloning || !voiceName}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                {isCloning ? (
                  <span>Extraindo Perfil Acústico...</span>
                ) : cloneSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Voz Clonada e Salva!</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Clonar e Salvar na Biblioteca</span>
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
              <span className="text-[10px] text-slate-500">Disponíveis em qualquer novo projeto</span>
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
