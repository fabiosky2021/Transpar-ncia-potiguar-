import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Volume2,
  Pause,
  Play,
  Square,
  RotateCcw,
  X,
  Eye,
  BookOpen,
  Maximize2,
  Bot,
  Gauge,
  ShieldCheck,
  Calculator,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowUp,
  CheckCircle2,
} from 'lucide-react';
import {
  RelatoCidadao,
  AvaliacaoCandidatoItem,
  POTIGUAR_BOT_SYSTEM_PROMPT,
} from '../data/platformData';
import {
  QUIZ_AFINIDADE_TSE,
  QUIZ_AFINIDADE_PRESIDENCIA_TSE,
  FICHAS_CANDIDATOS_2_TURNO,
  FICHAS_CANDIDATOS_PRESIDENCIA_2_TURNO,
} from '../data/segundoTurnoData';
import {
  voiceConfig,
  AVAILABLE_GEMINI_MALE_VOICES,
  GeminiMaleVoiceName,
  AVAILABLE_SPEECH_SPEEDS,
  SpeechSpeedOption,
  speakWithPotiguarTTS,
  pauseTTSPlayback,
  resumeTTSPlayback,
  stopTTSPlayback,
  setTTSSpeed,
  setTTSVoiceName,
  subscribeTTSState,
  speakWithExplicitBrowserFallback,
  TTSStateSnapshot,
} from '../services/ttsService';

export interface StudioChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  moderated?: boolean;
  imagePreview?: string;
  suggestedActions?: string[];
}

/**
 * Separa visualmente os 4 elementos da resposta do PotiguarBot sem alterar o texto original:
 * 1. Texto produzido pelo PotiguarBot
 * 2. Fonte das informações (bloco «Fonte: ...» quando presente)
 * 3. Identificação de Análise da IA
 * 4. Reprodução em áudio (renderizada em barra própria)
 */
function parseStructuredBotMessage(rawText: string): {
  mainBody: string;
  sourceBlock: string | null;
} {
  const match = rawText.match(/«([\s\S]*?)»/);
  if (!match) {
    return { mainBody: rawText, sourceBlock: null };
  }
  const sourceBlock = match[1].trim();
  const mainBody = rawText.replace(match[0], '').trim();
  return {
    mainBody: mainBody || rawText,
    sourceBlock,
  };
}

interface MultimodalStudioChatProps {
  agentName: string;
  agentDirective: string;
  emblemImg: string;
  chatMessages: StudioChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  isBotLoading: boolean;
  onSendPrompt: (customPrompt?: string, imageBase64?: string, imageMimeType?: string) => void;
  relatos: RelatoCidadao[];
  avaliacoes: AvaliacaoCandidatoItem[];
  novoAutor: string;
  setNovoAutor: (v: string) => void;
  novoBairro: string;
  setNovoBairro: (v: string) => void;
  novaMensagem: string;
  setNovaMensagem: (v: string) => void;
  isModerating: boolean;
  moderationFeedback: { type: 'success' | 'error'; text: string } | null;
  onSubmitRelato: (e: React.FormEvent) => void;
  isFloatingOpen?: boolean;
  setIsFloatingOpen?: (open: boolean) => void;
}

export const MultimodalStudioChat: React.FC<MultimodalStudioChatProps> = ({
  agentName,
  agentDirective,
  emblemImg,
  chatMessages,
  chatInput,
  setChatInput,
  isBotLoading,
  onSendPrompt,
  relatos,
  avaliacoes,
  novoAutor,
  setNovoAutor,
  novoBairro,
  setNovoBairro,
  novaMensagem,
  setNovaMensagem,
  isModerating,
  moderationFeedback,
  onSubmitRelato,
  isFloatingOpen: externalFloatingOpen,
  setIsFloatingOpen: setExternalFloatingOpen,
}) => {
  const [internalFloatingOpen, setInternalFloatingOpen] = useState<boolean>(true);
  const isFloatingOpen =
    externalFloatingOpen !== undefined ? externalFloatingOpen : internalFloatingOpen;
  const setIsFloatingOpen = setExternalFloatingOpen || setInternalFloatingOpen;

  const [emblemError, setEmblemError] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [showBotQuiz, setShowBotQuiz] = useState<boolean>(false);
  const [botQuizEsfera, setBotQuizEsfera] = useState<'presidencia' | 'rn'>('presidencia');
  const [botQuizIdx, setBotQuizIdx] = useState<number>(0);
  const [botQuizAnswers, setBotQuizAnswers] = useState<Record<string, string>>({});
  const [ttsState, setTtsState] = useState<TTSStateSnapshot>({
    activeMessageId: null,
    status: 'idle',
    errorMessage: null,
    usingFallback: false,
    voiceName: voiceConfig.voiceName,
    languageCode: voiceConfig.languageCode,
    speakingRate: voiceConfig.speakingRate,
    speed: voiceConfig.speed,
    pitch: voiceConfig.pitch,
    volume: voiceConfig.volume,
    playedMessageIds: [],
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const floatingFileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mainChatListRef = useRef<HTMLDivElement | null>(null);
  const floatingChatListRef = useRef<HTMLDivElement | null>(null);

  const ultimaPublicacaoMural = relatos[0];
  const ultimaAvaliacao = avaliacoes[0];

  useEffect(() => {
    return subscribeTTSState(setTtsState);
  }, []);

  useEffect(() => {
    if (mainChatListRef.current) {
      mainChatListRef.current.scrollTop = mainChatListRef.current.scrollHeight;
    }
    if (isFloatingOpen && floatingChatListRef.current) {
      floatingChatListRef.current.scrollTop = floatingChatListRef.current.scrollHeight;
    }
  }, [chatMessages.length, isBotLoading, isFloatingOpen]);

  // Voice Input (Microphone) via Web Speech API
  const toggleMicrophone = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus('Reconhecimento de voz nativo indisponível neste navegador. Digite ou envie imagem.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceStatus(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('🎙️ Microfone ativo: fale sua pergunta ou comando para o Estúdio IA...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setChatInput(chatInput ? `${chatInput} ${transcript}` : transcript);
          setVoiceStatus(`✓ Voz capturada: "${transcript}"`);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus('Não foi possível capturar o áudio. Verifique a permissão do microfone.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  /**
   * Controles dedicados de Reprodução em Áudio (Item 4 da separação estrutural):
   * - 🔊 Ouvir (transforma a resposta textual atual em áudio; texto original permanece visível)
   * - ⏸️ Pausar
   * - ▶️ Continuar
   * - ⏹️ Parar
   * - Controle de velocidade da fala (0.85x, 0.95x, 1.0x, 1.15x, 1.25x)
   */
  const renderNaturalTTSControls = (messageId: string, textToRead: string, compact = false) => {
    const isActive = ttsState.activeMessageId === messageId;
    const isLoading = isActive && ttsState.status === 'loading';
    const isPlaying = isActive && ttsState.status === 'playing';
    const isPaused = isActive && ttsState.status === 'paused';
    const isError = isActive && ttsState.status === 'error';
    const wasPlayed = ttsState.playedMessageIds.includes(messageId);

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Botão 🔊 Ouvir */}
        <button
          type="button"
          onClick={() => speakWithPotiguarTTS(messageId, textToRead)}
          disabled={isLoading || isPlaying}
          title="Transformar resposta textual em áudio natural masculino (pt-BR)"
          className={`botao px-2.5 py-1 rounded-md border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
            isPlaying
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)] text-[var(--accent-color)]'
          } disabled:opacity-60`}
        >
          {isLoading ? (
            <span className="animate-pulse">⏳ Gerando áudio...</span>
          ) : wasPlayed && !isPlaying && !isPaused ? (
            <>
              <RotateCcw className="w-3 h-3" />
              <span>🔊 Ouvir</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3" />
              <span>🔊 Ouvir</span>
            </>
          )}
        </button>

        {/* Botão ⏸️ Pausar */}
        <button
          type="button"
          onClick={() => pauseTTSPlayback()}
          disabled={!isPlaying}
          title="Pausar reprodução da voz"
          className="botao px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] disabled:opacity-40 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:border-amber-500 inline-flex items-center gap-1 cursor-pointer"
        >
          <Pause className="w-3 h-3" />
          <span>⏸️ Pausar</span>
        </button>

        {/* Botão ▶️ Continuar */}
        <button
          type="button"
          onClick={() => resumeTTSPlayback()}
          disabled={!isPaused}
          title="Continuar reprodução da voz do ponto em que parou"
          className="botao px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] disabled:opacity-40 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 inline-flex items-center gap-1 cursor-pointer"
        >
          <Play className="w-3 h-3" />
          <span>▶️ Continuar</span>
        </button>

        {/* Botão ⏹️ Parar */}
        <button
          type="button"
          onClick={() => stopTTSPlayback()}
          disabled={!isPlaying && !isPaused && !isLoading}
          title="Parar imediatamente a reprodução do áudio"
          className="botao px-2 py-1 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] disabled:opacity-40 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:border-rose-500 inline-flex items-center gap-1 cursor-pointer"
        >
          <Square className="w-3 h-3" />
          <span>⏹️ Parar</span>
        </button>

        {/* Seletor Centralizado de Voz Masculina Gemini TTS (Charon padrão + Achird, Algieba, Iapetus, Puck para teste) */}
        <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[10px] font-semibold text-[var(--text-muted)]">
          {!compact && <span>Voz Gemini:</span>}
          <select
            aria-label="Selecionar voz masculina Gemini TTS"
            value={ttsState.voiceName}
            onChange={(e) => setTTSVoiceName(e.target.value as GeminiMaleVoiceName)}
            className="bg-transparent text-[var(--text-color)] font-mono font-bold focus:outline-none cursor-pointer"
          >
            {AVAILABLE_GEMINI_MALE_VOICES.map((v) => (
              <option key={v.id} value={v.id} className="bg-[var(--card-bg)] text-[var(--text-color)]">
                { compact ? v.id : v.label }
              </option>
            ))}
          </select>
        </label>

        {/* Controle de velocidade da fala */}
        <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[10px] font-semibold text-[var(--text-muted)]">
          <Gauge className="w-3 h-3 text-[var(--accent-color)]" />
          {!compact && <span>Velocidade:</span>}
          <select
            aria-label="Controle de velocidade da fala"
            value={ttsState.speed}
            onChange={(e) => setTTSSpeed(Number(e.target.value) as SpeechSpeedOption)}
            className="bg-transparent text-[var(--text-color)] font-mono font-bold focus:outline-none cursor-pointer"
          >
            {AVAILABLE_SPEECH_SPEEDS.map((spd) => (
              <option key={spd} value={spd} className="bg-[var(--card-bg)] text-[var(--text-color)]">
                {spd}x {spd === 1.0 ? '(Natural)' : ''}
              </option>
            ))}
          </select>
        </label>

        {isError && ttsState.errorMessage && (
          <div className="w-full mt-1 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-500 flex flex-wrap items-center justify-between gap-2">
            <span>⚠️ {ttsState.errorMessage}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speakWithPotiguarTTS(messageId, textToRead)}
                className="underline font-semibold cursor-pointer"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => speakWithExplicitBrowserFallback(messageId, textToRead)}
                className="underline text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
              >
                Alternativa Web Speech API
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Image Upload Handler for Advanced Visual Analysis
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageMime(file.type || 'image/jpeg');
    setSelectedImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedImageBase64) return;
    onSendPrompt(
      chatInput.trim() || 'Realize uma análise visual avançada desta imagem e sugira ações criativas.',
      selectedImageBase64 || undefined,
      selectedImageMime
    );
    setSelectedImageBase64(null);
    setSelectedImageName('');
    setVoiceStatus(null);
  };

  const lerUltimaPublicacaoNoBot = () => {
    setIsFloatingOpen(true);
    onSendPrompt('Pode ler a última publicação que eu fiz agora no mural e na enquete de benefícios?');
  };

  const quickSuggestions = [
    'Transparência Jurídica CLT e análise da jornada de 4h (casal e família de 6)',
    'Candidatos a Presidente do Brasil e propostas de governo federal',
    'Comparar propostas do 2º turno RN (Allyson 44 x Cadu de Lula 13)',
    'Resumo do Radar de Transparência (Fontes Oficiais TSE x Relatos)',
    'Pode ler a última publicação que eu fiz agora?',
  ];

  const botListaQuiz =
    botQuizEsfera === 'presidencia' ? QUIZ_AFINIDADE_PRESIDENCIA_TSE : QUIZ_AFINIDADE_TSE;
  const botFichasQuiz =
    botQuizEsfera === 'presidencia' ? FICHAS_CANDIDATOS_PRESIDENCIA_2_TURNO : FICHAS_CANDIDATOS_2_TURNO;
  const botCandA = botQuizEsfera === 'presidencia' ? 'lula-13' : 'allyson-bezerra';
  const botCandB = botQuizEsfera === 'presidencia' ? 'flavio-bolsonaro-22' : 'cadu-xavier';

  // Cálculo em tempo real do Quiz Interativo dentro do PotiguarBot (sem enviar para o texto)
  const botQuizMetrics = (() => {
    const totalPerguntas = botListaQuiz.length;
    const vals = botListaQuiz.map((q) => botQuizAnswers[q.id]).filter(Boolean);
    const respondidas = vals.length;
    if (respondidas === 0) {
      return {
        totalPerguntas,
        respondidas: 0,
        pctA: 50,
        pctB: 50,
        vencedor: null,
      };
    }
    const contA = vals.filter((v) => v === botCandA).length;
    const contB = vals.filter((v) => v === botCandB).length;
    const pctA = Math.round((contA / respondidas) * 100);
    const pctB = 100 - pctA;
    const vencedorId = contA > contB ? botCandA : contB > contA ? botCandB : null;
    const vencedor = vencedorId
      ? botFichasQuiz.find((c) => c.id === vencedorId) || null
      : null;
    return { totalPerguntas, respondidas, pctA, pctB, vencedor };
  })();

  const renderInteractiveBotQuizWidget = () => {
    const qAtual = botListaQuiz[botQuizIdx] || botListaQuiz[0];
    return (
      <div className="mx-4 mt-3 p-4 rounded-xl border-2 border-[var(--accent-color)] bg-[var(--surface-subtle)] space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-color)]">
            <Calculator className="w-4 h-4" />
            <span>
              Quiz Interativo do PotiguarBot ({botQuizMetrics.respondidas}/{botQuizMetrics.totalPerguntas} respondidas)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {botQuizMetrics.respondidas > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBotQuizAnswers({});
                  setBotQuizIdx(0);
                }}
                className="text-[11px] underline text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
              >
                Reiniciar
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowBotQuiz(false);
              }}
              className="px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
            >
              Fechar Quiz ✕
            </button>
          </div>
        </div>

        {/* Seletor Presidente do Brasil vs Governo do RN */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setBotQuizEsfera('presidencia');
              setBotQuizIdx(0);
            }}
            className={`py-1.5 px-2 rounded text-[11px] font-bold cursor-pointer ${
              botQuizEsfera === 'presidencia'
                ? 'bg-[var(--accent-color)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            🇧🇷 Presidente do Brasil
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setBotQuizEsfera('rn');
              setBotQuizIdx(0);
            }}
            className={`py-1.5 px-2 rounded text-[11px] font-bold cursor-pointer ${
              botQuizEsfera === 'rn'
                ? 'bg-[var(--accent-color)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            🏛️ Governo do RN
          </button>
        </div>

        {/* Seletor das 5 perguntas sem sair do Quiz */}
        <div className="flex items-center gap-1">
          {botListaQuiz.map((qItem, idx) => {
            const resp = Boolean(botQuizAnswers[qItem.id]);
            const ativa = botQuizIdx === idx;
            return (
              <button
                key={qItem.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBotQuizIdx(idx);
                }}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-semibold border cursor-pointer truncate ${
                  ativa
                    ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                    : resp
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                    : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border-color)]'
                }`}
              >
                {idx + 1}. {qItem.temaCurto.split(' ')[0]} {resp ? '✓' : ''}
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-bold text-[var(--accent-color)]">
              Pergunta {botQuizIdx + 1} de {botListaQuiz.length} · {qAtual.temaCurto}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                speakWithPotiguarTTS(
                  `bot-quiz-${qAtual.id}`,
                  `${qAtual.pergunta} Opção 1: ${qAtual.opcoes[0].texto}. Opção 2: ${qAtual.opcoes[1].texto}.`
                );
              }}
              className="px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[10px] font-semibold text-[var(--accent-color)] cursor-pointer"
            >
              🔊 Ouvir Pergunta
            </button>
          </div>

          <div className="text-xs sm:text-sm font-bold text-[var(--text-color)]">
            {qAtual.pergunta}
          </div>

          <div className="space-y-2">
            {qAtual.opcoes.map((op) => {
              const selecionada = botQuizAnswers[qAtual.id] === op.candidatoId;
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBotQuizAnswers((prev) => ({
                      ...prev,
                      [qAtual.id]: op.candidatoId,
                    }));
                    if (botQuizIdx < botListaQuiz.length - 1) {
                      setTimeout(() => {
                        setBotQuizIdx((prev) =>
                          prev < botListaQuiz.length - 1 ? prev + 1 : prev
                        );
                      }, 500);
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    selecionada
                      ? 'border-2 border-[var(--accent-color)] bg-[var(--surface-subtle)] font-semibold text-[var(--text-color)]'
                      : 'border-[var(--border-color)] bg-[var(--surface-subtle)]/60 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[var(--accent-color)]'
                  }`}
                >
                  <div>{op.texto}</div>
                  {selecionada && (
                    <div className="text-[11px] text-[var(--success-color)] mt-1">
                      ✓ {op.resumoPlanoTSE}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-color)]">
            <button
              type="button"
              disabled={botQuizIdx === 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBotQuizIdx((prev) => Math.max(0, prev - 1));
              }}
              className="px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--surface-subtle)] disabled:opacity-40 text-[11px] font-semibold text-[var(--text-color)] inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" /> Anterior
            </button>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {botQuizIdx + 1} / {botListaQuiz.length}
            </span>
            <button
              type="button"
              disabled={botQuizIdx === botListaQuiz.length - 1}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBotQuizIdx((prev) => Math.min(botListaQuiz.length - 1, prev + 1));
              }}
              className="px-2.5 py-1 rounded bg-[var(--accent-color)] disabled:opacity-40 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              Próxima <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {botQuizMetrics.vencedor && (
          <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-[var(--text-color)]">
                  Maior Afinidade: {botQuizMetrics.vencedor.nome} (Nº {botQuizMetrics.vencedor.numero})
                </span>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {botFichasQuiz[0].nome}: {botQuizMetrics.pctA}% · {botFichasQuiz[1].nome}: {botQuizMetrics.pctB}%
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                speakWithPotiguarTTS(
                  'bot-quiz-res',
                  `Resultado do Quiz de Afinidade no PotiguarBot: maior afinidade com ${botQuizMetrics.vencedor?.nome}, número ${botQuizMetrics.vencedor?.numero}. ${botFichasQuiz[0].nome}: ${botQuizMetrics.pctA} por cento. ${botFichasQuiz[1].nome}: ${botQuizMetrics.pctB} por cento.`
                );
              }}
              className="px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[11px] font-semibold text-[var(--accent-color)] cursor-pointer"
            >
              🔊 Ouvir Resultado
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderChatMessagesList = (compact = false) => (
    <div
      ref={compact ? floatingChatListRef : mainChatListRef}
      className={`space-y-4 overflow-y-auto ${compact ? 'p-4 max-h-[320px]' : 'p-6 max-h-[450px]'}`}
    >
      {chatMessages.map((msg) => {
        const parsed = msg.sender === 'bot' ? parseStructuredBotMessage(msg.text) : null;

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Cabeçalho de Identificação (3. Análise da IA / Autor + Horário) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)] mb-1.5 px-1 w-full max-w-[95%]">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[var(--text-color)]">
                  {msg.sender === 'user' ? 'Você' : `${agentName}`}
                </span>
                <span aria-hidden="true">·</span>
                <span>{msg.timestamp}</span>
                {msg.sender === 'bot' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
                      Síntese & Análise da IA
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 1. Texto produzido pelo PotiguarBot (sempre visível na tela) + 2. Fonte das informações separada */}
            <div
              className={`max-w-[95%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-[var(--accent-color)] text-white'
                  : msg.moderated
                  ? 'bg-red-500/10 border border-red-500/40 text-[var(--text-color)]'
                  : 'bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[var(--text-color)]'
              }`}
            >
              {msg.imagePreview && (
                <div className="rounded-lg overflow-hidden border border-white/20 max-w-[210px]">
                  <img
                    src={msg.imagePreview}
                    alt="Imagem enviada para análise visual"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* 1. Texto produzido pelo PotiguarBot */}
              <div>{parsed ? parsed.mainBody : msg.text}</div>

              {/* 2. Fonte das informações (separada estruturalmente quando presente) */}
              {parsed?.sourceBlock && (
                <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] space-y-0.5">
                  <div className="font-bold text-[var(--text-color)] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--success-color)]" />
                    <span>Fonte e Classificação da Informação:</span>
                  </div>
                  <div className="whitespace-pre-line font-mono text-[10px]">
                    {parsed.sourceBlock}
                  </div>
                </div>
              )}

              {/* 4. Reprodução em Áudio (Camada de voz independente; texto original permanece visível) */}
              {msg.sender === 'bot' && (
                <div className="pt-2.5 border-t border-[var(--border-color)] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span>
                      🎙️ Gemini TTS ({ttsState.languageCode} · Voz masculina: <strong>{ttsState.voiceName}</strong> · Tom {voiceConfig.tom})
                    </span>
                    <span>Auto-play: Desativado</span>
                  </div>
                  {renderNaturalTTSControls(msg.id, msg.text, compact)}
                </div>
              )}
            </div>

            {/* Sugestão de ações em botões abaixo da resposta do agente */}
            {msg.sender === 'bot' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 max-w-[95%]">
                {msg.suggestedActions.map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => onSendPrompt(act)}
                    disabled={isBotLoading}
                    className="botao px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[11px] font-medium text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors cursor-pointer"
                  >
                    ⚡ {act}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {isBotLoading && (
        <div className="text-xs text-[var(--text-muted)] animate-pulse">
          {agentName} está consultando fontes verificadas (TSE, Firestore e Radar de Transparência)...
        </div>
      )}
    </div>
  );

  const renderMultimodalInputForm = (inputRefToUse: React.RefObject<HTMLInputElement | null>, compact = false) => (
    <form
      onSubmit={handleFormSubmit}
      className={`${compact ? 'p-3' : 'p-4'} border-t border-[var(--border-color)] bg-[var(--surface-subtle)] space-y-2.5`}
    >
      {(selectedImageBase64 || voiceStatus) && (
        <div className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
          {selectedImageBase64 && (
            <div className="flex items-center gap-2">
              <img
                src={selectedImageBase64}
                alt="Preview upload"
                className="w-9 h-9 rounded object-cover border border-[var(--border-color)]"
              />
              <div>
                <div className="font-semibold text-[var(--text-color)] flex items-center gap-1 text-[11px]">
                  <Eye className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                  <span>Análise Visual Avançada Pronta</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[160px]">
                  {selectedImageName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImageBase64(null);
                  setSelectedImageName('');
                }}
                className="p-1 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {voiceStatus && (
            <div className="text-[11px] font-medium text-[var(--accent-color)]">{voiceStatus}</div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input
          ref={inputRefToUse}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Botão de Upload de Imagem Ativo (Arredondado) */}
        <button
          type="button"
          onClick={() => inputRefToUse.current?.click()}
          title="Upload de Imagem para Análise Visual Avançada"
          className={`w-10 h-10 rounded-full border transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center ${
            selectedImageBase64
              ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
              : 'bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Botão de Microfone Ativo (Entrada por Voz · Arredondado) */}
        <button
          type="button"
          onClick={toggleMicrophone}
          title="Entrada por Voz (Microfone)"
          className={`w-10 h-10 rounded-full border transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center ${
            isListening
              ? 'bg-red-600 text-white border-red-600 animate-pulse'
              : 'bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Entrada por Texto (Arredondada) */}
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Digite, fale no microfone ou envie imagem..."
          className="flex-1 min-w-0 px-4 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] text-xs sm:text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--accent-color)]"
        />

        {/* Botão de Envio do Chat 🔼 Arredondado */}
        <button
          type="submit"
          disabled={isBotLoading || (!chatInput.trim() && !selectedImageBase64)}
          title="Enviar mensagem (🔼)"
          aria-label="Enviar mensagem"
          className="botao h-10 px-4 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          <span>Enviar</span>
        </button>
      </div>

      {/* Sugestões rápidas abaixo do campo de texto (Arredondadas) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)]">
          Sugestões rápidas:
        </span>
        {quickSuggestions.map((promptText) => (
          <button
            key={promptText}
            type="button"
            onClick={() => onSendPrompt(promptText)}
            disabled={isBotLoading}
            className="botao px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] text-[10px] text-[var(--text-color)] hover:border-[var(--accent-color)] transition-colors cursor-pointer truncate max-w-full"
          >
            {promptText}
          </button>
        ))}
      </div>
    </form>
  );

  const [studioDockSide, setStudioDockSide] = useState<'left' | 'right'>('left');

  return (
    <>
      <section id="potiguar-bot" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full min-w-0">
        {/* Left 7 Columns: Estúdio de Criação Multimodal PotiguarBot IA */}
        <div className="lg:col-span-7 card-clean rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col min-w-0 w-full">
          <div className="p-4 sm:p-6 border-b border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[var(--border-color)] shrink-0 bg-slate-900 flex items-center justify-center">
                  {!emblemError ? (
                    <img
                      src={emblemImg}
                      alt="Emblema PotiguarBot IA"
                      referrerPolicy="no-referrer"
                      onError={() => setEmblemError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-[var(--text-color)] leading-snug">
                    {agentName} · Estúdio de Criação Multimodal
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate">
                    Voz Masculina Natural ({voiceConfig.idioma}) · Ritmo {voiceConfig.estilo} · Velocidade {ttsState.speed}x
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowBotQuiz((prev) => !prev)}
                  className="botao px-3 py-1.5 rounded-full border border-[var(--accent-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--accent-color)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 shrink-0" />
                  <span>{showBotQuiz ? 'Ocultar Quiz' : '🎯 Quiz 5 Perguntas'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFloatingOpen(true)}
                  className="botao px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-[var(--accent-color)] shrink-0" />
                  <span>Abrir Painel Estúdio IA 🔼</span>
                </button>
                <button
                  type="button"
                  onClick={lerUltimaPublicacaoNoBot}
                  disabled={isBotLoading}
                  className="botao px-3 py-1.5 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Ler Última Publicação</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] p-2.5 rounded-lg border border-[var(--border-color)]">
              <strong>Diretriz Cívica, Rastreabilidade & Voz Natural:</strong> {agentDirective} Separação validada entre (1) texto do PotiguarBot, (2) fonte das informações, (3) análise da IA e (4) reprodução em áudio sob demanda.
            </div>
          </div>

          {showBotQuiz && renderInteractiveBotQuizWidget()}
          {renderChatMessagesList(false)}
          {renderMultimodalInputForm(fileInputRef, false)}
        </div>

        {/* Right 5 Columns: Mural Cidadão com Destaque da Última Publicação em Tempo Real */}
        <div className="lg:col-span-5 card-clean p-5 sm:p-7 space-y-5 min-w-0 w-full">
          <div className="space-y-1 border-b border-[var(--border-color)] pb-4">
            <h3 className="text-lg font-semibold text-[var(--text-color)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
              <span>Mural Cidadão · Publicações em Tempo Real</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Publique relatos sobre as linhas de ônibus ou eleições. Todas as publicações ficam salvas e podem ser lidas com voz natural pelo PotiguarBot IA.
            </p>
          </div>

          {/* Card em Destaque: Leitura Direta da Última Publicação */}
          {ultimaPublicacaoMural && (
            <div className="subcard-clean p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[var(--accent-color)] uppercase tracking-wide">
                  📌 Última Publicação Registrada Agora
                </span>
                <button
                  type="button"
                  onClick={lerUltimaPublicacaoNoBot}
                  className="text-[11px] font-semibold text-[var(--text-color)] underline cursor-pointer"
                >
                  Analisar na IA
                </button>
              </div>
              <p className="text-xs font-medium text-[var(--text-color)] leading-relaxed break-words">
                "{ultimaPublicacaoMural.mensagem}"
              </p>
              <div className="text-[11px] text-[var(--text-muted)] flex flex-wrap items-center justify-between gap-1">
                <span>
                  Por <strong>{ultimaPublicacaoMural.autor}</strong> · {ultimaPublicacaoMural.bairro}
                </span>
                <span>{ultimaPublicacaoMural.horario}</span>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)]">
                {renderNaturalTTSControls(
                  `mural-top-${ultimaPublicacaoMural.id}`,
                  `Relato cidadão registrado por ${ultimaPublicacaoMural.autor} no bairro ${ultimaPublicacaoMural.bairro}. ${ultimaPublicacaoMural.mensagem}`,
                  true
                )}
              </div>
            </div>
          )}

          <form onSubmit={onSubmitRelato} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={novoAutor}
                onChange={(e) => setNovoAutor(e.target.value)}
                placeholder="Seu nome ou apelido (opcional · LGPD)"
                className="w-full min-w-0 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
              />
              <select
                value={novoBairro}
                onChange={(e) => setNovoBairro(e.target.value)}
                className="w-full min-w-0 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
              >
                <option value="Mãe Luíza · Zona Leste">Mãe Luíza · Zona Leste</option>
                <option value="Alecrim · Zona Leste">Alecrim · Zona Leste</option>
                <option value="Pajuçara · Zona Norte">Pajuçara · Zona Norte</option>
                <option value="Igapó · Zona Norte">Igapó · Zona Norte</option>
                <option value="Tirol · Zona Leste">Tirol · Zona Leste</option>
                <option value="Ponta Negra · Zona Sul">Ponta Negra · Zona Sul</option>
                <option value="Lagoa Nova · Zona Sul">Lagoa Nova · Zona Sul</option>
                <option value="Cidade da Esperança · Zona Oeste">Cidade da Esperança · Zona Oeste</option>
                <option value="Felipe Camarão · Zona Oeste">Felipe Camarão · Zona Oeste</option>
                <option value="Parnamirim · Grande Natal">Parnamirim · Grande Natal</option>
              </select>
            </div>

            <textarea
              rows={2}
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              placeholder="Escreva sua publicação sobre seu bairro, seção eleitoral ou linhas de ônibus..."
              className="w-full min-w-0 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
            />

            {moderationFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  moderationFeedback.type === 'success'
                    ? 'bg-[var(--success-bg)] text-[var(--success-color)]'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{moderationFeedback.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isModerating || !novaMensagem.trim()}
              className="botao w-full py-2 px-4 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
            >
              {isModerating ? 'Verificando na Moderação LGPD...' : 'Publicar Agora no Mural (Salva no Banco)'}
            </button>
          </form>

          <div className="space-y-3 pt-2 border-t border-[var(--border-color)] max-h-[240px] overflow-y-auto pr-1">
            {relatos.slice(1).map((rel) => (
              <div
                key={rel.id}
                className="subcard-clean p-4 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text-color)]">
                    {rel.autor} · {rel.bairro}
                  </span>
                  <span>{rel.horario}</span>
                </div>
                <p className="text-xs text-[var(--text-color)] leading-relaxed break-words">{rel.mensagem}</p>
                <div className="text-[10px] text-[var(--success-color)]">
                  ✓ {rel.statusModeracao} · Relato cidadão validado
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BARRA INFERIOR NATIVA DE APLICATIVO (CELULAR & PWA) — Evita ficar "por fora do lado" no celular */}
      <nav
        aria-label="Navegação Rápida de Aplicativo Mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--border-color)] px-2 py-1.5 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1 text-[10px] font-semibold">
          <a
            href="#topo"
            onClick={() => setIsFloatingOpen(false)}
            className="flex flex-col items-center justify-center py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-color)] no-underline truncate"
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-[var(--accent-color)]" />
            <span>Início</span>
          </a>

          <a
            href="#colinha-politica-2026"
            onClick={() => setIsFloatingOpen(false)}
            className="flex flex-col items-center justify-center py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-color)] no-underline truncate"
          >
            <Award className="w-4 h-4 mb-0.5 text-amber-500" />
            <span>Colinha</span>
          </a>

          {/* Botão Central Integrado do Agente de IA no Modo App Mobile */}
          <button
            type="button"
            onClick={() => setIsFloatingOpen(!isFloatingOpen)}
            aria-label="Abrir ou fechar Agente PotiguarBot IA"
            className={`botao flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-white font-bold shadow-md cursor-pointer transition-transform active:scale-95 ${
              isFloatingOpen
                ? 'bg-emerald-600'
                : 'bg-[var(--accent-color)]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Bot className="w-4 h-4" />
              <ChevronUp className={`w-3.5 h-3.5 transition-transform ${isFloatingOpen ? 'rotate-180' : ''}`} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5">Agente IA</span>
          </button>

          <a
            href="#atualizacao-legislativa"
            onClick={() => setIsFloatingOpen(false)}
            className="flex flex-col items-center justify-center py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-color)] no-underline truncate"
          >
            <ShieldCheck className="w-4 h-4 mb-0.5 text-emerald-500" />
            <span>PEC 6x1</span>
          </a>

          <a
            href="#enquete-2-turno"
            onClick={() => setIsFloatingOpen(false)}
            className="flex flex-col items-center justify-center py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-color)] no-underline truncate"
          >
            <Calculator className="w-4 h-4 mb-0.5 text-[var(--accent-color)]" />
            <span>Enquete</span>
          </a>
        </div>
      </nav>

      {/* PAINEL DO AGENTE DE IA ACOPLADO (ESTILO PREVIEW LATERAL NO NOTEBOOK/COMPUTADOR & GAVETA ENCAIXADA NO CELULAR) */}
      {isFloatingOpen ? (
        <div
          role="dialog"
          aria-label="Painel Estúdio PotiguarBot IA"
          className={`fixed z-50 bg-[var(--card-bg)] border-2 border-[var(--accent-color)] shadow-2xl overflow-hidden flex flex-col transition-all ${
            /* No celular: encaixado 100% dentro da tela acima da barra de app | No notebook/PC: Painel lateral estilo Preview */
            studioDockSide === 'left'
              ? 'inset-x-2 bottom-16 max-h-[82dvh] rounded-2xl lg:inset-x-auto lg:left-4 lg:top-20 lg:bottom-4 lg:max-h-none lg:w-[400px] xl:w-[430px] lg:rounded-3xl'
              : 'inset-x-2 bottom-16 max-h-[82dvh] rounded-2xl lg:inset-x-auto lg:right-4 lg:top-20 lg:bottom-14 lg:max-h-none lg:w-[400px] xl:w-[430px] lg:rounded-3xl'
          }`}
        >
          {/* Header do Painel Estúdio com controles de lado (Estilo Preview) e Fechar (X) */}
          <div className="px-3.5 sm:px-4 py-3 bg-[#0f172a] text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                  <span className="truncate">{agentName} · Estúdio IA</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  Voz pt-BR ({ttsState.speed}x) · Texto, Voz e Imagem
                </div>
              </div>
            </div>

            {/* Botões do cabeçalho: Alternar Lado (Esquerda Preview / Direita), Quiz + Fechar (X) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setStudioDockSide((prev) => (prev === 'left' ? 'right' : 'left'))
                }
                title="Alternar posição do painel entre Esquerda (Estilo Preview) e Direita no Notebook/PC"
                className="hidden lg:inline-flex px-2.5 py-1 rounded-full bg-white/10 hover:bg-blue-600 text-white text-[10px] font-semibold transition-colors cursor-pointer items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{studioDockSide === 'left' ? 'Lado: Esq (Preview)' : 'Lado: Dir'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBotQuiz((prev) => !prev)}
                title="Abrir Quiz Interativo de 5 Perguntas aqui no Bot"
                className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-blue-600 text-white text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Calculator className="w-3 h-3" />
                <span>Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFloatingOpen(false)}
                title="Minimizar Painel IA (X)"
                aria-label="Minimizar Painel IA"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {showBotQuiz && renderInteractiveBotQuizWidget()}
            {renderChatMessagesList(true)}
          </div>
          {renderMultimodalInputForm(floatingFileInputRef, true)}
        </div>
      ) : (
        /* Botão Acoplado no Notebook/Computador na Lateral Esquerda (Estilo Preview, longe do selo Powered by Netlify da direita) */
        <div
          className={`hidden lg:flex fixed bottom-5 z-50 ${
            studioDockSide === 'left' ? 'left-5' : 'right-5 bottom-14'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsFloatingOpen(true)}
            title="Abrir Painel Estúdio PotiguarBot IA (🔼)"
            aria-label="Abrir Painel Estúdio PotiguarBot IA"
            className="botao px-4 py-2.5 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white shadow-xl flex items-center gap-2.5 cursor-pointer border-2 border-white/25 transition-transform hover:scale-105"
          >
            <span className="w-7 h-7 rounded-full bg-white/20 inline-flex items-center justify-center">
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            </span>
            <Bot className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-bold">Estúdio PotiguarBot IA 🔼</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      )}
    </>
  );
};
