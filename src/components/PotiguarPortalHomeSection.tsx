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
} from 'lucide-react';

interface PotiguarPortalHomeSectionProps {
  onSearchSubmit: (query: string) => void;
  onOpenAgenteIA: (prompt?: string) => void;
}

export const PotiguarPortalHomeSection: React.FC<PotiguarPortalHomeSectionProps> = ({
  onSearchSubmit,
  onOpenAgenteIA,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeModal, setActiveModal] = useState<
    'licitacoes' | 'gastos' | null
  >(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    onSearchSubmit(searchInput.trim());
  };

  return (
    <>
      {/* Container Principal do Portal Transparência Potiguar */}
      <section
        id="portal-home"
        className="w-full card-clean bg-renda-pattern p-4 sm:p-6 lg:p-8 space-y-6 overflow-hidden rounded-2xl sm:rounded-3xl shadow-card"
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
                <span className="text-xs font-bold tracking-wider text-[#0d3830] dark:text-emerald-400 uppercase leading-none">
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
        <section className="space-y-1.5" data-purpose="hero-search" id="hero-search">
          <label
            className="block text-xs font-semibold text-[#0d3830]/80 dark:text-emerald-300 ml-1"
            htmlFor="portal-search-input"
          >
            Hero Search
          </label>
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white dark:bg-slate-800 rounded-full p-1 pl-4 shadow-sm border border-emerald-900/10 dark:border-emerald-500/20 focus-within:ring-2 focus-within:ring-[#00875a]/40 transition"
          >
            <input
              id="portal-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="O que você procura no RN?"
              className="w-full text-xs sm:text-sm text-gray-700 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 font-medium"
            />
            {/* Search Pill Action Button */}
            <button
              type="submit"
              aria-label="Buscar"
              className="bg-gradient-to-r from-amber-400 to-emerald-600 hover:from-amber-500 hover:to-emerald-700 text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </form>
        </section>

        {/* BEGIN: KPI Summary Cards Section */}
        <section className="space-y-2" data-purpose="kpi-cards">
          <h2 className="text-xs font-semibold text-[#0d3830]/80 dark:text-emerald-300 ml-1">
            KPI Cards
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* KPI 1: Total de Consultas */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-card border border-emerald-900/5 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-800/10 dark:bg-emerald-500/20 flex items-center justify-center mb-1.5 text-emerald-800 dark:text-emerald-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="M12 7v5l3 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[10px] leading-tight font-medium text-gray-500 dark:text-gray-400 min-h-[22px] flex items-center">
                Total de Consultas
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight mt-0.5">
                129.337
              </span>
            </div>

            {/* KPI 2: Órgãos Monitorados */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-card border border-emerald-900/5 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center mb-1.5 text-sky-600 dark:text-sky-400">
                <Building2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] leading-tight font-medium text-gray-500 dark:text-gray-400 min-h-[22px] flex items-center">
                Órgãos Monitorados
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-sky-600 dark:text-sky-400 tracking-tight mt-0.5">
                50
              </span>
            </div>

            {/* KPI 3: Última Atualização */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-card border border-emerald-900/5 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-1.5 text-orange-600 dark:text-orange-400">
                <Calendar className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] leading-tight font-medium text-gray-500 dark:text-gray-400 min-h-[22px] flex items-center">
                Última Atualização
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-orange-600 dark:text-orange-400 tracking-tight mt-0.5">
                10/08/2023
              </span>
            </div>
          </div>
        </section>

        {/* BEGIN: Featured Portal Areas (Áreas de Destaque) */}
        <section className="space-y-2.5" data-purpose="areas-de-destaque">
          <h2 className="text-sm font-bold text-[#0d3830] dark:text-emerald-300 ml-1">
            Áreas de Destaque
          </h2>
          {/* Responsive 2x2 or 4-col Grid with Exact Color Themes from Mockup */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Card 1: Licitações & Contratos (Green) */}
            <article className="bg-[#00875a] rounded-2xl p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-card relative overflow-hidden min-h-[178px]">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5 text-amber-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M14 5l7 7m-9 9l-7-7m4-4l6 6m-9-3l3 3M3 21h6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                  Licitações &amp; Contratos
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-white/85 mt-1 leading-snug line-clamp-2">
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

            {/* Card 2: Gastos Estaduais (Blue) */}
            <article className="bg-[#0070ba] rounded-2xl p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-card relative overflow-hidden min-h-[178px]">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5 text-amber-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                  Gastos Estaduais
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-white/85 mt-1 leading-snug line-clamp-2">
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

            {/* Card 3: Deputados Estaduais (Orange) */}
            <article className="bg-[#e8622c] rounded-2xl p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-card relative overflow-hidden min-h-[178px]">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1">
                  Deputados Estaduais
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-white/85 mt-1 leading-snug line-clamp-2">
                  Atuação parlamentar, gastos de gabinetes e propostas.
                </p>
              </div>
              <div className="mt-3 text-center">
                <a
                  href="#colinha-politica-2026"
                  className="block w-full bg-white text-[#e8622c] hover:bg-orange-50 text-[11px] font-bold py-1.5 px-3 rounded-full shadow-sm active:scale-95 transition text-center no-underline cursor-pointer"
                >
                  Acessar
                </a>
              </div>
            </article>

            {/* Card 4: Cidadania Ativa (Yellow/Gold) */}
            <article className="bg-[#f2a900] rounded-2xl p-3.5 sm:p-4 text-slate-900 flex flex-col justify-between shadow-card relative overflow-hidden min-h-[178px]">
              <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-black/5 rounded-full pointer-events-none" />
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5 text-[#0d3830]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-tight line-clamp-1 text-[#0d3830]">
                  Cidadania Ativa
                </h3>
                <p className="text-[9.5px] sm:text-[10px] text-[#0d3830]/80 mt-1 leading-snug line-clamp-2">
                  Ouvidoria, denúncias e pedidos de informação (e-SIC).
                </p>
              </div>
              <div className="mt-3 text-center">
                <a
                  href="#potiguar-bot"
                  className="block w-full bg-white text-slate-900 hover:bg-amber-50 text-[11px] font-bold py-1.5 px-3 rounded-full shadow-sm active:scale-95 transition text-center no-underline cursor-pointer"
                >
                  Acessar
                </a>
              </div>
            </article>
          </div>
        </section>
      </section>

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
                  <div className="text-base font-black text-[#0070ba] mt-0.5">
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
                  <div className="text-base font-black text-[#0070ba] mt-0.5">
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
                  <div className="text-base font-black text-[#0070ba] mt-0.5">
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
                  <div className="text-base font-black text-[#0070ba] mt-0.5">
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
    </>
  );
};
