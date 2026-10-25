import React, { useState, useEffect } from 'react';
import {
  Vote,
  TrendingUp,
  RefreshCw,
  Landmark,
  Radio,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Pause,
  Square,
  Sparkles,
  ArrowRight,
  MapPin,
  Building2,
  Layers,
  ChevronDown,
  ShieldCheck,
  Flame,
  Globe2,
} from 'lucide-react';
import {
  ApuracaoEleicaoData,
  APURACAO_PRESIDENCIAL_INICIAL,
  APURACAO_RN_INICIAL,
} from '../data/apuracaoRealtimeData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import {
  speakWithPotiguarTTS,
  stopTTSPlayback,
  subscribeTTSState,
  TTSStateSnapshot,
  voiceConfig,
} from '../services/ttsService';

interface ApuracaoRealtimeSectionProps {
  onAskAgent?: (prompt: string) => void;
}

export const ApuracaoRealtimeSection: React.FC<ApuracaoRealtimeSectionProps> = ({
  onAskAgent,
}) => {
  const [esferaAtiva, setEsferaAtiva] = useState<'presidencial' | 'rn_natal'>('presidencial');
  const [dadosPresidencial, setDadosPresidencial] = useState<ApuracaoEleicaoData>(
    APURACAO_PRESIDENCIAL_INICIAL
  );
  const [dadosRN, setDadosRN] = useState<ApuracaoEleicaoData>(APURACAO_RN_INICIAL);
  const [isUpdatingFirestore, setIsUpdatingFirestore] = useState(false);
  const [ttsState, setTtsState] = useState<TTSStateSnapshot>({
    activeMessageId: null,
    status: 'idle',
    errorMessage: null,
    usingFallback: false,
    speed: voiceConfig.speed,
    volume: voiceConfig.volume,
    playedMessageIds: [],
  });
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    return subscribeTTSState(setTtsState);
  }, []);

  // Sincronização em Tempo Real com Firestore (/apuracao/presidencial e /apuracao/rn_natal)
  useEffect(() => {
    const unsubPres = onSnapshot(
      doc(db, 'apuracao', 'presidencial'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ApuracaoEleicaoData;
          if (data && data.candidatos) {
            setDadosPresidencial(data);
          }
        } else {
          // Inicializa registro inicial no Firestore se ainda não existir
          setDoc(doc(db, 'apuracao', 'presidencial'), APURACAO_PRESIDENCIAL_INICIAL).catch(() => {});
        }
      },
      (err) => {
        // Fallback gracioso se offline
        console.warn('Firestore offline ou em fallback para apuração presidencial:', err);
      }
    );

    const unsubRN = onSnapshot(
      doc(db, 'apuracao', 'rn_natal'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ApuracaoEleicaoData;
          if (data && data.candidatos) {
            setDadosRN(data);
          }
        } else {
          // Inicializa registro inicial no Firestore se ainda não existir
          setDoc(doc(db, 'apuracao', 'rn_natal'), APURACAO_RN_INICIAL).catch(() => {});
        }
      },
      (err) => {
        // Fallback gracioso se offline
        console.warn('Firestore offline ou em fallback para apuração RN/Natal:', err);
      }
    );

    return () => {
      unsubPres();
      unsubRN();
    };
  }, []);

  const dadosAtivos = esferaAtiva === 'presidencial' ? dadosPresidencial : dadosRN;
  const candA = dadosAtivos.candidatos[0];
  const candB = dadosAtivos.candidatos[1];
  const diferencaVotos = Math.abs(candA.votosApurados - candB.votosApurados);
  const diferencaPct = Math.abs(candA.percentual - candB.percentual).toFixed(2);

  // Simular entrada de novas urnas apuradas no Firestore em tempo real
  const handleSimularAvancoApuracao = async (candidatoIdFavorecido?: string) => {
    setIsUpdatingFirestore(true);
    const docId = esferaAtiva === 'presidencial' ? 'presidencial' : 'rn_natal';
    const dadosBase = { ...dadosAtivos };

    const novoPctUrnas = Math.min(100, Number((dadosBase.urnasApuradasPct + 0.35).toFixed(2)));
    const incrementoVotosTotal = esferaAtiva === 'presidencial' ? 420000 : 18500;
    
    // Distribuição dos novos votos
    let incA = Math.round(incrementoVotosTotal * 0.51);
    let incB = Math.round(incrementoVotosTotal * 0.49);
    if (candidatoIdFavorecido === candA.id) {
      incA = Math.round(incrementoVotosTotal * 0.65);
      incB = Math.round(incrementoVotosTotal * 0.35);
    } else if (candidatoIdFavorecido === candB.id) {
      incA = Math.round(incrementoVotosTotal * 0.35);
      incB = Math.round(incrementoVotosTotal * 0.65);
    }

    const novosVotosA = candA.votosApurados + incA;
    const novosVotosB = candB.votosApurados + incB;
    const novosValidos = novosVotosA + novosVotosB;
    const novoPctA = Number(((novosVotosA / novosValidos) * 100).toFixed(2));
    const novoPctB = Number(((novosVotosB / novosValidos) * 100).toFixed(2));

    const agoraHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const novaDataStr = `25/10/2026 às ${agoraHora}`;

    const novosCandidatos = [
      {
        ...candA,
        votosApurados: novosVotosA,
        percentual: novoPctA,
        situacao: novoPctA >= novoPctB ? ('Liderando' as const) : ('Em 2º Lugar' as const),
        vantagemVotos: Math.abs(novosVotosA - novosVotosB),
      },
      {
        ...candB,
        votosApurados: novosVotosB,
        percentual: novoPctB,
        situacao: novoPctB > novoPctA ? ('Liderando' as const) : ('Em 2º Lugar' as const),
      },
    ];

    const novosDados: ApuracaoEleicaoData = {
      ...dadosBase,
      timestamp: Date.now(),
      ultimaAtualizacao: novaDataStr,
      urnasApuradasPct: novoPctUrnas,
      totalVotosApurados: dadosBase.totalVotosApurados + incrementoVotosTotal,
      votosValidos: novosValidos,
      candidatos: novosCandidatos,
    };

    if (esferaAtiva === 'presidencial') {
      setDadosPresidencial(novosDados);
    } else {
      setDadosRN(novosDados);
    }

    try {
      await updateDoc(doc(db, 'apuracao', docId), {
        timestamp: novosDados.timestamp,
        ultimaAtualizacao: novosDados.ultimaAtualizacao,
        urnasApuradasPct: novosDados.urnasApuradasPct,
        totalVotosApurados: novosDados.totalVotosApurados,
        votosValidos: novosDados.votosValidos,
        candidatos: novosDados.candidatos,
      });
    } catch {
      // Ignora offline se local já atualizado
    } finally {
      setIsUpdatingFirestore(false);
    }
  };

  // Narração de áudio do boletim de apuração em tempo real
  const handleOuvirBoletimApuracao = () => {
    if (ttsState.status === 'playing') {
      stopTTSPlayback();
      return;
    }

    const textoBoletim =
      esferaAtiva === 'presidencial'
        ? `Boletim Oficial de Apuração para Presidente da República, segundo turno de 2026. Com ${dadosAtivos.urnasApuradasPct}% das urnas apuradas no Brasil: ${candA.nomeUrna}, do ${candA.siglaPartido}, lidera com ${candA.percentual}% dos votos válidos, totalizando ${candA.votosApurados.toLocaleString('pt-BR')} votos. Em segundo lugar, ${candB.nomeUrna}, do ${candB.siglaPartido}, com ${candB.percentual}%, somando ${candB.votosApurados.toLocaleString('pt-BR')} votos. Diferença atual de ${diferencaVotos.toLocaleString('pt-BR')} votos válidos. Dados sincronizados em tempo real via Tribunal Superior Eleitoral e Firestore.`
        : `Boletim Oficial de Apuração para o Governo do Rio Grande do Norte e Zonas de Natal, segundo turno de 2026. Com ${dadosAtivos.urnasApuradasPct}% das urnas apuradas: ${candA.nomeUrna}, do ${candA.siglaPartido}, lidera com ${candA.percentual}% dos votos válidos, somando ${candA.votosApurados.toLocaleString('pt-BR')} votos. Em segundo lugar, ${candB.nomeUrna}, do ${candB.siglaPartido}, com ${candB.percentual}%, totalizando ${candB.votosApurados.toLocaleString('pt-BR')} votos. Em Natal, a apuração nas cinco zonas eleitorais registra forte participação popular em bairros como Mãe Luíza, Ponta Negra e Zona Norte. Dados atualizados em tempo real.`;

    speakWithPotiguarTTS(textoBoletim, `boletim-apuracao-${esferaAtiva}`);
  };

  return (
    <section
      id="apuracao-ao-vivo"
      aria-label="Apuração de Votos em Tempo Real"
      className="card-clean p-4 sm:p-7 space-y-6 rounded-2xl sm:rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-[var(--card-bg)] via-[var(--surface-subtle)] to-[var(--card-bg)] overflow-hidden shadow-lg"
    >
      {/* Top Banner: Status TSE em Tempo Real + Indicador de Pulso */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider animate-pulse">
              <Radio className="w-3.5 h-3.5 text-rose-600 animate-spin" />
              🔴 Apuração de Votos ao Vivo (2º Turno 2026)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Totalização Oficial TSE / TRE-RN
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Atualizado: {dadosAtivos.ultimaAtualizacao}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] tracking-tight flex items-center gap-2">
            <Vote className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{dadosAtivos.titulo}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            {dadosAtivos.subtitulo}
          </p>
        </div>

        {/* Alternador de Esferas: Brasil (Presidente) x Natal & RN (Governo) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEsferaAtiva('presidencial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                esferaAtiva === 'presidencial'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>🇧🇷 Presidente (Brasil)</span>
            </button>

            <button
              type="button"
              onClick={() => setEsferaAtiva('rn_natal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                esferaAtiva === 'rn_natal'
                  ? 'bg-[#00875a] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>☀️ Natal &amp; RN (Governo)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOuvirBoletimApuracao}
            className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {ttsState.status === 'playing' ? (
              <>
                <Square className="w-3.5 h-3.5 text-rose-500 fill-current" />
                <span>Pausar Áudio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ouvir Apuração</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Régua de Totalização de Urnas (% Apurado pelo TSE) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Progresso da Totalização
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs">
              {dadosAtivos.urnasApuradasPct}% apurado
            </span>
          </div>

          <div className="text-xs text-[var(--text-muted)] font-tabular">
            Secções: <strong>{dadosAtivos.secoesTotalizadas.toLocaleString('pt-BR')}</strong> de {dadosAtivos.totalSecoes.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Barra de Progresso das Urnas */}
        <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-[var(--border-color)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 transition-all duration-700 relative"
            style={{ width: `${dadosAtivos.urnasApuradasPct}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Indicadores complementares (Válidos, Brancos, Nulos, Abstenção) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] block">Votos Válidos:</span>
            <strong className="text-[var(--text-color)] font-tabular">
              {dadosAtivos.votosValidos.toLocaleString('pt-BR')} ({dadosAtivos.votosValidosPct}%)
            </strong>
          </div>
          <div className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] block">Brancos:</span>
            <strong className="text-[var(--text-color)] font-tabular">
              {dadosAtivos.votosBrancos.toLocaleString('pt-BR')} ({dadosAtivos.votosBrancosPct}%)
            </strong>
          </div>
          <div className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] block">Nulos:</span>
            <strong className="text-[var(--text-color)] font-tabular">
              {dadosAtivos.votosNulos.toLocaleString('pt-BR')} ({dadosAtivos.votosNulosPct}%)
            </strong>
          </div>
          <div className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] block">Abstenção:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-tabular">
              {dadosAtivos.abstencaoPct}%
            </strong>
          </div>
        </div>
      </div>

      {/* Placar dos Candidatos em Disputa (Cards Grandes com Comparativo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {dadosAtivos.candidatos.map((cand, idx) => {
          const isLider = cand.percentual >= (dadosAtivos.candidatos[1 - idx]?.percentual ?? 0);
          const hasImgError = imgErrors[cand.id];

          return (
            <article
              key={cand.id}
              className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all space-y-4 relative overflow-hidden ${
                isLider
                  ? 'border-emerald-500 bg-gradient-to-b from-emerald-500/5 to-transparent shadow-md'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)]'
              }`}
            >
              {/* Badge de Posição / Liderança */}
              <div className="flex items-center justify-between">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: cand.corTema }}
                >
                  Nº {cand.numero} · {cand.siglaPartido}
                </span>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isLider
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isLider ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  {cand.situacao}
                </span>
              </div>

              {/* Foto, Nome e Partido */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-[var(--border-color)] shrink-0 shadow">
                  {!hasImgError && cand.fotoUrl ? (
                    <img
                      src={cand.fotoUrl}
                      alt={cand.nomeUrna}
                      className="w-full h-full object-cover"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [cand.id]: true }))
                      }
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-black text-xl text-white"
                      style={{ backgroundColor: cand.corTema }}
                    >
                      {cand.nomeUrna.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-color)] leading-tight truncate">
                    {cand.nomeUrna}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">{cand.nome}</p>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
                    {cand.partido}
                  </span>
                </div>
              </div>

              {/* Grande Número de Percentual e Votos */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-baseline justify-between">
                  <div
                    className="text-3xl sm:text-4xl font-black font-tabular tracking-tight"
                    style={{ color: cand.corTema }}
                  >
                    {cand.percentual.toFixed(2)}%
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-bold text-[var(--text-color)] font-tabular block">
                      {cand.votosApurados.toLocaleString('pt-BR')} votos
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">Votos válidos</span>
                  </div>
                </div>

                {/* Barra do candidato */}
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cand.percentual}%`,
                      backgroundColor: cand.corTema,
                    }}
                  />
                </div>
              </div>

              {/* Botão para simular votos na apuração */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {cand.vantagemVotos && isLider ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      +{cand.vantagemVotos.toLocaleString('pt-BR')} votos de vantagem
                    </span>
                  ) : (
                    <span>Aguardando novas urnas</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => handleSimularAvancoApuracao(cand.id)}
                  disabled={isUpdatingFirestore}
                  className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] hover:bg-gray-200 dark:hover:bg-slate-800 text-[10px] font-bold text-[var(--text-color)] cursor-pointer inline-flex items-center gap-1 active:scale-95 transition-all"
                  title="Simular novas urnas contabilizadas para este candidato"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>+ Urnas ({cand.siglaPartido})</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Painel Específico: Votação por Regiões (Presidência) OU Zonas de Natal (Governo RN) */}
      {esferaAtiva === 'presidencial' && dadosPresidencial.votosPorRegiao && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Desempenho da Apuração por Região do Brasil &amp; Estado do RN</span>
            </h4>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Nordeste · Sudeste · Sul · Norte · CO · RN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dadosPresidencial.votosPorRegiao.map((reg) => (
              <div
                key={reg.regiao}
                className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-color)]">
                  <span>{reg.regiao}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {reg.totalVotos.toLocaleString('pt-BR')} votos
                  </span>
                </div>

                {/* Mini Barra Comparativa */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-tabular">
                    <span className="text-rose-600 font-bold">Lula: {reg.candidatoAVotosPct}%</span>
                    <span className="text-blue-600 font-bold">Flávio: {reg.candidatoBVotosPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-rose-600 h-full transition-all"
                      style={{ width: `${reg.candidatoAVotosPct}%` }}
                    />
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{ width: `${reg.candidatoBVotosPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {esferaAtiva === 'rn_natal' && dadosRN.zonasNatal && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Apuração nas Zonas Eleitorais de Natal (Bairros da Capital)</span>
              </h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                Resultado apurado nas urnas eletrônicas das 5 Zonas Eleitorais de Natal e seus respectivos bairros.
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
              TRE-RN / Natal Oficial
            </span>
          </div>

          <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)]">
                  <th className="py-2.5 px-3 font-bold">Zona Eleitoral</th>
                  <th className="py-2.5 px-3 font-bold">Bairros Atendidos</th>
                  <th className="py-2.5 px-3 font-bold text-center">Urnas Apuradas</th>
                  <th className="py-2.5 px-3 font-bold text-blue-600 text-center">Allyson (44)</th>
                  <th className="py-2.5 px-3 font-bold text-rose-600 text-center">Cadu (13)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Liderança na Zona</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {dadosRN.zonasNatal.map((zona) => (
                  <tr key={zona.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[var(--text-color)] whitespace-nowrap">
                      {zona.zona}
                      <span className="block text-[10px] text-[var(--text-muted)] font-normal">
                        {zona.regiao}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)] max-w-xs truncate">
                      {zona.bairrosReferencia}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {zona.percentualApurado}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600 font-tabular">
                      {zona.votosAllyson.toLocaleString('pt-BR')} ({zona.percentualAllyson}%)
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-600 font-tabular">
                      {zona.votosCadu.toLocaleString('pt-BR')} ({zona.percentualCadu}%)
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {zona.lider}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Controles de Ação, Simulação e Consulta via PotiguarBot IA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSimularAvancoApuracao()}
            disabled={isUpdatingFirestore}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingFirestore ? 'animate-spin' : ''}`} />
            <span>Atualizar Totalização de Votos (+Urnas)</span>
          </button>

          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
            Sincronizado automaticamente via Firestore Live
          </span>
        </div>

        {onAskAgent && (
          <button
            type="button"
            onClick={() =>
              onAskAgent(
                `Faça uma análise detalhada da apuração de votos em tempo real das Eleições 2026: (1) Na Presidência da República (${candA.nomeUrna} com ${candA.percentual}% vs ${candB.nomeUrna} com ${candB.percentual}%, com ${dadosAtivos.urnasApuradasPct}% apurado); (2) No Governo do RN e em Natal (${dadosRN.candidatos[0].nomeUrna} com ${dadosRN.candidatos[0].percentual}% vs ${dadosRN.candidatos[1].nomeUrna} com ${dadosRN.candidatos[1].percentual}%). Quais zonas de Natal e regiões estão definindo o resultado?`
              )
            }
            className="px-3.5 py-2 rounded-xl border border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--card-bg)] hover:bg-emerald-500/10 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Análise da Apuração com PotiguarBot IA</span>
          </button>
        )}
      </div>
    </section>
  );
};
