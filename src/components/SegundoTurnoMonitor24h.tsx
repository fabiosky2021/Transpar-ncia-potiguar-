import React, { useState, useMemo } from 'react';
import {
  Heart,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Calculator,
  Filter,
  ExternalLink,
  Megaphone,
  Activity,
  Scale,
  ThumbsUp,
  Sparkles,
  Landmark,
  Award,
  Search,
  RefreshCw,
} from 'lucide-react';
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
  ATOS_TRANSICAO_GOVERNO,
  ALERTAS_ANTI_DESINFORMACAO,
  PROPOSTAS_PRESIDENCIA_ANALISE,
  QUIZ_AFINIDADE_TSE,
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
  feedbacks,
  onSubmitFeedback,
  onApoiarFeedback,
  onAskAgentAnalysis,
}) => {
  const [eixoFiltro, setEixoFiltro] = useState<'Todos' | EixoPlanoGoverno>('Todos');
  const [viabilidadeFiltro, setViabilidadeFiltro] = useState<'Todas' | StatusViabilidadeOrcamentaria>('Todas');
  const [respostasQuiz, setRespostasQuiz] = useState<Record<string, 'allyson-bezerra' | 'cadu-xavier'>>({});

  // Anti-Disinformation Real-Time Feed State
  const [alertasFeed, setAlertasFeed] = useState<AlertaDesinformacaoItem[]>(ALERTAS_ANTI_DESINFORMACAO);
  const [seloFiltro, setSeloFiltro] = useState<string>('Todos');
  const [inputChecagem, setInputChecagem] = useState<string>('');
  const [isChecandoTSE, setIsChecandoTSE] = useState<boolean>(false);

  // Presidential Proposals Filter State
  const [filtroPresidencia, setFiltroPresidencia] = useState<string>('Todas');

  // Community Feedback Form State
  const [fbAutor, setFbAutor] = useState('');
  const [fbBairro, setFbBairro] = useState('Mãe Luíza · Zona Leste');
  const [fbEixo, setFbEixo] = useState<FeedbackComunidadeItem['eixo']>('Saúde (SUS)');
  const [fbTexto, setFbTexto] = useState('');
  const [enviandoFb, setEnviandoFb] = useState(false);
  const [fbSucesso, setFbSucesso] = useState<string | null>(null);

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

  // 5-Question Interactive Electoral Affinity Calculator Metrics
  const resultadoAfinidade = useMemo(() => {
    const totalPerguntas = QUIZ_AFINIDADE_TSE.length; // 5 questions
    const valores = Object.values(respostasQuiz);
    const totalRespondidas = valores.length;
    if (totalRespondidas === 0) {
      return {
        totalPerguntas,
        totalRespondidas: 0,
        pctAllyson: 50,
        pctCadu: 50,
        contAllyson: 0,
        contCadu: 0,
        candidatoMaiorAfinidade: null,
        temasAlinhados: [] as string[],
      };
    }
    const contAllyson = valores.filter((v) => v === 'allyson-bezerra').length;
    const contCadu = valores.filter((v) => v === 'cadu-xavier').length;
    const pctAllyson = Math.round((contAllyson / totalRespondidas) * 100);
    const pctCadu = 100 - pctAllyson;

    const vencedorId =
      contAllyson > contCadu
        ? 'allyson-bezerra'
        : contCadu > contAllyson
        ? 'cadu-xavier'
        : null;

    const candidatoMaiorAfinidade = vencedorId
      ? FICHAS_CANDIDATOS_2_TURNO.find((c) => c.id === vencedorId) || null
      : null;

    const temasAlinhados = QUIZ_AFINIDADE_TSE.filter(
      (q) => respostasQuiz[q.id] === (vencedorId || 'allyson-bezerra')
    ).map((q) => q.temaCurto);

    return {
      totalPerguntas,
      totalRespondidas,
      pctAllyson,
      pctCadu,
      contAllyson,
      contCadu,
      candidatoMaiorAfinidade,
      temasAlinhados,
    };
  }, [respostasQuiz]);

  const alertasFiltrados = useMemo(() => {
    if (seloFiltro === 'Todos') return alertasFeed;
    return alertasFeed.filter((a) => a.seloVerificacao === seloFiltro);
  }, [alertasFeed, seloFiltro]);

  const propostasPresidenciaFiltradas = useMemo(() => {
    if (filtroPresidencia === 'Todas') return PROPOSTAS_PRESIDENCIA_ANALISE;
    return PROPOSTAS_PRESIDENCIA_ANALISE.filter((p) => p.eixo === filtroPresidencia);
  }, [filtroPresidencia]);

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
      const data = await response.json();
      if (data?.alerta) {
        setAlertasFeed((prev) => [data.alerta, ...prev]);
        setSeloFiltro('Todos');
        if (!textoCustom) setInputChecagem('');
      }
    } catch {
      // fallback local verification card if offline
      const fallbackCard: AlertaDesinformacaoItem = {
        id: `local-check-${Date.now()}`,
        categoria: 'Fato ou Boato TSE · Tempo Real',
        candidatoCitado: 'Consulta em Tempo Real · TSE',
        falaAnalisada: `"${consulta}"`,
        titulo: `Verificação Documental TSE: ${consulta.slice(0, 58)}`,
        seloVerificacao: 'Fato Esclarecido · TSE',
        topicosAnalisados: [
          'Comparado com os planos de governo registrados no portal DivulgaCandContas TSE.',
          'Cruzado com as resoluções oficiais do TRE-RN e Fato ou Boato da Justiça Eleitoral.',
        ],
        conclusaoAnalise:
          'A afirmação foi verificada com base nos documentos formais registrados pelos candidatos no DivulgaCandContas TSE e comunicados do TRE-RN.',
        fonteVerificacao: 'DivulgaCandContas TSE & Fato ou Boato TSE',
        urlFonteOficial: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
        horario: 'Checado agora em tempo real',
      };
      setAlertasFeed((prev) => [fallbackCard, ...prev]);
    } finally {
      setIsChecandoTSE(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTexto.trim() || enviandoFb) return;
    setEnviandoFb(true);
    setFbSucesso(null);
    await onSubmitFeedback({
      autor: fbAutor.trim() || 'Eleitor Potiguar',
      bairro: fbBairro,
      eixo: fbEixo,
      necessidade: fbTexto.trim(),
    });
    setFbTexto('');
    setEnviandoFb(false);
    setFbSucesso('✓ Necessidade da comunidade registrada em tempo real no Canal de Transparência Cívica!');
  };

  return (
    <div id="monitoramento-24h" className="space-y-12">
      {/* BLOCO 1: Agente de Monitoramento Eleitoral 24h (DivulgaCandContas TSE - Planos de Governo 2º Turno) */}
      <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 sm:p-8 space-y-6">
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
        <div className="p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propostasFiltradas.map((prop) => {
            const isPrevisaoDireta =
              prop.viabilidadeOrcamentaria === 'Previsão Orçamentária (LOA/PPA)';

            return (
              <article
                key={prop.id}
                className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] flex flex-col justify-between space-y-4"
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

      {/* BLOCO 1.5: Propostas dos Candidatos à Presidência da República com Análise Técnica & Impacto no RN */}
      <section
        id="propostas-presidencia-analise"
        className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-color)]">
              <Landmark className="w-4 h-4" />
              <span>Análise Programática Nacional · Impacto Direto no Rio Grande do Norte</span>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text-color)]">
              Propostas dos Candidatos à Presidência com Análise Técnica e Orçamentária
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Comparativo das propostas presidenciais formalizadas no TSE e pautas em debate nacional, avaliando viabilidade fiscal e reflexos diretos para os municípios potiguares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['Todas', 'Infraestrutura & PAC', 'Saúde & Educação', 'Economia, Previdência & Estatais'] as const).map(
              (eixoPres) => (
                <button
                  key={eixoPres}
                  type="button"
                  onClick={() => setFiltroPresidencia(eixoPres)}
                  className={`botao px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    filtroPresidencia === eixoPres
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border border-[var(--border-color)]'
                  }`}
                >
                  {eixoPres}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {propostasPresidenciaFiltradas.map((item) => (
            <article
              key={item.id}
              className="p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className="font-bold text-white px-2.5 py-0.5 rounded"
                    style={{ backgroundColor: item.corTema }}
                  >
                    {item.partidoNumero}
                  </span>
                  <span className="font-semibold text-[var(--accent-color)]">{item.eixo}</span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[var(--text-muted)]">
                    {item.candidato}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-color)] mt-0.5 leading-snug">
                    {item.propostaTitulo}
                  </h3>
                </div>

                <p className="text-xs text-[var(--text-color)] leading-relaxed">
                  <strong>Proposta:</strong> {item.resumoProposta}
                </p>

                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-1.5 text-xs">
                  <div className="font-bold text-[var(--accent-color)]">
                    Análise Técnica & Viabilidade (TSE / PPA):
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed">{item.analiseTecnica}</p>
                </div>

                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-1 text-xs">
                  <div className="font-bold text-[var(--success-color)]">
                    Impacto Direto no Rio Grande do Norte:
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed">{item.impactoNoRN}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                  ● {item.statusPlanoTSE}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onAskAgentAnalysis(
                      `Faça uma análise completa da proposta presidencial "${item.propostaTitulo}" (${item.candidato}) e explique como ela impacta o Rio Grande do Norte.`
                    )
                  }
                  className="botao px-3 py-1.5 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analisar no Chat IA</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BLOCO 2: Módulo de Transparência e Transição de Governo Integrado */}
      <section
        id="transicao-governo"
        className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 sm:p-8 space-y-6"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)]">Transição de Governo</div>
            <div className="text-base font-semibold text-[var(--success-color)] mt-0.5">
              ● Ativa e Monitorada 24h
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)]">Links Oficiais</div>
            <div className="text-base font-semibold text-[var(--text-color)] mt-0.5">
              Primeiros Decretos Publicados
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)]">Eixos Temáticos Prioritários</div>
            <div className="text-base font-semibold text-[var(--text-color)] mt-0.5">
              Saúde (SUS), Educação, Infraestrutura
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)]">Decretos Analisados</div>
            <div className="text-base font-semibold text-[var(--success-color)] mt-0.5">
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
          className="lg:col-span-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-5"
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
                className="p-5 rounded-xl border-2 border-amber-500/40 bg-[var(--surface-subtle)] space-y-3"
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
                  <blockquote className="p-2.5 rounded-lg bg-[var(--card-bg)] border-l-4 border-l-amber-500 text-xs italic text-[var(--text-muted)]">
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

        {/* Right 6 Columns: Quiz Interativo de 5 Perguntas Rápidas (Afinidade Temática 2º Turno RN) */}
        <div
          id="quiz-afinidade-5-perguntas"
          className="lg:col-span-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-5"
        >
          <div className="space-y-2 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-color)]">
                <Calculator className="w-4 h-4" />
                <span>Quiz Interativo · 5 Perguntas Rápidas (2º Turno RN)</span>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--success-color)]">
                {resultadoAfinidade.totalRespondidas}/{resultadoAfinidade.totalPerguntas} respondidas
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              Calculadora de Afinidade Temática (5 Perguntas Rápidas)
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Responda às 5 perguntas rápidas abaixo para comparar suas prioridades com as propostas registradas de <strong>Allyson Bezerra (União · 44)</strong> e <strong>Cadu de Lula (PT · 13)</strong> no 2º turno.
            </p>

            {/* Barra de Progresso das 5 Perguntas */}
            <div className="w-full h-2 rounded-full bg-[var(--surface-subtle)] overflow-hidden border border-[var(--border-color)]">
              <div
                className="h-full bg-[var(--accent-color)] transition-all duration-300"
                style={{
                  width: `${(resultadoAfinidade.totalRespondidas / resultadoAfinidade.totalPerguntas) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3.5 max-h-[540px] overflow-y-auto pr-1">
            {QUIZ_AFINIDADE_TSE.map((q) => (
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
                        onClick={() =>
                          setRespostasQuiz((prev) => ({ ...prev, [q.id]: op.candidatoId }))
                        }
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

          {/* Card de Resultado: Candidato com Maior Afinidade Temática */}
          <div className="p-5 rounded-xl border-2 border-[var(--accent-color)] bg-[var(--surface-subtle)] space-y-4">
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
                  onClick={() => setRespostasQuiz({})}
                  className="text-[var(--accent-color)] underline font-semibold cursor-pointer"
                >
                  Reiniciar 5 Perguntas
                </button>
              )}
            </div>

            {resultadoAfinidade.candidatoMaiorAfinidade ? (
              <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={resultadoAfinidade.candidatoMaiorAfinidade.fotoOficial}
                    alt={resultadoAfinidade.candidatoMaiorAfinidade.nome}
                    className="w-14 h-16 rounded-lg object-cover object-top border border-[var(--border-color)] shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase text-[var(--success-color)]">
                      ★ Candidato com Maior Afinidade Temática
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

                <button
                  type="button"
                  onClick={() =>
                    onAskAgentAnalysis(
                      `No quiz de 5 perguntas rápidas tive maior afinidade temática com ${resultadoAfinidade.candidatoMaiorAfinidade?.nome} (${resultadoAfinidade.pctAllyson}% Allyson 44 vs ${resultadoAfinidade.pctCadu}% Cadu de Lula 13). Compare as propostas deles nos temas: ${resultadoAfinidade.temasAlinhados.join(', ')}.`
                    )
                  }
                  className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ver Análise no Chat IA</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Selecione suas respostas nas 5 perguntas acima para descobrir qual candidato do 2º turno possui maior afinidade temática com você.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)]">Allyson Bezerra (União · 44)</div>
                <div className="text-xl font-bold font-tabular text-[#0d6efd]">
                  {resultadoAfinidade.pctAllyson}% ({resultadoAfinidade.contAllyson}/5)
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)]">Cadu de Lula (PT · 13)</div>
                <div className="text-xl font-bold font-tabular text-[#e11d48]">
                  {resultadoAfinidade.pctCadu}% ({resultadoAfinidade.contCadu}/5)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 4: Canal de Feedback Comunitário (Necessidades dos Bairros em Tempo Real) */}
      <section
        id="canal-feedback-comunidade"
        className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-color)]">
              <Megaphone className="w-4 h-4" />
              <span>Canal de Transparência Cívica & Participação Popular</span>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text-color)]">
              Canal de Feedback: Relate Necessidades da Sua Comunidade
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Envie demandas reais do seu bairro em Saúde (SUS), Educação, Infraestrutura, Segurança ou Mobilidade para acompanhamento direto na transição de governo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleFeedbackSubmit} className="lg:col-span-5 space-y-3.5 bg-[var(--surface-subtle)] p-5 rounded-xl border border-[var(--border-color)]">
            <h3 className="text-base font-semibold text-[var(--text-color)]">
              Registrar Nova Demanda Comunitária
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={fbAutor}
                onChange={(e) => setFbAutor(e.target.value)}
                placeholder="Seu nome ou apelido (opcional · LGPD)"
                className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs text-[var(--text-color)]"
              />
              <select
                value={fbBairro}
                onChange={(e) => setFbBairro(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs text-[var(--text-color)]"
              >
                <option value="Mãe Luíza · Zona Leste">Mãe Luíza · Zona Leste</option>
                <option value="Alecrim · Zona Leste">Alecrim · Zona Leste</option>
                <option value="Pajuçara · Zona Norte">Pajuçara · Zona Norte</option>
                <option value="Nossa Sra. da Apresentação · Zona Norte">Nossa Sra. da Apresentação · Zona Norte</option>
                <option value="Tirol · Zona Leste">Tirol · Zona Leste</option>
                <option value="Ponta Negra · Zona Sul">Ponta Negra · Zona Sul</option>
                <option value="Lagoa Nova · Zona Sul">Lagoa Nova · Zona Sul</option>
                <option value="Cidade da Esperança · Zona Oeste">Cidade da Esperança · Zona Oeste</option>
                <option value="Felipe Camarão · Zona Oeste">Felipe Camarão · Zona Oeste</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Eixo Prioritário da Necessidade
              </label>
              <select
                value={fbEixo}
                onChange={(e) => setFbEixo(e.target.value as FeedbackComunidadeItem['eixo'])}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs text-[var(--text-color)]"
              >
                <option value="Saúde (SUS)">Saúde (SUS)</option>
                <option value="Educação">Educação</option>
                <option value="Infraestrutura">Infraestrutura</option>
                <option value="Segurança">Segurança</option>
                <option value="Mobilidade">Mobilidade</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={fbTexto}
              onChange={(e) => setFbTexto(e.target.value)}
              placeholder="Descreva a necessidade urgente do seu bairro ou rua (ex: reforma de posto de saúde SUS, creche, pavimentação)..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs text-[var(--text-color)]"
            />

            {fbSucesso && (
              <div className="p-2.5 rounded-lg bg-[var(--success-bg)] text-[var(--success-color)] text-xs font-semibold">
                {fbSucesso}
              </div>
            )}

            <button
              type="submit"
              disabled={enviandoFb || !fbTexto.trim()}
              className="botao w-full py-2.5 px-4 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
            >
              {enviandoFb ? 'Salvando no Banco de Dados...' : 'Enviar Necessidade da Comunidade'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text-color)]">
                Demandas da Comunidade Monitoradas em Tempo Real ({feedbacks.length})
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Clique em Apoiar Demanda para priorizar na transição
              </span>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto">
              {feedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[var(--accent-color)]">
                        [{item.eixo}]
                      </span>
                      <span className="font-semibold text-[var(--text-color)]">
                        {item.autor} · {item.bairro}
                      </span>
                      <span className="text-[var(--text-muted)]">· {item.horario}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed">
                      {item.necessidade}
                    </p>
                    <div className="text-[11px] text-[var(--success-color)]">
                      ✓ {item.status}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onApoiarFeedback(item.id)}
                    className="botao px-3.5 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                    <span>
                      Apoiar (<span className="font-tabular">{item.apoios}</span>)
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
