import React, { useState } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface MonetizationStickyBannerProps {
  storefrontUrl?: string;
  onOpenStorefrontPopup?: () => void;
}

export const MonetizationStickyBanner: React.FC<MonetizationStickyBannerProps> = ({
  storefrontUrl = 'https://collshp.com/fabiokaua692287?view=storefront',
  onOpenStorefrontPopup,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      role="complementary"
      aria-label="Recomendação de Compras Seguras e Vitrine Oficial"
      className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white border-2 border-emerald-500/50 shadow-2xl backdrop-blur-md relative overflow-hidden flex items-center justify-between gap-3">
        {/* Glow de fundo */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Ícone e Conteúdo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <ShoppingBag className="w-5 h-5" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              <span>Loja Oficial Fábio Kauã</span>
            </div>
            <h5 className="text-xs sm:text-sm font-black truncate text-white">
              Achadinhos &amp; Recomendações
            </h5>
            <p className="text-[11px] text-gray-300 truncate">
              Compre com desconto e 100% de segurança
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center gap-1 no-underline shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <span>Ver Shop</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Fechar recomendação de compras"
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
