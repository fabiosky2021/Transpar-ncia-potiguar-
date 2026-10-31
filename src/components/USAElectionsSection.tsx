import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe2,
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
  ShieldCheck,
  Flame,
  Clock,
  Layers,
  MapPin,
  Vote,
  Share2,
  Check,
  Scale,
  DollarSign,
  Briefcase,
  Sliders,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import {
  USAElectionsData,
  INITIAL_USA_ELECTIONS_DATA,
  SwingState,
  PolicyBattleground,
} from '../data/usaElectionsData';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import {
  speakWithPotiguarTTS,
  stopTTSPlayback,
  subscribeTTSState,
  TTSStateSnapshot,
  voiceConfig,
} from '../services/ttsService';

interface USAElectionsSectionProps {
  onAskAgent?: (prompt: string) => void;
  onOpenStorefront?: () => void;
}

export const USAElectionsSection: React.FC<USAElectionsSectionProps> = ({
  onAskAgent,
  onOpenStorefront,
}) => {
  const [data, setData] = useState<USAElectionsData>(INITIAL_USA_ELECTIONS_DATA);
  const [activeTab, setActiveTab] = useState<'swing_states' | 'simulator' | 'propostas' | 'noticias'>('swing_states');
  const [userVote, setUserVote] = useState<string | null>(null);
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({
    'donald-trump': 14820,
    'kamala-harris': 12340,
  });
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<'all' | 'projected' | 'counting'>('all');

  // Estado interativo do Simulador de 270 Delegados (Custom State Overrides)
  const [simulatorWinners, setSimulatorWinners] = useState<Record<string, 'donald-trump' | 'kamala-harris'>>({
    pa: 'donald-trump',
    ga: 'donald-trump',
    nc: 'donald-trump',
    mi: 'donald-trump',
    az: 'donald-trump',
    wi: 'donald-trump',
    nv: 'donald-trump',
  });

  const [ttsState, setTtsState] = useState<TTSStateSnapshot>({
    activeMessageId: null,
    status: 'idle',
    errorMessage: null,
    usingFallback: false,
    speed: voiceConfig.speed,
    volume: voiceConfig.volume,
    playedMessageIds: [],
  });

  useEffect(() => {
    return subscribeTTSState(setTtsState);
  }, []);

  // Sincronização em tempo real via Firestore (/eleicoes_usa/resultado e /eleicoes_usa/enquete_comunidade)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'eleicoes_usa', 'resultado'),
      (snap) => {
        if (snap.exists()) {
          const dbData = snap.data() as USAElectionsData;
          if (dbData && dbData.candidates?.length >= 2) {
            setData(dbData);
          }
        } else {
          setDoc(doc(db, 'eleicoes_usa', 'resultado'), INITIAL_USA_ELECTIONS_DATA).catch(() => {});
        }
      },
      (err) => {
        console.warn('Firestore offline ou em fallback para eleições EUA:', err);
      }
    );

    const unsubPoll = onSnapshot(
      doc(db, 'eleicoes_usa', 'enquete_comunidade'),
      (snap) => {
        if (snap.exists()) {
          const pollData = snap.data();
          if (pollData && pollData.votes) {
            setPollVotes(pollData.votes);
          }
        }
      },
      () => {}
    );

    return () => {
      unsub();
      unsubPoll();
    };
  }, []);

  const trump = data.candidates.find((c) => c.id === 'donald-trump') || data.candidates[0];
  const harris = data.candidates.find((c) => c.id === 'kamala-harris') || data.candidates[1];

  // Cálculo dinâmico do simulador
  const { simTrumpVotes, simHarrisVotes } = useMemo(() => {
    // Base de votos seguros tradicionais (sem os 7 swing states que somam 93 delegados)
    // 538 total - 93 swing = 445 delegados base
    // Trump base tradicional: 219 delegados seguros
    // Harris base tradicional: 226 delegados seguros
    let trumpSum = 219;
    let harrisSum = 226;

    data.swingStates.forEach((st) => {
      const winner = simulatorWinners[st.id] || (st.winnerId === 'donald-trump' ? 'donald-trump' : 'kamala-harris');
      if (winner === 'donald-trump') {
        trumpSum += st.electoralVotes;
      } else {
        harrisSum += st.electoralVotes;
      }
    });

    return { simTrumpVotes: trumpSum, simHarrisVotes: harrisSum };
  }, [data.swingStates, simulatorWinners]);

  const totalPoll = pollVotes['donald-trump'] + pollVotes['kamala-harris'];
  const trumpPollPct = Math.round((pollVotes['donald-trump'] / totalPoll) * 100);
  const harrisPollPct = 100 - trumpPollPct;

  const handleVotePoll = async (candidateId: string) => {
    if (userVote) return;
    setUserVote(candidateId);
    const updated = {
      ...pollVotes,
      [candidateId]: (pollVotes[candidateId] || 0) + 1,
    };
    setPollVotes(updated);

    try {
      await updateDoc(doc(db, 'eleicoes_usa', 'enquete_comunidade'), {
        votes: updated,
        lastVoteAt: Date.now(),
      });
    } catch {
      // offline fallback
    }
  };

  const handleToggleAudioBriefing = () => {
    const audioId = 'usa-presidential-audio-briefing';
    if (ttsState.activeMessageId === audioId && ttsState.status === 'playing') {
      stopTTSPlayback();
    } else {
      const speechText = `Plantão Especial da Eleição Presidencial dos Estados Unidos. Meta de 270 delegados no Colégio Eleitoral. Donald Trump atinge 312 delegados projetados, superando os 270 necessários, com 50 vírgula 1 por cento do voto popular. Kamala Harris soma 226 delegados com 48 vírgula 4 por cento dos votos. A vitória nos sete estados pêndulo, incluindo Pensilvânia, Geórgia, Carolina do Norte, Michigan, Wisconsin, Arizona e Nevada definiu a corrida à Casa Branca. Acompanhe as análises sobre tarifas, cotação do dólar e os desdobramentos globais em nosso estúdio multimídia.`;
      speakWithPotiguarTTS(speechText, audioId);
    }
  };

  const handleShareSummary = () => {
    const shareText = `🇺🇸 ELEIÇÕES PRESIDENCIAIS DOS EUA · APURAÇÃO EM TEMPO REAL\n\nDonald Trump: ${trump.electoralVotes} delegados (${trump.popularVotePct}% voto popular)\nKamala Harris: ${harris.electoralVotes} delegados (${harris.popularVotePct}% voto popular)\n\nMeta Constitucional: 270 Delegados de 538\n\nAcompanhe o simulador e checagem de fatos ao vivo:\nhttps://collshp.com/fabiokaua692287?view=storefront`;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const filteredSwingStates = data.swingStates.filter((st) => {
    if (selectedStateFilter === 'projected') return st.status === 'projected';
    if (selectedStateFilter === 'counting') return st.status === 'counting';
    return true;
  });

  // Dados para Recharts dos 7 swing states
  const chartSwingStatesData = useMemo(() => {
    return data.swingStates.map((st) => ({
      name: st.name.split(' ')[0],
      code: st.code,
      Trump: st.votesTrump,
      Harris: st.votesHarris,
      delegados: st.electoralVotes,
    }));
  }, [data.swingStates]);

  return (
    <section
      id="eleicoes-eua"
      aria-label="Apuração das Eleições Presidenciais dos EUA"
      className="card-clean p-4 sm:p-7 space-y-6 sm:space-y-8 border-2 border-red-600/40 bg-gradient-to-b from-slate-950 via-[var(--card-bg)] to-[var(--card-bg)] shadow-2xl relative overflow-hidden"
    >
      {/* Faixa Superior Oficial Americana com Estrelas */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-white to-blue-600 shadow-sm" />

      {/* CABEÇALHO DO MONITOR CENTRAL USA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5 pt-1">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-sm animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              White House Live 2024–2028
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-semibold">
              <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
              {data.lastUpdated}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-color)] tracking-tight">
            Corrida à Casa Branca · Eleição Presidencial dos EUA
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-3xl leading-relaxed">
            Painel central com totalização do Colégio Eleitoral (meta: <strong>270 delegados</strong>), apuração dos 7 estados decisivos (swing states), simulador interativo e impactos na economia e no Brasil.
          </p>
        </div>

        {/* Botões de Ação do Header */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleToggleAudioBriefing}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all border shadow-sm ${
              ttsState.status === 'playing'
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border-[var(--border-color)] hover:border-red-400'
            }`}
          >
            {ttsState.status === 'playing' ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Pausar Locução</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-red-500" />
                <span>Ouvir Boletim (Áudio)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareSummary}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[var(--surface-subtle)] hover:bg-red-500/10 text-[var(--text-color)] border border-[var(--border-color)] inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-red-500" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PLACAR GIGANTE DO COLÉGIO ELEITORAL (TRUMP 312 x HARRIS 226) */}
      <div className="p-4 sm:p-7 rounded-3xl bg-[var(--surface-subtle)] border-2 border-[var(--border-color)] space-y-6 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 uppercase tracking-wider text-xs">
            <Landmark className="w-4 h-4" />
            Total de 538 Delegados · Vence quem alcançar 270
          </span>
          <span className="font-mono text-xs bg-[var(--card-bg)] px-3 py-1 rounded-xl border border-[var(--border-color)] text-[var(--text-color)]">
            Urnas Apuradas: {data.totalReportedPct}% em todo o território americano
          </span>
        </div>

        {/* Cards Lado a Lado dos Candidatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Donald Trump */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-red-600/20 via-[var(--card-bg)] to-[var(--card-bg)] border-2 border-red-600/50 space-y-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-500 shrink-0 bg-red-950/60 shadow-md">
                  <img
                    src={trump.avatarUrl}
                    alt={trump.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white tracking-wider">
                    {trump.partyAbbr} · Republicano
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] mt-1">
                    {trump.name}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Vice-Presidente: <strong className="text-[var(--text-color)]">{trump.runningMate}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-4xl sm:text-5xl font-black font-mono text-red-600 dark:text-red-400 tracking-tight">
                  {trump.electoralVotes}
                </div>
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Delegados
                </div>
              </div>
            </div>

            {/* Voto Popular e Status */}
            <div className="pt-3 border-t border-red-500/20 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                Voto Popular: <strong className="text-[var(--text-color)]">{trump.popularVotes.toLocaleString('pt-BR')}</strong> ({trump.popularVotePct.toFixed(1).replace('.', ',')}%)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[11px] shadow-sm">
                ✓ Projeção Eleito (+42 além da meta)
              </span>
            </div>
          </div>

          {/* Kamala Harris */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 via-[var(--card-bg)] to-[var(--card-bg)] border-2 border-blue-600/50 space-y-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-500 shrink-0 bg-blue-950/60 shadow-md">
                  <img
                    src={harris.avatarUrl}
                    alt={harris.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-600 text-white tracking-wider">
                    {harris.partyAbbr} · Democrata
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] mt-1">
                    {harris.name}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Vice-Presidente: <strong className="text-[var(--text-color)]">{harris.runningMate}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-4xl sm:text-5xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-tight">
                  {harris.electoralVotes}
                </div>
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Delegados
                </div>
              </div>
            </div>

            {/* Voto Popular e Status */}
            <div className="pt-3 border-t border-blue-500/20 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                Voto Popular: <strong className="text-[var(--text-color)]">{harris.popularVotes.toLocaleString('pt-BR')}</strong> ({harris.popularVotePct.toFixed(1).replace('.', ',')}%)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-bold text-[11px]">
                2º Lugar no Colégio Eleitoral
              </span>
            </div>
          </div>
        </div>

        {/* BARRA VISUAL DE DELEGADOS COM MARCADOR DOS 270 */}
        <div className="space-y-2">
          <div className="relative w-full h-9 rounded-2xl overflow-hidden bg-slate-900 flex shadow-inner border border-slate-700">
            {/* Bloco Trump */}
            <div
              className="h-full bg-gradient-to-r from-red-700 to-rose-600 text-white font-black text-sm flex items-center justify-start pl-4 transition-all duration-700 font-mono"
              style={{ width: `${(trump.electoralVotes / 538) * 100}%` }}
            >
              Trump: {trump.electoralVotes}
            </div>

            {/* Marcador dos 270 votos (50,18% de 538) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-10 shadow-[0_0_12px_rgba(250,204,21,1)]"
              style={{ left: `${(270 / 538) * 100}%` }}
            />

            {/* Bloco Harris */}
            <div
              className="h-full bg-gradient-to-l from-blue-700 to-indigo-600 text-white font-black text-sm flex items-center justify-end pr-4 transition-all duration-700 ml-auto font-mono"
              style={{ width: `${(harris.electoralVotes / 538) * 100}%` }}
            >
              Harris: {harris.electoralVotes}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono font-bold px-1">
            <span className="text-red-500">🔴 Trump ({((trump.electoralVotes / 538) * 100).toFixed(1)}%)</span>
            <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/30">
              ▲ 270 Delegados para Vitória
            </span>
            <span className="text-blue-500">🔵 Harris ({((harris.electoralVotes / 538) * 100).toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA SEÇÃO USA */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-color)] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('swing_states')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'swing_states'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Os 7 Swing States (Estados-Pêndulo)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Simulador 270 Delegados</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('propostas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'propostas'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Tarifas, Dólar &amp; Impacto no Brasil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('noticias')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'noticias'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Plantão Washington 24h</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: OS 7 SWING STATES */}
      {activeTab === 'swing_states' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Os 7 Estados-Pêndulo (Battleground States) que Decidiram a Eleição
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Nos EUA, o vencedor em cada estado leva todos os seus delegados (sistema <em>Winner-Take-All</em>).
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedStateFilter('all')}
                className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
                  selectedStateFilter === 'all'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
                }`}
              >
                Todos (7)
              </button>
              <button
                type="button"
                onClick={() => setSelectedStateFilter('projected')}
                className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
                  selectedStateFilter === 'projected'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
                }`}
              >
                Definidos
              </button>
            </div>
          </div>

          {/* Grid dos Swing States */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredSwingStates.map((st) => {
              const isTrump = st.winnerId === 'donald-trump';
              const totalStVotes = st.votesTrump + st.votesHarris;
              const trumpPct = ((st.votesTrump / totalStVotes) * 100).toFixed(1);
              const harrisPct = ((st.votesHarris / totalStVotes) * 100).toFixed(1);

              return (
                <div
                  key={st.id}
                  className={`p-4 rounded-2xl border-2 ${
                    isTrump ? 'border-red-500/50 bg-red-500/5' : 'border-blue-500/50 bg-blue-500/5'
                  } space-y-3 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[var(--text-color)] mr-1.5">
                        {st.code}
                      </span>
                      <strong className="text-base font-bold text-[var(--text-color)]">
                        {st.name}
                      </strong>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-black font-mono shadow-sm">
                      {st.electoralVotes} delegados
                    </span>
                  </div>

                  {/* Detalhes de apuração */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Apurado: {st.reportedPct}%</span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        +{st.leaderMarginPct}% para Trump
                      </span>
                    </div>

                    {/* Barrinha comparativa por estado */}
                    <div className="w-full h-3 rounded-full overflow-hidden bg-slate-800 flex shadow-inner">
                      <div
                        className="h-full bg-red-600 flex items-center justify-start pl-1 text-[9px] text-white font-mono"
                        style={{ width: `${trumpPct}%` }}
                      >
                        {trumpPct}%
                      </div>
                      <div
                        className="h-full bg-blue-600 flex items-center justify-end pr-1 text-[9px] text-white font-mono"
                        style={{ width: `${harrisPct}%` }}
                      >
                        {harrisPct}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-0.5 font-mono">
                      <span>Trump: {(st.votesTrump).toLocaleString('pt-BR')}</span>
                      <span>Harris: {(st.votesHarris).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Condados Chave */}
                  <div className="p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]/60 text-[11px] text-[var(--text-muted)] space-y-0.5">
                    <span className="font-bold text-[var(--text-color)] block">Condados Críticos:</span>
                    <p className="line-clamp-2">{st.keyCounties}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
                    <span>Vencedor: Donald Trump</span>
                    <CheckCircle2 className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico Comparativo Horizontal dos Swing States */}
          <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-color)]">
              Comparativo de Votos Válidos nos 7 Estados Decisivos
            </h4>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSwingStatesData}>
                  <XAxis dataKey="code" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} votos`, '']}
                  />
                  <Bar dataKey="Trump" fill="#dc2626" name="Trump (Republicano)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Harris" fill="#2563eb" name="Harris (Democrata)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: SIMULADOR INTERATIVO 270 DELEGADOS */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-red-950/20 via-[var(--surface-subtle)] to-blue-950/20 border-2 border-indigo-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                  Simulador 270 to Win Interativo
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                  Altere os vencedores dos estados e calcule o novo presidente
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Clique nos botões de cada estado para alternar a vitória entre Trump e Harris e observe a barra recalcular em tempo real.
                </p>
              </div>

              {/* Placar do Simulador */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center p-3 rounded-xl bg-red-600/20 border border-red-500 text-red-600 dark:text-red-400 min-w-24">
                  <span className="text-[10px] font-bold uppercase block">Trump Simulado</span>
                  <strong className="text-2xl font-black font-mono">{simTrumpVotes}</strong>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-600/20 border border-blue-500 text-blue-600 dark:text-blue-400 min-w-24">
                  <span className="text-[10px] font-bold uppercase block">Harris Simulada</span>
                  <strong className="text-2xl font-black font-mono">{simHarrisVotes}</strong>
                </div>
              </div>
            </div>

            {/* Barra do Simulador */}
            <div className="relative w-full h-8 rounded-xl overflow-hidden bg-slate-900 flex shadow-inner">
              <div
                className="h-full bg-red-600 flex items-center justify-start pl-3 text-white font-mono font-bold text-xs transition-all duration-300"
                style={{ width: `${(simTrumpVotes / 538) * 100}%` }}
              >
                {simTrumpVotes} {simTrumpVotes >= 270 ? '🏆 Venceu!' : ''}
              </div>
              <div
                className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-10"
                style={{ left: `${(270 / 538) * 100}%` }}
              />
              <div
                className="h-full bg-blue-600 flex items-center justify-end pr-3 text-white font-mono font-bold text-xs transition-all duration-300 ml-auto"
                style={{ width: `${(simHarrisVotes / 538) * 100}%` }}
              >
                {simHarrisVotes >= 270 ? '🏆 Venceu!' : ''} {simHarrisVotes}
              </div>
            </div>

            {/* Controles do Simulador para cada estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {data.swingStates.map((st) => {
                const currentWinner = simulatorWinners[st.id] || 'donald-trump';

                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[var(--text-color)]">
                        {st.name} ({st.code})
                      </span>
                      <span className="text-xs font-mono font-black text-amber-500">
                        {st.electoralVotes} votos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSimulatorWinners((prev) => ({ ...prev, [st.id]: 'donald-trump' }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          currentWinner === 'donald-trump'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-red-500'
                        }`}
                      >
                        Trump (R)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSimulatorWinners((prev) => ({ ...prev, [st.id]: 'kamala-harris' }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          currentWinner === 'kamala-harris'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-blue-500'
                        }`}
                      >
                        Harris (D)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: COMPARADOR DE PROPOSTAS & IMPACTOS NO BRASIL */}
      {activeTab === 'propostas' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)]">
              Pilares Econômicos &amp; Consequências para o Brasil
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Análise comparativa das diretrizes de governo de Donald Trump versus Kamala Harris e reflexos no agronegócio, comércio exterior e câmbio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.policyBattlegrounds.map((policy) => (
              <div
                key={policy.id}
                className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3.5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 font-bold">
                    <Scale className="w-4 h-4" />
                  </span>
                  <h4 className="font-bold text-base text-[var(--text-color)]">
                    {policy.pillar}
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-600 text-[var(--text-color)]">
                    <strong className="text-red-600 dark:text-red-400 block mb-0.5">Donald Trump (Republicano):</strong>
                    {policy.trumpStance}
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border-l-4 border-blue-600 text-[var(--text-color)]">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-0.5">Kamala Harris (Democrata):</strong>
                    {policy.harrisStance}
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border-l-4 border-emerald-600 text-[var(--text-color)]">
                    <strong className="text-emerald-700 dark:text-emerald-300 block mb-0.5">Impacto no Brasil &amp; Câmbio:</strong>
                    {policy.impactOnBrazil}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 4: PLANTÃO WASHINGTON 24H */}
      {activeTab === 'noticias' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              Plantão de Notícias em Tempo Real de Washington
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Despachos verificados de agências internacionais (AP, Reuters, Bloomberg e The Washington Post).
            </p>
          </div>

          <div className="space-y-3">
            {data.newsTicker.map((news) => (
              <div
                key={news.id}
                className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1.5 hover:border-red-500/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-[10px] bg-red-600/10 px-2 py-0.5 rounded-full">
                    {news.urgency.toUpperCase()}
                  </span>
                  <span className="text-[var(--text-muted)] font-mono">{news.time} · {news.source}</span>
                </div>
                <h4 className="font-bold text-base text-[var(--text-color)]">
                  {news.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {news.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENQUETE INTERATIVA DA COMUNIDADE */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-red-950/30 via-[var(--surface-subtle)] to-blue-950/30 border-2 border-red-500/40 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
              <Vote className="w-4 h-4" />
              Simulação de Preferência Popular
            </div>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-color)] mt-0.5">
              Se você pudesse votar para Presidente dos EUA hoje, qual seria seu candidato?
            </h3>
          </div>

          <div className="text-xs text-[var(--text-muted)] font-mono">
            {totalPoll.toLocaleString('pt-BR')} eleitores participaram
          </div>
        </div>

        {/* Botões da Enquete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={userVote !== null}
            onClick={() => handleVotePoll('donald-trump')}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              userVote === 'donald-trump'
                ? 'border-red-500 bg-red-500/20 ring-2 ring-red-500/40 shadow-lg'
                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-red-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base text-[var(--text-color)]">
                Donald Trump (Republicano)
              </span>
              <span className="font-mono font-black text-red-600 dark:text-red-400 text-lg">
                {trumpPollPct}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${trumpPollPct}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">
              {userVote === 'donald-trump' ? '✓ Seu voto foi registrado com sucesso!' : 'Clique para votar em Donald Trump'}
            </p>
          </button>

          <button
            type="button"
            disabled={userVote !== null}
            onClick={() => handleVotePoll('kamala-harris')}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              userVote === 'kamala-harris'
                ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/40 shadow-lg'
                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-blue-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base text-[var(--text-color)]">
                Kamala Harris (Democrata)
              </span>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-lg">
                {harrisPollPct}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${harrisPollPct}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">
              {userVote === 'kamala-harris' ? '✓ Seu voto foi registrado com sucesso!' : 'Clique para votar em Kamala Harris'}
            </p>
          </button>
        </div>
      </div>

      {/* ATALHOS DE PERGUNTA RÁPIDA PARA O ESTÚDIO IA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[var(--text-color)]">
              Dúvidas sobre o Colégio Eleitoral, tarifas ou políticas da Casa Branca?
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Pergunte ao Estúdio Multimodal por texto ou microfone para obter respostas instantâneas e checadas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onAskAgent?.(
                'Como a vitória de Donald Trump afeta as tarifas de importação, o agronegócio e a cotação do dólar no Brasil?'
              )
            }
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            Impacto no Dólar &amp; Brasil 📈
          </button>
          <button
            type="button"
            onClick={() =>
              onAskAgent?.(
                'Explique didaticamente por que o Colégio Eleitoral dos EUA tem 538 votos e como os 270 delegados decidem a eleição.'
              )
            }
            className="px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-red-400 text-[var(--text-color)] text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            Como Funcionam os 270 Delegados 🗳️
          </button>
        </div>
      </div>
    </section>
  );
};
