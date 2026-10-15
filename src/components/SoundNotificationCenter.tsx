import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Scale,
  Bus,
  Sparkles,
  X,
  ChevronRight,
  Sliders,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  soundNotificationManager,
  SoundNotificationItem,
  NotificationSoundType,
} from '../services/soundNotificationService';
import { speakWithPotiguarTTS } from '../services/ttsService';

interface SoundNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  onAskAgentPrompt?: (prompt: string) => void;
}

const INITIAL_NOTIFICATIONS: SoundNotificationItem[] = [
  {
    id: 'notif-1',
    titulo: 'Passe Livre 100% Confirmado no 2º Turno em Natal',
    mensagem: 'Todas as 62 linhas de ônibus urbanos da STTU e transportes intermunicipais terão catraca livre das 06h às 20h no dia da eleição.',
    categoria: 'transporte',
    timestamp: 'Hoje · 08:30',
    lida: false,
    linkHref: '#utilidade-publica',
    soundType: 'urgent',
  },
  {
    id: 'notif-2',
    titulo: 'Novo Boletim Diário IA de Transparência Publicado',
    mensagem: 'Resumo com checagem de fatos do TSE, gastos públicos e monitoramento das diretrizes de governo de Allyson 44 e Cadu 13.',
    categoria: 'plantao',
    timestamp: 'Hoje · 07:15',
    lida: false,
    linkHref: '#slides-noticias-24h',
    soundType: 'chime',
  },
  {
    id: 'notif-3',
    titulo: 'Atualização Legislativa: PEC 221/2019 e Escala 6x1',
    mensagem: 'Quadro comparativo oficial sobre a proposta de redução da jornada de trabalho semanal para 36h/40h sem redução salarial.',
    categoria: 'legislativo',
    timestamp: 'Ontem · 18:45',
    lida: true,
    linkHref: '#atualizacao-legislativa',
    soundType: 'success',
  },
  {
    id: 'notif-4',
    titulo: 'Quiz Animado do Brasil & Calculadora 2026 Disponíveis',
    mensagem: 'Calcule sua afinidade temática presidencial e estadual com efeitos sonoros e ponderação oficial por eixo de governo.',
    categoria: 'eleicoes',
    timestamp: 'Ontem · 15:20',
    lida: true,
    linkHref: '#monitoramento-24h',
    soundType: 'chime',
  },
];

export const SoundNotificationCenter: React.FC<SoundNotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
  onAskAgentPrompt,
}) => {
  const [notifications, setNotifications] = useState<SoundNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundNotificationManager.isEnabled());
  const [selectedSoundType, setSelectedSoundType] = useState<NotificationSoundType>('chime');
  const [toastNotification, setToastNotification] = useState<SoundNotificationItem | null>(null);
  const [toastTimeoutId, setToastTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Escuta alterações de som e novas notificações
  useEffect(() => {
    const unsubSound = soundNotificationManager.subscribe((enabled) => {
      setSoundEnabled(enabled);
    });

    const unsubNotif = soundNotificationManager.onNewNotification((newItem) => {
      setNotifications((prev) => [newItem, ...prev]);
      
      // Exibe Toast flutuante
      setToastNotification(newItem);
      if (toastTimeoutId) clearTimeout(toastTimeoutId);
      const tid = setTimeout(() => {
        setToastNotification(null);
      }, 6000);
      setToastTimeoutId(tid);
    });

    return () => {
      unsubSound();
      unsubNotif();
      if (toastTimeoutId) clearTimeout(toastTimeoutId);
    };
  }, [toastTimeoutId]);

  const handleToggleSound = () => {
    const next = soundNotificationManager.toggle();
    setSoundEnabled(next);
  };

  const handlePlayTestSound = (type: NotificationSoundType = selectedSoundType) => {
    soundNotificationManager.playSound(type);
  };

  const handleSimularNotificacao = () => {
    const exemplos = [
      {
        titulo: 'Alerta Eleitoral 24h · TSE Atualizado',
        mensagem: 'Nova seção de checagem contra fake news sobre o 2º turno disponível no painel.',
        categoria: 'eleicoes' as const,
        soundType: 'urgent' as NotificationSoundType,
      },
      {
        titulo: 'Estúdio Multimodal: Análise Concluída',
        mensagem: 'O PotiguarBot gerou uma nova sugestão de conteúdo cívico para compartilhamento.',
        categoria: 'estudio' as const,
        soundType: 'chime' as NotificationSoundType,
      },
      {
        titulo: 'Transparência de Voto Seguro',
        mensagem: 'Seus dados de preferência temática foram calculados com sucesso no simulador.',
        categoria: 'plantao' as const,
        soundType: 'success' as NotificationSoundType,
      },
    ];

    const pick = exemplos[Math.floor(Math.random() * exemplos.length)];
    soundNotificationManager.triggerNotification({
      titulo: pick.titulo,
      mensagem: pick.mensagem,
      categoria: pick.categoria,
      soundType: pick.soundType,
    });
  };

  const handleMarcarTodasLidas = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
    soundNotificationManager.playSound('subtle');
  };

  const unreadCount = notifications.filter((n) => !n.lida).length;

  return (
    <>
      {/* Toast Flutuante em Tempo Real com Som */}
      {toastNotification && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-short"
        >
          <div className="bg-[#0b2e26] text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-start gap-3 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <BellRing className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {toastNotification.categoria} · Notificação Sonora
                </span>
                <span className="text-[9px] text-white/60">{toastNotification.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                {toastNotification.titulo}
              </h4>
              <p className="text-[11px] text-emerald-100 line-clamp-2 mt-0.5">
                {toastNotification.mensagem}
              </p>

              <div className="flex items-center gap-2 mt-2 pt-1 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={() => soundNotificationManager.playSound(toastNotification.soundType || 'chime')}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3 text-amber-300" />
                  Repetir Som
                </button>
                {toastNotification.linkHref && (
                  <a
                    href={toastNotification.linkHref}
                    onClick={() => setToastNotification(null)}
                    className="text-[10px] text-amber-300 hover:underline font-bold flex items-center gap-0.5"
                  >
                    Acessar
                    <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal / Gaveta Central de Notificações com Som */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-[var(--card-bg)] border-t sm:border border-[var(--border-color)] rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header da Central */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-sm">
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[var(--text-color)] m-0">
                      Notificações com Som
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e8622c] text-white">
                        {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] m-0">
                    Alertas cívicos em tempo real com efeitos sonoros e leitura por voz
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-[var(--text-color)] cursor-pointer"
                aria-label="Fechar Central de Notificações"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Controles de Áudio da Notificação */}
            <div className="p-3 sm:p-4 bg-[var(--surface-subtle)] border-b border-[var(--border-color)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      soundEnabled
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                        : 'bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Som Ativado</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>Som Silenciado</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlayTestSound(selectedSoundType)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[var(--border-color)] hover:border-emerald-500 text-xs font-semibold text-[var(--text-color)] flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Tocar efeito sonoro de teste agora"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Testar Som</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSimularNotificacao}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Simular Alerta
                </button>
              </div>

              {/* Seletor de Timbres Sonoros */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-[10px] text-[var(--text-muted)] font-medium shrink-0">
                  Timbre do Som:
                </span>
                {(
                  [
                    { id: 'chime', label: '🔔 Sino Chime' },
                    { id: 'urgent', label: '🚨 Plantão' },
                    { id: 'success', label: '✨ Acorde' },
                    { id: 'subtle', label: '💧 Sutil' },
                    { id: 'breeze', label: '🍃 Suave' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedSoundType(t.id);
                      handlePlayTestSound(t.id);
                    }}
                    className={`px-2 py-0.5 rounded-md font-medium shrink-0 cursor-pointer transition-colors ${
                      selectedSoundType === t.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-white dark:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                <span>Histórico de Atualizações Oficiais</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarcarTodasLidas}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {notifications.map((item) => {
                const getCategoryBadge = () => {
                  switch (item.categoria) {
                    case 'transporte':
                      return { icon: Bus, text: 'Mobilidade STTU', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
                    case 'plantao':
                      return { icon: Radio, text: 'Plantão TSE', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
                    case 'legislativo':
                      return { icon: Scale, text: 'Legislação CLT', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
                    case 'eleicoes':
                      return { icon: Sparkles, text: '2º Turno 2026', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
                    default:
                      return { icon: Bell, text: 'Estúdio IA', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' };
                  }
                };

                const badge = getCategoryBadge();
                const IconComp = badge.icon;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.lida
                        ? 'bg-[var(--card-bg)] border-[var(--border-color)] opacity-85'
                        : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                          <IconComp className="w-3 h-3" />
                          {badge.text}
                        </span>
                        {!item.lida && (
                          <span className="w-2 h-2 rounded-full bg-[#e8622c] animate-pulse" title="Nova notificação" />
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">{item.timestamp}</span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--text-color)] mt-2 mb-1">
                      {item.titulo}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
                      {item.mensagem}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        {/* Botão de Tocar Som da Notificação */}
                        <button
                          type="button"
                          onClick={() => soundNotificationManager.playSound(item.soundType || 'chime')}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-emerald-500/10 text-[11px] font-semibold text-[var(--text-color)] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Tocar som deste alerta"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>Tocar Som</span>
                        </button>

                        {/* Botão Ouvir por Voz TTS */}
                        <button
                          type="button"
                          onClick={() => {
                            speakWithPotiguarTTS(`Notificação oficial: ${item.titulo}. ${item.mensagem}`, `notif-tts-${item.id}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-emerald-500/10 text-[11px] font-semibold text-[var(--text-color)] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ouvir alerta na voz do PotiguarBot"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ouvir Voz</span>
                        </button>
                      </div>

                      {item.linkHref && (
                        <a
                          href={item.linkHref}
                          onClick={() => {
                            if (onNavigateToSection) {
                              onNavigateToSection(item.linkHref!.replace('#', ''));
                            }
                            onClose();
                          }}
                          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>Acessar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé da Central */}
            <div className="p-3 sm:p-4 border-t border-[var(--border-color)] bg-[var(--surface-subtle)] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Sintetizador Web Audio API ativo (Zero latência)
              </span>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-[var(--accent-color)] text-white font-bold cursor-pointer hover:opacity-95 shadow-sm"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
