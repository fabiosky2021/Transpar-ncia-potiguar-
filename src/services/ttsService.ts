/**
 * Camada Centralizada e Independente de Voz (Gemini TTS) — Transparência Potiguar
 *
 * Arquitetura:
 * PotiguarBot -> resposta textual Gemini -> ttsService -> Backend (/api/potiguar-tts) -> Gemini TTS -> Áudio WAV 24kHz -> Controles de Reprodução
 *
 * - Centraliza toda a configuração de voz em um único local (voiceName, languageCode, speakingRate, pitch, volume, autoPlay: false).
 * - Mantém "Charon" como voz masculina padrão/atual e disponibiliza "Achird", "Algieba", "Iapetus" e "Puck" para teste.
 * - Preserva fallback isolado via Web Speech API apenas como contingência separada.
 * - Evita geração duplicada em toques múltiplos e interrompe o áudio anterior ao selecionar uma nova resposta.
 */

export type GeminiMaleVoiceName = 'Charon' | 'Achird' | 'Algieba' | 'Iapetus' | 'Puck';

export interface GeminiVoiceOption {
  id: GeminiMaleVoiceName;
  label: string;
  profile: string;
}

/**
 * Catálogo centralizado das vozes masculinas Gemini TTS para teste em pt-BR.
 * Nenhum componente externo precisa declarar nomes de vozes manualmente.
 */
export const AVAILABLE_GEMINI_MALE_VOICES: readonly GeminiVoiceOption[] = [
  {
    id: 'Charon',
    label: 'Charon (Padrão · Informativa e Calma)',
    profile: 'Masculina informativa, serena, segura e clara para comunicação pública',
  },
  {
    id: 'Achird',
    label: 'Achird (Teste · Amigável e Conversacional)',
    profile: 'Masculina natural, amigável, acolhedora e conversacional',
  },
  {
    id: 'Algieba',
    label: 'Algieba (Teste · Suave e Equilibrada)',
    profile: 'Masculina suave, fluida, calma e agradável',
  },
  {
    id: 'Iapetus',
    label: 'Iapetus (Teste · Clara e Confiável)',
    profile: 'Masculina nítida, articulada e firme',
  },
  {
    id: 'Puck',
    label: 'Puck (Teste · Expressiva e Dinâmica)',
    profile: 'Masculina expressiva com entonação dinâmica',
  },
] as const;

export type SpeechSpeedOption = 0.85 | 0.95 | 1.0 | 1.15 | 1.25;

export const AVAILABLE_SPEECH_SPEEDS: SpeechSpeedOption[] = [0.85, 0.95, 1.0, 1.15, 1.25];

export interface CentralVoiceConfiguration {
  /** Voz Gemini TTS configurada em um único local (Padrão: Charon) */
  voiceName: GeminiMaleVoiceName;
  /** Código de idioma oficial */
  languageCode: 'pt-BR';
  idioma: 'pt-BR';
  language: 'pt-BR';
  /** Taxa de velocidade da fala (1.0 = ritmo conversacional natural) */
  speakingRate: SpeechSpeedOption;
  velocidade: SpeechSpeedOption;
  speed: SpeechSpeedOption;
  /** Tom da voz (1.0 = tom masculino natural, calmo e seguro) */
  pitch: number;
  tom: 'calmo, seguro e respeitoso';
  /** Volume de reprodução (0.0 a 1.0) */
  volume: number;
  /** Gênero e estilo */
  voz: 'masculina';
  gender: 'male';
  estilo: 'conversacional';
  style: 'conversational';
  /** Modelo Gemini TTS oficial */
  model: 'gemini-3.8-flash-lite-tts';
  /** Reprodução automática estritamente DESATIVADA por padrão */
  autoPlay: false;
  /** Instrução de estilo prosódico para pronúncia clara em português brasileiro */
  stylePrompt: string;
}

/**
 * Configuração central única de voz do PotiguarBot.
 * Começa mantendo "Charon" como configuração atual/padrão, com Achird, Algieba, Iapetus e Puck disponíveis para teste.
 */
export const voiceConfig: CentralVoiceConfiguration = {
  voiceName: 'Charon',
  languageCode: 'pt-BR',
  idioma: 'pt-BR',
  language: 'pt-BR',
  speakingRate: 1.0,
  velocidade: 1.0,
  speed: 1.0,
  pitch: 1.0,
  tom: 'calmo, seguro e respeitoso',
  volume: 1.0,
  voz: 'masculina',
  gender: 'male',
  estilo: 'conversacional',
  style: 'conversational',
  model: 'gemini-3.8-flash-lite-tts',
  autoPlay: false,
  stylePrompt:
    'Voz masculina em português do Brasil (pt-BR), natural, clara, conversacional, calma e amigável, com boa pronúncia em português brasileiro, pausas naturais e entonação humana adequada para um aplicativo público de transparência cidadã. Narrar exclusivamente o texto fornecido sem resumir, modificar ou inventar informações.',
};

export type TTSPlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export interface TTSStateSnapshot {
  activeMessageId: string | null;
  status: TTSPlaybackStatus;
  errorMessage: string | null;
  usingFallback: boolean;
  voiceName?: GeminiMaleVoiceName;
  languageCode?: 'pt-BR';
  speakingRate?: SpeechSpeedOption;
  speed: SpeechSpeedOption;
  pitch?: number;
  volume: number;
  playedMessageIds: string[];
}

/**
 * Contrato de Provedor TTS Independente.
 */
export interface ITTSProvider {
  readonly providerId: string;
  synthesizeAudioUrl(
    text: string,
    config: CentralVoiceConfiguration,
    signal: AbortSignal
  ): Promise<string>;
}

/**
 * Provedor Principal: Gemini TTS via backend seguro (/api/potiguar-tts).
 * Nenhuma chave de API é exposta no frontend.
 */
class GeminiTTSBackendProvider implements ITTSProvider {
  readonly providerId = 'gemini-tts-pt-br';

  async synthesizeAudioUrl(
    text: string,
    config: CentralVoiceConfiguration,
    signal: AbortSignal
  ): Promise<string> {
    const response = await fetch('/api/potiguar-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceConfig: {
          voiceName: config.voiceName,
          languageCode: config.languageCode,
          speakingRate: config.speakingRate,
          pitch: config.pitch,
          volume: config.volume,
          idioma: config.idioma,
          language: config.language,
          voz: config.voz,
          gender: config.gender,
          velocidade: config.velocidade,
          speed: config.speed,
          tom: config.tom,
          estilo: config.estilo,
          style: config.style,
          stylePrompt: config.stylePrompt,
        },
      }),
      signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || 'Serviço Gemini TTS temporariamente indisponível.'
      );
    }

    const data = await response.json();
    if (!data?.audioBase64) {
      throw new Error('Áudio não retornado pelo serviço Gemini TTS.');
    }

    const binaryString = window.atob(data.audioBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}

/**
 * Provedor de Fallback Separado: Web Speech API do navegador.
 * Mantido isolado da implementação principal do Gemini TTS.
 */
class BrowserWebSpeechFallbackProvider {
  speak(
    cleanText: string,
    config: CentralVoiceConfiguration,
    callbacks: {
      onStart: () => void;
      onEnd: () => void;
      onError: (msg: string) => void;
    }
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      callbacks.onError('Fallback Web Speech API indisponível neste dispositivo.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = config.languageCode;
    utterance.rate = config.speakingRate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    const voices = window.speechSynthesis.getVoices();
    const ptMaleVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('pt') &&
        /(daniel|antonio|carlos|male|masculin|google português)/i.test(v.name)
    );
    if (ptMaleVoice) {
      utterance.voice = ptMaleVoice;
    }

    utterance.onstart = () => callbacks.onStart();
    utterance.onend = () => callbacks.onEnd();
    utterance.onerror = () =>
      callbacks.onError('Falha ao reproduzir fallback Web Speech API.');

    window.speechSynthesis.speak(utterance);
  }

  pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

let activePrimaryProvider: ITTSProvider = new GeminiTTSBackendProvider();
const isolatedFallbackProvider = new BrowserWebSpeechFallbackProvider();

export function registerPrimaryTTSProvider(provider: ITTSProvider): void {
  activePrimaryProvider = provider;
}

type TTSListener = (state: TTSStateSnapshot) => void;

// Cache em memória de áudios gerados (chave: provedor + voiceName + texto -> Blob URL WAV)
const audioCache = new Map<string, string>();
const playedMessagesSet = new Set<string>();

let currentAudio: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;
let inFlightRequestKey: string | null = null;

let currentState: TTSStateSnapshot = {
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
};

const listeners = new Set<TTSListener>();

function notifyListeners() {
  const snapshot: TTSStateSnapshot = {
    ...currentState,
    voiceName: voiceConfig.voiceName,
    languageCode: voiceConfig.languageCode,
    speakingRate: voiceConfig.speakingRate,
    speed: voiceConfig.speed,
    pitch: voiceConfig.pitch,
    volume: voiceConfig.volume,
    playedMessageIds: Array.from(playedMessagesSet),
  };
  listeners.forEach((listener) => listener(snapshot));
}

function updateState(partial: Partial<TTSStateSnapshot>) {
  currentState = {
    ...currentState,
    ...partial,
  };
  notifyListeners();
}

export function subscribeTTSState(listener: TTSListener): () => void {
  listeners.add(listener);
  listener({
    ...currentState,
    voiceName: voiceConfig.voiceName,
    languageCode: voiceConfig.languageCode,
    speakingRate: voiceConfig.speakingRate,
    speed: voiceConfig.speed,
    pitch: voiceConfig.pitch,
    volume: voiceConfig.volume,
    playedMessageIds: Array.from(playedMessagesSet),
  });
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Altera a voz masculina Gemini TTS na configuração centralizada (Charon, Achird, Algieba, Iapetus, Puck).
 */
export function setTTSVoiceName(newVoice: GeminiMaleVoiceName): void {
  if (voiceConfig.voiceName === newVoice) return;
  stopTTSPlayback();
  voiceConfig.voiceName = newVoice;
  updateState({ voiceName: newVoice });
}

/**
 * Ajusta a velocidade de fala (speakingRate) na configuração central e aplica ao áudio em execução.
 */
export function setTTSSpeed(newSpeed: SpeechSpeedOption): void {
  voiceConfig.speakingRate = newSpeed;
  voiceConfig.velocidade = newSpeed;
  voiceConfig.speed = newSpeed;
  if (currentAudio) {
    currentAudio.playbackRate = newSpeed;
  }
  updateState({ speakingRate: newSpeed, speed: newSpeed });
}

/**
 * Ajusta o volume na configuração central e aplica ao áudio em execução.
 */
export function setTTSVolume(newVolume: number): void {
  const clamped = Math.max(0, Math.min(1, newVolume));
  voiceConfig.volume = clamped;
  if (currentAudio) {
    currentAudio.volume = clamped;
  }
  updateState({ volume: clamped });
}

/**
 * Limpa apenas símbolos de formatação visual (markdown/emojis) para que o Gemini TTS
 * narre literalmente o texto produzido pelo PotiguarBot com pausas naturais,
 * sem resumir, modificar, reinterpretar ou inventar informações.
 */
export function sanitizeTextForNaturalSpeech(rawText: string): string {
  return rawText
    .replace(/\*\*/g, '')
    .replace(/[`#_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[«»]/g, '. ')
    .replace(/[📌🔎🏛️📋👥📊🤖🕐⚡✓⚠️🔒🔏🚌📍👍👎★●]/g, '')
    .replace(/•/g, '. ')
    .replace(/\|/g, ', ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * ⏹️ Parar: Interrompe imediatamente qualquer geração ou reprodução de áudio em andamento.
 */
export function stopTTSPlayback(): void {
  inFlightRequestKey = null;

  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }

  isolatedFallbackProvider.stop();

  if (currentState.activeMessageId) {
    playedMessagesSet.add(currentState.activeMessageId);
  }

  updateState({
    activeMessageId: null,
    status: 'idle',
    errorMessage: null,
    usingFallback: false,
  });
}

/**
 * ⏸️ Pausar: Pausa a reprodução atual mantendo a posição.
 */
export function pauseTTSPlayback(): void {
  if (currentState.usingFallback && currentState.status === 'playing') {
    isolatedFallbackProvider.pause();
    updateState({ status: 'paused' });
    return;
  }

  if (currentAudio && currentState.status === 'playing') {
    currentAudio.pause();
    updateState({ status: 'paused' });
  }
}

/**
 * ▶️ Continuar: Retoma a reprodução pausada do ponto exato.
 */
export async function resumeTTSPlayback(): Promise<void> {
  if (currentState.usingFallback && currentState.status === 'paused') {
    isolatedFallbackProvider.resume();
    updateState({ status: 'playing', errorMessage: null });
    return;
  }

  if (currentAudio && currentState.status === 'paused') {
    try {
      currentAudio.playbackRate = voiceConfig.speakingRate;
      currentAudio.volume = voiceConfig.volume;
      await currentAudio.play();
      updateState({ status: 'playing', errorMessage: null });
    } catch {
      updateState({
        status: 'error',
        errorMessage: 'Não foi possível retomar a reprodução do áudio.',
      });
    }
  }
}

/**
 * Reproduz de forma estável no celular e no navegador o áudio WAV gerado.
 */
async function playAudioUrl(messageId: string, audioUrl: string): Promise<void> {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }

  const audio = new Audio(audioUrl);
  audio.preload = 'auto';
  (audio as any).playsInline = true;
  audio.playbackRate = voiceConfig.speakingRate;
  audio.volume = voiceConfig.volume;
  currentAudio = audio;

  audio.onended = () => {
    playedMessagesSet.add(messageId);
    currentAudio = null;
    updateState({
      activeMessageId: messageId,
      status: 'ended',
      errorMessage: null,
      usingFallback: false,
    });
  };

  audio.onerror = () => {
    currentAudio = null;
    updateState({
      activeMessageId: messageId,
      status: 'error',
      errorMessage: 'Falha ao reproduzir o áudio gerado.',
      usingFallback: false,
    });
  };

  updateState({
    activeMessageId: messageId,
    status: 'playing',
    errorMessage: null,
    usingFallback: false,
  });

  await audio.play();
}

/**
 * 🔊 Ouvir: Converte a resposta textual atual do PotiguarBot em áudio via Gemini TTS.
 * - Evita gerar múltiplos áudios simultâneos se o usuário tocar várias vezes em "Ouvir".
 * - Se uma nova resposta for selecionada, interrompe o áudio anterior antes de iniciar o novo.
 */
export async function speakWithPotiguarTTS(
  messageId: string,
  rawText: string
): Promise<void> {
  const cleanText = sanitizeTextForNaturalSpeech(rawText);
  if (!cleanText) return;

  const requestLockKey = `${messageId}:${voiceConfig.voiceName}`;

  // Evita disparos duplicados quando o usuário toca repetidamente em "Ouvir" na mesma mensagem
  if (
    currentState.activeMessageId === messageId &&
    (currentState.status === 'loading' || currentState.status === 'playing') &&
    inFlightRequestKey === requestLockKey
  ) {
    return;
  }

  // Se a mesma mensagem estiver pausada e na mesma voz, apenas continua
  if (
    currentState.activeMessageId === messageId &&
    currentState.status === 'paused'
  ) {
    await resumeTTSPlayback();
    return;
  }

  // Interrompe qualquer áudio ou requisição anterior antes de iniciar a nova resposta
  stopTTSPlayback();
  inFlightRequestKey = requestLockKey;

  const cacheKey = `${activePrimaryProvider.providerId}:${voiceConfig.voiceName}:${cleanText}`;
  const cachedAudioUrl = audioCache.get(cacheKey);

  if (cachedAudioUrl) {
    try {
      await playAudioUrl(messageId, cachedAudioUrl);
      return;
    } catch {
      audioCache.delete(cacheKey);
    }
  }

  const abortController = new AbortController();
  currentAbortController = abortController;

  updateState({
    activeMessageId: messageId,
    status: 'loading',
    errorMessage: null,
    usingFallback: false,
  });

  try {
    const objectUrl = await activePrimaryProvider.synthesizeAudioUrl(
      cleanText,
      voiceConfig,
      abortController.signal
    );

    if (abortController.signal.aborted) return;

    audioCache.set(cacheKey, objectUrl);
    currentAbortController = null;

    await playAudioUrl(messageId, objectUrl);
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return;
    }
    inFlightRequestKey = null;
    currentAbortController = null;
    updateState({
      activeMessageId: messageId,
      status: 'error',
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar a voz Gemini TTS no momento.',
      usingFallback: false,
    });
  }
}

/**
 * Fallback separado usando Web Speech API (somente como contingência quando Gemini TTS não estiver disponível).
 */
export function speakWithExplicitBrowserFallback(
  messageId: string,
  rawText: string
): void {
  stopTTSPlayback();
  const cleanText = sanitizeTextForNaturalSpeech(rawText);
  if (!cleanText) return;

  isolatedFallbackProvider.speak(cleanText, voiceConfig, {
    onStart: () => {
      updateState({
        activeMessageId: messageId,
        status: 'playing',
        errorMessage: null,
        usingFallback: true,
      });
    },
    onEnd: () => {
      playedMessagesSet.add(messageId);
      updateState({
        activeMessageId: messageId,
        status: 'ended',
        errorMessage: null,
        usingFallback: true,
      });
    },
    onError: (msg) => {
      updateState({
        activeMessageId: messageId,
        status: 'error',
        errorMessage: msg,
        usingFallback: false,
      });
    },
  });
}
