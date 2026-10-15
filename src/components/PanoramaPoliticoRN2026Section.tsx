import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Sparkles,
  Users,
  Building2,
  HeartPulse,
  GraduationCap,
  Landmark,
  TrendingUp,
  Heart,
  ExternalLink,
  SlidersHorizontal,
  Volume2,
  Bot,
  Scale,
  FileText,
} from 'lucide-react';
import senadoImg from '../assets/images/senado_votacao_pec_1792087922644.jpg';
import camaraImg from '../assets/images/camara_federal_pec_1792087938378.jpg';
import { speakWithPotiguarTTS } from '../services/ttsService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import {
  CANDIDATOS_PRESIDENCIA_BRASIL_2026,
  DISPUTA_GOVERNO_RN_2026,
  PANORAMA_CARGOS_RN_2026,
  CandidatoCargoRN2026,
} from '../data/panoramaRN2026Data';
import { CandidatoItem } from '../data/platformData';

interface PanoramaPoliticoRN2026SectionProps {
  onAskAgent: (prompt: string) => void;
  candidatos?: CandidatoItem[];
  unlockedAffiliates?: Record<string, boolean>;
  onLikeCandidate?: (candId: string) => void;
  onOpenAffiliateEditor?: (candId: string, currentLink: string, currentProd: string) => void;
}

export const PanoramaPoliticoRN2026Section: React.FC<PanoramaPoliticoRN2026SectionProps> = ({
  onAskAgent,
  candidatos = [],
  unlockedAffiliates = {},
  onLikeCandidate,
  onOpenAffiliateEditor,
}) => {
  const [cargoFiltro, setCargoFiltro] = useState<
    'Todos' | 'Senador' | 'Deputado Federal' | 'Deputado Estadual'
  >('Todos');
  const [imgStage, setImgStage] = useState<Record<string, number>>({});
  const [presidenciaAbertaIA, setPresidenciaAbertaIA] = useState<Record<string, boolean>>({
    'pres-lula-13': true,
    'pres-flavio-bolsonaro-22': true,
  });

  const handleImgError = (id: string) => {
    setImgStage((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const getInitials = (nome: string) =>
    nome
      .replace(/\(.*\)/g, '')
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();

  const renderFoto = (
    id: string,
    nome: string,
    fotoUrl: string,
    fotoFallbackUrl: string,
    className = 'w-20 h-24 sm:w-24 sm:h-28'
  ) => {
    const stage = imgStage[id] ?? 0;
    const src = stage === 0 ? fotoUrl : stage === 1 && fotoFallbackUrl ? fotoFallbackUrl : null;

    return (
      <div
        className={`${className} rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-800 shrink-0 relative flex items-center justify-center shadow-[var(--subcard-shadow)]`}
      >
        {src ? (
          <img
            src={src}
            alt={`Foto de ${nome}`}
            referrerPolicy="no-referrer"
            onError={() => handleImgError(id)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white p-2 text-center">
            <span className="text-lg font-bold tracking-wider">{getInitials(nome)}</span>
            <span className="text-[9px] text-slate-300 leading-tight mt-1 line-clamp-2">
              {nome}
            </span>
          </div>
        )}
      </div>
    );
  };

  const chartDataGoverno = DISPUTA_GOVERNO_RN_2026.map((c) => ({
    id: c.id,
    nomeUrna: `${c.nome.split('(')[0].split('/')[0].trim()} (${c.numero})`,
    partido: c.partido,
    porcentagem: c.porcentagem_votos_validos,
    label: `${c.porcentagem_votos_validos}% (${c.segundoTurno ? '2ºT' : '1ºT'})`,
    cor: c.corTema,
  }));

  const cargosLegislativosValidados = PANORAMA_CARGOS_RN_2026.filter(
    (c) => c.cargo !== 'Presidente da República' && c.cargo !== 'Governador'
  );

  const cargosFiltrados: CandidatoCargoRN2026[] =
    cargoFiltro === 'Todos'
      ? cargosLegislativosValidados
      : cargosLegislativosValidados.filter((c) => c.cargo === cargoFiltro);

  return (
    <section
      id="colinha-politica-2026"
      className="card-clean p-4 sm:p-8 space-y-8 sm:space-y-10 overflow-hidden"
    >
      {/* Top Header: Colinha Política RN 2026 & Segundo Turno Governo RN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[var(--border-color)] pb-5">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-color)]">
            <Award className="w-4 h-4 shrink-0" />
            <span>Colinha Política RN 2026 · Panorama Político do Rio Grande do Norte</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-color)] leading-tight">
            Disputa pelo Governo do RN (2º Turno) & Destaques Absolutos 2026
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-[75ch]">
            Candidatos ao <strong>2º Turno no RN</strong>: <strong>Allyson Bezerra (UNIÃO · 44)</strong> e{' '}
            <strong>Carlos Eduardo Xavier / Cadu de Lula (PT · 13)</strong>, além da lista completa de Governadores,
            Senadores, Deputados Federais, Deputados Estaduais, Presidente da República e alinhamento comunitário para{' '}
            <strong>Mãe Luíza</strong>.
          </p>
        </div>

        {/* Atalhos Rápidos Validados (Sem Repetição de Card Presidencial no Topo) */}
        <div className="subcard-clean p-4 sm:p-5 space-y-3 w-full lg:max-w-md shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--success-color)]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Dados Validados · DivulgaCandContas TSE</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-snug">
            Painel revisado e sem duplicidades: Governadores do RN, Candidatos a Presidente do Brasil, Legislativo e Varredura Mãe Luíza.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <a
              href="#candidatos-presidente-brasil-2026"
              className="botao px-3 py-1.5 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold no-underline"
            >
              Ver Candidatos a Presidente ↓
            </a>
            <a
              href="#quiz-afinidade-5-perguntas"
              className="botao px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs font-semibold text-[var(--text-color)] no-underline"
            >
              Ir ao Quiz 5 Perguntas ↓
            </a>
          </div>
        </div>
      </div>

      {/* Bloco 1: Governadores - Candidatos (37% Allyson 44 | 32% Cadu de Lula 13 | 29% Álvaro Dias 22) */}
      <div className="space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--accent-color)] shrink-0" />
              <span>Governadores - Candidatos & Segundo Turno no RN</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Comparativo oficial de votos válidos e propostas prioritárias para o Governo do Rio Grande do Norte
            </p>
          </div>
          <span className="px-3 py-1 rounded-md bg-[var(--surface-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--success-color)] self-start sm:self-auto">
            2º Turno RN: Allyson Bezerra (UNIÃO 44) vs. Cadu de Lula (PT 13)
          </span>
        </div>

        {/* Gráfico Horizontal de Porcentagem de Votos Válidos (37%, 32%, 29%) */}
        <div className="subcard-clean p-4 sm:p-6 space-y-3 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-color)]">
              Disputa pelo Governo do Rio Grande do Norte (% Votos Válidos)
            </span>
            <span className="font-mono text-[11px]">Allyson 37% · Cadu de Lula 32% · Álvaro Dias 29%</span>
          </div>
          <div className="w-full h-48 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartDataGoverno}
                layout="vertical"
                margin={{ top: 8, right: 62, left: 4, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis
                  type="number"
                  domain={[0, 45]}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  stroke="var(--border-color)"
                />
                <YAxis
                  type="category"
                  dataKey="nomeUrna"
                  width={112}
                  tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-color)' }}
                  stroke="var(--border-color)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, _name: any, props: any) => [
                    `${val}% dos votos válidos`,
                    props.payload.partido,
                  ]}
                />
                <Bar dataKey="porcentagem" radius={[0, 6, 6, 0]} barSize={28}>
                  {chartDataGoverno.map((entry) => (
                    <Cell key={entry.id} fill={entry.cor} />
                  ))}
                  <LabelList
                    dataKey="label"
                    position="right"
                    style={{
                      fill: 'var(--text-color)',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cards dos 3 Candidatos ao Governo do RN com Fotos, Propostas e Like-to-Unlock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {DISPUTA_GOVERNO_RN_2026.map((gov) => {
            const baseId = gov.id.replace(/-\d+$/, '');
            const candLive = candidatos.find((c) => c.id === baseId);
            const likesCount = candLive?.curtidas ?? 4500;
            const isUnlocked = Boolean(unlockedAffiliates[baseId]);

            return (
              <article
                key={gov.id}
                className="subcard-clean p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {renderFoto(gov.id, gov.nome, gov.fotoUrl, gov.fotoFallbackUrl, 'w-20 h-26')}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
                          style={{ backgroundColor: gov.corTema }}
                        >
                          Nº {gov.numero} · {gov.siglaPartido}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          {gov.porcentagem_votos_validos}% Votos Válidos
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[var(--text-color)] leading-snug">
                        {gov.nome}
                      </h4>
                      <p className="text-[11px] font-semibold text-[var(--success-color)]">
                        ★ {gov.destaque}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {gov.focoPrincipal}
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[var(--text-color)]">
                      Propostas Registradas:
                    </div>
                    <ul className="space-y-1 text-xs text-[var(--text-color)]">
                      {gov.propostas.map((prop) => (
                        <li key={prop} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success-color)] shrink-0 mt-0.5" />
                          <span>{prop}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    {onLikeCandidate && (
                      <button
                        type="button"
                        onClick={() => onLikeCandidate(baseId)}
                        className="botao flex-1 py-2 px-3 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>Apoiar ({likesCount.toLocaleString('pt-BR')})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onAskAgent(
                          `Analise detalhadamente as propostas de ${gov.nome} (${gov.partido} - ${gov.numero}) para o Governo do RN (${gov.porcentagem_votos_validos}% dos votos válidos).`
                        )
                      }
                      className="botao flex-1 py-2 px-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                      <span>Analisar na IA</span>
                    </button>
                  </div>

                  {isUnlocked && candLive && (
                    <div className="p-2.5 rounded-lg bg-[var(--success-bg)] border border-dashed border-[var(--success-color)] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--success-color)]">
                          Oferta Liberada: {candLive.produtoRecomendado}
                        </span>
                        {onOpenAffiliateEditor && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenAffiliateEditor(
                                baseId,
                                candLive.linkAfiliado,
                                candLive.produtoRecomendado
                              )
                            }
                            className="underline text-[11px] text-[var(--text-muted)] cursor-pointer inline-flex items-center gap-1"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        )}
                      </div>
                      {candLive.linkAfiliado !== 'AGUARDANDO_SEU_LINK' && (
                        <a
                          href={candLive.linkAfiliado}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[var(--accent-color)] underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Acessar recomendação parceira</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bloco 1.5: IA · Candidatos a Presidente do Brasil e Suas Propostas de Governo Federal (Eleições 2026) */}
      <div
        id="candidatos-presidente-brasil-2026"
        className="space-y-6 pt-6 border-t border-[var(--border-color)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent-color)] mb-1">
              <Bot className="w-4 h-4" />
              <span>Análise de IA Integrada · Planos de Governo Federal Registrados no TSE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[var(--accent-color)]" />
              <span>Candidatos a Presidente do Brasil e Suas Propostas de Governo Federal</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Comparativo completo dos candidatos à Presidência da República (2º Turno Nacional: Lula 13 vs. Flávio Bolsonaro 22, além de Romeu Zema 30 e Ronaldo Caiado 55 no 1º Turno) com propostas federais, parecer técnico da IA no próprio card e leitura em voz natural.
            </p>
          </div>
          <a
            href="#quiz-afinidade-5-perguntas"
            className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1.5 no-underline shrink-0 self-start"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ir para o Quiz Presidencial & RN</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CANDIDATOS_PRESIDENCIA_BRASIL_2026.map((pres) => {
            const mostrarIA = Boolean(presidenciaAbertaIA[pres.id]);
            const textoVozPres = `Candidato a Presidente do Brasil: ${pres.nome}, partido ${pres.siglaPartido}, número ${pres.numero}. ${pres.porcentagemPrimeiroTurno}. Resumo do plano de governo federal: ${pres.resumoPlanoFederal}. ${pres.analiseIA}`;

            return (
              <article
                key={pres.id}
                className="subcard-clean p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {renderFoto(
                      pres.id,
                      pres.nome,
                      pres.fotoUrl,
                      pres.fotoFallbackUrl,
                      'w-20 h-26'
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase text-white"
                          style={{ backgroundColor: pres.corTema }}
                        >
                          Presidente · Nº {pres.numero} · {pres.siglaPartido}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          {pres.porcentagemPrimeiroTurno}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[var(--text-color)] leading-snug">
                        {pres.nome}
                      </h4>
                      <p className="text-[11px] font-semibold text-[var(--success-color)]">
                        ★ {pres.destaque}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {pres.resumoPlanoFederal}
                  </p>

                  {/* Lista de Propostas de Governo Federal por Eixo */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[var(--text-color)]">
                      📋 Propostas de Governo Federal (TSE):
                    </div>
                    <div className="space-y-1.5">
                      {pres.propostasGovernoFederal.map((itemProp) => (
                        <div
                          key={itemProp.eixo}
                          className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs"
                        >
                          <span className="font-bold text-[var(--accent-color)]">
                            {itemProp.eixo}:{' '}
                          </span>
                          <span className="text-[var(--text-color)]">{itemProp.proposta}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parecer da IA renderizado diretamente dentro do Card (sem precisar pular para o chat) */}
                  {mostrarIA && (
                    <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-[var(--subcard-shadow)] space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[var(--accent-color)] flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" />
                          <span>🤖 Análise da IA · Viabilidade & Impacto no RN</span>
                        </span>
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          {pres.statusTSE}
                        </span>
                      </div>
                      <p className="text-[var(--text-color)] leading-relaxed">{pres.analiseIA}</p>
                      <p className="text-[var(--success-color)] leading-relaxed">
                        <strong>Reflexo no RN:</strong> {pres.impactoNoRN}
                      </p>
                    </div>
                  )}
                </div>

                {/* Barra de Ações do Card Presidencial (IA Direto no Card + Voz Natural + Chat) */}
                <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPresidenciaAbertaIA((prev) => ({
                          ...prev,
                          [pres.id]: !prev[pres.id],
                        }))
                      }
                      className="botao px-3 py-1.5 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>
                        {mostrarIA ? 'Ocultar Análise IA' : 'Ver Análise IA das Propostas'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => speakWithPotiguarTTS(`pres-card-${pres.id}`, textoVozPres)}
                      className="botao px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)] text-xs font-semibold text-[var(--accent-color)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>🔊 Ouvir Propostas</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onAskAgent(
                        `Analise as propostas de governo federal de ${pres.nome} (${pres.siglaPartido} · ${pres.numero}) para a Presidência do Brasil e os impactos para o Rio Grande do Norte.`
                      )
                    }
                    className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent-color)] underline cursor-pointer"
                  >
                    Debater no Chat IA ↗
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bloco 2: Seções por Cargo Legislativo (Senadores, Deputados Federais, Deputados Estaduais — Sem Repetir Presidente) */}
      <div className="space-y-6 pt-6 border-t border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--accent-color)]" />
              <span>Destaques Absolutos para o Legislativo no RN (Senado, Câmara e ALRN)</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Senadores, Deputados Federais e Deputados Estaduais validados e mais citados nas pesquisas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                'Todos',
                'Senador',
                'Deputado Federal',
                'Deputado Estadual',
              ] as const
            ).map((filtro) => (
              <button
                key={filtro}
                type="button"
                onClick={() => setCargoFiltro(filtro)}
                className={`botao px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  cargoFiltro === filtro
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                }`}
              >
                {filtro === 'Todos'
                  ? `Todos os Cargos (${cargosLegislativosValidados.length})`
                  : `${filtro}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Banners com Imagens do Senado e Câmara Federal: Votação da PEC 221/2019 */}
        {(cargoFiltro === 'Todos' || cargoFiltro === 'Senador' || cargoFiltro === 'Deputado Federal') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Imagem e Atualização do Senado Federal */}
            {(cargoFiltro === 'Todos' || cargoFiltro === 'Senador') && (
              <div className="subcard-clean overflow-hidden flex flex-col justify-between border-2 border-blue-500/25">
                <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={senadoImg}
                    alt="Plenário do Senado Federal durante votação da PEC"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold w-fit uppercase tracking-wider mb-1">
                      🏛️ Senado Federal · Votação PEC 221/2019
                    </span>
                    <h4 className="text-sm sm:text-base font-bold leading-tight drop-shadow-sm">
                      CCJ do Senado aprova Fim da Escala 6x1
                    </h4>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Data: <strong>02/09/2026</strong></span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">● Aprovado na CCJ</span>
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed m-0">
                    A bancada do Senado no RN (Carlos Eduardo Alves e Rogério Marinho) acompanha o projeto que reduz a jornada máxima para 36h semanais.
                  </p>
                </div>
              </div>
            )}

            {/* Imagem e Atualização da Câmara Federal */}
            {(cargoFiltro === 'Todos' || cargoFiltro === 'Deputado Federal') && (
              <div className="subcard-clean overflow-hidden flex flex-col justify-between border-2 border-emerald-500/25">
                <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={camaraImg}
                    alt="Plenário da Câmara dos Deputados em sessão deliberativa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-[10px] font-bold w-fit uppercase tracking-wider mb-1">
                      🏛️ Câmara dos Deputados · Bancada Federal
                    </span>
                    <h4 className="text-sm sm:text-base font-bold leading-tight drop-shadow-sm">
                      8 Deputados Federais do RN em Pauta
                    </h4>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Quórum: <strong>308 votos (3/5)</strong></span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">● 2 Turnos de Voto</span>
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed m-0">
                    Na Câmara Federal, Natália Bonavides (PT), Nina Souza, Benes Leocádio e Dr. Bernardo analisam os impactos no setor produtivo potiguar.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cargosFiltrados.map((item) => (
            <div
              key={item.id}
              className="subcard-clean p-6 flex flex-col sm:flex-row gap-4 items-start justify-between"
            >
              {renderFoto(item.id, item.nome, item.fotoUrl, item.fotoFallbackUrl, 'w-20 h-24')}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[var(--accent-color)]/15 text-[var(--accent-color)] text-[11px] font-bold uppercase">
                    {item.cargo}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">
                    Partido: {item.partido} · Nº {item.numero}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-[var(--text-color)]">{item.nome}</h4>

                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  ★ {item.destaque}
                </div>

                {/* Badge do Posicionamento na PEC 221/2019 (Fim da Escala 6x1) */}
                {(item.cargo === 'Senador' || item.cargo === 'Deputado Federal') && (
                  <div className="p-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[11px] flex items-start gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-color)]">Posição na PEC 221/2019: </strong>
                      <span className="text-[var(--text-muted)]">
                        {item.nome.includes('Carlos Eduardo')
                          ? 'Favorável à transição gradual com garantia da renda e diálogo com o comércio potiguar.'
                          : item.nome.includes('Rogério Marinho')
                          ? 'Acompanha impacto fiscal, defendendo equilíbrio para pequenas empresas e setor privado.'
                          : item.nome.includes('Natália Bonavides')
                          ? 'Coautora e atuante pelo fim imediato da escala 6x1 e jornada de 36h sem redução salarial.'
                          : item.nome.includes('Nina')
                          ? 'Foco na proteção da saúde laboral e garantia de descanso semanal digno.'
                          : item.nome.includes('Benes Leocádio')
                          ? 'Atenção aos impactos nos municípios e serviços essenciais de saúde.'
                          : 'Acompanhando deliberação das comissões temáticas no Congresso Nacional.'}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {item.resumoAtuacao}
                </p>

                <ul className="space-y-1 text-xs text-[var(--text-color)] pt-1">
                  {item.propostasChave.map((p) => (
                    <li key={p} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success-color)] shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloco 3: Varredura Política Atualizada (Upgrade) & Benefícios Políticos para a Comunidade de Mãe Luíza */}
      <div className="subcard-clean p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--success-color)] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Varredura Política Atualizada (Upgrade) · Foco Comunitário</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-color)]">
              Propostas Prioritárias e Benefícios Políticos para a Comunidade de Mãe Luíza
            </h3>
          </div>
          <button
            type="button"
            onClick={() =>
              onAskAgent(
                'Quais são os candidatos e benefícios políticos alinhados com a comunidade de Mãe Luíza em Saúde (SUS online) e Educação em tempo integral?'
              )
            }
            className="botao px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer self-start"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultar Varredura Mãe Luíza na IA</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-[var(--subcard-shadow)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              <HeartPulse className="w-4 h-4" />
              <span>Governador Alinhado a Mãe Luíza</span>
            </div>
            <div className="text-base font-bold text-[var(--text-color)]">
              Cadu de Lula / Carlos Eduardo Xavier (PT · 13)
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Apresentou propostas focadas na <strong>regionalização do SUS</strong>, fortalecimento do sistema com{' '}
              <strong>diagnósticos médicos online</strong> e <strong>expansão da educação em tempo integral</strong>.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-[var(--subcard-shadow)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-4 h-4" />
              <span>Deputado Estadual / Vereador Alinhado</span>
            </div>
            <div className="text-base font-bold text-[var(--text-color)]">
              Daniel Valença (PT · 13)
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Trabalho focado em <strong>pautas sociais, educação e saúde</strong>, alinhando-se diretamente às
              prioridades históricas e comunitárias do bairro de <strong>Mãe Luíza</strong>.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-[var(--subcard-shadow)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Landmark className="w-4 h-4" />
              <span>Senado Federal & Câmara Federal</span>
            </div>
            <div className="text-base font-bold text-[var(--text-color)]">
              Carlos Eduardo Alves · Rogério Marinho (555) · Benes Leocádio
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              <strong>Carlos Eduardo Alves</strong> (Destaque absoluto no Senado),{' '}
              <strong>Rogério Marinho (PL · 555)</strong> (reformas fiscais e setor privado) e{' '}
              <strong>Benes Leocádio (União)</strong> (emendas parlamentares para a saúde pública do RN).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
