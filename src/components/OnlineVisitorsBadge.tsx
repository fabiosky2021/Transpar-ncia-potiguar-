import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Smartphone,
  Laptop,
  Flame,
  Clock,
  X,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  realtimePresenceService,
  EstatisticasAudienciaAoVivo,
  DADOS_AUDIENCIA_INICIAL,
} from '../services/presenceService';

interface OnlineVisitorsBadgeProps {
  variant?: 'header' | 'compact' | 'floating-widget' | 'full-card';
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

  // Fecha o modal ao pressionar a tecla ESC
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Formatador de número para pt-BR
  const formattedOnline = stats.onlineAgora.toLocaleString('pt-BR');
  const formattedPico = stats.picoHoje.toLocaleString('pt-BR');
  const formattedViews = stats.totalVisualizacoes.toLocaleString('pt-BR');
  const formattedHoje = stats.visitasHoje.toLocaleString('pt-BR');

  // Modal com todos os dados e botões de fechar explícitos
  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Painel do Marcador de Visitas em Tempo Real"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="w-full max-w-lg card-clean rounded-2xl sm:rounded-3xl border-2 border-emerald-500/50 p-5 sm:p-6 space-y-5 bg-[var(--card-bg)] shadow-2xl relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do Modal com Botão de Fechar Bem Visível */}
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-color)] flex items-center gap-2">
                  <span className="truncate">Marcador de Visitas do Site</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase shrink-0">
                    Ao Vivo
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  Contador oficial de presença e acessos simultâneos via Firestore
                </p>
              </div>
            </div>

            {/* Botão de Fechar do Topo */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              title="Fechar painel de visitas (ESC ou clique fora)"
              aria-label="Fechar painel de visitas"
              className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Fechar</span>
            </button>
          </div>

          {/* Cartão de Destaque com o Total Online e Ticker Ativo */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-blue-600/15 border-2 border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span>Marcador Ativo · Online Agora:</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-800 dark:text-emerald-200 tracking-tight mt-1 flex items-baseline gap-2">
                <span>{formattedOnline}</span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--text-muted)]">
                  eleitores navegando
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                <span>Último pulso: {stats.ultimaAtualizacao}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border-color)]">
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold inline-flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Pico Hoje: {formattedPico}</span>
              </div>
              <div className="text-xs text-[var(--text-color)] font-medium flex items-center sm:justify-end gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span><strong>{formattedHoje}</strong> acessos hoje</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                {formattedViews} visualizações acumuladas
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

          {/* Rodapé com Botão Fechar Explícito */}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Monitoramento em tempo real (LGPD)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Fechar Marcador</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 1. Variante Flutuante (Fixa na tela para estar sempre acessível e visível)
  if (variant === 'floating-widget') {
    return (
      <>
        <div className="fixed bottom-20 left-3 sm:left-6 z-40">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Marcador de Visitas do Site ao Vivo (Clique para abrir detalhes)"
            aria-label="Marcador de Visitas do Site ao Vivo"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d3830]/95 hover:bg-[#00875a] text-white border-2 border-emerald-400/50 shadow-xl backdrop-blur-md text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>
              <span className="text-emerald-200 font-extrabold">{formattedOnline}</span>{' '}
              <span className="text-white/90">online</span>
            </span>
          </button>
        </div>
        {renderModal()}
      </>
    );
  }

  // 2. Variante Compacta (Para usar dentro de cards como a Apuração)
  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title="Marcador de Visitas do Site: clique para ver o painel de acessos ao vivo"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Marcador: <strong className="font-black text-emerald-900 dark:text-emerald-100">{formattedOnline}</strong> online
          </span>
        </button>
        {renderModal()}
      </>
    );
  }

  // 3. Variante Padrão (Header)
  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Marcador de Visitas do Site em Tempo Real (Clique para ver estatísticas)"
        aria-label="Marcador de Visitas do Site"
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs group shrink-0 ${className}`}
      >
        <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500" />
        </span>
        <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="whitespace-nowrap">
          <span className="hidden md:inline text-[var(--text-muted)] font-medium mr-1">Visitas:</span>
          <strong className="font-black text-emerald-900 dark:text-emerald-100">{formattedOnline}</strong>{' '}
          <span className="hidden sm:inline">online</span>
        </span>
      </button>

      {renderModal()}
    </>
  );
};
