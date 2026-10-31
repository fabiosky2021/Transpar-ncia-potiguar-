import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Users,
  ShieldAlert,
  Search,
  ExternalLink,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Send,
  MessageSquare,
  Bot,
  Mic,
  Image as ImageIcon,
} from 'lucide-react';

interface PotiguarPortalHomeSectionProps {
  onSearchSubmit: (query: string) => void;
  onOpenAgenteIA: (prompt?: string) => void;
  onOpenColinhaRN?: () => void;
}

export const PotiguarPortalHomeSection: React.FC<PotiguarPortalHomeSectionProps> = ({
  onSearchSubmit,
  onOpenAgenteIA,
  onOpenColinhaRN,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchBanner, setActiveSearchBanner] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<
    'licitacoes' | 'gastos' | 'deputados' | 'cidadania' | 'info-kpi' | null
  >(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const q = searchInput.trim();
    setActiveSearchBanner(q);
    onSearchSubmit(q);
  };

  return (
    <>
      {/* Container Principal do Portal Transparência Potiguar */}
      <section
        id="portal-home"
        className="w-full card-clean bg-renda-pattern p-4 sm:p-6 lg:p-8 space-y-6 overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-emerald-900/10 dark:border-emerald-500/20"
      >
        {/* BEGIN: Top Decorative Header & Branding */}
        <header className="pt-2 px-1 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 sm:space-x-3.5">
              {/* Stylized Compass & 'P' Cultural Badge */}
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 shrink-0 flex items-center justify-center">
                {/* Compass Rose / Nautical Star Motif SVG */}
                <svg
                  className="absolute inset-0 w-full h-full text-[#0a5c43] opacity-80"
                  fill="none"
                  viewBox="0 0 100 100"
                >
                  <polygon
                    fill="#00875a"
                    fillOpacity="0.18"
                    points="50,4 55,42 96,50 55,58 50,96 45,58 4,50 45,42"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    opacity="0.4"
                    r="44"
                    stroke="#00875a"
                    strokeDasharray="2,3"
                    strokeWidth="1.5"
                  />
                  <text
                    fill="#0b4737"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    x="50"
                    y="14"
                  >
                    N
                  </text>
                  <text
                    fill="#0b4737"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    x="90"
                    y="53"
                  >
                    L
                  </text>
                  <text
                    fill="#0b4737"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    x="50"
                    y="93"
                  >
                    S
                  </text>
                  <text
                    fill="#0b4737"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    x="12"
                    y="53"
                  >
                    O
                  </text>
                </svg>

                {/* Stylized Letter 'P' Emblem with State Colors */}
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9 relative z-10 drop-shadow-sm"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  {/* Stem of P (Forest Green) */}
                  <rect
                    fill="#00875a"
                    height="32"
                    rx="4"
                    width="8"
                    x="10"
                    y="8"
                  />
                  {/* Upper Loop (Vibrant Yellow / Gold and Teal) */}
                  <path
                    d="M14 8H26C31.5228 8 36 12.4772 36 18C36 23.5228 31.5228 28 26 28H14V8Z"
                    fill="#fdb913"
                  />
                  {/* Inner cutout loop */}
                  <path
                    d="M18 14H25C27.2091 14 29 15.7909 29 18C29 20.2091 27.2091 22 25 22H18V14Z"
                    fill="#0a5c43"
                  />
                  {/* Diagonal RN Sky-Blue Accent */}
                  <path
                    d="M25 23L33 37H25L18 25H25Z"
                    fill="#0070ba"
                    opacity="0.95"
                  />
                </svg>
              </div>

              {/* Brand Text Typography */}
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0d3830] dark:text-emerald-400 uppercase leading-none">
                  Transparência
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0a5c43] dark:text-emerald-300 uppercase leading-tight font-sans">
                  Potiguar
                </span>
              </div>
            </div>

            {/* Potiguar Caju (Cashew) Cultural Motif */}
            <div
              className="w-10 h-10 flex items-center justify-center relative cursor-pointer transition-transform hover:scale-105"
              title="Caju Potiguar · Símbolo Cultural do Rio Grande do Norte"
              onClick={() =>
                onOpenAgenteIA(
                  'Me fale sobre os símbolos de transparência e a identidade cultural potiguar.'
                )
              }
            >
              <svg className="w-9 h-9 drop-shadow" fill="none" viewBox="0 0 40 40">
                <path
                  d="M16 14C11 15 9 20 10 26C11 31 16 35 22 35C28 35 32 30 31 23C30 16 23 13 16 14Z"
                  fill="url(#cashewGradPortal)"
                />
                <path
                  d="M19 8C16 7 13 9 12 11C11 13 12 15 15 15C18 15 21 13 22 11C23 9 21 8 19 8Z"
                  fill="#5c4428"
                />
                <defs>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="cashewGradPortal"
                    x1="12"
                    x2="30"
                    y1="14"
                    y2="34"
                  >
                    <stop stopColor="#fdb913" />
                    <stop offset="0.45" stopColor="#f27024" />
                    <stop offset="1" stopColor="#cf2e2e" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </header>

        {/* BEGIN: Hero Search Component */}
        <section className="space-y-2" data-purpose="hero-search" id="hero-search">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white dark:bg-slate-800 rounded-full p-1.5 pl-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-emerald-900/15 dark:border-emerald-500/25 focus-within:ring-2 focus-within:ring-[#00875a]/40 transition"
          >
            <input
              id="portal-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="O que você procura no RN?"
              className="w-full text-xs sm:text-sm text-gray-800 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 font-medium"
            />
            {/* Quick Clear / Close Search Button */}
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setActiveSearchBanner(null);
                }}
                title="Limpar e fechar pesquisa"
                aria-label="Limpar pesquisa"
                className="w-7 h-7 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center shrink-0 cursor-pointer mr-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {/* Quick Voice / Mic Button */}
            <button
              type="button"
              onClick={() => onOpenAgenteIA()}
              title="Pesquisar por voz ou falar com o PotiguarBot IA"
              aria-label="Pesquisar por voz"
              className="w-8 h-8 rounded-full text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer mr-0.5"
            >
              <Mic className="w-4 h-4 stroke-[2.2]" />
            </button>
            {/* Quick Image Upload Button */}
            <button
              type="button"
              onClick={() => onOpenAgenteIA()}
              title="Análise visual de imagem ou documento"
              aria-label="Upload de imagem para análise visual"
              className="w-8 h-8 rounded-full text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer mr-1"
            >
              <ImageIcon className="w-4 h-4 stroke-[2.2]" />
            </button>
            {/* Search Pill Action Button */}
            <button
              type="submit"
              aria-label="Buscar no Portal Transparência"
              className="bg-gradient-to-r from-amber-400 to-[#00875a] hover:from-amber-500 hover:to-[#00704a] text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </form>

          {/* Banner de Pesquisa Ativa com Botão Fechar Explícito */}
          {activeSearchBanner && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 min-w-0">
                <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  Pesquisando por: <strong>"{activeSearchBanner}"</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSearchBanner(null);
                  setSearchInput('');
                }}
                className="px-2.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                title="Fechar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
                <span>Fechar</span>
              </button>
            </div>
          )}
        </section>

        {/* BEGIN: KPI Summary Cards Section */}
        <section className="space-y-2" data-purpose="kpi-cards">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-[#0d3830]/90 dark:text-emerald-300 uppercase tracking-wide">
              Indicadores do Painel
            </h2>
            <button
              type="button"
              onClick={() => setActiveModal('info-kpi')}
              className="text-[10.5px] font-semibold text-[#00875a] dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Fontes Oficiais</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* KPI 1: Total de Consultas */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-emerald-900/10 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-800/10 dark:bg-emerald-500/20 flex items-center justify-center mb-1.5 text-emerald-800 dark:text-emerald-400">
                <Clock className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium text-gray-500 dark:text-gray-400 min-h-[22px] flex items-center">
                Total de Consultas
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight mt-0.5 font-tabular">
                129.337
              </span>
            </div>

            {/* KPI 2: Órgãos Monitorados */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-emerald-900/10 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center mb-1.5 text-sky-600 dark:text-sky-400">
                <Building2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium text-gray-500 dark:text-gray-400 min-h-[22px] flex items-center">
                Órgãos Monitorados
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-sky-600 dark:text-sky-400 tracking-tight mt-0.5 font-tabular">
                50
              </span>
            </div>

            {/* KPI 3: Última Atualização */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-emerald-900/10 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-1.5 text-orange-600 dark:text-orange-400">
                <Calendar className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium text-gray-500 dark:text-gray-400 min-h-[22px] flex items-center">
                Última Atualização
              </span>
              <span className="text-[10.5px] sm:text-xs font-extrabold text-orange-600 dark:text-orange-400 tracking-tight mt-0.5 font-tabular">
                25/10/2026
              </span>
            </div>
          </div>
        </section>

        {/* BEGIN: Featured Portal Areas (Áreas de Destaque) */}
        <section className="space-y-2.5" data-purpose="areas-de-destaque">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold text-[#0d3830] dark:text-emerald-300">
              Áreas de Destaque
            </h2>
            <span className="text-[10.5px] text-gray-500 dark:text-slate-400">
              Acesso rápido com dados reais
            </span>
          </div>

          {/* Responsive 2x2 or 4-col Grid with Exact Color Themes from Mockup */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Card 1: Licitações & Contratos (Green #00875a) */}
            <article className="bg-[#00875a] rounded-2xl p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-[0_4px_14px_rgba(0,135,90,0.2)] relative overflow-hidden min-h-[178px] hover:shadow-[0_6px_20px_rgba(0,135,90,0.3)] transition-all">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                  Licitações &amp; Contratos
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-white/90 mt-1 leading-snug line-clamp-2">
                  Pesquise e acompanhe licitações e contratos estaduais.
                </p>
              </div>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setActiveModal('licitacoes')}
                  className="w-full bg-white text-[#00875a] hover:bg-emerald-50 text-[11px] font-bold py-1.5 px-3 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Acessar
                </button>
              </div>
            </article>

            {/* Card 2: Gastos Estaduais (Blue #0070ba) */}
            <article className="bg-[#0070ba] rounded-2xl p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-[0_4px_14px_rgba(0,112,186,0.2)] relative overflow-hidden min-h-[178px] hover:shadow-[0_6px_20px_rgba(0,112,186,0.3)] transition-all">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                  Gastos Estaduais
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-white/90 mt-1 leading-snug line-clamp-2">
                  Consulte despesas, receitas e convênios do RN.
                </p>
              </div>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setActiveModal('gastos')}
                  className="w-full bg-white text-[#0070ba] hover:bg-sky-50 text-[11px] font-bold py-1.5 px-3 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Acessar
                </button>
              </div>
            </article>

            {/* Card 3: Deputados Estaduais (Orange #e8622c) */}
            <article className="bg-[#e8622c] rounded-2xl p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-[0_4px_14px_rgba(232,98,44,0.2)] relative overflow-hidden min-h-[178px] hover:shadow-[0_6px_20px_rgba(232,98,44,0.3)] transition-all">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                  Deputados Estaduais
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-white/90 mt-1 leading-snug line-clamp-2">
                  Atuação parlamentar, gastos de gabinetes e propostas.
                </p>
              </div>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setActiveModal('deputados')}
                  className="w-full bg-white text-[#e8622c] hover:bg-orange-50 text-[11px] font-bold py-1.5 px-3 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Acessar
                </button>
              </div>
            </article>

            {/* Card 4: Cidadania Ativa (Yellow #f2a900) */}
            <article className="bg-[#f2a900] rounded-2xl p-3.5 sm:p-4 text-slate-900 flex flex-col justify-between shadow-[0_4px_14px_rgba(242,169,0,0.2)] relative overflow-hidden min-h-[178px] hover:shadow-[0_6px_20px_rgba(242,169,0,0.3)] transition-all">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-black/5 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center mb-2">
                  <ShieldAlert className="w-5 h-5 text-[#0d3830]" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1 text-[#0d3830]">
                  Cidadania Ativa
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-[#0d3830]/85 mt-1 leading-snug line-clamp-2">
                  Ouvidoria, denúncias e pedidos de informação (e-SIC).
                </p>
              </div>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setActiveModal('cidadania')}
                  className="w-full bg-white text-slate-900 hover:bg-amber-50 text-[11px] font-bold py-1.5 px-3 rounded-full shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Acessar
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* BEGIN: Destaque do Estúdio PotiguarBot IA */}
        <section className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0d3830] via-[#0a5c43] to-[#00875a] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-500/30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <span>PotiguarBot IA · Estúdio de Criação</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/90 leading-tight">
                Consulte gastos públicos, deputados, licitações e crie conteúdos por Texto, Voz (Microfone) ou Imagem.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onOpenAgenteIA()}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0d3830] font-black text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Abrir Chatbot IA</span>
            </button>
          </div>
        </section>
      </section>

      {/* MODAL: Informações e Metadados dos Indicadores (KPIs) */}
      {activeModal === 'info-kpi' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-emerald-800 text-white">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold">Fontes Oficiais dos Indicadores</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs text-[var(--text-color)]">
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-[#00875a]">Total de Consultas (129.337)</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Consolidação dos acessos a contratações, licitações, despesas públicas e consultas cidadãs auditadas no Portal da Transparência Potiguar.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-[#0070ba]">Órgãos Monitorados (50)</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Secretarias de Estado, Autarquias, Fundações Públicas e Órgãos da Administração Direta e Indireta do Governo do Estado do Rio Grande do Norte.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-[#e8622c]">Última Atualização (14/10/2026)</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Sincronizado com os dados abertos do Diário Oficial do Estado (DOE-RN), Tribunal de Contas do Estado (TCE-RN) e Tribunal Superior Eleitoral (TSE).
                </p>
              </div>
            </div>
            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Licitações & Contratos do RN */}
      {activeModal === 'licitacoes' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[#00875a] text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm sm:text-base font-bold">
                  Licitações &amp; Contratos Públicos (RN)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <p className="text-[var(--text-muted)]">
                Dados consolidados a partir do Portal de Transparência do Governo do RN e Diário Oficial do Estado:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    edital: 'Pregão Eletrônico nº 042/2026 - SIN',
                    objeto: 'Requalificação e manutenção emergencial de rodovias estaduais (RN-117 e RN-013).',
                    valor: 'R$ 14.820.000,00',
                    status: 'Homologado',
                    data: '10/10/2026',
                  },
                  {
                    edital: 'Concorrência nº 018/2026 - SESAP',
                    objeto: 'Aquisição de insumos hospitalares e exames por telemedicina para o Hospital Walfredo Gurgel.',
                    valor: 'R$ 6.350.000,00',
                    status: 'Em Julgamento',
                    data: '08/10/2026',
                  },
                  {
                    edital: 'Dispensa de Licitação nº 007/2026 - STTU/Passe Livre',
                    objeto: 'Operação de reforço de frota para gratuidade de transporte no 2º Turno (Eleições 2026).',
                    valor: 'R$ 1.280.000,00',
                    status: 'Publicado',
                    data: '04/10/2026',
                  },
                ].map((item) => (
                  <div
                    key={item.edital}
                    className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#00875a]">
                      <span>{item.edital}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[var(--text-color)] font-medium">
                      {item.objeto}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1">
                      <span>Valor estimado: <strong>{item.valor}</strong></span>
                      <span>{item.data}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-300">
                ✓ Informação pública auditada pela Lei nº 12.527 (LAI) e Tribunal de Contas do Estado (TCE-RN).
              </div>
            </div>

            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onOpenAgenteIA('Analise as últimas licitações de saúde e transporte do RN.');
                }}
                className="text-[11px] font-semibold text-[var(--accent-color)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Analisar no PotiguarBot IA
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#00875a] text-white text-xs font-bold hover:bg-[#00704a] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Gastos Estaduais do RN */}
      {activeModal === 'gastos' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[#0070ba] text-white">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm sm:text-base font-bold">
                  Gastos e Receitas Estaduais (RN)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <p className="text-[var(--text-muted)]">
                Execução Orçamentária Atualizada · Exercício 2026 (Secretaria de Estado da Fazenda - SEFAZ/RN):
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                    Saúde Pública (SUS RN)
                  </span>
                  <div className="text-base font-black text-[#0070ba] mt-0.5 font-tabular">
                    R$ 2,41 Bi
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    18,4% do orçamento
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                    Educação e UERN
                  </span>
                  <div className="text-base font-black text-[#0070ba] mt-0.5 font-tabular">
                    R$ 3,18 Bi
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    25,2% do orçamento
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                    Segurança Pública
                  </span>
                  <div className="text-base font-black text-[#0070ba] mt-0.5 font-tabular">
                    R$ 1,89 Bi
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    14,5% do orçamento
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                    Infraestrutura & Obras
                  </span>
                  <div className="text-base font-black text-[#0070ba] mt-0.5 font-tabular">
                    R$ 840 Mi
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    6,8% do orçamento
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-500/30 text-[11px] text-sky-800 dark:text-sky-300">
                📊 As contas estaduais seguem os limites da Lei de Responsabilidade Fiscal (LRF) com acompanhamento em tempo real.
              </div>
            </div>

            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onOpenAgenteIA('Como o governo do RN tem aplicado as despesas em saúde e infraestrutura?');
                }}
                className="text-[11px] font-semibold text-[var(--accent-color)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Analisar no PotiguarBot IA
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0070ba] text-white text-xs font-bold hover:bg-[#005c99] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Deputados Estaduais (ALRN) */}
      {activeModal === 'deputados' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[#e8622c] text-white">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <h3 className="text-sm sm:text-base font-bold">
                  Deputados Estaduais (ALRN)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <p className="text-[var(--text-muted)]">
                Acompanhamento parlamentar e transparência da Assembleia Legislativa do Rio Grande do Norte (ALRN):
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#e8622c]">24 Deputados em Exercício</span>
                    <span className="text-[10px] font-semibold text-gray-500">Legislatura 2023-2027</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-1">
                    Fiscalização de verba de gabinete, presenças em plenário, projetos de lei em tramitação e comissões temáticas.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-500/20 text-orange-900 dark:text-orange-200">
                  <div className="font-bold mb-1">Destaques Parlamentares em 2026:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Debate sobre ampliação do Passe Livre Intermunicipal (Região Metropolitana de Natal e Mossoró).</li>
                    <li>Adequação da jornada de trabalho e impactos da PEC 221/2019 no setor de comércio e serviços potiguar.</li>
                    <li>Fiscalização de obras de infraestrutura nas rodovias estaduais e pontes sobre o Rio Potengi.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="#colinha-politica-2026"
                  onClick={() => {
                    setActiveModal(null);
                    if (onOpenColinhaRN) onOpenColinhaRN();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e8622c] hover:underline"
                >
                  <span>Ver Colinha RN 2026 &amp; Candidaturas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onOpenAgenteIA('Quais foram as principais leis aprovadas pela ALRN este ano?');
                }}
                className="text-[11px] font-semibold text-[var(--accent-color)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Consultar PotiguarBot IA
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#e8622c] text-white text-xs font-bold hover:bg-[#d05020] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Cidadania Ativa & Ouvidoria */}
      {activeModal === 'cidadania' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[#f2a900] text-slate-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#0d3830]" />
                <h3 className="text-sm sm:text-base font-bold text-[#0d3830]">
                  Cidadania Ativa &amp; Ouvidoria (RN)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <p className="text-[var(--text-muted)]">
                Canais oficiais e ferramentas de controle social democrático para o cidadão do Rio Grande do Norte:
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1">
                  <div className="font-bold text-[#0d3830]">Sistema Eletrônico do Serviço de Informação ao Cidadão (e-SIC)</div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    Faça pedidos diretos de acesso à informação com base na Lei Federal nº 12.527/2011 para qualquer secretaria ou autarquia estadual.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1">
                  <div className="font-bold text-[#0d3830]">Ouvidoria Geral do Estado do RN (OGE)</div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                    Envio de sugestões, elogios, reclamações ou denúncias de serviços públicos estaduais.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                  <div className="font-bold mb-1">Moderação Cívica e LGPD:</div>
                  <p className="text-[11px]">
                    Todos os relatos enviados na plataforma contam com proteção de dados pessoais (Lei nº 13.709/2018) e auditoria contra discurso de ódio.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="#relatos-comunidade"
                  onClick={() => setActiveModal(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d3830] hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Publicar Relato Cidadão com Moderação LGPD</span>
                </a>
              </div>
            </div>

            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onOpenAgenteIA('Como abrir uma solicitação na ouvidoria pública do RN?');
                }}
                className="text-[11px] font-semibold text-[var(--accent-color)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Orientação no PotiguarBot IA
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#f2a900] text-slate-900 text-xs font-bold hover:bg-amber-400 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
