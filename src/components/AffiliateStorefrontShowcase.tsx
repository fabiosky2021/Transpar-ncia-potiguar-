import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Star,
  Tag,
  ArrowUpRight,
  Store,
  SlidersHorizontal,
  Clock,
  Flame,
  Truck,
  CreditCard,
  Download,
  Bike,
} from 'lucide-react';
import bannerBlackFridayImg from '../assets/images/banner_black_friday_promo_1793436552103.jpg';

interface AffiliateStorefrontShowcaseProps {
  affiliateUrl?: string;
  onOpenEditor?: () => void;
  onOpenPopup?: () => void;
  variant?: 'banner' | 'card' | 'compact';
}

export const AffiliateStorefrontShowcase: React.FC<AffiliateStorefrontShowcaseProps> = ({
  affiliateUrl = 'https://collshp.com/fabiokaua692287?view=storefront',
  onOpenEditor,
  onOpenPopup,
  variant = 'card',
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '09',
    minutes: '59',
    seconds: '59',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft({
        hours: String(hrs).padStart(2, '0'),
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const domainDisplay = 'collshp.com/fabiokaua692287';

  // Compact Variant (e.g. for sidebars, cards, candidate profiles)
  if (variant === 'compact') {
    return (
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--text-color)] truncate">
                Vitrine Oficial Fábio Kauã
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                Parceiro
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">
              {domainDisplay}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copiar link da vitrine"
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] hover:bg-[var(--surface-subtle)] text-xs cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 no-underline transition-colors shadow-sm"
          >
            <span>Ver Loja</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // Full Featured Showcase Card (fits seamlessly in main layout, mobile-ready)
  return (
    <section
      id="vitrine-afiliado"
      aria-label="Vitrine de Afiliado Parceira"
      className="card-clean p-5 sm:p-7 space-y-5 rounded-2xl sm:rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-[var(--card-bg)] via-[var(--surface-subtle)] to-[var(--card-bg)] overflow-hidden shadow-sm"
    >
      {/* Header com Badges e Informações do Criador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00875a] via-teal-500 to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-[var(--card-bg)] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black">
                <Store className="w-6 h-6" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
              <ShieldCheck className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                ★ Vitrine Parceira Oficial
              </span>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Curadoria Verificada
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)] leading-snug">
              Loja &amp; Recomendações de Fábio Kauã
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Storefront digital oficial com ofertas, achadinhos, tecnologia e leitura recomendada.
            </p>
          </div>
        </div>

        {onOpenEditor && (
          <button
            type="button"
            onClick={onOpenEditor}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configurar</span>
          </button>
        )}
      </div>

      {/* BANNER PROMOCIONAL HORIZONTAL 11.11 & BLACK FRIDAY (ALTA RESOLUÇÃO) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-orange-500/50 shadow-2xl bg-gradient-to-br from-red-950 via-slate-950 to-orange-950 group">
        <div className="relative aspect-[16/9] w-full max-h-[460px] overflow-hidden">
          <img
            src={bannerBlackFridayImg}
            alt="Banner Promocional 11.11 e Black Friday com Mountain Bike, Máquina de Cortar Cabelo, Escova Elétrica e Suporte de Cabeça"
            className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Subtle gradient vignette at bottom for mobile legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

          {/* Quick Floating Action Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <a
              href={bannerBlackFridayImg}
              download="banner-11-11-black-friday-alta-resolucao.jpg"
              title="Baixar imagem do banner em alta resolução"
              className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 inline-flex items-center gap-1.5 shadow-lg no-underline cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Baixar Banner HD</span>
            </a>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                11.11 + Black Friday
              </span>
              <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-yellow-300 font-mono text-xs font-black border border-yellow-500/40 flex items-center gap-1.5 shadow">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span>EXPIRA EM: {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}</span>
              </div>
            </div>

            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-600 text-black font-black text-xs sm:text-sm uppercase tracking-wide shadow-xl shadow-orange-950/50 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 no-underline cursor-pointer border border-yellow-300"
            >
              <span>Compre Agora na Vitrine</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Barra de Vantagens Competitivas & Produtos em Destaque no Banner */}
        <div className="p-3.5 sm:p-4 bg-slate-900/95 border-t border-orange-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-gray-200">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            <Bike className="w-5 h-5 text-orange-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-extrabold text-white text-[11px] leading-tight truncate">Mountain Bike MTB</div>
              <div className="text-[10px] text-orange-300 truncate">Destaque Central</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-extrabold text-white text-[11px] leading-tight truncate">Máquina &amp; Escova</div>
              <div className="text-[10px] text-yellow-300 truncate">Cards Flutuantes 3D</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-extrabold text-white text-[11px] leading-tight truncate">Frete Grátis Brasil</div>
              <div className="text-[10px] text-emerald-300 truncate">Itens Selecionados</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-extrabold text-white text-[11px] leading-tight truncate">Até 12x Sem Juros</div>
              <div className="text-[10px] text-cyan-300 truncate">Facilidade de Pagamento</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Acesso Rápido à Vitrine de Afiliado */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#0a5c43] text-white shadow-xl border border-emerald-400/40 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-bold shadow-lg shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 text-emerald-300 border border-emerald-400/30">
                Vitrine Oficial de Afiliado
              </span>
              <span className="text-xs font-bold text-emerald-100">
                Fábio Kauã · CollabShop
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              Produtos &amp; Achadinhos Selecionados
            </h4>
            <p className="text-xs text-emerald-100 max-w-xl">
              Navegue pelas recomendações de compras com segurança e descontos exclusivos diretamente no parceiro oficial.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch sm:self-auto">
          {onOpenPopup && (
            <button
              type="button"
              onClick={onOpenPopup}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ver Pop-up (10s)</span>
            </button>
          )}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs uppercase tracking-wide shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 no-underline"
          >
            <span>Acessar Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid de Destaques da Loja (Acomoda perfeitamente em telas pequenas e grandes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Item 1 */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-color)]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              Achadinhos &amp; Seleção
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
              Top Descontos
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Produtos selecionados a dedo com as melhores avaliações e cupons aplicados.
          </p>
        </div>

        {/* Item 2 */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-color)]">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Tag className="w-4 h-4" />
              Tecnologia &amp; Utilidades
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-semibold">
              Atualizado
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Acessórios, periféricos e itens práticos para o dia a dia e estudos.
          </p>
        </div>

        {/* Item 3 */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-color)]">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
              Coleções Exclusivas
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">
              CollabShop
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Navegue pelas prateleiras digitais personalizadas na plataforma CollabShop.
          </p>
        </div>
      </div>

      {/* Caixa de Ação Principal e Link Formatado */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-teal-950/15 to-slate-900/10 dark:from-emerald-900/30 dark:to-slate-900/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[var(--text-color)]">
              Link de Afiliado Pronto &amp; Ativo
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)] font-mono truncate max-w-full sm:max-w-md bg-[var(--card-bg)] px-2.5 py-1 rounded-md border border-[var(--border-color)]">
            {affiliateUrl}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00875a] to-[#0a5c43] hover:from-[#0b6b49] hover:to-[#074734] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 no-underline shadow-md shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Acessar Vitrine na CollabShop</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
};
