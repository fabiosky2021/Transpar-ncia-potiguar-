/**
 * Serviço de Notificação com Som (Web Audio API) — Transparência Potiguar & Estúdio Multimodal
 * 
 * Fornece áudio sintetizado puro e cristalino via Web Audio API (sem dependência de arquivos externos),
 * garantindo compatibilidade PWA offline, baixo consumo e reprodução instantânea com baixa latência.
 */

export type NotificationSoundType = 'chime' | 'urgent' | 'success' | 'subtle' | 'breeze';

export interface SoundNotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  categoria: 'plantao' | 'transporte' | 'legislativo' | 'eleicoes' | 'estudio';
  timestamp: string;
  lida: boolean;
  linkHref?: string;
  soundType?: NotificationSoundType;
}

const STORAGE_SOUND_KEY = 'potiguar_notificacoes_som_ativo_v1';
const STORAGE_VOLUME_KEY = 'potiguar_notificacoes_som_volume_v1';

class SoundNotificationManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.7;
  private listeners: Set<(enabled: boolean) => void> = new Set();
  private notificationListeners: Set<(item: SoundNotificationItem) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_SOUND_KEY);
        if (stored !== null) {
          this.soundEnabled = stored === 'true';
        }
        const storedVol = localStorage.getItem(STORAGE_VOLUME_KEY);
        if (storedVol !== null) {
          this.volume = parseFloat(storedVol) || 0.7;
        }
      } catch {
        this.soundEnabled = true;
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem(STORAGE_SOUND_KEY, String(enabled));
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  public toggle(): boolean {
    const next = !this.soundEnabled;
    this.setEnabled(next);
    if (next) {
      this.playSound('chime');
    }
    return next;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(this.volume));
    } catch {
      // ignore
    }
  }

  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onNewNotification(listener: (item: SoundNotificationItem) => void): () => void {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn(this.soundEnabled));
  }

  /**
   * Toca efeito sonoro da notificação com base no tipo escolhido
   */
  public playSound(type: NotificationSoundType = 'chime') {
    if (!this.soundEnabled) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(ctx.destination);

      if (type === 'chime') {
        // Clássico chime de notificação com dois harmônicos limpos estilo sino
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // E6

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760, now); // A6
        osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.12);

        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        gain2.gain.setValueAtTime(0.1, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(masterGain);
        gain2.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);

      } else if (type === 'urgent') {
        // Tom duplo de plantão / notícia urgente 24h
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.1); // A5
        osc.frequency.setValueAtTime(587.33, now + 0.2); // D5
        osc.frequency.setValueAtTime(880, now + 0.3); // A5

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.setValueAtTime(0.22, now + 0.1);
        gain.gain.setValueAtTime(0.18, now + 0.2);
        gain.gain.setValueAtTime(0.22, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.58);

      } else if (type === 'success') {
        // Arpeggio de sucesso cívico (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startNote = now + idx * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startNote);

          gain.gain.setValueAtTime(0.2, startNote);
          gain.gain.exponentialRampToValueAtTime(0.001, startNote + 0.35);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(startNote);
          osc.stop(startNote + 0.38);
        });

      } else if (type === 'subtle') {
        // Pop sutil de interface
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.07);

      } else if (type === 'breeze') {
        // Triplo acorde suave com fade out longo
        [440, 554.37, 659.25].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.9);
        });
      }
    } catch {
      // Ignora erro de áudio silenciosamente
    }
  }

  /**
   * Dispara uma notificação completa com som e notificação visual
   */
  public triggerNotification(item: Omit<SoundNotificationItem, 'id' | 'timestamp' | 'lida'>): SoundNotificationItem {
    const fullItem: SoundNotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lida: false,
    };

    // Toca o som correspondente
    this.playSound(fullItem.soundType || 'chime');

    // Notifica listeners no frontend
    this.notificationListeners.forEach((fn) => fn(fullItem));

    // Se a permissão nativa estiver autorizada, aciona Notification do navegador
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(fullItem.titulo, {
          body: fullItem.mensagem,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }

    return fullItem;
  }

  /**
   * Solicita permissão para notificações nativas do sistema operacional
   */
  public async requestBrowserPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        return result === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const soundNotificationManager = new SoundNotificationManager();
