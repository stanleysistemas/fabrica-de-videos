import React from 'react';
import { useNavigationStore, AppModule } from '../stores/useNavigationStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { 
  Video, Newspaper, UserCheck, Mic, Image as ImageIcon, Cpu, 
  ChevronLeft, ChevronRight, Sparkles, Layers, Sliders, ExternalLink
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentModule, isSidebarCollapsed, setCurrentModule, toggleSidebar } = useNavigationStore();
  const { hardware, openVoiceLab, openApiSettings } = useSettingsStore();

  const navGroups: {
    title: string;
    items: {
      id: AppModule;
      label: string;
      badge?: string;
      badgeColor?: string;
      icon: React.ReactNode;
      desc: string;
    }[];
  }[] = [
    {
      title: 'PRODUÇÃO DE VÍDEO',
      items: [
        {
          id: 'viral_video',
          label: 'Vídeo Viral (Referência)',
          badge: 'Ativo',
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: <Video className="w-4 h-4" />,
          desc: 'Visão de vídeo, blueprint e player Remotion',
        },
        {
          id: 'news_to_video',
          label: 'Notícia / URL to Video',
          badge: 'Próximo',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <Newspaper className="w-4 h-4" />,
          desc: 'Artigo de blog/portal em vídeo animado',
        },
        {
          id: 'avatar_studio',
          label: 'Avatar Studio',
          badge: 'Novo',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <UserCheck className="w-4 h-4" />,
          desc: 'Apresentador gamer com sincronia labial',
        },
      ],
    },
    {
      title: 'ESTÚDIOS & RECURSOS',
      items: [
        {
          id: 'voice_vault',
          label: 'Voice Lab (VoiceStudio)',
          badge: 'Custo $0',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <Mic className="w-4 h-4" />,
          desc: 'Clonagem com 5s e Voice Design',
        },
        {
          id: 'thumbnail_maker',
          label: 'Thumbnail Studio',
          badge: 'CTR Alto',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: <ImageIcon className="w-4 h-4" />,
          desc: 'Capas virais com recorte de avatar',
        },
      ],
    },
    {
      title: 'SISTEMA & INFRA',
      items: [
        {
          id: 'hardware_settings',
          label: 'Hardware & Motores',
          badge: 'CPU 20T',
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: <Cpu className="w-4 h-4" />,
          desc: 'Aceleração de hardware e chaves de IA',
        },
      ],
    },
  ];

  return (
    <aside 
      className={`bg-[#06080e] border-r border-slate-800/80 flex flex-col transition-all duration-300 z-30 shrink-0 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Topo da Sidebar com Logo e Botão de Recolher */}
      <div className="h-16 border-b border-slate-800/80 flex items-center justify-between px-3.5 bg-slate-950/40">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Video className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div className="truncate">
              <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                Fábrica de Vídeos
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Plataforma Unificada
              </span>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all ${
            isSidebarCollapsed ? 'mx-auto' : ''
          }`}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navegação e Grupos */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'voice_vault') {
                      openVoiceLab();
                    } else if (item.id === 'hardware_settings') {
                      setCurrentModule('hardware_settings');
                    } else {
                      setCurrentModule(item.id);
                    }
                  }}
                  title={isSidebarCollapsed ? `${item.label} - ${item.desc}` : undefined}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600/15 border border-indigo-500/40 text-white shadow-sm shadow-indigo-500/10'
                      : 'hover:bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {item.icon}
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex-1 truncate">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Rodapé da Sidebar: Hardware e Status do Motor */}
      {!isSidebarCollapsed ? (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Motor Local
              </span>
              <span className="text-[9px] font-mono bg-slate-800 text-cyan-300 px-1 py-0.2 rounded border border-slate-700">
                GGUF 20T
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-200 truncate">
              {hardware?.cpu?.model || 'Intel Core i5-13500'}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>VoiceStudio:</span>
              <span className="text-emerald-400 font-semibold">Custo $0</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800/80 flex justify-center py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Motor Local VoiceStudio Online" />
        </div>
      )}
    </aside>
  );
};
