import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Clock,
  FileText,
  Users,
  BarChart3,
  Bot,
  AlertTriangle,
  Sparkles,
  Volume2,
  Pause,
  Square,
  RotateCcw,
  CheckCircle2,
  Filter,
  Landmark,
  Eye,
} from 'lucide-react';
import {
  CandidatoItem,
  RelatoCidadao,
  BoletimDiarioIA,
  AvaliacaoCandidatoItem,
} from '../data/platformData';
import {
  PropostaTSEItem,
  FeedbackComunidadeItem,
  ATOS_TRANSICAO_GOVERNO,
  ALERTAS_ANTI_DESINFORMACAO,
  PROPOSTAS_PRESIDENCIA_ANALISE,
} from '../data/segundoTurnoData';
import {
  speakWithPotiguarTTS,
  pauseTTSPlayback,
  stopTTSPlayback,
  subscribeTTSState,
  TTSStateSnapshot,
} from '../services/ttsService';

export type ClassificacaoInformacao =
  | 'Informação oficial'
  | 'Informação verificada'
  | 'Acompanhamento'
  | 'Requer verificação'
  | 'Relato cidadão'
  | 'Opinião da comunidade'
  | 'Análise da IA'
  | 'Atualização pendente';

export type CategoriaRadar =
  | 'todas'
  | 'atencao'
  | 'oficiais'
  | 'propostas'
  | 'relatos'
  | 'avaliacoes'
  | 'analises-ia'
  | 'linha-do-tempo';

export interface ItemRadarConsolidado {
  id: string;
  categoria: Exclude<CategoriaRadar, 'todas' | 'linha-do-tempo'>;
  classificacao: ClassificacaoInformacao;
  titulo: string;
  descricao: string;
  entidadeRelacionada: string;
  fonte: string;
  dataReferencia: string;
  status: string;
  novaAtualizacaoOficial?: boolean;
  detalheComplementar?: string;
}

/**
 * Filtro de neutralidade e não-acusação (Parte 2):
 * Nunca transforma relato ou opinião em acusação e evita termos acusatórios
 * ("corrupto", "criminoso", "fraude", "ilegal", "desvio") sem comprovação oficial.
 */
export function garantirNeutralidadeTexto(texto: string, isFonteOficial: boolean): string {
  if (isFonteOficial) return texto;
  return texto.replace(
    /\b(corrupto|corrupção|criminoso|fraude|ilegal|desvio)\b/gi,
    '[termo sujeito a verificação oficial]'
  );
}

export function obterEstiloClassificacao(classificacao: ClassificacaoInformacao): {
  badgeClass: string;
  dotColor: string;
} {
  switch (classificacao) {
    case 'Informação oficial':
      return {
        badgeClass: 'text-emerald-700 dark:text-emerald-300 font-bold',
        dotColor: 'bg-emerald-500',
      };
    case 'Informação verificada':
      return {
        badgeClass: 'text-teal-700 dark:text-teal-300 font-bold',
        dotColor: 'bg-teal-500',
      };
    case 'Acompanhamento':
      return {
        badgeClass: 'text-blue-700 dark:text-blue-300 font-bold',
        dotColor: 'bg-blue-500',
      };
    case 'Requer verificação':
      return {
        badgeClass: 'text-amber-700 dark:text-amber-300 font-bold',
        dotColor: 'bg-amber-500',
      };
    case 'Relato cidadão':
      return {
        badgeClass: 'text-indigo-700 dark:text-indigo-300 font-bold',
        dotColor: 'bg-indigo-500',
      };
    case 'Opinião da comunidade':
      return {
        badgeClass: 'text-purple-700 dark:text-purple-300 font-bold',
        dotColor: 'bg-purple-500',
      };
    case 'Análise da IA':
      return {
        badgeClass: 'text-cyan-700 dark:text-cyan-300 font-bold',
        dotColor: 'bg-cyan-500',
      };
    case 'Atualização pendente':
    default:
      return {
        badgeClass: 'text-slate-600 dark:text-slate-400 font-bold',
        dotColor: 'bg-slate-400',
      };
  }
}

interface RadarTransparenciaSectionProps {
  candidatos: CandidatoItem[];
  avaliacoes: AvaliacaoCandidatoItem[];
  relatos: RelatoCidadao[];
  feedbacks: FeedbackComunidadeItem[];
  propostas: PropostaTSEItem[];
  boletins: BoletimDiarioIA[];
  onAskPotiguarBot: (prompt: string) => void;
}

export const RadarTransparenciaSection: React.FC<RadarTransparenciaSectionProps> = ({
  candidatos,
  avaliacoes,
  relatos,
  feedbacks,
  propostas,
  boletins,
  onAskPotiguarBot,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<CategoriaRadar>('todas');
  const [filtroClassificacao, setFiltroClassificacao] = useState<
    'Todas' | ClassificacaoInformacao
  >('Todas');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [ttsState, setTtsState] = useState<TTSStateSnapshot>({
    activeMessageId: null,
    status: 'idle',
    errorMessage: null,
    usingFallback: false,
    playedMessageIds: [],
  });

  useEffect(() => {
    return subscribeTTSState(setTtsState);
  }, []);

  // Consolida todas as estruturas existentes sem duplicar modelos ou criar dados fictícios
  const itensConsolidados = useMemo<ItemRadarConsolidado[]>(() => {
    const lista: ItemRadarConsolidado[] = [];

    // 1. 🔎 O que merece atenção (Alertas de checagem TSE + Propostas que exigem reformas/convênio federal + Demandas prioritárias)
    ALERTAS_ANTI_DESINFORMACAO.forEach((alerta) => {
      const requerVerificacao =
        alerta.seloVerificacao === 'Sem Confirmação Oficial no Plano Formal';
      lista.push({
        id: `radar-alerta-${alerta.id}`,
        categoria: requerVerificacao ? 'atencao' : 'oficiais',
        classificacao: requerVerificacao ? 'Requer verificação' : 'Informação verificada',
        titulo: alerta.titulo,
        descricao: alerta.conclusaoAnalise,
        entidadeRelacionada: alerta.candidatoCitado || 'Eleições RN 2026 / TSE',
        fonte: alerta.fonteVerificacao,
        dataReferencia: alerta.horario,
        status: alerta.seloVerificacao,
        novaAtualizacaoOficial: !requerVerificacao,
        detalheComplementar: alerta.falaAnalisada,
      });
    });

    propostas
      .filter((p) => p.viabilidadeOrcamentaria === 'Exige Reformas / Convênio Federal')
      .forEach((prop) => {
        lista.push({
          id: `radar-atencao-prop-${prop.id}`,
          categoria: 'atencao',
          classificacao: 'Acompanhamento',
          titulo: `Atenção Orçamentária: ${prop.titulo}`,
          descricao: `${prop.descricao} (${prop.execucaoTransicao})`,
          entidadeRelacionada: `${prop.candidatoNome} (${prop.partido})`,
          fonte: 'DivulgaCandContas TSE · Monitoramento Orçamentário',
          dataReferencia: 'Outubro/2026 · 2º Turno RN',
          status: prop.viabilidadeOrcamentaria,
          detalheComplementar: `${prop.likes.toLocaleString('pt-BR')} apoios registrados na plataforma`,
        });
      });

    // 2. 🏛️ Atualizações oficiais (TSE, TRE-RN, Atos de Transição e Candidaturas registradas)
    ATOS_TRANSICAO_GOVERNO.forEach((ato) => {
      lista.push({
        id: `radar-ato-${ato.id}`,
        categoria: 'oficiais',
        classificacao: 'Informação oficial',
        titulo: `${ato.codigoAto} — ${ato.titulo}`,
        descricao: `Vinculado a: ${ato.propostaRelacionada}. Índice de Coerência Cívica: ${ato.coerenciaPopularPct}%.`,
        entidadeRelacionada: `Eixo ${ato.eixo} · Governo do RN`,
        fonte: 'Diário Oficial / Comissão de Transição & TSE',
        dataReferencia: ato.dataPublicacao,
        status: ato.statusConformidade,
        novaAtualizacaoOficial: true,
      });
    });

    candidatos.forEach((cand) => {
      lista.push({
        id: `radar-cand-${cand.id}`,
        categoria: 'oficiais',
        classificacao: 'Informação oficial',
        titulo: `Registro Oficial TSE: ${cand.nome} (${cand.partido} · Nº ${cand.numero})`,
        descricao: cand.resumoMonitoramento,
        entidadeRelacionada: `${cand.nome} — ${cand.cargo}`,
        fonte: cand.fonteFotoOficial || 'DivulgaCandContas TSE',
        dataReferencia: 'Outubro/2026 · Dados Oficiais TSE',
        status: 'Candidatura Registrada · Monitoramento Ativo',
        novaAtualizacaoOficial: true,
        detalheComplementar: `Eixos prioritários: ${cand.eixosPrioritarios.join(' · ')}`,
      });
    });

    // 3. 📋 Propostas em acompanhamento (Propostas registradas no TSE + Presidência)
    propostas.forEach((prop) => {
      lista.push({
        id: `radar-prop-${prop.id}`,
        categoria: 'propostas',
        classificacao: 'Acompanhamento',
        titulo: `[${prop.eixo}] ${prop.titulo}`,
        descricao: prop.descricao,
        entidadeRelacionada: `${prop.candidatoNome} (${prop.partido})`,
        fonte: 'DivulgaCandContas TSE',
        dataReferencia: 'Plano de Governo 2º Turno · 2026',
        status: `${prop.viabilidadeOrcamentaria} · ${prop.likes.toLocaleString('pt-BR')} likes`,
        detalheComplementar: prop.execucaoTransicao,
      });
    });

    PROPOSTAS_PRESIDENCIA_ANALISE.forEach((pres) => {
      const isDebateSemRegistro =
        pres.statusPlanoTSE === 'Debate Público / Sem Formalização no TSE';
      lista.push({
        id: `radar-pres-${pres.id}`,
        categoria: 'propostas',
        classificacao: isDebateSemRegistro ? 'Atualização pendente' : 'Informação oficial',
        titulo: `[Presidência · ${pres.eixo}] ${pres.propostaTitulo}`,
        descricao: `${pres.resumoProposta} Impacto no RN: ${pres.impactoNoRN}`,
        entidadeRelacionada: `${pres.candidato} (${pres.partidoNumero})`,
        fonte: 'DivulgaCandContas TSE / PPA Federal',
        dataReferencia: 'Monitoramento Nacional & RN 2026',
        status: pres.statusPlanoTSE,
        detalheComplementar: pres.analiseTecnica,
      });
    });

    // 4. 👥 Relatos cidadãos (Mural Cidadão + Demandas da Comunidade)
    relatos.forEach((rel) => {
      lista.push({
        id: `radar-relato-${rel.id}`,
        categoria: 'relatos',
        classificacao: 'Relato cidadão',
        titulo: `Relato de Mobilidade e Cidadania — ${rel.bairro}`,
        descricao: garantirNeutralidadeTexto(rel.mensagem, false),
        entidadeRelacionada: `Bairro: ${rel.bairro} (Autor: ${rel.autor})`,
        fonte: 'Relato cidadão (Mural Cidadão)',
        dataReferencia: rel.horario,
        status: 'Relato não verificado oficialmente · Moderação LGPD aprovada',
      });
    });

    feedbacks.forEach((fb) => {
      lista.push({
        id: `radar-fb-${fb.id}`,
        categoria: 'relatos',
        classificacao: 'Relato cidadão',
        titulo: `Demanda Comunitária [${fb.eixo}] — ${fb.bairro}`,
        descricao: garantirNeutralidadeTexto(fb.necessidade, false),
        entidadeRelacionada: `${fb.bairro} (${fb.autor})`,
        fonte: 'Canal de Feedback Comunitário',
        dataReferencia: fb.horario,
        status: `${fb.status} · ${fb.apoios} apoios da comunidade`,
      });
    });

    // 5. 📊 Avaliações da comunidade (Enquete de Benefícios)
    avaliacoes.forEach((av) => {
      lista.push({
        id: `radar-aval-${av.id}`,
        categoria: 'avaliacoes',
        classificacao: 'Opinião da comunidade',
        titulo: `Avaliação Cidadã sobre ${av.candidatoNome} (${av.aprovado ? 'Aprovado' : 'Ponto de Cobrança'})`,
        descricao: garantirNeutralidadeTexto(
          `Benefício apontado: "${av.fezDeBom}". Ponto cobrado pela comunidade: "${av.naoFez}".`,
          false
        ),
        entidadeRelacionada: av.candidatoNome,
        fonte: `Opinião da comunidade (por ${av.autor})`,
        dataReferencia: av.horario,
        status: 'Percepção de eleitor · Não constitui fato oficial nem acusação',
      });
    });

    // 6. 🤖 Análises do PotiguarBot (Boletins IA separados dos fatos oficiais)
    boletins.forEach((bol) => {
      lista.push({
        id: `radar-bol-${bol.id}`,
        categoria: 'analises-ia',
        classificacao: 'Análise da IA',
        titulo: bol.titulo,
        descricao: `${bol.resumoCandidatos} | Transporte: ${bol.statusTransporte}`,
        entidadeRelacionada: 'PotiguarBot IA · Monitoramento RN 2026',
        fonte: `PotiguarBot IA (Fontes consultadas: ${bol.fontesVerificadas})`,
        dataReferencia: bol.dataReferencia,
        status: 'Síntese analítica automatizada separada dos fatos brutos',
      });
    });

    return lista;
  }, [candidatos, avaliacoes, relatos, feedbacks, propostas, boletins]);

  // Estatísticas rápidas do Radar
  const contadores = useMemo(() => {
    return {
      total: itensConsolidados.length,
      atencao: itensConsolidados.filter((i) => i.categoria === 'atencao').length,
      oficiais: itensConsolidados.filter((i) => i.categoria === 'oficiais').length,
      propostas: itensConsolidados.filter((i) => i.categoria === 'propostas').length,
      relatos: itensConsolidados.filter((i) => i.categoria === 'relatos').length,
      avaliacoes: itensConsolidados.filter((i) => i.categoria === 'avaliacoes').length,
      analisesIA: itensConsolidados.filter((i) => i.categoria === 'analises-ia').length,
    };
  }, [itensConsolidados]);

  // Filtragem ativa
  const itensExibidos = useMemo(() => {
    return itensConsolidados.filter((item) => {
      const okCategoria =
        abaAtiva === 'todas' || abaAtiva === 'linha-do-tempo' || item.categoria === abaAtiva;
      const okClassificacao =
        filtroClassificacao === 'Todas' || item.classificacao === filtroClassificacao;
      const q = buscaTexto.trim().toLowerCase();
      const okBusca =
        !q ||
        item.titulo.toLowerCase().includes(q) ||
        item.descricao.toLowerCase().includes(q) ||
        item.entidadeRelacionada.toLowerCase().includes(q) ||
        item.fonte.toLowerCase().includes(q);
      return okCategoria && okClassificacao && okBusca;
    });
  }, [itensConsolidados, abaAtiva, filtroClassificacao, buscaTexto]);

  const renderBotaoVozItem = (item: ItemRadarConsolidado) => {
    const msgId = `tts-radar-${item.id}`;
    const isThisActive = ttsState.activeMessageId === msgId;
    const isPlaying = isThisActive && ttsState.status === 'playing';
    const isPaused = isThisActive && ttsState.status === 'paused';
    const isLoading = isThisActive && ttsState.status === 'loading';
    const wasPlayed = ttsState.playedMessageIds.includes(msgId);

    const textoParaLer = `Radar de Transparência. Classificação: ${item.classificacao}. Fonte: ${item.fonte}. Data: ${item.dataReferencia}. ${item.titulo}. ${item.descricao}`;

    if (isLoading) {
      return (
        <span className="text-[11px] font-semibold text-[var(--accent-color)] animate-pulse">
          ⏳ Gerando áudio...
        </span>
      );
    }

    if (isPlaying || isPaused) {
      return (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              isPlaying ? pauseTTSPlayback() : speakWithPotiguarTTS(msgId, textoParaLer)
            }
            className="botao px-2 py-1 rounded bg-amber-600 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Pause className="w-3 h-3" />
            <span>{isPlaying ? '⏸️ Pausar' : '▶️ Continuar'}</span>
          </button>
          <button
            type="button"
            onClick={() => stopTTSPlayback()}
            className="botao px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Square className="w-3 h-3" />
            <span>⏹️ Parar</span>
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => speakWithPotiguarTTS(msgId, textoParaLer)}
        className="botao px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[11px] font-semibold text-[var(--accent-color)] hover:border-[var(--accent-color)] inline-flex items-center gap-1 cursor-pointer"
      >
        {wasPlayed ? <RotateCcw className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        <span>{wasPlayed ? '🔊 Ouvir novamente' : '🔊 Ouvir'}</span>
      </button>
    );
  };

  return (
    <section
      id="radar-transparencia"
      className="bg-[var(--card-bg)] border-2 border-[var(--accent-color)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
    >
      {/* Cabeçalho do Radar de Transparência */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-color)]">
            <ShieldCheck className="w-4 h-4" />
            <span>Fiscalização Cidadã Organizada · Fluxo TSE → Firestore → Radar → PotiguarBot</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)]">
            Radar de Transparência Cívica e Eleitoral
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-[78ch]">
            Consolidação apartidária de atualizações oficiais do TSE, propostas em acompanhamento, relatos cidadãos, avaliações da comunidade e análises do PotiguarBot IA, com diferenciação rigorosa entre fato oficial, relato e análise.
          </p>
        </div>

        {/* Selo de Diretriz Apartidária & Classificação Rigorosa */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] text-xs space-y-1 max-w-sm shrink-0">
          <div className="font-bold text-[var(--text-color)] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--success-color)] shrink-0" />
            <span>Compromisso de Neutralidade e Rigor</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Relatos cidadãos e opiniões nunca são convertidos em acusações. Fatos oficiais (TSE), relatos não verificados e análises da IA possuem identificação visual e estrutural distinta.
          </p>
        </div>
      </div>

      {/* Navegação das 7 Visões do Radar de Transparência */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'todas' as const, label: `Visão Geral (${contadores.total})`, icon: Eye },
            {
              id: 'atencao' as const,
              label: `🔎 O que merece atenção (${contadores.atencao})`,
              icon: AlertTriangle,
            },
            {
              id: 'oficiais' as const,
              label: `🏛️ Atualizações oficiais (${contadores.oficiais})`,
              icon: Landmark,
            },
            {
              id: 'propostas' as const,
              label: `📋 Propostas em acompanhamento (${contadores.propostas})`,
              icon: FileText,
            },
            {
              id: 'relatos' as const,
              label: `👥 Relatos cidadãos (${contadores.relatos})`,
              icon: Users,
            },
            {
              id: 'avaliacoes' as const,
              label: `📊 Avaliações da comunidade (${contadores.avaliacoes})`,
              icon: BarChart3,
            },
            {
              id: 'analises-ia' as const,
              label: `🤖 Análises do PotiguarBot (${contadores.analisesIA})`,
              icon: Bot,
            },
            {
              id: 'linha-do-tempo' as const,
              label: `🕐 Linha do tempo`,
              icon: Clock,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaAtiva(tab.id)}
              className={`botao px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                abaAtiva === tab.id
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Barra de Filtro por Classificação da Informação (Parte 2) + Busca */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--text-muted)] mr-1 inline-flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Classificação:
            </span>
            {(
              [
                'Todas',
                'Informação oficial',
                'Informação verificada',
                'Acompanhamento',
                'Requer verificação',
                'Relato cidadão',
                'Opinião da comunidade',
                'Análise da IA',
                'Atualização pendente',
              ] as const
            ).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setFiltroClassificacao(cls)}
                className={`botao px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                  filtroClassificacao === cls
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Filtrar por candidato, bairro, fonte ou tema..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs text-[var(--text-color)]"
            />
          </div>
        </div>
      </div>

      {/* Renderização em Modo Linha do Tempo (🕐 Linha do tempo) ou Cards Classificados */}
      {abaAtiva === 'linha-do-tempo' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-color)]">
              🕐 Linha do Tempo Consolidada (TSE → Firestore → Radar → PotiguarBot)
            </span>
            <span>{itensExibidos.length} registros cronológicos</span>
          </div>

          <div className="relative pl-6 border-l-2 border-[var(--accent-color)] space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {itensExibidos.map((item) => {
              const estilo = obterEstiloClassificacao(item.classificacao);
              return (
                <div
                  key={`timeline-${item.id}`}
                  className="relative p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-2"
                >
                  <span
                    className={`w-3 h-3 rounded-full ${estilo.dotColor} absolute -left-[31px] top-5 border-2 border-[var(--card-bg)]`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {item.dataReferencia}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className={estilo.badgeClass}>● {item.classificacao}</span>
                      {item.novaAtualizacaoOficial && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            🏛️ Nova atualização oficial
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Fonte: <strong>{item.fonte}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-color)]">
                    {item.titulo}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {item.descricao}
                  </p>

                  <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-[var(--text-muted)]">
                      <strong>Entidade:</strong> {item.entidadeRelacionada} ·{' '}
                      <strong>Status:</strong> {item.status}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderBotaoVozItem(item)}
                      <button
                        type="button"
                        onClick={() =>
                          onAskPotiguarBot(
                            `No Radar de Transparência consta o registro "${item.titulo}" (Classificação: ${item.classificacao}, Fonte: ${item.fonte}, Status: ${item.status}). Explique os detalhes identificando Fonte, Data, Tipo de informação e Status.`
                          )
                        }
                        className="botao px-2.5 py-1 rounded bg-[var(--accent-color)] text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Analisar no PotiguarBot</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[680px] overflow-y-auto pr-1">
          {itensExibidos.map((item) => {
            const estilo = obterEstiloClassificacao(item.classificacao);
            return (
              <article
                key={item.id}
                className="p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2">
                  {/* Metadados limpos com diferenciação visual da classificação (Parte 2) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${estilo.dotColor}`} />
                      <span className={estilo.badgeClass}>{item.classificacao}</span>
                    </div>
                    {item.novaAtualizacaoOficial && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        🏛️ Nova atualização oficial
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-color)] leading-snug">
                    {item.titulo}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {item.descricao}
                  </p>

                  {item.detalheComplementar && (
                    <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[11px] text-[var(--text-color)]">
                      {item.detalheComplementar}
                    </div>
                  )}
                </div>

                {/* Bloco de Rastreabilidade: Fonte, Data, Entidade Relacionada e Status */}
                <div className="pt-3 border-t border-[var(--border-color)] space-y-2.5 text-[11px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[var(--text-muted)]">
                    <div>
                      <strong>Fonte:</strong> {item.fonte}
                    </div>
                    <div>
                      <strong>Data:</strong> {item.dataReferencia}
                    </div>
                    <div>
                      <strong>Entidade:</strong> {item.entidadeRelacionada}
                    </div>
                    <div>
                      <strong>Status:</strong> {item.status}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {renderBotaoVozItem(item)}
                    <button
                      type="button"
                      onClick={() =>
                        onAskPotiguarBot(
                          `Analise o item do Radar de Transparência: "${item.titulo}" (Fonte: ${item.fonte}, Tipo: ${item.classificacao}, Status: ${item.status}).`
                        )
                      }
                      className="botao px-3 py-1 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Consultar no PotiguarBot</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
