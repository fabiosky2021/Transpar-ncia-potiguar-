import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Copy,
  Check,
  Tag,
  Clock,
  Flame,
  Bike,
  Truck,
  CreditCard,
  Gift,
} from 'lucide-react';
import bannerBlackFridayImg from '../assets/images/banner_black_friday_promo_1793436552103.jpg';

interface ShopStorefrontPopupProps {
  storefrontUrl?: string;
  initialDelaySeconds?: number;
  lockCloseSeconds?: number;
  isOpen?: boolean;
  onClose?: () => void;
  bannerImageOverride?: string;
}

export const ShopStorefrontPopup: React.FC<ShopStorefrontPopupProps> = ({
  storefrontUrl = 'https://collshp.com/fabiokaua692287?view=storefront',
  initialDelaySeconds = 2,
  lockCloseSeconds = 10,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  bannerImageOverride,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(lockCloseSeconds);
  const [canClose, setCanClose] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bannerImgSrc, setBannerImgSrc] = useState<string>(
    bannerImageOverride || bannerBlackFridayImg || '/assets/aistudio/banner-11-11-black-friday-alta-resolucao.jpg_4386d02a.html'
  );

  // Animated countdown timer for the promotion (hours:minutes:seconds)
  const [promoClock, setPromoClock] = useState<{ hours: string; minutes: string; seconds: string }>({
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
      setPromoClock({
        hours: String(hrs).padStart(2, '0'),
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isActuallyOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  // Dispara a abertura automática do pop-up após delay inicial (se não for controlado externamente)
  useEffect(() => {
    if (controlledIsOpen !== undefined) return;
    const jaFechado = sessionStorage.getItem('popup_shop_fechado');
    if (jaFechado) return;

    const timerAbertura = setTimeout(() => {
      setInternalOpen(true);
      setSecondsRemaining(lockCloseSeconds);
      setCanClose(false);
    }, initialDelaySeconds * 1000);

    return () => clearTimeout(timerAbertura);
  }, [controlledIsOpen, initialDelaySeconds, lockCloseSeconds]);

  // Se aberto externamente, reinicia contagem se ainda não concluída
  useEffect(() => {
    if (controlledIsOpen) {
      setSecondsRemaining(lockCloseSeconds);
      setCanClose(false);
    }
  }, [controlledIsOpen, lockCloseSeconds]);

  // Contagem regressiva de 10 segundos quando o pop-up está aberto
  useEffect(() => {
    if (!isActuallyOpen || canClose) return;

    if (secondsRemaining <= 1) {
      setSecondsRemaining(0);
      setCanClose(true);
      return;
    }

    const timerSegundo = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerSegundo);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerSegundo);
  }, [isActuallyOpen, secondsRemaining, canClose]);

  // Fecha com ESC quando liberado
  useEffect(() => {
    if (!isActuallyOpen || !canClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActuallyOpen, canClose]);

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
    sessionStorage.setItem('popup_shop_fechado', 'true');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isActuallyOpen) return null;

  const progressoPct = Math.round(((lockCloseSeconds - secondsRemaining) / lockCloseSeconds) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (canClose) handleClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-950 border-2 border-orange-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-300"
      >
        {/* Barra superior de contagem e segurança */}
        <div className="w-full bg-gradient-to-r from-red-950 via-slate-900 to-orange-950 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-orange-500/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Oferta Exclusiva · 11.11 &amp; Black Friday
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            {!canClose ? (
              <span className="text-yellow-300 font-bold bg-black/50 px-2 py-0.5 rounded-md border border-yellow-500/30">
                Fechar em {secondsRemaining}s
              </span>
            ) : (
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                ✓ Pronto para fechar
              </span>
            )}
          </div>
        </div>

        {/* Barra de Progresso Animada dos 10 Segundos */}
        {!canClose && (
          <div className="w-full h-1.5 bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-all duration-1000 ease-linear shadow-sm"
              style={{ width: `${progressoPct}%` }}
            />
          </div>
        )}

        {/* Botão de Fechar no Canto Superior Direito (Desbloqueado após os 10s) */}
        {canClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar pop-up promocional"
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer shadow-xl transition-all hover:scale-110 active:scale-95 border border-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Conteúdo com Scroll Suave */}
        <div className="overflow-y-auto space-y-4 p-4 sm:p-6">
          {/* BANNER PROMOCIONAL VISUAL ANIME / ANIMADO (ALTA RESOLUÇÃO) */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-2xl group bg-gradient-to-tr from-red-950 via-orange-950 to-slate-950">
            {/* Imagem do Banner */}
            <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden">
              <img
                src={bannerImgSrc}
                alt="Banner Promocional 11.11 e Black Friday com Mountain Bike e Ofertas"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={() => {
                  setBannerImgSrc(bannerBlackFridayImg);
                }}
              />

              {/* Overlay Gradiente com Brilho Dinâmico */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* Badges Flutuantes Superiores Animados */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  11.11 &amp; BLACK FRIDAY LIBERADA
                </span>

                <span className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-yellow-300 font-mono text-xs font-black border border-yellow-500/50 flex items-center gap-1.5 shadow-md">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>EXPIRA EM: {promoClock.hours}:{promoClock.minutes}:{promoClock.seconds}</span>
                </span>
              </div>

              {/* Botão de Destaque Flutuante Central/Inferior na Imagem */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="space-y-0.5">
                  <div className="text-white font-black text-sm sm:text-base drop-shadow-md flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-orange-400" />
                    Mountain Bike MTB + Gadgets em Destaque
                  </div>
                  <div className="text-xs text-amber-300 font-bold drop-shadow">
                    Até 70% OFF · Entrega Garantida no CollabShop
                  </div>
                </div>

                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-600 text-black font-black text-xs sm:text-sm uppercase tracking-wide shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1.5 no-underline border border-yellow-300"
                >
                  <span>Compre Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Grid de Vantagens e Cards Flutuantes */}
            <div className="p-3 bg-slate-900 border-t border-orange-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <Bike className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-black text-white text-[11px] truncate">Mountain Bike</div>
                  <div className="text-[10px] text-orange-300 truncate">Oferta Central</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-black text-white text-[11px] truncate">Máquina &amp; Escova</div>
                  <div className="text-[10px] text-yellow-300 truncate">Cupons Verificados</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-black text-white text-[11px] truncate">Frete Grátis</div>
                  <div className="text-[10px] text-emerald-300 truncate">Itens Selecionados</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <CreditCard className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-black text-white text-[11px] truncate">Até 12x Sem Juros</div>
                  <div className="text-[10px] text-cyan-300 truncate">Cartão ou Pix</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Detalhes da Vitrine Oficial com Link Copiável */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                Vitrine Oficial de Fábio Kauã (CollabShop)
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                Parceria Verificada
              </span>
            </div>

            {/* Link estilizado */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-gray-300">
              <span className="truncate">{storefrontUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copiar link da vitrine"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-200 cursor-pointer shrink-0 transition-colors flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Botões de Ação Principal */}
          <div className="space-y-2 pt-1">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-700 hover:to-orange-700 text-white text-sm sm:text-base font-black flex items-center justify-center gap-2 no-underline shadow-xl shadow-orange-950/50 hover:scale-[1.01] active:scale-98 transition-all border border-orange-400/40"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Aproveitar Ofertas na Loja Oficial</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* Botão de Fechar Liberado após os 10s */}
            {canClose ? (
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>Continuar Navegando no Portal (Fechar Pop-up)</span>
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 font-medium flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>O botão de fechar será liberado em <strong>{secondsRemaining} segundos</strong>...</span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Segurança */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-gray-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ambiente Verificado · CollabShop Storefront Oficial</span>
        </div>
      </div>
    </div>
  );
};
