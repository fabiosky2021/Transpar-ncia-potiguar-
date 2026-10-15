import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, CheckCircle2, RotateCcw, Award, ChevronRight, ChevronLeft, Play, Square } from 'lucide-react';
import { speakWithPotiguarTTS, stopTTSPlayback } from '../services/ttsService';

// Quiz focado na situação atual do Brasil (Outubro de 2026)
export interface RealityQuizOptionPesos {
  flavio_bolsonaro_22: number;
  lula_13: number;
}

export interface RealityQuizOption {
  texto: string;
  pesos: RealityQuizOptionPesos;
}

export interface RealityQuizQuestion {
  id: string;
  categoria: string;
  pergunta: string;
  opcoes: RealityQuizOption[];
}

export const realityQuiz: RealityQuizQuestion[] = [
  {
    id: "crise_fiscal",
    categoria: "Economia & Contas Públicas",
    pergunta: "Com a inflação pressionada e o debate sobre o teto de gastos, qual deve ser a prioridade imediata do governo?",
    opcoes: [
      {
        texto: "Cortar gastos públicos, fazer reforma administrativa urgente e retomar privatizações para atrair o mercado.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Manter o foco em investimentos sociais, proteger o poder de compra do salário mínimo e manter o arcabouço flexível.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      }
    ]
  },
  {
    id: "seguranca_urbana",
    categoria: "Segurança Pública",
    pergunta: "Diante do avanço do crime organizado e da sensação de insegurança nas grandes cidades, qual medida é mais urgente?",
    opcoes: [
      {
        texto: "Endurecer as leis penais (redução da maioridade para 16 anos), ampliar presídios federais e usar alta tecnologia de reconhecimento facial.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Integrar as polícias via SUSP, asfixiar as finanças das facções com inteligência financeira e expandir o uso de câmeras corporais.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      }
    ]
  },
  {
    id: "trabalho_renda",
    categoria: "Trabalho & Emprego",
    pergunta: "Sobre as leis trabalhistas e o mercado de trabalho atual:",
    opcoes: [
      {
        texto: "Desburocratizar a abertura de empresas, flexibilizar regras e estimular o empreendedorismo individual.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Avançar na pauta de proteção ao trabalhador, incluindo o debate pelo fim da escala 6x1 e limitação de jornadas excessivas.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      }
    ]
  },
  {
    id: "saude_fila",
    categoria: "Saúde Básica",
    pergunta: "Para desafogar as filas de espera que afetam milhões de brasileiros no SUS:",
    opcoes: [
      {
        texto: "Apostar na digitalização total com prontuário unificado, telemedicina em massa e parcerias com a rede privada.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Garantir o SUS 100% público com mutirões organizados pelo governo e expansão forte da Farmácia Popular.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      }
    ]
  }
];

// Efeitos Sonoros Nativos com Web Audio API (Zero dependências externas, áudio cristalino)
class QuizSoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Toque suave e agradável ao selecionar opção
  playOptionSelect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignora erro de áudio silenciosamente
    }
  }

  // Toque animado de avanço
  playNext() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.06); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // Fanfarra festiva brasileira ao calcular resultado (acorde verde e amarelo alegre)
  playFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Acorde Maior)

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {}
  }
}

const sfx = new QuizSoundEffects();

interface PrioritiesQuizProps {
  onAskAgentAnalysis?: (prompt: string) => void;
  className?: string;
}

export default function PrioritiesQuiz({ onAskAgentAnalysis, className = '' }: PrioritiesQuizProps) {
  const [answers, setAnswers] = useState<Record<string, RealityQuizOptionPesos>>({});
  const [result, setResult] = useState<{ flavio: number; lula: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'step' | 'list'>('step');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [animatedFlavio, setAnimatedFlavio] = useState(0);
  const [animatedLula, setAnimatedLula] = useState(0);

  // Sincroniza som
  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Animação de confetes ao finalizar
  useEffect(() => {
    if (result) {
      setConfettiActive(true);
      sfx.playFanfare();

      // Animação gradual das barras percentuais
      const duration = 900;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setAnimatedFlavio(Math.round(result.flavio * easeOut));
        setAnimatedLula(Math.round(result.lula * easeOut));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);

      const timer = setTimeout(() => setConfettiActive(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleSelect = (questionId: string, pesos: RealityQuizOptionPesos) => {
    sfx.playOptionSelect();
    setAnswers((prev) => ({ ...prev, [questionId]: pesos }));

    // No modo passo a passo, avança suavemente para a próxima pergunta
    if (viewMode === 'step' && currentStep < realityQuiz.length - 1) {
      setTimeout(() => {
        sfx.playNext();
        setCurrentStep((prev) => Math.min(realityQuiz.length - 1, prev + 1));
      }, 350);
    }
  };

  const calculateResults = () => {
    let totalFlavio = 0;
    let totalLula = 0;
    const maxScore = realityQuiz.length * 10;

    Object.values(answers).forEach((p) => {
      totalFlavio += p.flavio_bolsonaro_22;
      totalLula += p.lula_13;
    });

    const fPct = Math.round((totalFlavio / maxScore) * 100);
    const lPct = Math.round((totalLula / maxScore) * 100);

    setResult({
      flavio: fPct,
      lula: lPct,
    });
  };

  const handleReset = () => {
    sfx.playNext();
    stopTTSPlayback();
    setIsSpeaking(false);
    setActiveSpeechId(null);
    setResult(null);
    setAnswers({});
    setCurrentStep(0);
    setAnimatedFlavio(0);
    setAnimatedLula(0);
  };

  const speakQuestion = (q: RealityQuizQuestion, index: number) => {
    const speechId = `quiz-q-${q.id}`;
    if (activeSpeechId === speechId && isSpeaking) {
      stopTTSPlayback();
      setIsSpeaking(false);
      setActiveSpeechId(null);
      return;
    }

    const text = `Pergunta ${index + 1}. Eixo: ${q.categoria}. ${q.pergunta}. Opção A: ${q.opcoes[0].texto}. Opção B: ${q.opcoes[1].texto}.`;
    setIsSpeaking(true);
    setActiveSpeechId(speechId);
    speakWithPotiguarTTS(speechId, text);
  };

  const speakResult = () => {
    if (!result) return;
    const speechId = 'quiz-prioridades-result';
    if (activeSpeechId === speechId && isSpeaking) {
      stopTTSPlayback();
      setIsSpeaking(false);
      setActiveSpeechId(null);
      return;
    }

    const lider = result.flavio > result.lula ? 'Flávio Bolsonaro (PL)' : result.lula > result.flavio ? 'Lula (PT)' : 'Empate técnico';
    const text = `Resultado do Quiz de Prioridades do Brasil 2026. Sua afinidade foi de ${result.flavio} por cento com Flávio Bolsonaro, número 22, e ${result.lula} por cento com Lula, número 13. Maior convergência com ${lider}.`;
    setIsSpeaking(true);
    setActiveSpeechId(speechId);
    speakWithPotiguarTTS(speechId, text);
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === realityQuiz.length;

  return (
    <div
      className={`relative overflow-hidden p-5 sm:p-6 max-w-xl mx-auto bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 rounded-3xl shadow-xl border-2 border-emerald-500/20 font-sans transition-all ${className}`}
    >
      {/* Chuva de Confetes Animada (Brasileira: Verde, Amarelo, Azul, Branco) */}
      {confettiActive && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${(i * 3.6) % 98}%`,
                top: `${(i * 7) % 85}%`,
                animationDuration: `${1.2 + (i % 5) * 0.3}s`,
                animationDelay: `${(i % 4) * 0.15}s`,
              }}
            >
              <span
                className={`inline-block w-2.5 h-2.5 rounded-sm transform rotate-45 shadow-sm ${
                  i % 4 === 0
                    ? 'bg-emerald-500'
                    : i % 4 === 1
                    ? 'bg-amber-400'
                    : i % 4 === 2
                    ? 'bg-blue-600'
                    : 'bg-white border border-slate-300'
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Topo do Quiz: Identidade Brasileira com Selo e Controles de Som */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🇧🇷</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Quiz Animado Brasileiro
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                2026
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight mt-0.5">
              Quiz de Prioridades do Brasil
            </h2>
          </div>
        </div>

        {/* Controles de Som & Alternador de Modo */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Desativar som do quiz' : 'Ativar som do quiz'}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!result && (
            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === 'step' ? 'list' : 'step'))}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 cursor-pointer"
            >
              {viewMode === 'step' ? 'Ver Todas' : 'Passo a Passo'}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
        Descubra qual candidato melhor responde aos seus dilemas atuais sobre inflação, contas públicas, segurança e trabalho.
      </p>

      {/* Barra de Progresso Animada */}
      {!result && (
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span>Progresso das Respostas</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {answeredCount} de {realityQuiz.length} respondidas ({Math.round((answeredCount / realityQuiz.length) * 100)}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${(answeredCount / realityQuiz.length) * 100}%` }}
            />
          </div>

          {/* Atalhos para as 4 perguntas */}
          {viewMode === 'step' && (
            <div className="flex items-center gap-1.5 pt-1">
              {realityQuiz.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isActive = currentStep === idx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      sfx.playNext();
                      setCurrentStep(idx);
                    }}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all truncate cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : isAnswered
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {idx + 1}. {q.categoria.split('&')[0].trim()} {isAnswered ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL: MODO PASSO A PASSO OU LISTA COMPLETA */}
      {!result ? (
        <div className="space-y-5">
          {viewMode === 'step' ? (
            (() => {
              const q = realityQuiz[currentStep];
              const isSelectedA = answers[q.id] === q.opcoes[0].pesos;
              const isSelectedB = answers[q.id] === q.opcoes[1].pesos;

              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-lg">
                      {q.categoria}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakQuestion(q, currentStep)}
                      className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{activeSpeechId === `quiz-q-${q.id}` && isSpeaking ? 'Parar Áudio' : 'Ouvir Pergunta'}</span>
                    </button>
                  </div>

                  <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-snug">
                    {currentStep + 1}. {q.pergunta}
                  </p>

                  <div className="space-y-2.5">
                    {q.opcoes.map((opt, oIdx) => {
                      const isSelected = answers[q.id] === opt.pesos;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelect(q.id, opt.pesos)}
                          className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold shadow-md ring-2 ring-emerald-500/20 scale-[1.01]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/60 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 text-slate-400'
                              }`}
                            >
                              {oIdx === 0 ? 'A' : 'B'}
                            </span>
                            <span className="text-xs sm:text-sm leading-relaxed">{opt.texto}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navegação entre passos */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={currentStep === 0}
                      onClick={() => {
                        sfx.playNext();
                        setCurrentStep((prev) => Math.max(0, prev - 1));
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>

                    <span className="text-[11px] font-mono text-slate-400">
                      {currentStep + 1} de {realityQuiz.length}
                    </span>

                    {currentStep < realityQuiz.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playNext();
                          setCurrentStep((prev) => Math.min(realityQuiz.length - 1, prev + 1));
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>Próxima</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!isComplete}
                        onClick={calculateResults}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md disabled:opacity-40"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ver Resultado</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Modo Lista Completa */
            <div className="space-y-4">
              {realityQuiz.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded">
                      {q.categoria}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakQuestion(q, idx)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Ouvir</span>
                    </button>
                  </div>
                  <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                    {idx + 1}. {q.pergunta}
                  </p>

                  <div className="space-y-2">
                    {q.opcoes.map((opt, oIdx) => {
                      const isSelected = answers[q.id] === opt.pesos;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelect(q.id, opt.pesos)}
                          className={`w-full text-left p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs ring-1 ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold ${
                                isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                              }`}
                            >
                              {isSelected ? '✓' : oIdx === 0 ? 'A' : 'B'}
                            </span>
                            <span>{opt.texto}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão Principal de Calcular */}
          <button
            type="button"
            onClick={calculateResults}
            disabled={!isComplete}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-extrabold rounded-2xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>
              {isComplete
                ? 'Calcular Minhas Prioridades Eleitorais 2026'
                : `Responda todas as perguntas (${answeredCount}/${realityQuiz.length})`}
            </span>
          </button>
        </div>
      ) : (
        /* RESULTADO ANIMADO COM SOM E BARRAS INTERATIVAS */
        <div className="text-center py-2 space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-amber-50/60 dark:from-emerald-950/30 dark:to-slate-800 border-2 border-emerald-400/40 shadow-sm space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-extrabold mb-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Resultado das Prioridades 2026</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">
              {result.flavio > result.lula
                ? 'Maior Convergência: Flávio Bolsonaro (PL - 22)'
                : result.lula > result.flavio
                ? 'Maior Convergência: Lula (PT - 13)'
                : 'Convergência Equilibrada (50% / 50%)'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Calculado a partir de 4 eixos reais da economia, segurança, trabalho e saúde.
            </p>
          </div>

          {/* Barras de Percentual Animadas */}
          <div className="space-y-4 text-left">
            {/* Flávio Bolsonaro */}
            <div className="p-3.5 rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 shadow-2xs">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-xs" />
                  <span>Flávio Bolsonaro (PL - 22)</span>
                </span>
                <span className="text-blue-600 dark:text-blue-400 text-base font-black">
                  {animatedFlavio}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${animatedFlavio}%` }}
                />
              </div>
            </div>

            {/* Lula */}
            <div className="p-3.5 rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 shadow-2xs">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-xs" />
                  <span>Lula (PT - 13)</span>
                </span>
                <span className="text-red-600 dark:text-red-400 text-base font-black">
                  {animatedLula}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-700 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${animatedLula}%` }}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação: Ouvir Resultado com Voz Brasileira, Refazer e Análise com IA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={speakResult}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>{activeSpeechId === 'quiz-prioridades-result' && isSpeaking ? '⏹️ Parar Voz' : '🔊 Ouvir com Voz Brasileira'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refazer Teste</span>
            </button>

            {onAskAgentAnalysis && (
              <button
                type="button"
                onClick={() =>
                  onAskAgentAnalysis(
                    `Fiz o Quiz Animado de Prioridades do Brasil 2026. Meu resultado deu ${result.flavio}% para Flávio Bolsonaro (PL - 22) e ${result.lula}% para Lula (PT - 13). Como esses dilemas (crise fiscal, segurança urbana, leis trabalhistas e saúde básica) afetam diretamente a população do Rio Grande do Norte?`
                  )
                }
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Parecer PotiguarBot IA</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
