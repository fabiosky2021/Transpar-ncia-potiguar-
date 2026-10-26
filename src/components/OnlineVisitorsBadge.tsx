import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Globe2,
  Smartphone,
  Laptop,
  Flame,
  Clock,
  X,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  realtimePresenceService,
  EstatisticasAudienciaAoVivo,
  DADOS_AUDIENCIA_INICIAL,
} from '../services/presenceService';

interface OnlineVisitorsBadgeProps {
  variant?: 'header' | 'compact' | 'full-card';
  className?: string;
}

export const OnlineVisitorsBadge: React.FC<OnlineVisitorsBadgeProps> = ({
  variant = 'header',
  className = '',
}) => {
  const [stats, setStats] = useState<EstatisticasAudienciaAoVivo>(DADOS_AUDIENCIA_INICIAL);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    realtimePresenceService.init();
    const unsub = realtimePresenceService.subscribe((newStats) => {
      setStats(newStats);
    });
    return unsub;
  }, []);

  // Formatador de número para pt-BR
  const formattedOnline = stats.onlineAgora.toLocaleString('pt-BR');
  const formattedPico = stats.picoHoje.toLocaleString('pt-BR');
  const formattedViews = stats.totalVisualizacoes.toLocaleString('pt-BR');

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Clique para ver o Painel de Acessos e Pessoas Online Agora"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs group ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>
          <strong className="font-extrabold">{formattedOnline}</strong> online agora
        </span>
      </button>
    );
  }

  return (
    <>
      {/* Botão Badge no Topo / Header */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Visualizar quantas pessoas estão acessando a plataforma em tempo real"
        aria-label="Quantas pessoas estão acessando agora"
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs group shrink-0 ${className}`}
      >
        <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500" />
        </span>
        <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="whitespace-nowrap">
          <strong className="font-black text-emerald-700 dark:text-emerald-200">{formattedOnline}</strong>{' '}
          <span className="hidden sm:inline">online agora</span>
          <span className="sm:hidden">online</span>
        </span>
      </button>

      {/* Modal Detalhado de Acessos em Tempo Real */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg card-clean rounded-2xl sm:rounded-3xl border-2 border-emerald-500/40 p-5 sm:p-6 space-y-5 bg-[var(--card-bg)] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-color)] flex items-center gap-2">
                    <span>Acessos em Tempo Real</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                      Ao Vivo
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Usuários simultâneos conectados à plataforma via Firestore
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                title="Fechar modal"
                className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cartão de Destaque com o Total Online */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-blue-600/10 border-2 border-emerald-500/30 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Conectados neste segundo:</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-200 tracking-tight mt-1">
                  {formattedOnline}
                  <span className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] ml-2">
                    eleitores ativos
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Última atualização: {stats.ultimaAtualizacao}</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold inline-flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pico: {formattedPico}</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono">
                  {formattedViews} views hoje
                </div>
              </div>
            </div>

            {/* Onde os usuários estão agora */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--text-color)] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[var(--accent-color)]" />
                <span>O que as pessoas estão visualizando agora:</span>
              </div>
              <div className="space-y-1.5">
                {stats.secoesMaisAcessadas.map((item) => (
                  <div
                    key={item.rota}
                    className="p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex items-center justify-between text-xs gap-2"
                  >
                    <a
                      href={item.rota}
                      onClick={() => setIsModalOpen(false)}
                      className="font-semibold text-[var(--text-color)] hover:text-[var(--accent-color)] hover:underline truncate"
                    >
                      {item.nome}
                    </a>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--card-bg)] text-[var(--accent-color)] font-mono font-bold text-[11px] shrink-0 border border-[var(--border-color)]">
                      {item.percentual}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Origem Geográfica dos Acessos no RN */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--text-color)] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Principais Municípios com Acessos Ativos:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {stats.cidades.map((cid) => (
                  <div
                    key={cid.nome}
                    className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between"
                  >
                    <span className="truncate text-[var(--text-muted)] font-medium">
                      {cid.nome}
                    </span>
                    <span className="font-bold text-[var(--text-color)] shrink-0 font-mono text-[11px]">
                      {cid.percentual}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispositivos Conectados */}
            <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex items-center justify-around text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong className="text-[var(--text-color)]">{stats.dispositivos.mobilePct}%</strong> Celular
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--border-color)]" />
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>
                  <strong className="text-[var(--text-color)]">{stats.dispositivos.desktopPct}%</strong> Computador
                </span>
              </div>
            </div>

            {/* Rodapé LGPD & Conclusão */}
            <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Métricas anônimas em conformidade com a LGPD</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold cursor-pointer transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
