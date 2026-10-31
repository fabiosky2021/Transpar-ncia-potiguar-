import React from 'react';

export type BottomNavTab = 'home' | 'busca' | 'alertas' | 'favoritos' | 'menu';

interface BottomNavigationBarProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  unreadAlertsCount?: number;
  favoritesCount?: number;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onSelectTab,
  unreadAlertsCount = 0,
  favoritesCount = 0,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto z-40 px-3 pb-3 pointer-events-auto">
      <nav
        aria-label="Navegação Inferior"
        data-purpose="navegacao-inferior"
        className="bg-[#0d3830] text-white rounded-3xl py-2 px-3 shadow-[0_-4px_20px_rgba(11,46,38,0.35)] flex items-center justify-around border border-emerald-500/20 backdrop-blur-md select-none"
      >
        {/* Tab 1: Home (Active State em Amarelo/Ouro Potiguar) */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center space-y-0.5 transition-colors group cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#fdb913] font-bold'
              : 'text-white/75 hover:text-white font-medium'
          }`}
          aria-label="Início"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Busca */}
        <button
          type="button"
          onClick={() => onSelectTab('busca')}
          className={`flex flex-col items-center space-y-0.5 transition-colors group cursor-pointer ${
            activeTab === 'busca'
              ? 'text-[#fdb913] font-bold'
              : 'text-white/75 hover:text-white font-medium'
          }`}
          aria-label="Busca no Portal"
          aria-current={activeTab === 'busca' ? 'page' : undefined}
        >
          <svg
            className="w-5 h-5 stroke-current fill-none stroke-[2.2]"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] tracking-tight">Busca</span>
        </button>

        {/* Tab 3: Alertas (Com pip indicador de notificação em tempo real) */}
        <button
          type="button"
          onClick={() => onSelectTab('alertas')}
          className={`flex flex-col items-center space-y-0.5 transition-colors group relative cursor-pointer ${
            activeTab === 'alertas'
              ? 'text-[#fdb913] font-bold'
              : 'text-white/75 hover:text-white font-medium'
          }`}
          aria-label="Alertas e Atualizações"
          aria-current={activeTab === 'alertas' ? 'page' : undefined}
        >
          <svg
            className="w-5 h-5 stroke-current fill-none stroke-[2.2]"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {unreadAlertsCount > 0 && (
            <>
              <span className="absolute top-0 right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute top-0 right-1 w-2 h-2 bg-amber-400 rounded-full" />
            </>
          )}
          <span className="text-[10px] tracking-tight">Alertas</span>
        </button>

        {/* Tab 4: Vitrine & Shop Oficial Fábio Kauã */}
        <button
          type="button"
          onClick={() => onSelectTab('favoritos')}
          className={`flex flex-col items-center space-y-0.5 transition-colors group relative cursor-pointer ${
            activeTab === 'favoritos'
              ? 'text-amber-400 font-bold'
              : 'text-white/75 hover:text-white font-medium'
          }`}
          aria-label="Loja e Vitrine Oficial"
          aria-current={activeTab === 'favoritos' ? 'page' : undefined}
        >
          <svg
            className="w-5 h-5 stroke-current fill-none stroke-[2.2]"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] tracking-tight">Shop</span>
        </button>

        {/* Tab 5: Estúdio PotiguarBot IA */}
        <button
          type="button"
          onClick={() => onSelectTab('menu')}
          className={`flex flex-col items-center space-y-0.5 transition-colors group relative cursor-pointer ${
            activeTab === 'menu'
              ? 'text-[#fdb913] font-bold'
              : 'text-white/75 hover:text-white font-medium'
          }`}
          aria-label="Abrir Estúdio PotiguarBot IA"
          aria-current={activeTab === 'menu' ? 'page' : undefined}
        >
          <div className="relative">
            <svg
              className="w-5 h-5 stroke-current fill-none stroke-[2.2]"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight">Estúdio IA</span>
        </button>
      </nav>
    </footer>
  );
};
