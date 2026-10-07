import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Copy,
  Check,
  FileJson,
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
} from 'lucide-react';
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
  PRESIDENTE_REFERENCIA_2026,
  DISPUTA_GOVERNO_RN_2026,
  PANORAMA_CARGOS_RN_2026,
  JSON_DISPUTA_GOVERNO_RN,
  JSON_PANORAMA_POLITICO_RN_2026,
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
    'Todos' | 'Governador' | 'Senador' | 'Deputado Federal' | 'Deputado Estadual'
  >('Todos');
  const [imgStage, setImgStage] = useState<Record<string, number>>({});
  const [jsonTab, setJsonTab] = useState<'panorama' | 'governo'>('panorama');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

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
        className={`${className} rounded-xl overflow-hidden border-2 border-[var(--border-color)] bg-slate-800 shrink-0 relative flex items-center justify-center shadow-sm`}
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
    nomeUrna: `${c.nome.split('(')[0].trim()} (${c.numero})`,
    partido: c.partido,
    porcentagem: c.porcentagem_votos_validos,
    label: `${c.porcentagem_votos_validos}% (${c.segundoTurno ? '2º Turno' : '1º Turno'})`,
    cor: c.corTema,
  }));

  const cargosFiltrados: CandidatoCargoRN2026[] =
    cargoFiltro === 'Todos'
      ? PANORAMA_CARGOS_RN_2026
      : PANORAMA_CARGOS_RN_2026.filter((c) => c.cargo === cargoFiltro);

  const copiarJsonAtivo = async () => {
    const texto =
      jsonTab === 'panorama'
        ? JSON.stringify(JSON_PANORAMA_POLITICO_RN_2026, null, 2)
        : JSON.stringify(JSON_DISPUTA_GOVERNO_RN, null, 2);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <section
      id="colinha-politica-2026"
      className="space-y-10 bg-[var(--card-bg)] border-2 border-[var(--accent-color)] rounded-2xl p-6 sm:p-8 shadow-sm"
    >
      {/* Top Header: Colinha Política RN 2026 & Segundo Turno Governo RN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[var(--border-color)] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-color)]">
            <Award className="w-4 h-4" />
            <span>Colinha Política RN 2026 · Panorama Político do Rio Grande do Norte</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)] leading-tight">
            Disputa pelo Governo do RN (2º Turno) & Destaques Absolutos 2026
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-[75ch]">
            Candidatos ao <strong>2º Turno no RN</strong>: <strong>Allyson Bezerra (UNIÃO · 44)</strong> e{' '}
            <strong>Carlos Eduardo Xavier / Cadu de Lula (PT · 13)</strong>, além da lista completa de Governadores,
            Senadores, Deputados Federais, Deputados Estaduais, Presidente da República e alinhamento comunitário para{' '}
            <strong>Mãe Luíza</strong>.
          </p>
        </div>

        {/* Card do Presidente da República (Referência Nacional & Apoio no RN) */}
        <div className="bg-[var(--surface-subtle)] border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-4 max-w-md shrink-0">
          {renderFoto(
            PRESIDENTE_REFERENCIA_2026.id,
            PRESIDENTE_REFERENCIA_2026.nome,
            PRESIDENTE_REFERENCIA_2026.fotoUrl,
            PRESIDENTE_REFERENCIA_2026.fotoFallbackUrl,
            'w-16 h-20'
          )}
          <div className="space-y-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Presidência da República · Nº {PRESIDENTE_REFERENCIA_2026.numero}
            </div>
            <div className="text-sm font-bold text-[var(--text-color)] truncate">
              {PRESIDENTE_REFERENCIA_2026.nome}
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-snug line-clamp-2">
              {PRESIDENTE_REFERENCIA_2026.destaque} — Obras na BR-304, Ensino Integral e SUS Digital.
            </p>
          </div>
        </div>
      </div>

      {/* Bloco 1: Governadores - Candidatos (37% Allyson 44 | 32% Cadu de Lula 13 | 29% Álvaro Dias 22) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--accent-color)]" />
              <span>Governadores - Candidatos & Segundo Turno no RN</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Comparativo oficial de votos válidos e propostas prioritárias para o Governo do Rio Grande do Norte
            </p>
          </div>
          <span className="px-3 py-1 rounded-md bg-[var(--surface-subtle)] border border-[var(--border-color)] text-xs font-semibold text-[var(--success-color)]">
            2º Turno RN: Allyson Bezerra (UNIÃO 44) vs. Carlos Eduardo Xavier / Cadu de Lula (PT 13)
          </span>
        </div>

        {/* Gráfico Horizontal de Porcentagem de Votos Válidos (37%, 32%, 29%) */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-color)]">
              Disputa pelo Governo do Rio Grande do Norte (% Votos Válidos)
            </span>
            <span className="font-mono">Allyson 37% · Cadu de Lula 32% · Álvaro Dias 29%</span>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartDataGoverno}
                layout="vertical"
                margin={{ top: 8, right: 110, left: 10, bottom: 8 }}
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
                  width={150}
                  tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--text-color)' }}
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
                className={`rounded-xl p-5 bg-[var(--surface-subtle)] border-2 transition-all flex flex-col justify-between space-y-4 ${
                  gov.segundoTurno
                    ? 'border-[var(--accent-color)] shadow-sm'
                    : 'border-[var(--border-color)]'
                }`}
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

      {/* Bloco 2: Seções por Cargo Político (Senadores, Deputados Federais, Deputados Estaduais) */}
      <div className="space-y-6 pt-6 border-t border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--accent-color)]" />
              <span>Destaques Absolutos nas Intenções de Voto por Cargo (RN 2026)</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Senadores, Deputados Federais e Deputados Estaduais mais citados nas pesquisas e varredura política
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['Todos', 'Senador', 'Deputado Federal', 'Deputado Estadual'] as const).map(
              (filtro) => (
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
                  {filtro === 'Todos' ? 'Todos os Cargos (10)' : `${filtro}s`}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cargosFiltrados.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex flex-col sm:flex-row gap-4 items-start justify-between"
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
      <div className="p-6 rounded-xl bg-[var(--surface-subtle)] border-2 border-[var(--border-color)] space-y-5">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2">
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

          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2">
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

          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-2">
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

      {/* Bloco 4: JSON Atualizado e Prompt Mestre para Landing Page */}
      <div className="p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-[var(--accent-color)]" />
            <div>
              <h4 className="text-sm font-bold text-[var(--text-color)]">
                JSON Atualizado e Base de Dados Oficial (Eleições RN 2026)
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                Estrutura JSON sincronizada com Governadores, Deputados Estaduais, Deputados Federais e Senadores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setJsonTab('panorama')}
              className={`botao px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                jsonTab === 'panorama'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              JSON Panorama Político 2026
            </button>
            <button
              type="button"
              onClick={() => setJsonTab('governo')}
              className={`botao px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                jsonTab === 'governo'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              JSON Disputa Governo RN
            </button>
            <button
              type="button"
              onClick={copiarJsonAtivo}
              className="botao px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-color)] overflow-x-auto max-h-[260px]">
          {JSON.stringify(
            jsonTab === 'panorama' ? JSON_PANORAMA_POLITICO_RN_2026 : JSON_DISPUTA_GOVERNO_RN,
            null,
            2
          )}
        </pre>
      </div>
    </section>
  );
};
