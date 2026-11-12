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
  Download,
  Share2,
  Send,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import shopeePosterImg from '../assets/images/shopee_11_11_black_friday.jpg';
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
  const [activeTab, setActiveTab] = useState<'poster' | 'copy_tools'>('poster');
  const [copiedType, setCopiedType] = useState<'url' | 'bio' | 'whatsapp' | 'stories' | null>(null);

  // Default to the user's uploaded 11.11 Shopee Black Friday poster
  const [currentPosterSrc, setCurrentPosterSrc] = useState<string>(
    bannerImageOverride || shopeePosterImg || '/assets/aistudio/IMG-20261110-WA1186_a5f1944d.jpg'
  );

  // Animated countdown timer for tomorrow's 11.11 sale (hours:minutes:seconds)
  const [promoClock, setPromoClock] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '05',
    minutes: '31',
    seconds: '15',
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

  // Auto-open after delay when uncontrolled
  useEffect(() => {
    if (controlledIsOpen !== undefined) return;

    const timerAbertura = setTimeout(() => {
      setInternalOpen(true);
      setSecondsRemaining(lockCloseSeconds);
      setCanClose(false);
    }, initialDelaySeconds * 1000);

    return () => clearTimeout(timerAbertura);
  }, [controlledIsOpen, initialDelaySeconds, lockCloseSeconds]);

  // Reset countdown if reopened
  useEffect(() => {
    if (controlledIsOpen) {
      setSecondsRemaining(lockCloseSeconds);
      setCanClose(false);
    }
  }, [controlledIsOpen, lockCloseSeconds]);

  // 10s countdown timer
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

  // ESC key handler
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
  };

  // Textos formatados para Bio e WhatsApp prontos para copiar e colar
  const bioText = `🔥 11.11 BLACK FRIDAY SHOPEE (É HOJE! SÓ HOJE!)
🎁 Até 70% OFF + Frete Grátis na minha vitrine
👇 Garanta seus achadinhos antes que esgote:
${storefrontUrl}`;

  const whatsappMessage = `🚨 *É HOJE! MEGA 11.11 BLACK FRIDAY SHOPEE LIBERADA!* 🚨

Acabei de liberar na minha vitrine oficial os maiores achadinhos e cupons secretos do ano! 💥

⚡ *O que tá rolando na vitrine HOJE:*
✅ Até *70% de desconto real* em tecnologia, casa e produtos virais
✅ *Frete Grátis* para todo o Brasil
✅ Cupons acumulativos exclusivos da Shopee
✅ Compras 100% seguras e verificadas

⏳ *Atenção:* Os lotes com 70% OFF são válidos SÓ HOJE e esgotam rápido!

👇 *Toque no link oficial e aproveite agora:*
🔗 ${storefrontUrl}`;

  const storiesScript = `[STORIES COM FIGURINHA DE LINK]:
"Gente, para tudo! É HOJE a Mega 11.11 Black Friday da Shopee! Liberei na minha vitrine cupons de até 70% OFF e Frete Grátis. Clica no link da figurinha agora antes que acabe o estoque!"
🔗 Link da figurinha: ${storefrontUrl}`;

  const handleCopy = (text: string, type: 'url' | 'bio' | 'whatsapp' | 'stories') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  if (!isActuallyOpen) return null;

  const progressoPct = Math.round(((lockCloseSeconds - secondsRemaining) / lockCloseSeconds) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (canClose) handleClose();
      }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 animate-in fade-in duration-300 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl sm:max-w-2xl bg-slate-950 border-2 border-orange-500/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] animate-in zoom-in-95 duration-300"
      >
        {/* Barra superior de contagem regressiva e status */}
        <div className="w-full bg-gradient-to-r from-red-950 via-slate-900 to-orange-950 text-white px-3 sm:px-4 py-2.5 flex items-center justify-between text-xs border-b border-orange-500/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px] sm:text-[11px]">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
              11.11 Shopee Black Friday · É Hoje! Só Hoje!
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            {!canClose ? (
              <span className="text-yellow-300 font-bold bg-black/60 px-2 py-0.5 rounded-md border border-yellow-500/40">
                Fechar em {secondsRemaining}s
              </span>
            ) : (
              <span className="text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/40">
                ✓ Pronto para fechar
              </span>
            )}
          </div>
        </div>

        {/* Barra de Progresso Animada dos 10 Segundos */}
        {!canClose && (
          <div className="w-full h-1.5 bg-slate-900 overflow-hidden shrink-0">
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
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer shadow-xl transition-all hover:scale-110 active:scale-95 border border-white/30"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Seletor de Abas: Poster Visual vs Ferramentas de Divulgação (Bio & WhatsApp) */}
        <div className="px-3 sm:px-6 pt-3 pb-1 bg-slate-900/90 border-b border-orange-500/20 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('poster')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'poster'
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pop-up do Poster (11.11)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('copy_tools')}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'copy_tools'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copiar para Bio &amp; WhatsApp</span>
            </button>
          </div>

          <a
            href={currentPosterSrc}
            download="shopee-11-11-black-friday-fabiokaua.jpg"
            title="Baixar imagem original do banner para postar nos stories e status"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-300 hover:text-yellow-200 text-xs font-bold transition-colors inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar Imagem</span>
          </a>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="overflow-y-auto space-y-4 p-3.5 sm:p-5 flex-1">
          {/* ABA 1: O POSTER VISUAL DA PROMOÇÃO 11.11 SHOPEE & BLACK FRIDAY */}
          {activeTab === 'poster' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Moldura de Alta Resolução do Poster com Efeitos Visuais */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-orange-500/70 shadow-2xl bg-gradient-to-b from-red-950 via-orange-950 to-slate-950 group">
                <div className="relative w-full max-h-[500px] flex items-center justify-center bg-black/60 overflow-hidden">
                  <img
                    src={currentPosterSrc}
                    alt="11.11 Black Friday Shopee - É HOJE! Só Hoje Na Minha Vitrine com até 70% OFF e Frete Grátis"
                    className="w-full h-auto max-h-[500px] object-contain object-center transform transition-transform duration-700 group-hover:scale-[1.02]"
                    onError={() => {
                      setCurrentPosterSrc('/assets/aistudio/IMG-20261110-WA1186_a5f1944d.jpg');
                    }}
                  />

                  {/* Faixa Chamativa de Correção em Tempo Real: É HOJE! */}
                  <div className="absolute top-12 sm:top-14 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none w-[92%] sm:w-auto">
                    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-2xl border-2 border-yellow-300 uppercase tracking-wider text-center flex items-center justify-center gap-2 animate-bounce">
                      <Flame className="w-4 h-4 fill-current text-yellow-200" />
                      <span>É HOJE! AS PROMOÇÕES JÁ ESTÃO VALENDO!</span>
                    </div>
                  </div>

                  {/* Badges Flutuantes Dinâmicos */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-md border border-white/20 animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-current text-yellow-300" />
                      É HOJE · 11.11
                    </span>

                    <span className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-yellow-300 font-mono text-xs font-black border border-yellow-500/50 flex items-center gap-1.5 shadow-md">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      <span>ENCERRA EM: {promoClock.hours}:{promoClock.minutes}:{promoClock.seconds}</span>
                    </span>
                  </div>

                  {/* Botão Flutuante Direto Sobre o Poster */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-yellow-400/40 text-[11px] text-yellow-300 font-bold hidden sm:flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Até 70% OFF + Frete Grátis Shopee</span>
                    </div>

                    <a
                      href={storefrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-600 text-black font-black text-sm uppercase tracking-wide shadow-2xl hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2 no-underline border-2 border-white cursor-pointer ml-auto"
                    >
                      <span>VER VITRINE AGORA</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Barra de Ações Rápidas: Compartilhar no WhatsApp e Copiar Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg no-underline transition-transform active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar para o WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => setActiveTab('copy_tools')}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Ver Textos para Bio &amp; WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: FERRAMENTAS PRONTAS PARA BIO E WHATSAPP */}
          {activeTab === 'copy_tools' && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              {/* Card 1: Texto para a Bio do Instagram / TikTok */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-orange-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-pink-600/20 text-pink-400 font-bold">
                      📸 Instagram / TikTok
                    </span>
                    <strong className="text-white text-xs">Texto Pronto para a Bio</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(bioText, 'bio')}
                    className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedType === 'bio' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'bio' ? 'Copiado!' : 'Copiar Texto da Bio'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {bioText}
                </div>
              </div>

              {/* Card 2: Mensagem para Grupos e Status do WhatsApp */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold">
                      💬 WhatsApp
                    </span>
                    <strong className="text-white text-xs">Mensagem para Grupos &amp; Status</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(whatsappMessage, 'whatsapp')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-500/40"
                    >
                      {copiedType === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'whatsapp' ? 'Copiado!' : 'Copiar Mensagem'}</span>
                    </button>

                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 no-underline transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Enviar Direto</span>
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-gray-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {whatsappMessage}
                </div>
              </div>

              {/* Card 3: Roteiro para Stories do Instagram com Link */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 font-bold">
                      🎬 Stories &amp; Reels
                    </span>
                    <strong className="text-white text-xs">Roteiro de Stories (Figurinha de Link)</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(storiesScript, 'stories')}
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedType === 'stories' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'stories' ? 'Copiado!' : 'Copiar Roteiro'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {storiesScript}
                </div>
              </div>

              {/* Link Puro Copiável */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Link Puro da Vitrine:</span>
                  <span className="text-xs font-mono text-amber-300 truncate block">{storefrontUrl}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(storefrontUrl, 'url')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'url' ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Botão de Fechar Liberado após os 10s */}
          <div className="pt-1">
            {canClose ? (
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>Continuar Navegando no Portal (Fechar Pop-up)</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 font-medium flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>O botão de fechar será liberado em <strong>{secondsRemaining} segundos</strong>...</span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Segurança */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-center text-[10px] sm:text-[11px] text-gray-400 flex items-center justify-center gap-2 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vitrine Oficial Verificada · CollabShop Fábio Kauã (collshp.com/fabiokaua692287)</span>
        </div>
      </div>
    </div>
  );
};
