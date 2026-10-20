import React from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { FolderUp, UploadCloud, Film, Image, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const Step4Assets: React.FC = () => {
  const { nextStep, prevStep } = useProjectStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderUp className="w-5 h-5 text-indigo-400" />
          Etapa 4: Seus Arquivos & Ativos Próprios
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Envie capturas de tela do seu sistema, logotipos ou vídeos gravados com celular.
        </p>
      </div>

      {/* Dropzone de Upload */}
      <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-900/40 cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">
          Arraste e solte seus arquivos aqui ou clique para selecionar
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
          Suporta MP4, MOV, PNG, JPG ou áudios MP3/WAV. Cada vídeo tem sua pasta hermética isolada.
        </p>
        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Isolamento Seguro Ativado
        </span>
      </div>

      {/* Lista de Ativos Simulados / Já Disponíveis */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Ativos Vinculados a Este Projeto
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <Image className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-slate-200">logo_marca_principal.png</span>
              <span className="text-[10px] text-slate-500">Transparente</span>
            </div>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pronto
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <Film className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-slate-200">dashboard_screenshot_hero.png</span>
              <span className="text-[10px] text-slate-500">Para ScreenshotScene</span>
            </div>
            <span className="text-indigo-400 flex items-center gap-1 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-between">
        <button
          onClick={prevStep}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          onClick={nextStep}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <span>Próxima Etapa: Áudio & Legendas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
