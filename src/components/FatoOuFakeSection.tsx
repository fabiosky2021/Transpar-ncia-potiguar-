import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Share2,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Filter,
  Check,
  Clock,
  HelpCircle,
  Radio,
} from 'lucide-react';
import {
  FactCheckItem,
  INITIAL_FACT_CHECKS,
  FactStatus,
} from '../data/fatoOuFakeData';

interface FatoOuFakeSectionProps {
  onAskAgent?: (prompt: string) => void;
  onOpenStorefront?: () => void;
}

export const FatoOuFakeSection: React.FC<FatoOuFakeSectionProps> = ({
  onAskAgent,
  onOpenStorefront,
}) => {
  const [items, setItems] = useState<FactCheckItem[]>(INITIAL_FACT_CHECKS);
  const [activeFilter, setActiveFilter] = useState<'todos' | FactStatus>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, 'fato' | 'fake'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === 'todos' || item.status === activeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleVoteCommunity = (id: string, choice: 'fato' | 'fake') => {
    if (userVotes[id]) return;
    setUserVotes((prev) => ({ ...prev, [id]: choice }));
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            communityVotes: {
              believedFake:
                choice === 'fake'
                  ? item.communityVotes.believedFake + 1
                  : item.communityVotes.believedFake,
              believedFato:
                choice === 'fato'
                  ? item.communityVotes.believedFato + 1
                  : item.communityVotes.believedFato,
            },
          };
        }
        return item;
      })
    );
  };

  const handleShareFactCheck = (item: FactCheckItem) => {
    const text = `🔍 CHECAGEM FATO OU FAKE: ${item.title}\n\nStatus: [${item.statusLabel}]\n\nResumo da Verificação: ${item.summary}\n\nFonte: ${item.verifiedBy}\n\nConfira mais checagens e recomendações oficiais:\nhttps://collshp.com/fabiokaua692287?view=storefront`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getStatusBadge = (status: FactStatus) => {
    switch (status) {
      case 'fato':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            FATO / VERDADEIRO
          </span>
        );
      case 'fake':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/15 text-rose-600 dark:text-rose-400 font-black text-xs border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            FAKE / FALSO
          </span>
        );
      case 'golpe':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            ALERTA DE GOLPE VIRTUAL
          </span>
        );
      case 'distorcido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-black text-xs border border-yellow-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            FORA DE CONTEXTO
          </span>
        );
    }
  };

  return (
    <section
      id="fato-ou-fake"
      aria-label="Central de Checagem Fato ou Fake 24h"
      className="card-clean p-4 sm:p-7 space-y-6 sm:space-y-8 border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-950/15 via-[var(--card-bg)] to-[var(--card-bg)] shadow-xl relative overflow-hidden"
    >
      {/* Header do Módulo Fato ou Fake */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Checagem de Fatos 24h
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verificação Jornalística &amp; Detecção de Deepfakes
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight">
            Radar FATO ou FAKE · Desmascarando Boatos &amp; Golpes
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">
            Consulte notícias verificadas sobre política americana, discursos, economia e alertas contra fraudes virtuais. Checamos com fontes oficiais para você navegar com segurança.
          </p>
        </div>

        {/* Botão de checagem com o Estúdio IA */}
        <button
          type="button"
          onClick={() =>
            onAskAgent?.(
              'Quero verificar se uma notícia que recebi no WhatsApp é Fato ou Fake. Você pode checar para mim com fontes confiáveis?'
            )
          }
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wide inline-flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Verificar Boato com IA</span>
        </button>
      </div>

      {/* BARRA DE PESQUISA RÁPIDA & FILTROS POR STATUS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquise por termo, tema, candidato ou boato (ex: vistos, tarifas, iPhone por 99, Trump, urnas)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] text-sm text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Pílulas de filtro */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)] text-[11px] font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
              activeFilter === 'todos'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fake')}
            className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
              activeFilter === 'fake'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
            }`}
          >
            Fakes Desmentidos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fato')}
            className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
              activeFilter === 'fato'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
            }`}
          >
            Fatos Confirmados
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('golpe')}
            className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
              activeFilter === 'golpe'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
            }`}
          >
            ⚠️ Alertas de Golpes
          </button>
        </div>
      </div>

      {/* LISTAGEM DE CHECAGENS INTERATIVAS */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] text-sm text-[var(--text-muted)] space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
            <p className="font-semibold text-[var(--text-color)]">Nenhuma checagem encontrada para esta busca.</p>
            <p className="text-xs">
              Você pode enviar o texto ou print diretamente ao Estúdio de IA para checagem imediata.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const hasVoted = userVotes[item.id] !== undefined;
            const totalVotes = item.communityVotes.believedFake + item.communityVotes.believedFato;
            const fakePct = Math.round((item.communityVotes.believedFake / Math.max(1, totalVotes)) * 100);

            return (
              <article
                key={item.id}
                className="p-4 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm space-y-4 hover:border-emerald-500/50 transition-colors"
              >
                {/* Header do Card: Selo de Status + Alcance */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.originalDate}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                    {item.viralReach}
                  </span>
                </div>

                {/* Título Principal */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-color)] leading-snug">
                    {item.title}
                  </h3>
                  <div className="mt-2 p-3 rounded-xl bg-[var(--surface-subtle)] border-l-4 border-amber-500 text-xs text-[var(--text-color)] italic">
                    «{item.claim}»
                  </div>
                </div>

                {/* Resumo da Investigação */}
                <div className="space-y-2 text-xs sm:text-sm text-[var(--text-color)] leading-relaxed">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    O que checamos:
                  </p>
                  <p>{item.summary}</p>
                </div>

                {/* Provas e Evidências com Checklist */}
                <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)]/70 border border-[var(--border-color)] space-y-2">
                  <span className="text-xs font-bold text-[var(--text-color)] uppercase tracking-wider block">
                    Evidências Verificadas:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
                    {item.evidence.map((ev, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-color)]/60 flex items-center justify-between">
                    <span>Verificado por: <strong className="text-[var(--text-color)]">{item.verifiedBy}</strong></span>
                    <span>Fonte primária: {item.sourceUrlName}</span>
                  </div>
                </div>

                {/* Monetização Contextual / Alerta de Compras Seguras (se houver) */}
                {item.monetizationTip && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {item.monetizationTip.headline}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] max-w-xl">
                        {item.monetizationTip.description}
                      </p>
                    </div>

                    <a
                      href={item.monetizationTip.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 no-underline shadow-sm shrink-0 whitespace-nowrap"
                    >
                      <span>{item.monetizationTip.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Footer do Card: Enquete de Comunidade & Compartilhar */}
                <div className="pt-2 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Pergunta interativa para o leitor */}
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">Você achava que era:</span>
                    <button
                      type="button"
                      disabled={hasVoted}
                      onClick={() => handleVoteCommunity(item.id, 'fake')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        userVotes[item.id] === 'fake'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border-[var(--border-color)] hover:border-rose-400'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3 text-rose-500" />
                      <span>Fake ({fakePct}%)</span>
                    </button>
                    <button
                      type="button"
                      disabled={hasVoted}
                      onClick={() => handleVoteCommunity(item.id, 'fato')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        userVotes[item.id] === 'fato'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border-[var(--border-color)] hover:border-emerald-400'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-500" />
                      <span>Fato ({100 - fakePct}%)</span>
                    </button>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareFactCheck(item)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] hover:bg-emerald-500/10 text-[var(--text-color)] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Compartilhar Verificação</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Rodapé do Módulo com Canal de Denúncias & Afiliado */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-[#0a5c43] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Recebeu um boato no WhatsApp ou TikTok?
          </span>
          <h4 className="text-base font-black">
            Envie no Estúdio de Criação para Análise Visual &amp; Checagem Imediata
          </h4>
          <p className="text-xs text-emerald-100 max-w-xl">
            Nosso agente analisa prints, extrai texto por visão computacional e checa em bases de dados abertos.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onAskAgent?.(
              'Como posso enviar um print ou áudio para vocês analisarem se é Fato ou Fake?'
            )
          }
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs uppercase tracking-wide cursor-pointer shadow-md shrink-0 transition-transform active:scale-95"
        >
          Enviar Denúncia ou Print 📸
        </button>
      </div>
    </section>
  );
};
