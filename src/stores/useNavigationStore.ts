import { create } from 'zustand';

export type AppModule = 
  | 'viral_video'      // Vídeo Viral por Referência (Blueprint + Remotion Player)
  | 'news_to_video'    // Notícia / Artigo para Vídeo (URL to Video)
  | 'avatar_studio'    // Avatar Studio (Apresentadores Virtuais)
  | 'voice_vault'      // Laboratório de Voz (VoiceStudio)
  | 'thumbnail_maker'  // Thumbnail Studio Viral
  | 'hardware_settings'; // Configurações de Hardware & APIs

interface NavigationState {
  currentModule: AppModule;
  isSidebarCollapsed: boolean;
  setCurrentModule: (module: AppModule) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentModule: 'viral_video',
  isSidebarCollapsed: false,
  setCurrentModule: (module) => set({ currentModule: module }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
}));
