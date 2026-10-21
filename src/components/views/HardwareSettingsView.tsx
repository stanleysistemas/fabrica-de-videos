import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { 
  Cpu, HardDrive, Key, Sliders, ShieldCheck, RefreshCw, Sparkles, Check,
  Star, Edit2, Trash2, ExternalLink, CheckCircle2, Eye, EyeOff, AlertCircle
} from 'lucide-react';

interface ApiItem {
  id: string;
  name: string;
  category: 'llm' | 'voice' | 'video' | 'avatar';
  categoryLabel: string;
  description: string;
  linkToGet: string;
  key: string;
  maskedKey: string;
  isConfigured: boolean;
  isPrimary: boolean;
  updatedAt: string | null;
}

export const HardwareSettingsView: React.FC = () => {
  const { 
    hardware, isLoadingHardware, fetchHardware, setHardwareMode,
    setApiKeys,
  } = useSettingsStore();

  // Estados das Chaves de API
  const [apiList, setApiList] = useState<ApiItem[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState(false);
  const [selectedApiId, setSelectedApiId] = useState<string>('gemini');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isPrimaryCheck, setIsPrimaryCheck] = useState<boolean>(true);
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Carregar status do hardware e das chaves de API
  useEffect(() => {
    if (!hardware) fetchHardware();
    loadApiKeys();
  }, [hardware, fetchHardware]);

  const loadApiKeys = async () => {
    setIsLoadingApis(true);
    try {
      const res = await fetch('http://localhost:3001/api/settings/api-keys');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.apis) {
          setApiList(data.apis);
          // Se houver uma selecionada, sincroniza o input
          const current = data.apis.find((a: ApiItem) => a.id === selectedApiId);
          if (current) {
            setApiKeyInput(current.key || '');
            setIsPrimaryCheck(Boolean(current.isPrimary));
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar chaves:', err);
    } finally {
      setIsLoadingApis(false);
    }
  };

  // Quando o usuário muda a API no Combo
  const handleSelectApiChange = (newId: string) => {
    setSelectedApiId(newId);
    const found = apiList.find((a) => a.id === newId);
    if (found) {
      setApiKeyInput(found.key || '');
      setIsPrimaryCheck(found.isPrimary);
      setIsEditing(Boolean(found.key));
    } else {
      setApiKeyInput('');
      setIsPrimaryCheck(false);
      setIsEditing(false);
    }
  };

  // Carregar para edição a partir do botão Editar da tabela
  const handleStartEdit = (item: ApiItem) => {
    setSelectedApiId(item.id);
    setApiKeyInput(item.key || '');
    setIsPrimaryCheck(item.isPrimary);
    setIsEditing(true);
    // Rolagem suave até o formulário
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Gravar Chave de API
  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiId) return;

    try {
      const res = await fetch('http://localhost:3001/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApiId,
          key: apiKeyInput,
          isPrimary: isPrimaryCheck,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.apis) {
          setApiList(data.apis);

          // Sincronizar com o useSettingsStore local para compatibilidade imediata
          if (selectedApiId === 'gemini') setApiKeys({ geminiApiKey: apiKeyInput });
          if (selectedApiId === 'claude') setApiKeys({ claudeApiKey: apiKeyInput });
          if (selectedApiId === 'openai') setApiKeys({ openaiApiKey: apiKeyInput });
          if (selectedApiId === 'elevenlabs') setApiKeys({ elevenLabsApiKey: apiKeyInput });

          setFeedbackMessage({ text: `Chave da API "${data.apis.find((a: ApiItem) => a.id === selectedApiId)?.name}" gravada com sucesso!`, type: 'success' });
          setIsEditing(false);
          setTimeout(() => setFeedbackMessage(null), 3000);
        }
      } else {
        setFeedbackMessage({ text: 'Falha ao gravar chave.', type: 'error' });
      }
    } catch (err) {
      console.error('Erro ao gravar chave:', err);
      setFeedbackMessage({ text: 'Erro de comunicação ao salvar.', type: 'error' });
    }
  };

  // Limpar / Excluir Chave
  const handleDeleteKey = async (id: string) => {
    if (!confirm('Deseja realmente remover esta chave de API?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/settings/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.apis) {
          setApiList(data.apis);
          if (selectedApiId === id) {
            setApiKeyInput('');
            setIsPrimaryCheck(false);
            setIsEditing(false);
          }
          setFeedbackMessage({ text: 'Chave removida com sucesso.', type: 'success' });
          setTimeout(() => setFeedbackMessage(null), 2500);
        }
      }
    } catch (err) {
      console.error('Erro ao remover chave:', err);
    }
  };

  const selectedApiData = apiList.find((a) => a.id === selectedApiId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
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
            Monitore o hardware do seu computador, selecione a aceleração local e gerencie as chaves de API com indicação de serviço principal.
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
            {hardware?.cpu ? hardware.cpu.model : '13th Gen Intel Core i5-13500'}
          </div>
          <div className="text-[11px] text-slate-400">
            {hardware?.cpu ? `${hardware.cpu.cores} Núcleos Físicos • ${hardware.cpu.threads} Threads Lógicos` : '14 Núcleos • 20 Threads'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Acelerador Gráfico (GPU)</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {hardware?.gpus && hardware.gpus.length > 0 ? hardware.gpus[0].name : 'Intel UHD Graphics 770'}
          </div>
          <div className="text-[11px] text-slate-400">
            GPU Integrada (Renderização Remotion & GGUF)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Memória do Sistema (RAM)</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {hardware ? `${hardware.ramGB} GB RAM Instalados` : '32 GB RAM'}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            Capacidade total para modelos locais e multithread
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

      {/* ========================================================================= */}
      {/* ================= SEÇÃO SOLICITADA: GERENCIAMENTO DE CHAVES ============== */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Gerenciamento de Chaves de API
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Escolha a API no combo, insira a chave, marque se é a principal e clique em gravar.
            </p>
          </div>

          {feedbackMessage && (
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
              feedbackMessage.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {feedbackMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{feedbackMessage.text}</span>
            </div>
          )}
        </div>

        {/* FORMULÁRIO COM COMBO, CAMPO DE KEY, CHECK DE PRINCIPAL E BOTÕES */}
        <form onSubmit={handleSaveKey} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* 1. COMBO COM OS NOMES DAS APIS */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                1. Escolher API:
              </label>
              <select
                value={selectedApiId}
                onChange={(e) => handleSelectApiChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
              >
                <optgroup label="Inteligência Artificial (Roteiros & Visão)">
                  <option value="gemini">Google Gemini AI</option>
                  <option value="openai">OpenAI (GPT-4 / Whisper)</option>
                  <option value="claude">Anthropic Claude AI</option>
                </optgroup>
                <optgroup label="Voz & Áudio">
                  <option value="elevenlabs">ElevenLabs API</option>
                </optgroup>
                <optgroup label="Vídeos Gratuitos (B-Roll)">
                  <option value="pexels">Pexels API</option>
                  <option value="pixabay">Pixabay API</option>
                </optgroup>
                <optgroup label="Avatar & Lip-Sync">
                  <option value="heygen">HeyGen API (Talking Photo)</option>
                  <option value="replicate">Replicate API (LatentSync ByteDance)</option>
                </optgroup>
              </select>
            </div>

            {/* 2. CAMPO PARA COLOCAR A KEY */}
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                  2. Chave de API / Token:
                </label>
                {selectedApiData?.linkToGet && (
                  <a
                    href={selectedApiData.linkToGet}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>Obter Chave</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={`Cole aqui sua chave de ${selectedApiData?.name || 'API'}...`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. CHECK PARA DIZER QUAL É A PRINCIPAL */}
            <div className="md:col-span-3 flex items-center pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPrimaryCheck}
                  onChange={(e) => setIsPrimaryCheck(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Star className={`w-3.5 h-3.5 ${isPrimaryCheck ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                  Definir como Principal
                </span>
              </label>
            </div>
          </div>

          {/* BOTÕES: GRAVAR E EDITAR */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-850">
            <div className="text-[11px] text-slate-400">
              {selectedApiData?.description}
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    const found = apiList.find((a) => a.id === selectedApiId);
                    setApiKeyInput(found?.key || '');
                    setIsPrimaryCheck(Boolean(found?.isPrimary));
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all"
                >
                  Cancelar Edição
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isEditing ? 'Atualizar / Gravar' : 'Gravar Chave'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* TABELA / LISTA DAS CHAVES GRAVADAS MOSTRANDO ALI */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Chaves Cadastradas no Sistema ({apiList.filter((a) => a.isConfigured).length} de {apiList.length} Ativas):
            </h4>
            <button
              type="button"
              onClick={loadApiKeys}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingApis ? 'animate-spin' : ''}`} />
              <span>Atualizar Lista</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                <tr>
                  <th className="p-3 font-bold">API / Serviço</th>
                  <th className="p-3 font-bold">Categoria</th>
                  <th className="p-3 font-bold">Chave Gravada</th>
                  <th className="p-3 font-bold text-center">Status Principal</th>
                  <th className="p-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {apiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Nome da API */}
                    <td className="p-3">
                      <div className="font-extrabold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.isConfigured && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.description}</div>
                    </td>

                    {/* Categoria */}
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        item.category === 'llm'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : item.category === 'voice'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                          : item.category === 'video'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}>
                        {item.categoryLabel}
                      </span>
                    </td>

                    {/* Chave Mascarada */}
                    <td className="p-3 font-mono text-xs">
                      {item.isConfigured ? (
                        <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.maskedKey}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Não configurada</span>
                      )}
                    </td>

                    {/* Check / Status de Principal */}
                    <td className="p-3 text-center">
                      {item.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold shadow-sm">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>PRINCIPAL</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Ações: Editar e Excluir */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                          title="Editar Chave"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {item.isConfigured && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKey(item.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition-all"
                            title="Remover Chave"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
