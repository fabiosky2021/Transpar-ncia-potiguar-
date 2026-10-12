import React, { useState, useMemo } from 'react';
import {
  Heart,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Calculator,
  Filter,
  ExternalLink,
  Activity,
  Scale,
  Sparkles,
  Award,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Square,
} from 'lucide-react';
import {
  speakWithPotiguarTTS,
  stopTTSPlayback,
  subscribeTTSState,
  TTSStateSnapshot,
  voiceConfig,
} from '../services/ttsService';
import { generateAutonomousTSEFactCheck } from '../services/potiguarBotAutonomousEngine';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  PropostaTSEItem,
  EixoPlanoGoverno,
  StatusViabilidadeOrcamentaria,
  FICHAS_CANDIDATOS_2_TURNO,
  FICHAS_CANDIDATOS_PRESIDENCIA_2_TURNO,
  ATOS_TRANSICAO_GOVERNO,
  ALERTAS_ANTI_DESINFORMACAO,
  QUIZ_AFINIDADE_TSE,
  QUIZ_AFINIDADE_PRESIDENCIA_TSE,
  FeedbackComunidadeItem,
  AlertaDesinformacaoItem,
} from '../data/segundoTurnoData';

interface SegundoTurnoMonitor24hProps {
  propostas: PropostaTSEItem[];
  onLikeProposta: (propostaId: string) => Promise<void>;
  feedbacks: FeedbackComunidadeItem[];
  onSubmitFeedback: (novo: Omit<FeedbackComunidadeItem, 'id' | 'apoios' | 'horario' | 'status'>) => Promise<void>;
  onApoiarFeedback: (feedbackId: string) => Promise<void>;
  onAskAgentAnalysis: (prompt: string) => void;
}

export const SegundoTurnoMonitor24h: React.FC<SegundoTurnoMonitor24hProps> = ({
  propostas,
  onLikeProposta,
  onAskAgentAnalysis,
}) => {
  const [eixoFiltro, setEixoFiltro] = useState<'Todos' | EixoPlanoGoverno>('Todos');
  const [viabilidadeFiltro, setViabilidadeFiltro] = useState<'Todas' | StatusViabilidadeOrcamentaria>('Todas');
  const [esferaQuiz, setEsferaQuiz] = useState<'rn' | 'presidencia'>('presidencia');
  const [respostasQuiz, setRespostasQuiz] = useState<Record<string, string>>({});
  const [perguntaAtivaIdx, setPerguntaAtivaIdx] = useState<number>(0);
  const [modoQuiz, setModoQuiz] = useState<'passo-a-passo' | 'todas'>('passo-a-passo');
  const [mostrarAnaliseLocalQuiz, setMostrarAnaliseLocalQuiz] = useState<boolean>(false);
  const [ttsQuizState, setTtsQuizState] = useState<TTSStateSnapshot>({
    activeMessageId: null,
    status: 'idle',
    errorMessage: null,
    usingFallback: false,
    speed: voiceConfig.speed,
    volume: voiceConfig.volume,
    playedMessageIds: [],
  });

  React.useEffect(() => {
    return subscribeTTSState(setTtsQuizState);
  }, []);

  // Anti-Disinformation Real-Time Feed State
  const [alertasFeed, setAlertasFeed] = useState<AlertaDesinformacaoItem[]>(ALERTAS_ANTI_DESINFORMACAO);
  const [seloFiltro, setSeloFiltro] = useState<string>('Todos');
  const [inputChecagem, setInputChecagem] = useState<string>('');
  const [isChecandoTSE, setIsChecandoTSE] = useState<boolean>(false);

  // Filter proposals by Axis and Budgetary Viability
  const propostasFiltradas = useMemo(() => {
    return propostas.filter((p) => {
      const okEixo = eixoFiltro === 'Todos' || p.eixo === eixoFiltro;
      const okViab = viabilidadeFiltro === 'Todas' || p.viabilidadeOrcamentaria === viabilidadeFiltro;
      return okEixo && okViab;
    });
  }, [propostas, eixoFiltro, viabilidadeFiltro]);

  // Dynamic Chart Data comparing Popular Approval (Likes) of Proposals by Axis
  const dadosGraficoPropostas = useMemo(() => {
    const eixos: EixoPlanoGoverno[] = ['Saúde/SUS', 'Educação', 'Segurança', 'Economia'];
    return eixos.map((eixo) => {
      const likesAllyson = propostas
        .filter((p) => p.eixo === eixo && p.candidatoId === 'allyson-bezerra')
        .reduce((acc, cur) => acc + cur.likes, 0);
      const likesCadu = propostas
        .filter((p) => p.eixo === eixo && p.candidatoId === 'cadu-xavier')
        .reduce((acc, cur) => acc + cur.likes, 0);
      return {
        eixo,
        'Allyson Bezerra (União 44)': likesAllyson,
        'Cadu de Lula (PT 13)': likesCadu,
      };
    });
  }, [propostas]);

  const totalLikesPropostas = useMemo(
    () => propostas.reduce((acc, p) => acc + p.likes, 0),
    [propostas]
  );

  const listaPerguntasQuiz =
    esferaQuiz === 'presidencia' ? QUIZ_AFINIDADE_PRESIDENCIA_TSE : QUIZ_AFINIDADE_TSE;
  const fichasAtuaisQuiz =
    esferaQuiz === 'presidencia' ? FICHAS_CANDIDATOS_PRESIDENCIA_2_TURNO : FICHAS_CANDIDATOS_2_TURNO;
  const candIdA = esferaQuiz === 'presidencia' ? 'lula-13' : 'allyson-bezerra';
  const candIdB = esferaQuiz === 'presidencia' ? 'flavio-bolsonaro-22' : 'cadu-xavier';

  // 5-Question Interactive Electoral Affinity Calculator Metrics (Presidência do Brasil ou Governo do RN)
  const resultadoAfinidade = useMemo(() => {
    const totalPerguntas = listaPerguntasQuiz.length; // 5 questions
    const valores = listaPerguntasQuiz
      .map((q) => respostasQuiz[q.id])
      .filter(Boolean);
    const totalRespondidas = valores.length;
    if (totalRespondidas === 0) {
      return {
        totalPerguntas,
        totalRespondidas: 0,
        pctA: 50,
        pctB: 50,
        contA: 0,
        contB: 0,
        candidatoMaiorAfinidade: null,
        temasAlinhados: [] as string[],
      };
    }
    const contA = valores.filter((v) => v === candIdA).length;
    const contB = valores.filter((v) => v === candIdB).length;
    const pctA = Math.round((contA / totalRespondidas) * 100);
    const pctB = 100 - pctA;

    const vencedorId = contA > contB ? candIdA : contB > contA ? candIdB : null;

    const candidatoMaiorAfinidade = vencedorId
      ? fichasAtuaisQuiz.find((c) => c.id === vencedorId) || null
      : null;

    const temasAlinhados = listaPerguntasQuiz
      .filter((q) => respostasQuiz[q.id] === (vencedorId || candIdA))
      .map((q) => q.temaCurto);

    return {
      totalPerguntas,
      totalRespondidas,
      pctA,
      pctB,
      contA,
      contB,
      candidatoMaiorAfinidade,
      temasAlinhados,
    };
  }, [respostasQuiz, listaPerguntasQuiz, fichasAtuaisQuiz, candIdA, candIdB]);

  const alertasFiltrados = useMemo(() => {
    if (seloFiltro === 'Todos') return alertasFeed;
    return alertasFeed.filter((a) => a.seloVerificacao === seloFiltro);
  }, [alertasFeed, seloFiltro]);

  const executarChecagemTempoRealTSE = async (textoCustom?: string) => {
    const consulta = (textoCustom ?? inputChecagem).trim();
    if (!consulta || isChecandoTSE) return;
    setIsChecandoTSE(true);
    try {
      const response = await fetch('/api/fact-check-tse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ falaOuTema: consulta }),
      });
      if (!response.ok) throw new Error('Ativar motor autônomo TSE');
      const data = await response.json();
      if (data?.alerta) {
        setAlertasFeed((prev) => [data.alerta, ...prev]);
        setSeloFiltro('Todos');
        if (!textoCustom) setInputChecagem('');
      } else {
        throw new Error('Sem alerta retornado');
      }
    } catch {
      const fallbackCard = generateAutonomousTSEFactCheck(consulta);
      setAlertasFeed((prev) => [fallbackCard, ...prev]);
      setSeloFiltro('Todos');
      if (!textoCustom) setInputChecagem('');
    } finally {
      setIsChecandoTSE(false);
    }
  };

  return (
    <div id="monitoramento-24h" className="space-y-12">
      {/* BLOCO 1: Agente de Monitoramento Eleitoral 24h (DivulgaCandContas TSE - Planos de Governo 2º Turno) */}
      <section className="card-clean p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-color)]">
              <Activity className="w-4 h-4" />
              <span>Agente de Monitoramento Eleitoral 24h · Atualização Terça-Feira (2º Turno)</span>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text-color)]">
              Planos de Governo DivulgaCandContas TSE & Aprovação Popular das Propostas
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Curta as propostas individuais (Saúde/SUS, Educação, Segurança e Economia) para atualizar o gráfico comparativo em tempo real até o dia da votação.
            </p>
          </div>

          <div className="text-xs font-tabular bg-[var(--surface-subtle)] border border-[var(--border-color)] px-4 py-2.5 rounded-lg shrink-0">
            <div className="text-[var(--text-muted)]">Aprovação Acumulada nas Propostas:</div>
            <div className="text-base font-semibold text-[var(--success-color)]">
              {totalLikesPropostas.toLocaleString('pt-BR')} likes contabilizados em tempo real
            </div>
          </div>
        </div>

        {/* Gráfico Público Comparativo Dinâmico de Aprovação Popular das Propostas por Eixo */}
        <div className="subcard-clean p-5 sm:p-6 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-color)]">
                Gráfico Público Comparativo de Aprovação das Propostas (Tempo Real)
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Comparação dinâmica de likes por eixo temático (Saúde/SUS, Educação, Segurança e Economia)
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--success-color)]">
              ● Sincronizado com Firestore
            </span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoPropostas} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="eixo" tick={{ fontSize: 12, fill: 'var(--text-color)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Allyson Bezerra (União 44)" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cadu de Lula (PT 13)" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filtros de Eixo e Filtro de Viabilidade Orçamentária */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--text-muted)] mr-1 inline-flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Eixo TSE:
            </span>
            {(['Todos', 'Saúde/SUS', 'Educação', 'Segurança', 'Economia'] as const).map((eixo) => (
              <button
                key={eixo}
                type="button"
                onClick={() => setEixoFiltro(eixo)}
                className={`botao px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  eixoFiltro === eixo
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border border-[var(--border-color)]'
                }`}
              >
                {eixo}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--text-muted)] mr-1">
              Filtro de Viabilidade Orçamentária:
            </span>
            {(
              [
                'Todas',
                'Previsão Orçamentária (LOA/PPA)',
                'Exige Reformas / Convênio Federal',
              ] as const
            ).map((viab) => (
              <button
                key={viab}
                type="button"
                onClick={() => setViabilidadeFiltro(viab)}
                className={`botao px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  viabilidadeFiltro === viab
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border border-[var(--border-color)]'
                }`}
              >
                {viab}
              </button>
            ))}
          </div>
        </div>

        {/* Cards de Propostas Individuais com Contabilização de Likes e Etiqueta de Viabilidade Orçamentária */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {propostasFiltradas.map((prop) => {
            const isPrevisaoDireta =
              prop.viabilidadeOrcamentaria === 'Previsão Orçamentária (LOA/PPA)';

            return (
              <article
                key={prop.id}
                className="subcard-clean p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[var(--accent-color)]">
                      Eixo: {prop.eixo} · {prop.candidatoNome} ({prop.partido})
                    </span>
                    <span
                      className={`font-semibold ${
                        isPrevisaoDireta
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      ● {prop.viabilidadeOrcamentaria}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-[var(--text-color)]">
                    {prop.titulo}
                  </h4>

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {prop.descricao}
                  </p>

                  <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
                    <strong>Coerência & Execução:</strong> {prop.execucaoTransicao}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onLikeProposta(prop.id)}
                    className="botao px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>
                      Apoiar Proposta (<span className="font-tabular">{prop.likes.toLocaleString('pt-BR')}</span> likes)
                    </span>
                  </button>

                  <span className="text-[11px] text-[var(--text-muted)]">
                    Pressione para aprovar (fica verde ao clicar)
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* BLOCO 2: Módulo de Transparência e Transição de Governo Integrado */}
      <section
        id="transicao-governo"
        className="card-clean p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--success-color)]">
              <Scale className="w-4 h-4" />
              <span>Transição de Governo: Ativa · Decretos Analisados: Nomeações Iniciais - Em conformidade</span>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text-color)]">
              Módulo de Transparência e Transição de Governo Integrado
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Acompanhamento de Atos, Primeiros Decretos e Nomeações Oficiais em conformidade legal nos Eixos Temáticos Prioritários: <strong>Saúde (SUS), Educação e Infraestrutura</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a
              href="https://www.natal.rn.gov.br/dom"
              target="_blank"
              rel="noopener noreferrer"
              className="botao px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 no-underline"
            >
              <FileText className="w-4 h-4 text-[var(--accent-color)]" />
              <span>Links Oficiais: Primeiros Decretos (DOM Natal)</span>
            </a>
          </div>
        </div>

        {/* Painel de Status Oficial da Transição */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="subcard-clean p-5">
            <div className="text-xs text-[var(--text-muted)]">Transição de Governo</div>
            <div className="text-base font-semibold text-[var(--success-color)] mt-1">
              ● Ativa e Monitorada 24h
            </div>
          </div>
          <div className="subcard-clean p-5">
            <div className="text-xs text-[var(--text-muted)]">Links Oficiais</div>
            <div className="text-base font-semibold text-[var(--text-color)] mt-1">
              Primeiros Decretos Publicados
            </div>
          </div>
          <div className="subcard-clean p-5">
            <div className="text-xs text-[var(--text-muted)]">Eixos Temáticos Prioritários</div>
            <div className="text-base font-semibold text-[var(--text-color)] mt-1">
              Saúde (SUS), Educação, Infraestrutura
            </div>
          </div>
          <div className="subcard-clean p-5">
            <div className="text-xs text-[var(--text-muted)]">Decretos Analisados</div>
            <div className="text-base font-semibold text-[var(--success-color)] mt-1">
              Nomeações Iniciais - Em conformidade
            </div>
          </div>
        </div>

        {/* Tabela de Coerência entre Projetos Mais Votados (Likes) e Ações Reais de Gestão */}
        <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-muted)]">
                <th className="py-3 px-4 font-semibold">Ato / Decreto Analisado</th>
                <th className="py-3 px-4 font-semibold">Eixo Prioritário</th>
                <th className="py-3 px-4 font-semibold">Coerência com Propostas Votadas (Likes)</th>
                <th className="py-3 px-4 font-semibold text-right">Status Legal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {ATOS_TRANSICAO_GOVERNO.map((ato) => (
                <tr key={ato.id} className="hover:bg-[var(--surface-subtle)]">
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs font-semibold text-[var(--accent-color)]">
                      {ato.codigoAto}
                    </div>
                    <div className="font-semibold text-[var(--text-color)]">{ato.titulo}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-[var(--text-color)] whitespace-nowrap">
                    {ato.eixo}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">
                    <div>{ato.propostaRelacionada}</div>
                    <div className="font-tabular text-[var(--success-color)] font-semibold">
                      Índice de Coerência Cívica: {ato.coerenciaPopularPct}%
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="text-xs font-semibold text-[var(--success-color)]">
                      ✓ {ato.statusConformidade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* BLOCO 3: Quiz Interativo de 5 Perguntas Rápidas (Afinidade 2º Turno) + Módulo Alerta Anti-Desinformação (TSE) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Columns: Módulo 'Alerta Anti-Desinformação' em Tempo Real (API TSE / Fontes Oficiais Verificadas) */}
        <div
          id="alerta-anti-desinformacao"
          className="lg:col-span-6 card-clean p-6 sm:p-7 space-y-5"
        >
          <div className="space-y-2 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Módulo Alerta Anti-Desinformação · Feed em Tempo Real TSE</span>
              </div>
              <a
                href="https://www.justicaeleitoral.jus.br/fato-ou-boato/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-[var(--accent-color)] underline inline-flex items-center gap-1"
              >
                <span>Fato ou Boato TSE</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              Feed de Checagens em Tempo Real das Falas dos Candidatos
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Verificação instantânea de falas, debates e áudios de campanha utilizando dados do DivulgaCandContas TSE, Fato ou Boato TSE e TRE-RN.
            </p>
          </div>

          {/* Barra de Verificação Instantânea em Tempo Real (API TSE / Fontes Verificadas) */}
          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3">
            <label className="block text-xs font-semibold text-[var(--text-color)]">
              Checar Fala, Promessa ou Boato Eleitoral Agora (Tempo Real):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputChecagem}
                onChange={(e) => setInputChecagem(e.target.value)}
                placeholder="Ex: Candidato prometeu aposentadoria aos 70 anos ou 3ª ponte do Rio Potengi?"
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs text-[var(--text-color)]"
              />
              <button
                type="button"
                disabled={isChecandoTSE || !inputChecagem.trim()}
                onClick={() => executarChecagemTempoRealTSE()}
                className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isChecandoTSE ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>{isChecandoTSE ? 'Verificando TSE...' : 'Checar Fala'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[var(--text-muted)] font-semibold">
                Checagens rápidas:
              </span>
              {[
                'Escala de 12h e aposentadoria aos 70 anos consta no TSE?',
                '3ª Ponte sobre o Rio Potengi e Hospitais Regionais (Allyson 44)',
                'Diagnósticos médicos online no SUS e BR-304 (Cadu de Lula 13)',
              ].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  disabled={isChecandoTSE}
                  onClick={() => executarChecagemTempoRealTSE(sug)}
                  className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[10px] font-medium text-[var(--text-color)] hover:border-[var(--accent-color)] cursor-pointer"
                >
                  ⚡ {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Selo de Verificação */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                'Todos',
                'Confirmado Oficialmente',
                'Fato Esclarecido · TSE',
                'Sem Confirmação Oficial no Plano Formal',
              ] as const
            ).map((selo) => (
              <button
                key={selo}
                type="button"
                onClick={() => setSeloFiltro(selo)}
                className={`botao px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                  seloFiltro === selo
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {selo}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
            {alertasFiltrados.map((alerta) => (
              <article
                key={alerta.id}
                className="subcard-clean p-5 space-y-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[var(--accent-color)]">
                    {alerta.categoria} {alerta.candidatoCitado ? `· ${alerta.candidatoCitado}` : ''}
                  </span>
                  <span
                    className={`font-semibold ${
                      alerta.seloVerificacao === 'Confirmado Oficialmente' ||
                      alerta.seloVerificacao === 'Fato Esclarecido · TSE'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {alerta.seloVerificacao === 'Sem Confirmação Oficial no Plano Formal' ? '⚠️ ' : '✓ '}
                    {alerta.seloVerificacao}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[var(--text-color)]">
                  {alerta.titulo}
                </h3>

                {alerta.falaAnalisada && (
                  <blockquote className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs italic text-[var(--text-muted)]">
                    Fala / Material checado: {alerta.falaAnalisada}
                  </blockquote>
                )}

                <div className="space-y-1.5 text-xs text-[var(--text-color)]">
                  <div className="font-semibold text-[var(--text-muted)]">
                    Pontos verificados nas fontes oficiais:
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {alerta.topicosAnalisados.map((topico) => (
                      <li key={topico}>{topico}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs leading-relaxed text-[var(--text-color)]">
                  <strong className="text-[var(--accent-color)] block mb-1">
                    Conclusão da Checagem Documental (TSE / Fontes Verificadas):
                  </strong>
                  {alerta.conclusaoAnalise}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)] pt-1">
                  <span>
                    Fonte: <strong>{alerta.fonteVerificacao}</strong> · {alerta.horario}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onAskAgentAnalysis(
                        `Explique detalhadamente a checagem sobre "${alerta.titulo}" e o que consta nas fontes oficiais do TSE.`
                      )
                    }
                    className="botao px-2.5 py-1 rounded bg-[var(--accent-color)] text-white font-semibold cursor-pointer"
                  >
                    Debater no Chat IA
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right 6 Columns: Quiz Interativo de 5 Perguntas Rápidas (Presidente do Brasil e Governo do RN) */}
        <div
          id="quiz-afinidade-5-perguntas"
          className="lg:col-span-6 card-clean p-6 sm:p-7 space-y-5"
        >
          <div className="space-y-3 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-color)]">
                <Calculator className="w-4 h-4" />
                <span>
                  Quiz Interativo com IA · 5 Perguntas Rápidas ({esferaQuiz === 'presidencia' ? 'Presidente do Brasil' : 'Governo do RN'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setModoQuiz((prev) => (prev === 'passo-a-passo' ? 'todas' : 'passo-a-passo'))
                  }
                  className="px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[11px] font-semibold text-[var(--text-color)] hover:border-[var(--accent-color)] cursor-pointer"
                >
                  {modoQuiz === 'passo-a-passo' ? 'Ver todas as 5 juntas' : 'Modo Passo a Passo'}
                </button>
                <span className="text-xs font-mono font-bold text-[var(--success-color)]">
                  {resultadoAfinidade.totalRespondidas}/{resultadoAfinidade.totalPerguntas} respondidas
                </span>
              </div>
            </div>

            {/* Seletor de Esfera: Presidente do Brasil (Governo Federal) vs Governo do RN */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => {
                  setEsferaQuiz('presidencia');
                  setPerguntaAtivaIdx(0);
                  setMostrarAnaliseLocalQuiz(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  esferaQuiz === 'presidencia'
                    ? 'bg-[var(--accent-color)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                🇧🇷 Presidente do Brasil (Federal)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEsferaQuiz('rn');
                  setPerguntaAtivaIdx(0);
                  setMostrarAnaliseLocalQuiz(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  esferaQuiz === 'rn'
                    ? 'bg-[var(--accent-color)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                🏛️ Governo do RN (Estadual)
              </button>
            </div>

            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              {esferaQuiz === 'presidencia'
                ? 'Quiz: Candidatos a Presidente do Brasil e Propostas de Governo Federal'
                : 'Calculadora de Afinidade Temática · 2º Turno Governo do RN'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {esferaQuiz === 'presidencia' ? (
                <>
                  Responda às 5 perguntas rápidas para comparar suas prioridades com as propostas de Governo Federal de{' '}
                  <strong>Luiz Inácio Lula da Silva (PT · 13)</strong> e{' '}
                  <strong>Flávio Bolsonaro (PL · 22)</strong> registradas no TSE.
                </>
              ) : (
                <>
                  Responda diretamente nas opções abaixo para comparar suas prioridades com as propostas registradas de{' '}
                  <strong>Allyson Bezerra (União · 44)</strong> e{' '}
                  <strong>Cadu de Lula (PT · 13)</strong> no 2º turno do RN.
                </>
              )}
            </p>

            {/* Barra de Progresso + Seletor Rápido das 5 Perguntas */}
            <div className="space-y-2">
              <div className="w-full h-2 rounded-full bg-[var(--surface-subtle)] overflow-hidden border border-[var(--border-color)]">
                <div
                  className="h-full bg-[var(--accent-color)] transition-all duration-300"
                  style={{
                    width: `${(resultadoAfinidade.totalRespondidas / resultadoAfinidade.totalPerguntas) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-1.5 pt-1">
                {listaPerguntasQuiz.map((qItem, idx) => {
                  const respondida = Boolean(respostasQuiz[qItem.id]);
                  const isAtiva = modoQuiz === 'passo-a-passo' && perguntaAtivaIdx === idx;
                  return (
                    <button
                      key={qItem.id}
                      type="button"
                      onClick={() => {
                        setModoQuiz('passo-a-passo');
                        setPerguntaAtivaIdx(idx);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer truncate ${
                        isAtiva
                          ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-sm'
                          : respondida
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-color)]'
                      }`}
                    >
                      {idx + 1}. {qItem.temaCurto.split(' ')[0]} {respondida ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Área de Perguntas: Passo a Passo (sem pular para o chat) ou Lista Completa */}
          {modoQuiz === 'passo-a-passo' ? (
            (() => {
              const qAtual = listaPerguntasQuiz[perguntaAtivaIdx] || listaPerguntasQuiz[0];
              return (
                <div className="subcard-clean p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[var(--accent-color)] uppercase tracking-wide">
                      Pergunta {perguntaAtivaIdx + 1} de {listaPerguntasQuiz.length} · Eixo: {qAtual.temaCurto} ({qAtual.eixo})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          speakWithPotiguarTTS(
                            `quiz-q-${qAtual.id}`,
                            `${qAtual.pergunta} Opção 1: ${qAtual.opcoes[0].texto}. Opção 2: ${qAtual.opcoes[1].texto}.`
                          )
                        }
                        className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[11px] font-semibold text-[var(--accent-color)] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>🔊 Ouvir Pergunta</span>
                      </button>
                      {respostasQuiz[qAtual.id] && (
                        <span className="text-[11px] font-semibold text-[var(--success-color)]">
                          ✓ Respondida
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-base font-bold text-[var(--text-color)] leading-snug">
                    {qAtual.pergunta}
                  </div>

                  <div className="space-y-2.5">
                    {qAtual.opcoes.map((op) => {
                      const selecionada = respostasQuiz[qAtual.id] === op.candidatoId;
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const novasRespostas = {
                              ...respostasQuiz,
                              [qAtual.id]: op.candidatoId,
                            };
                            setRespostasQuiz(novasRespostas);
                            setMostrarAnaliseLocalQuiz(true);

                            // Avança automaticamente para a próxima pergunta ainda não respondida sem sair do Quiz
                            if (perguntaAtivaIdx < listaPerguntasQuiz.length - 1) {
                              setTimeout(() => {
                                setPerguntaAtivaIdx((prev) =>
                                  prev < listaPerguntasQuiz.length - 1 ? prev + 1 : prev
                                );
                              }, 550);
                            }
                          }}
                          className={`botao w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${
                            selecionada
                              ? 'border-2 border-[var(--accent-color)] bg-[var(--card-bg)] font-semibold text-[var(--text-color)] shadow-sm'
                              : 'border-[var(--border-color)] bg-[var(--card-bg)]/70 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:border-[var(--accent-color)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span>{op.texto}</span>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                                selecionada
                                  ? 'bg-[var(--accent-color)] text-white'
                                  : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
                              }`}
                            >
                              {selecionada ? '✓ Selecionada' : 'Escolher'}
                            </span>
                          </div>
                          {selecionada && (
                            <div className="text-xs text-[var(--success-color)] mt-1.5 pt-1.5 border-t border-[var(--border-color)]">
                              ✓ <strong>Proposta correspondente no TSE:</strong> {op.resumoPlanoTSE}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navegação interna entre as 5 perguntas do Quiz */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      disabled={perguntaAtivaIdx === 0}
                      onClick={() => setPerguntaAtivaIdx((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] disabled:opacity-40 text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Pergunta Anterior</span>
                    </button>

                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      {perguntaAtivaIdx + 1} / {listaPerguntasQuiz.length}
                    </span>

                    {perguntaAtivaIdx < listaPerguntasQuiz.length - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPerguntaAtivaIdx((prev) =>
                            Math.min(listaPerguntasQuiz.length - 1, prev + 1)
                          )
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Próxima Pergunta</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMostrarAnaliseLocalQuiz(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ver Parecer Completo Aqui</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="space-y-3.5 max-h-[540px] overflow-y-auto pr-1">
              {listaPerguntasQuiz.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--accent-color)]">
                      Eixo: {q.temaCurto} ({q.eixo})
                    </span>
                    {respostasQuiz[q.id] && (
                      <span className="text-[11px] font-semibold text-[var(--success-color)]">
                        ✓ Respondida
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-color)]">
                    {q.pergunta}
                  </div>
                  <div className="space-y-2">
                    {q.opcoes.map((op) => {
                      const selecionada = respostasQuiz[q.id] === op.candidatoId;
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => {
                            const novas = { ...respostasQuiz, [q.id]: op.candidatoId };
                            setRespostasQuiz(novas);
                            setMostrarAnaliseLocalQuiz(true);
                          }}
                          className={`botao w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                            selecionada
                              ? 'border-[var(--accent-color)] bg-[var(--card-bg)] font-semibold text-[var(--text-color)] shadow-sm'
                              : 'border-[var(--border-color)] bg-[var(--card-bg)]/60 text-[var(--text-muted)] hover:text-[var(--text-color)]'
                          }`}
                        >
                          <div>{op.texto}</div>
                          {selecionada && (
                            <div className="text-[11px] text-[var(--success-color)] mt-1">
                              ✓ Proposta correspondente: {op.resumoPlanoTSE}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Card de Resultado: Candidato com Maior Afinidade Temática (Exibido diretamente no Quiz, sem pular para o chat) */}
          <div className="subcard-clean p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-color)] uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--accent-color)]" />
                <span>
                  Resultado do Quiz ({resultadoAfinidade.totalRespondidas}/{resultadoAfinidade.totalPerguntas} perguntas):
                </span>
              </span>
              {resultadoAfinidade.totalRespondidas > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const novoMapa = { ...respostasQuiz };
                    listaPerguntasQuiz.forEach((q) => delete novoMapa[q.id]);
                    setRespostasQuiz(novoMapa);
                    setPerguntaAtivaIdx(0);
                    setMostrarAnaliseLocalQuiz(false);
                  }}
                  className="text-[var(--accent-color)] underline font-semibold cursor-pointer"
                >
                  Reiniciar 5 Perguntas
                </button>
              )}
            </div>

            {resultadoAfinidade.candidatoMaiorAfinidade ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={resultadoAfinidade.candidatoMaiorAfinidade.fotoOficial}
                      alt={resultadoAfinidade.candidatoMaiorAfinidade.nome}
                      onError={(e) => {
                        const img = e.currentTarget;
                        const fb = (resultadoAfinidade.candidatoMaiorAfinidade as any)?.fotoFallback;
                        if (fb && img.src !== window.location.origin + fb) {
                          img.src = fb;
                        }
                      }}
                      className="w-14 h-16 rounded-lg object-cover object-top border border-[var(--border-color)] shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase text-[var(--success-color)]">
                        ★ Candidato com Maior Afinidade Temática ({esferaQuiz === 'presidencia' ? 'Presidente do Brasil' : 'Governo do RN'})
                      </div>
                      <div className="text-base font-bold text-[var(--text-color)]">
                        {resultadoAfinidade.candidatoMaiorAfinidade.nome} (Nº{' '}
                        {resultadoAfinidade.candidatoMaiorAfinidade.numero})
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Temas alinhados: <strong>{resultadoAfinidade.temasAlinhados.join(', ')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMostrarAnaliseLocalQuiz((prev) => !prev)}
                      className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {mostrarAnaliseLocalQuiz
                          ? 'Ocultar Análise Aqui'
                          : 'Ver Análise Completa Aqui'}
                      </span>
                    </button>

                    {ttsQuizState.activeMessageId === 'quiz-resultado-tts' &&
                    ttsQuizState.status === 'playing' ? (
                      <button
                        type="button"
                        onClick={() => stopTTSPlayback()}
                        className="botao px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>⏹️ Parar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          speakWithPotiguarTTS(
                            'quiz-resultado-tts',
                            `Resultado do Quiz de Afinidade Temática para ${
                              esferaQuiz === 'presidencia' ? 'Presidente do Brasil' : 'Governo do Rio Grande do Norte'
                            }. Você respondeu ${resultadoAfinidade.totalRespondidas} de ${resultadoAfinidade.totalPerguntas} perguntas. Candidato com maior afinidade: ${resultadoAfinidade.candidatoMaiorAfinidade?.nome}, número ${resultadoAfinidade.candidatoMaiorAfinidade?.numero}, com ${
                              resultadoAfinidade.candidatoMaiorAfinidade?.id === candIdA
                                ? resultadoAfinidade.pctA
                                : resultadoAfinidade.pctB
                            } por cento de convergência nos temas: ${resultadoAfinidade.temasAlinhados.join(', ')}. Fonte: Planos de governo registrados no DivulgaCandContas TSE.`
                          )
                        }
                        className="botao px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--accent-color)] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>🔊 Ouvir Resultado</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Parecer do PotiguarBot renderizado diretamente dentro do Quiz (sem jogar para o texto do chat) */}
                {mostrarAnaliseLocalQuiz && (
                  <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-[var(--subcard-shadow)] space-y-2.5 text-xs">
                    <div className="font-bold text-[var(--accent-color)] flex items-center justify-between">
                      <span>
                        🤖 Parecer Técnico do PotiguarBot IA ({esferaQuiz === 'presidencia' ? 'Plano de Governo Federal' : 'Plano Estadual RN'})
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        Fonte: DivulgaCandContas TSE
                      </span>
                    </div>
                    <p className="text-[var(--text-color)] leading-relaxed">
                      Com base nas suas <strong>{resultadoAfinidade.totalRespondidas} respostas</strong>, suas prioridades tiveram{' '}
                      <strong>{resultadoAfinidade.pctA}%</strong> de convergência com{' '}
                      <strong>{fichasAtuaisQuiz[0].nome} ({fichasAtuaisQuiz[0].partido} · {fichasAtuaisQuiz[0].numero})</strong> e{' '}
                      <strong>{resultadoAfinidade.pctB}%</strong> com{' '}
                      <strong>{fichasAtuaisQuiz[1].nome} ({fichasAtuaisQuiz[1].partido} · {fichasAtuaisQuiz[1].numero})</strong>.
                    </p>
                    <div className="space-y-1.5 pt-1 border-t border-[var(--border-color)]">
                      {listaPerguntasQuiz.map((qItem, idx) => {
                        const escolhaId = respostasQuiz[qItem.id];
                        const opEscolhida = qItem.opcoes.find((o) => o.candidatoId === escolhaId);
                        if (!opEscolhida) return null;
                        return (
                          <div key={qItem.id} className="text-[11px] text-[var(--text-muted)]">
                            <strong className="text-[var(--text-color)]">
                              {idx + 1}. {qItem.temaCurto}:
                            </strong>{' '}
                            {opEscolhida.resumoPlanoTSE}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Selecione suas respostas nas 5 perguntas acima para descobrir qual candidato ({esferaQuiz === 'presidencia' ? 'Presidente do Brasil' : 'Governo do RN'}) possui maior afinidade temática com você.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)]">
                  {fichasAtuaisQuiz[0].nome} (Nº {fichasAtuaisQuiz[0].numero})
                </div>
                <div
                  className="text-xl font-bold font-tabular"
                  style={{ color: fichasAtuaisQuiz[0].cor }}
                >
                  {resultadoAfinidade.pctA}% ({resultadoAfinidade.contA}/5)
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)]">
                  {fichasAtuaisQuiz[1].nome} (Nº {fichasAtuaisQuiz[1].numero})
                </div>
                <div
                  className="text-xl font-bold font-tabular"
                  style={{ color: fichasAtuaisQuiz[1].cor }}
                >
                  {resultadoAfinidade.pctB}% ({resultadoAfinidade.contB}/5)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
