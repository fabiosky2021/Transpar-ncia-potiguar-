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
} from 'lucide-react';

interface ShopStorefrontPopupProps {
  storefrontUrl?: string;
  initialDelaySeconds?: number;
  lockCloseSeconds?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ShopStorefrontPopup: React.FC<ShopStorefrontPopupProps> = ({
  storefrontUrl = 'https://collshp.com/fabiokaua692287?view=storefront',
  initialDelaySeconds = 2, // Abre rapidamente após 2s no site
  lockCloseSeconds = 10,   // Fica 10 segundos em contagem regressiva antes de liberar o botão de fechar
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(lockCloseSeconds);
  const [canClose, setCanClose] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActuallyOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  // Efeito 1: Dispara a abertura automática do pop-up após delay inicial (se não for controlado externamente)
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

  // Efeito 2: Contagem regressiva de 10 segundos quando o pop-up está aberto
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg bg-[var(--card-bg)] border-2 border-emerald-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
        
        {/* Barra superior com indicador de tempo / contagem de 10 segundos */}
        <div className="w-full bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              Vitrine Oficial Fábio Kauã
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {!canClose ? (
              <span className="text-amber-300 font-bold">
                Fechar em {secondsRemaining}s
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">
                ✓ Pronto para fechar
              </span>
            )}
          </div>
        </div>

        {/* Barra de Progresso Animada dos 10 Segundos */}
        {!canClose && (
          <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-1000 ease-linear"
              style={{ width: `${progressoPct}%` }}
            />
          </div>
        )}

        {/* Botão de Fechar no Canto Superior Direito (Desbloqueado após os 10s) */}
        {canClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar pop-up"
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Conteúdo Principal do Pop-up da Loja */}
        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto">
          {/* Header & Identidade */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#00875a] via-teal-500 to-amber-400 text-white shadow-lg mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Novidade Especial de Afiliado
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] tracking-tight">
                Conheça Minha Loja &amp; Vitrine Oficial
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                Produtos selecionados, achadinhos com desconto, tecnologia e indicações especiais no <strong>CollabShop</strong>.
              </p>
            </div>
          </div>

          {/* Card com prévia visual da Vitrine */}
          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-color)]">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Storefront Verificado Fábio Kauã
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                Destaque
              </span>
            </div>

            {/* Tags de categorias */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] font-medium flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-500" /> Achadinhos Exclusivos
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] font-medium flex items-center gap-1">
                <Tag className="w-3 h-3 text-blue-500" /> Tecnologia &amp; Gadgets
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] font-medium flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-500" /> Cupons &amp; Ofertas
              </span>
            </div>

            {/* Link estilizado */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-muted)]">
              <span className="truncate">{storefrontUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copiar link"
                className="p-1.5 rounded-lg hover:bg-[var(--surface-subtle)] text-[var(--text-color)] cursor-pointer shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2.5 pt-1">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#00875a] via-teal-600 to-[#0a5c43] hover:from-[#0b6b49] hover:to-[#074734] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 no-underline shadow-lg shadow-emerald-900/30 hover:scale-[1.01] active:scale-98 transition-all"
            >
              <span>Acessar Meu Shop Agora</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Botão de Fechar (visível após os 10s) */}
            {canClose ? (
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] hover:bg-gray-200 dark:hover:bg-slate-800 text-[var(--text-color)] text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Continuar Navegando no Portal (Fechar)</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>O botão de fechar será liberado em {secondsRemaining} segundos...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer do Pop-up */}
        <div className="px-5 py-3 bg-[var(--surface-subtle)] border-t border-[var(--border-color)] text-center text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Ambiente 100% seguro · CollabShop Storefront Oficial</span>
        </div>
      </div>
    </div>
  );
};
