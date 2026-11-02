import React, { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Flame,
  Filter,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import { SwingState, VotingStatusCategory } from '../data/usaElectionsData';

interface SwingStatesTrackerProps {
  swingStates: SwingState[];
  onAskAgentAboutState?: (prompt: string) => void;
  onStateStatusChange?: (stateId: string, newStatus: VotingStatusCategory) => void;
}

export const SwingStatesTracker: React.FC<SwingStatesTrackerProps> = ({
  swingStates,
  onAskAgentAboutState,
  onStateStatusChange,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Leaning Trump' | 'Toss-up' | 'Leaning Harris'>('all');
  const [localStatuses, setLocalStatuses] = useState<Record<string, VotingStatusCategory>>(() => {
    const map: Record<string, VotingStatusCategory> = {};
    swingStates.forEach((st) => {
      map[st.id] = st.votingStatus || (st.leaderMarginPct < 1.5 ? 'Toss-up' : st.leaderId === 'donald-trump' ? 'Leaning Trump' : 'Leaning Harris');
    });
    return map;
  });

  const handleCycleStatus = (stateId: string) => {
    const current = localStatuses[stateId] || 'Toss-up';
    let next: VotingStatusCategory = 'Toss-up';
    if (current === 'Leaning Trump') next = 'Toss-up';
    else if (current === 'Toss-up') next = 'Leaning Harris';
    else next = 'Leaning Trump';

    setLocalStatuses((prev) => ({ ...prev, [stateId]: next }));
    if (onStateStatusChange) {
      onStateStatusChange(stateId, next);
    }
  };

  const handleResetStatuses = () => {
    const map: Record<string, VotingStatusCategory> = {};
    swingStates.forEach((st) => {
      map[st.id] = st.votingStatus || (st.leaderMarginPct < 1.5 ? 'Toss-up' : 'Leaning Trump');
    });
    setLocalStatuses(map);
  };

  const filteredStates = swingStates.filter((st) => {
    if (statusFilter === 'all') return true;
    return (localStatuses[st.id] || st.votingStatus) === statusFilter;
  });

  // Totals calculations
  const totalElectoralVotes = swingStates.reduce((acc, st) => acc + st.electoralVotes, 0);
  const trumpDelegates = swingStates.filter((st) => localStatuses[st.id] === 'Leaning Trump').reduce((acc, st) => acc + st.electoralVotes, 0);
  const tossupDelegates = swingStates.filter((st) => localStatuses[st.id] === 'Toss-up').reduce((acc, st) => acc + st.electoralVotes, 0);
  const harrisDelegates = swingStates.filter((st) => localStatuses[st.id] === 'Leaning Harris').reduce((acc, st) => acc + st.electoralVotes, 0);

  const getStatusBadge = (status: VotingStatusCategory, marginPct: number) => {
    switch (status) {
      case 'Leaning Trump':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/15 border border-red-500/40 text-red-700 dark:text-red-300 font-extrabold text-[11px] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Leaning Trump</span>
            <span className="text-[10px] font-mono opacity-85">({marginPct > 0 ? `+${marginPct}%` : 'Favorável'})</span>
          </span>
        );
      case 'Toss-up':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] shadow-2xs">
            <Scale className="w-3 h-3 text-amber-500" />
            <span>Toss-up</span>
            <span className="text-[10px] font-mono opacity-85">(Empate Técnico)</span>
          </span>
        );
      case 'Leaning Harris':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/15 border border-blue-500/40 text-blue-700 dark:text-blue-300 font-extrabold text-[11px] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Leaning Harris</span>
            <span className="text-[10px] font-mono opacity-85">({marginPct > 0 ? `+${marginPct}%` : 'Favorável'})</span>
          </span>
        );
    }
  };

  return (
    <div className="card-clean p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-b from-[var(--card-bg)] via-[var(--surface-subtle)] to-[var(--card-bg)] space-y-5 shadow-sm">
      {/* Header do Componente Visual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Battleground States 2024/2026
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Total: {totalElectoralVotes} delegados em disputa
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)] mt-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Indicadores dos 7 Swing States &amp; Apuração em Tempo Real
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Acompanhe o status de votação (<em>Leaning Trump</em>, <em>Toss-up</em>, <em>Leaning Harris</em>) e o progresso da contagem de urnas apuradas em cada estado decisivo.
          </p>
        </div>

        {/* Resumo de Delegados nos Swing States */}
        <div className="flex items-center gap-2 shrink-0 bg-[var(--card-bg)] p-2 rounded-2xl border border-[var(--border-color)]">
          <div className="text-center px-2">
            <div className="text-xs font-mono font-black text-red-600 dark:text-red-400">{trumpDelegates}</div>
            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Trump</div>
          </div>
          <div className="w-px h-6 bg-[var(--border-color)]" />
          <div className="text-center px-2">
            <div className="text-xs font-mono font-black text-amber-500">{tossupDelegates}</div>
            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Toss-up</div>
          </div>
          <div className="w-px h-6 bg-[var(--border-color)]" />
          <div className="text-center px-2">
            <div className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">{harrisDelegates}</div>
            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Harris</div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Rápidos por Status de Votação */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
            }`}
          >
            Todos ({swingStates.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Leaning Trump')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              statusFilter === 'Leaning Trump'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Leaning Trump
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Toss-up')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              statusFilter === 'Toss-up'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
            }`}
          >
            <Scale className="w-3 h-3 text-amber-500" />
            Toss-up
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Leaning Harris')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              statusFilter === 'Leaning Harris'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Leaning Harris
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetStatuses}
          title="Restaurar status originais das redes oficiais"
          className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-color)] inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restaurar Padrão</span>
        </button>
      </div>

      {/* Grid com os Cards Visuais dos 7 Swing States */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {filteredStates.map((st) => {
          const currentStatus = localStatuses[st.id] || st.votingStatus;
          const totalStVotes = st.votesTrump + st.votesHarris;
          const trumpPct = totalStVotes > 0 ? ((st.votesTrump / totalStVotes) * 100).toFixed(1) : '50.0';
          const harrisPct = totalStVotes > 0 ? ((st.votesHarris / totalStVotes) * 100).toFixed(1) : '50.0';

          const cardBorderColor =
            currentStatus === 'Leaning Trump'
              ? 'border-red-500/40 hover:border-red-500'
              : currentStatus === 'Leaning Harris'
              ? 'border-blue-500/40 hover:border-blue-500'
              : 'border-amber-500/40 hover:border-amber-500';

          return (
            <div
              key={st.id}
              className={`p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border-2 ${cardBorderColor} space-y-3.5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between`}
            >
              <div className="space-y-3">
                {/* Top: Estado, Sigla e Delegados */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] font-mono text-xs font-black text-[var(--text-color)]">
                        {st.code}
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-[var(--text-color)] tracking-tight">
                        {st.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {st.keyCounties.split(',')[0]} &amp; região
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-mono text-xs font-black shadow-xs shrink-0">
                    {st.electoralVotes} delegados
                  </span>
                </div>

                {/* Indicador de Status de Votação (Badge Obrigatório) */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                  <div className="text-xs">
                    {getStatusBadge(currentStatus, st.leaderMarginPct)}
                  </div>

                  {/* Botão para alternar status e simular */}
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(st.id)}
                    title="Clique para alternar o status deste estado (Leaning Trump ➔ Toss-up ➔ Leaning Harris)"
                    className="px-2 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer transition-colors"
                  >
                    Simular Alternância ↻
                  </button>
                </div>

                {/* PEQUENA BARRA DE PROGRESSO PARA A APURAÇÃO EM CADA ESTADO */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[var(--text-color)] flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      Apuração de Urnas:
                    </span>
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                      {st.reportedPct}% apurado
                    </span>
                  </div>

                  {/* Barra de Progresso Visual da Apuração */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, st.reportedPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>Início: 0%</span>
                    <span>Meta: 100% totalizado</span>
                  </div>
                </div>

                {/* Barra Comparativa dos Votos (Trump x Harris) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      Trump: {trumpPct}% ({st.votesTrump.toLocaleString('pt-BR')})
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      Harris: {harrisPct}% ({st.votesHarris.toLocaleString('pt-BR')})
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-800 flex shadow-xs">
                    <div
                      className="h-full bg-red-600 transition-all duration-500"
                      style={{ width: `${trumpPct}%` }}
                    />
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${harrisPct}%` }}
                    />
                  </div>
                </div>

                {/* Condados Chave e Atualização */}
                <div className="text-[11px] text-[var(--text-muted)] space-y-0.5 pt-1 border-t border-[var(--border-color)]">
                  <div>
                    <strong className="text-[var(--text-color)]">Condados Críticos: </strong>
                    <span className="line-clamp-1">{st.keyCounties}</span>
                  </div>
                  <div className="text-[10px] italic line-clamp-1 text-emerald-600 dark:text-emerald-400">
                    ● {st.lastUpdate}
                  </div>
                </div>
              </div>

              {/* Botão de Pergunta ao Agente IA */}
              {onAskAgentAboutState && (
                <button
                  type="button"
                  onClick={() =>
                    onAskAgentAboutState(
                      `Analise em detalhes a apuração e o status de votação do swing state ${st.name} (${st.code} - ${st.electoralVotes} delegados), onde o status atual é ${currentStatus} com ${st.reportedPct}% das urnas apuradas.`
                    )
                  }
                  className="w-full mt-3 py-1.5 px-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-indigo-500/10 border border-[var(--border-color)] hover:border-indigo-400 text-xs font-bold text-[var(--text-color)] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Analisar {st.code} com IA</span>
                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
