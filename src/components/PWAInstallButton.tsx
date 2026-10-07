import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline — Dados em cache local estão sendo utilizados.</span>
    </div>
  );
};

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Instalar Aplicativo Transparência Potiguar no seu celular ou computador"
        className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-transform active:scale-95 shadow-sm"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Instalar App</span>
      </button>

      {showInstallModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[var(--accent-color)]" />
                <h3 className="text-base font-bold text-[var(--text-color)]">
                  Instalar Aplicativo (PWA)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                aria-label="Fechar guia de instalação"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-color)] leading-relaxed">
              <p className="text-[var(--text-muted)]">
                O <strong>Transparência Potiguar (TranspRN)</strong> é um aplicativo web progressivo (PWA) instalável com suporte rápido e ícone na tela inicial:
              </p>

              {isIOS ? (
                <div className="p-3.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1.5">
                  <div className="font-bold text-[var(--accent-color)]">
                    No iPhone / iPad (Safari):
                  </div>
                  <p>
                    1. Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.<br />
                    2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1">
                    <div className="font-bold text-[var(--accent-color)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--success-color)]" />
                      <span>Android (Chrome / Edge / Samsung Internet):</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Abra em nova guia (se estiver em modo preview), toque no menu <strong>⋮</strong> do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1">
                    <div className="font-bold text-[var(--accent-color)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--success-color)]" />
                      <span>Computador (Chrome / Edge):</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Clique no ícone de <strong>Instalar Transparência Potiguar</strong> no canto direito da barra de endereços do navegador.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowInstallModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Instalar Agora
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
