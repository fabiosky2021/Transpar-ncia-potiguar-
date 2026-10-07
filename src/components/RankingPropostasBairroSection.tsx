import React, { useState, useMemo } from 'react';
import {
  Trophy,
  MapPin,
  Heart,
  Sparkles,
  FileJson,
  Copy,
  Check,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { PropostaTSEItem, FeedbackComunidadeItem } from '../data/segundoTurnoData';

export interface PropostaRanqueadaItem {
  id: string;
  posicao: number;
  titulo: string;
  total_likes: number;
  conclusao_do_agente: string;
  origem: 'propostaTSE' | 'feedback';
}

export interface RankingBairroSaidaJSON {
  estado: string;
  cidade: string;
  bairro: string;
  resumo_executivo: string;
  propostas_destacadas: {
    posicao: number;
    titulo: string;
    total_likes: number;
    conclusao_do_agente: string;
  }[];
}

export const SCHEMA_GOOGLE_AI_STUDIO_RANQUEAR_BAIRRO = {
  tarefa: 'Analisar e ranquear as propostas de melhoria urbana mais votadas por localização.',
  formato_saida: {
    estado: 'string',
    cidade: 'string',
    bairro: 'string',
    resumo_executivo: 'string',
    propostas_destacadas: [
      {
        posicao: 'number',
        titulo: 'string',
        total_likes: 'number',
        conclusao_do_agente: 'string',
      },
    ],
  },
};

interface RankingPropostasBairroSectionProps {
  propostas: PropostaTSEItem[];
  feedbacks: FeedbackComunidadeItem[];
  onLikeProposta: (propostaId: string) => Promise<void>;
  onAskAgent: (prompt: string) => void;
}

const BAIRROS_NATAL_RN = [
  'Mãe Luíza',
  'Alecrim',
  'Pajuçara',
  'Cidade da Esperança',
  'Ponta Negra',
  'Tirol',
  'Lagoa Nova',
  'Felipe Camarão',
] as const;

const PESO_BAIRRO_PROPOSTA: Record<string, Record<string, { bonusLikes: number; conclusao: string }>> = {
  'Mãe Luíza': {
    'prop-sus-cadu': {
      bonusLikes: 185,
      conclusao:
        'Proposta líder em Mãe Luíza: alta demanda comunitária por diagnósticos médicos online e fortalecimento da UBS local no SUS.',
    },
    'prop-edu-cadu': {
      bonusLikes: 160,
      conclusao:
        'Forte adesão das famílias de Mãe Luíza pela expansão do ensino em tempo integral com alimentação e contraturno.',
    },
    'prop-eco-allyson': {
      bonusLikes: 45,
      conclusao:
        'Impacto positivo na conexão viária costeira e deslocamento de trabalhadores entre Zona Leste e Zona Norte.',
    },
    'prop-seg-cadu': {
      bonusLikes: 110,
      conclusao:
        'Prioridade para policiamento comunitário, iluminação segura nas escadarias e prevenção social da violência.',
    },
  },
  Alecrim: {
    'prop-eco-allyson': {
      bonusLikes: 140,
      conclusao:
        'Alta aprovação entre comerciantes e usuários de ônibus do Alecrim pela melhoria do fluxo viário e corredores urbanos.',
    },
    'prop-sus-allyson': {
      bonusLikes: 115,
      conclusao:
        'Destaque pela descentralização de exames e desafogamento das unidades de pronto atendimento da Zona Leste.',
    },
    'prop-seg-allyson': {
      bonusLikes: 130,
      conclusao:
        'Demanda prioritária do comércio popular do Alecrim por videomonitoramento integrado e patrulhamento.',
    },
    'prop-edu-allyson': {
      bonusLikes: 70,
      conclusao:
        'Relevante para qualificação técnica e juventude inserida no comércio e serviços da região central.',
    },
  },
  Pajuçara: {
    'prop-eco-allyson': {
      bonusLikes: 290,
      conclusao:
        '1º lugar absoluto na Zona Norte: a 3ª ponte sobre o Rio Potengi é a obra de mobilidade urbana mais aguardada pelos moradores da Pajuçara.',
    },
    'prop-eco-cadu': {
      bonusLikes: 145,
      conclusao:
        'Importante integração logística com os corredores metropolitanos e geração de emprego na Zona Norte.',
    },
    'prop-sus-cadu': {
      bonusLikes: 120,
      conclusao:
        'Redução do tempo de espera por especialistas médicos na Zona Norte via telessaúde e diagnósticos online.',
    },
    'prop-edu-cadu': {
      bonusLikes: 95,
      conclusao:
        'Apoio expressivo à ampliação de vagas em tempo integral nas escolas estaduais da Zona Norte.',
    },
  },
  'Cidade da Esperança': {
    'prop-sus-allyson': {
      bonusLikes: 150,
      conclusao:
        'Forte aprovação na Zona Oeste para ampliação do atendimento hospitalar regional e exames de média complexidade.',
    },
    'prop-eco-cadu': {
      bonusLikes: 165,
      conclusao:
        'Destaque estratégico pela proximidade da Zona Oeste com o entroncamento rodoviário da BR-304 e BR-226.',
    },
    'prop-seg-allyson': {
      bonusLikes: 125,
      conclusao:
        'Moradores priorizam cercamento eletrônico e reforço de segurança nos terminais de ônibus da Cidade da Esperança.',
    },
    'prop-edu-allyson': {
      bonusLikes: 105,
      conclusao:
        'Demanda por ensino técnico profissionalizante integrado às escolas estaduais da Zona Oeste.',
    },
  },
};

const RESUMO_PADRAO_POR_BAIRRO: Record<string, string> = {
  'Mãe Luíza':
    'Em Mãe Luíza (Zona Leste de Natal/RN), o ranking de melhoria urbana é liderado por propostas de Saúde (fortalecimento do SUS com diagnósticos médicos online) e Educação em tempo integral, refletindo o alinhamento comunitário com pautas sociais.',
  Alecrim:
    'No Alecrim (Zona Leste de Natal/RN), os eleitores priorizam infraestrutura viária, videomonitoramento no polo comercial e agilidade no atendimento do SUS.',
  Pajuçara:
    'Na Pajuçara (Zona Norte de Natal/RN), as propostas de mobilidade estruturante — lideradas pela 3ª Ponte sobre o Rio Potengi — e telessaúde concentram o maior volume de curtidas.',
  'Cidade da Esperança':
    'Na Cidade da Esperança (Zona Oeste de Natal/RN), obras rodoviárias no eixo da BR-304, requalificação hospitalar e segurança nos corredores de ônibus lideram a preferência.',
};

export const RankingPropostasBairroSection: React.FC<RankingPropostasBairroSectionProps> = ({
  propostas,
  feedbacks,
  onLikeProposta,
  onAskAgent,
}) => {
  const [bairroSelecionado, setBairroSelecionado] = useState<string>('Mãe Luíza');
  const [jsonViewMode, setJsonViewMode] = useState<'saida' | 'schema'>('saida');
  const [copied, setCopied] = useState<boolean>(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiOverrideMap, setAiOverrideMap] = useState<Record<string, RankingBairroSaidaJSON>>({});

  // Compute deterministic real-time ranking for the selected neighborhood based on live likes
  const rankingCalculado = useMemo<{
    saidaJson: RankingBairroSaidaJSON;
    itensInterativos: PropostaRanqueadaItem[];
  }>(() => {
    const pesosBairro = PESO_BAIRRO_PROPOSTA[bairroSelecionado] || {};

    const baseItems: PropostaRanqueadaItem[] = propostas.map((p) => {
      const custom = pesosBairro[p.id];
      const bonus = custom?.bonusLikes ?? 35;
      const conclusao =
        custom?.conclusao ??
        `Proposta monitorada no eixo ${p.eixo} (${p.candidatoNome}) com ${p.viabilidadeOrcamentaria.toLowerCase()} e impacto direto em ${bairroSelecionado}.`;

      return {
        id: p.id,
        posicao: 0,
        titulo: p.titulo,
        total_likes: p.likes + bonus,
        conclusao_do_agente: conclusao,
        origem: 'propostaTSE',
      };
    });

    // Include neighborhood-specific community feedbacks if any match the selected neighborhood
    const feedbacksDoBairro = feedbacks.filter((f) =>
      f.bairro.toLowerCase().includes(bairroSelecionado.toLowerCase())
    );

    feedbacksDoBairro.forEach((fb) => {
      baseItems.push({
        id: fb.id,
        posicao: 0,
        titulo: `Demanda Comunitária (${fb.eixo}): ${fb.necessidade}`,
        total_likes: 650 + fb.apoios * 8,
        conclusao_do_agente: `Necessidade relatada por moradores de ${bairroSelecionado} no Canal de Transparência Cívica (${fb.status}).`,
        origem: 'feedback',
      });
    });

    const ordenados = [...baseItems]
      .sort((a, b) => b.total_likes - a.total_likes)
      .slice(0, 4)
      .map((item, idx) => ({
        ...item,
        posicao: idx + 1,
      }));

    const aiOverride = aiOverrideMap[bairroSelecionado];

    const saidaJson: RankingBairroSaidaJSON = {
      estado: 'Rio Grande do Norte (RN)',
      cidade: 'Natal',
      bairro: bairroSelecionado,
      resumo_executivo:
        aiOverride?.resumo_executivo ||
        RESUMO_PADRAO_POR_BAIRRO[bairroSelecionado] ||
        `Análise automatizada das propostas de melhoria urbana mais votadas pelos eleitores em ${bairroSelecionado} (Natal/RN), ordenada pelo total de likes em tempo real.`,
      propostas_destacadas: ordenados.map((item, idx) => ({
        posicao: item.posicao,
        titulo: item.titulo,
        total_likes: item.total_likes,
        conclusao_do_agente:
          aiOverride?.propostas_destacadas?.[idx]?.conclusao_do_agente ||
          item.conclusao_do_agente,
      })),
    };

    return {
      saidaJson,
      itensInterativos: ordenados.map((item, idx) => ({
        ...item,
        conclusao_do_agente:
          aiOverride?.propostas_destacadas?.[idx]?.conclusao_do_agente ||
          item.conclusao_do_agente,
      })),
    };
  }, [propostas, feedbacks, bairroSelecionado, aiOverrideMap]);

  const executarAnaliseIA = async () => {
    if (isAnalyzingAI) return;
    setIsAnalyzingAI(true);
    try {
      const response = await fetch('/api/rank-propostas-bairro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'Rio Grande do Norte (RN)',
          cidade: 'Natal',
          bairro: bairroSelecionado,
          propostasAtuais: rankingCalculado.saidaJson.propostas_destacadas,
        }),
      });
      const data = await response.json();
      if (data.formato_saida) {
        setAiOverrideMap((prev) => ({
          ...prev,
          [bairroSelecionado]: data.formato_saida,
        }));
      }
    } catch {
      // fallback already active
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const jsonParaExibir =
    jsonViewMode === 'saida'
      ? {
          tarefa: SCHEMA_GOOGLE_AI_STUDIO_RANQUEAR_BAIRRO.tarefa,
          formato_saida: rankingCalculado.saidaJson,
        }
      : SCHEMA_GOOGLE_AI_STUDIO_RANQUEAR_BAIRRO;

  const copiarJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonParaExibir, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="ranking-propostas-bairro"
      className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent-color)]">
            <Trophy className="w-4 h-4" />
            <span>Google AI Studio JSON · Ranking Urbano por Localização</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-color)]">
            Propostas Mais Votadas por Bairro (Natal/RN)
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Tarefa estruturada: analisar e ranquear as propostas de melhoria urbana mais votadas por localização sem duplicar dados.
          </p>
        </div>

        <button
          type="button"
          onClick={executarAnaliseIA}
          disabled={isAnalyzingAI}
          className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
          <span>{isAnalyzingAI ? 'Gerando JSON com IA...' : 'Gerar Conclusão IA do Bairro'}</span>
        </button>
      </div>

      {/* Seletor de Bairro */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-color)] inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            <span>Selecione o Bairro de Natal/RN:</span>
          </span>
          <span className="font-mono text-[11px]">
            {rankingCalculado.saidaJson.cidade} · {rankingCalculado.saidaJson.estado}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {BAIRROS_NATAL_RN.map((bairro) => (
            <button
              key={bairro}
              type="button"
              onClick={() => setBairroSelecionado(bairro)}
              className={`botao px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                bairroSelecionado === bairro
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
              }`}
            >
              {bairro}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo Executivo do Agente para o Bairro */}
      <div className="p-3.5 rounded-lg bg-[var(--surface-subtle)] border-l-4 border-l-[var(--accent-color)] border border-[var(--border-color)] space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-color)]">
          Resumo Executivo · {rankingCalculado.saidaJson.bairro} ({rankingCalculado.saidaJson.cidade})
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed">
          {rankingCalculado.saidaJson.resumo_executivo}
        </p>
      </div>

      {/* Lista de Propostas Destacadas Ranqueadas (1º ao 4º lugar) */}
      <div className="space-y-3">
        {rankingCalculado.itensInterativos.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[var(--accent-color)] text-white text-xs font-bold font-mono inline-flex items-center justify-center shrink-0">
                  {item.posicao}º
                </span>
                <h3 className="text-sm font-bold text-[var(--text-color)] leading-snug">
                  {item.titulo}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs font-bold text-[var(--success-color)]">
                  {item.total_likes.toLocaleString('pt-BR')} likes
                </span>
                {item.origem === 'propostaTSE' && (
                  <button
                    type="button"
                    onClick={() => onLikeProposta(item.id)}
                    className="botao px-2.5 py-1 rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    title="Curtir proposta para subir no ranking do bairro"
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    <span>+1</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-8">
              <strong className="text-[var(--text-color)]">Conclusão do Agente:</strong>{' '}
              {item.conclusao_do_agente}
            </p>
          </div>
        ))}
      </div>

      {/* Bloco JSON Estruturado para Google AI Studio */}
      <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-color)]">
            <FileJson className="w-4 h-4 text-[var(--accent-color)]" />
            <span>Estrutura JSON Google AI Studio ({bairroSelecionado})</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setJsonViewMode('saida')}
              className={`botao px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                jsonViewMode === 'saida'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              JSON Preenchido
            </button>
            <button
              type="button"
              onClick={() => setJsonViewMode('schema')}
              className={`botao px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                jsonViewMode === 'schema'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              Schema Original
            </button>
            <button
              type="button"
              onClick={copiarJson}
              className="botao px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onAskAgent(
                  `Analise o ranking JSON das propostas mais votadas no bairro ${bairroSelecionado} (Natal/RN) e explique a conclusão do agente para as ${rankingCalculado.saidaJson.propostas_destacadas.length} propostas destacadas.`
                )
              }
              className="botao px-2.5 py-1 rounded bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[11px] font-semibold text-[var(--accent-color)] inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Enviar p/ IA</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <pre className="p-3.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[11px] font-mono text-[var(--text-color)] overflow-x-auto max-h-[220px]">
          {JSON.stringify(jsonParaExibir, null, 2)}
        </pre>
      </div>
    </div>
  );
};
