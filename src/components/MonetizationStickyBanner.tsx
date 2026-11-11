import React, { useState } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  X,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
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
      aria-label="Campanha 11.11 & Black Friday Vitrine Oficial"
      className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-orange-950 text-white border-2 border-orange-500/60 shadow-2xl backdrop-blur-md relative overflow-hidden flex items-center justify-between gap-3">
        {/* Glow pulsante de fundo */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-orange-500/25 rounded-full blur-xl pointer-events-none animate-pulse" />

        {/* Ícone e Conteúdo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-orange-950/60">
            <Flame className="w-6 h-6 fill-current animate-pulse text-yellow-200" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-300 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              <span>11.11 &amp; Black Friday Ativa</span>
            </div>
            <h5 className="text-xs sm:text-sm font-black truncate text-white">
              Vitrine Oficial Fábio Kauã
            </h5>
            <p className="text-[11px] text-gray-300 truncate">
              Mountain Bike, achadinhos &amp; até 70% OFF
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenStorefrontPopup && (
            <button
              type="button"
              onClick={onOpenStorefrontPopup}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-black text-xs uppercase tracking-wide flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-yellow-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver Pop-up</span>
            </button>
          )}

          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Acessar loja oficial"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Fechar banner da campanha"
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
