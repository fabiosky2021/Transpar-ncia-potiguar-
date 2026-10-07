/**
 * Serviço centralizado de Text-to-Speech (TTS) do PotiguarBot IA.
 * Utiliza a API oficial Google Gemini TTS (gemini-3.8-flash-lite-tts) via backend seguro (/api/potiguar-tts),
 * com voz masculina natural em português do Brasil, cache em memória, controle de reprodução
 * (Ouvir, Pausar, Parar, Ouvir novamente) e cancelamento de requisições anteriores.
 */

export interface VoiceConfig {
  language: 'pt-BR';
  gender: 'male';
  voiceName: 'Charon' | 'Fenrir' | 'Puck';
  model: 'gemini-3.8-flash-lite-tts';
  speed: number;
  style: 'conversational';
  stylePrompt: string;
}

export const voiceConfig: VoiceConfig = {
  language: 'pt-BR',
  gender: 'male',
  voiceName: 'Charon',
  model: 'gemini-3.8-flash-lite-tts',
  speed: 1.0,
  style: 'conversational',
  stylePrompt:
    'Locutor masculino brasileiro em português do Brasil (pt-BR), tom natural, conversacional, calmo, claro, seguro e com pausas naturais, adequado para comunicação pública apartidária.',
};

export type TTSPlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export interface TTSStateSnapshot {
  activeMessageId: string | null;
  status: TTSPlaybackStatus;
  errorMessage: string | null;
  usingFallback: boolean;
  playedMessageIds: string[];
}

type TTSListener = (state: TTSStateSnapshot) => void;

// Cache em memória de áudios já gerados (chave: texto limpo -> Blob URL de áudio WAV)
const audioCache = new Map<string, string>();
const playedMessagesSet = new Set<string>();

let currentAudio: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;

let currentState: TTSStateSnapshot = {
  activeMessageId: null,
  status: 'idle',
  errorMessage: null,
  usingFallback: false,
  playedMessageIds: [],
};

const listeners = new Set<TTSListener>();

function notifyListeners() {
  const snapshot: TTSStateSnapshot = {
    ...currentState,
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
    playedMessageIds: Array.from(playedMessagesSet),
  });
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Limpa marcações markdown/emojis excessivos para leitura fluida e natural com pausas adequadas.
 */
export function sanitizeTextForNaturalSpeech(rawText: string): string {
  return rawText
    .replace(/\*\*/g, '')
    .replace(/[`#_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[📌🔎🏛️📋👥📊🤖🕐⚡✓⚠️🔒🔏🚌📍👍👎★]/g, '')
    .replace(/•/g, '. ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Interrompe imediatamente qualquer geração ou reprodução de áudio em andamento.
 */
export function stopTTSPlayback(): void {
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

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

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
 * Pausa a reprodução atual, se suportado.
 */
export function pauseTTSPlayback(): void {
  if (currentAudio && currentState.status === 'playing') {
    currentAudio.pause();
    updateState({ status: 'paused' });
  }
}

/**
 * Retoma a reprodução pausada.
 */
export async function resumeTTSPlayback(): Promise<void> {
  if (currentAudio && currentState.status === 'paused') {
    try {
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
 * Reproduz um áudio WAV a partir de uma URL (Blob URL em cache).
 */
async function playAudioUrl(messageId: string, audioUrl: string): Promise<void> {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(audioUrl);
  audio.playbackRate = voiceConfig.speed;
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
      errorMessage: 'Falha ao reproduzir o arquivo de áudio gerado.',
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
 * Solicita ao servidor (/api/potiguar-tts) a síntese de voz natural masculina em pt-BR
 * ou reutiliza o áudio já existente no cache em memória.
 */
export async function speakWithPotiguarTTS(
  messageId: string,
  rawText: string
): Promise<void> {
  const cleanText = sanitizeTextForNaturalSpeech(rawText);
  if (!cleanText) return;

  // Se a mesma mensagem estiver pausada, apenas retoma
  if (currentState.activeMessageId === messageId && currentState.status === 'paused') {
    await resumeTTSPlayback();
    return;
  }

  // Cancela qualquer geração ou áudio anterior antes de iniciar
  stopTTSPlayback();

  const cacheKey = `${voiceConfig.voiceName}:${cleanText}`;
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
    const response = await fetch('/api/potiguar-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        voiceConfig: {
          language: voiceConfig.language,
          gender: voiceConfig.gender,
          voiceName: voiceConfig.voiceName,
          speed: voiceConfig.speed,
          style: voiceConfig.style,
          stylePrompt: voiceConfig.stylePrompt,
        },
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Serviço de voz natural temporariamente indisponível.');
    }

    const data = await response.json();
    if (abortController.signal.aborted) return;

    if (!data?.audioBase64) {
      throw new Error('Áudio não retornado pelo servidor TTS.');
    }

    // Converte Base64 WAV em Blob URL para reprodução rápida e cache em memória
    const binaryString = window.atob(data.audioBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
    const objectUrl = URL.createObjectURL(blob);

    audioCache.set(cacheKey, objectUrl);
    currentAbortController = null;

    await playAudioUrl(messageId, objectUrl);
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return;
    }
    currentAbortController = null;
    updateState({
      activeMessageId: messageId,
      status: 'error',
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar a voz natural no momento.',
      usingFallback: false,
    });
  }
}

/**
 * Fallback explícito e isolado: SÓ é acionado se o usuário clicar manualmente
 * na opção de contingência offline caso o servidor TTS esteja inacessível.
 * Nunca é utilizado como voz principal padrão do aplicativo.
 */
export function speakWithExplicitBrowserFallback(messageId: string, rawText: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    updateState({
      activeMessageId: messageId,
      status: 'error',
      errorMessage: 'Leitura offline indisponível neste dispositivo.',
      usingFallback: false,
    });
    return;
  }

  stopTTSPlayback();
  const cleanText = sanitizeTextForNaturalSpeech(rawText);
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const ptMaleVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().includes('pt') &&
      /(daniel|antonio|carlos|male|masculin|google português)/i.test(v.name)
  );
  if (ptMaleVoice) {
    utterance.voice = ptMaleVoice;
  }

  utterance.onend = () => {
    playedMessagesSet.add(messageId);
    updateState({
      activeMessageId: messageId,
      status: 'ended',
      errorMessage: null,
      usingFallback: true,
    });
  };

  utterance.onerror = () => {
    updateState({
      activeMessageId: messageId,
      status: 'idle',
      errorMessage: null,
      usingFallback: false,
    });
  };

  updateState({
    activeMessageId: messageId,
    status: 'playing',
    errorMessage: null,
    usingFallback: true,
  });

  window.speechSynthesis.speak(utterance);
}
