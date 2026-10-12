import React, { useState, useEffect } from 'react';
import {
  Scale,
  Landmark,
  Calendar,
  ExternalLink,
  PlayCircle,
  Code2,
  Copy,
  CheckCircle2,
  Volume2,
  Pause,
  Square,
  Sparkles,
  ArrowRight,
  FileJson,
  BookOpen,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  PEC_221_2019_JSON,
  ATUALIZACOES_LEGISLATIVAS,
  ProposicaoLegislativaJSON,
  TRANSPARENCIA_CLT_JSON,
  ANALISE_JORNADA_TRABALHO_E_CLT,
} from '../data/segundoTurnoData';
import {
  speakWithPotiguarTTS,
  pauseTTSPlayback,
  stopTTSPlayback,
  subscribeTTSState,
  TTSStateSnapshot,
  voiceConfig,
} from '../services/ttsService';

interface AtualizacaoLegislativaSectionProps {
  dadosJson?: ProposicaoLegislativaJSON;
  onAskPotiguarBot?: (prompt: string) => void;
}

export const AtualizacaoLegislativaSection: React.FC<AtualizacaoLegislativaSectionProps> = ({
  dadosJson = PEC_221_2019_JSON,
  onAskPotiguarBot,
}) => {
  const [abaInterna, setAbaInterna] = useState<'resumo' | 'clt' | 'video' | 'json'>('resumo');
  const [copiado, setCopiado] = useState<boolean>(false);
  const [copiadoClt, setCopiadoClt] = useState<boolean>(false);
  const [mostrarAnaliseLocalIA, setMostrarAnaliseLocalIA] = useState<boolean>(true);
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

  const detalheComplementar = ATUALIZACOES_LEGISLATIVAS[0];

  // Extrai ID do YouTube a partir do Video_Link do JSON
  const youtubeEmbedId = (() => {
    const match = dadosJson.Video_Link.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : detalheComplementar.youtubeId;
  })();

  const linkSenadoResolvido =
    dadosJson.Link && dadosJson.Link.startsWith('http')
      ? dadosJson.Link
      : 'https://www25.senado.leg.br/web/atividade/materias';

  const jsonExibicao: ProposicaoLegislativaJSON = {
    Proposicao: dadosJson.Proposicao,
    Status: dadosJson.Status,
    Data_Ultima_Movimentacao: dadosJson.Data_Ultima_Movimentacao,
    Link: linkSenadoResolvido,
    Video_Link: dadosJson.Video_Link,
  };

  const msgId = 'tts-atualizacao-legislativa-pec-221';
  const isPlaying = ttsState.activeMessageId === msgId && ttsState.status === 'playing';
  const isPaused = ttsState.activeMessageId === msgId && ttsState.status === 'paused';

  const textoNarracao = `Atualização Legislativa no Transparência Potiguar. Proposição: ${dadosJson.Proposicao}. Status: ${dadosJson.Status}. Data da última movimentação: ${dadosJson.Data_Ultima_Movimentacao}. A proposta que prevê o fim da escala de trabalho 6 por 1 foi aprovada na Comissão de Constituição e Justiça do Senado e segue para votação no Plenário. ${detalheComplementar.impactoPotiguar}`;

  const copiarJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(jsonExibicao, null, 2));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const copiarJsonClt = () => {
    navigator.clipboard?.writeText(JSON.stringify(TRANSPARENCIA_CLT_JSON, null, 2));
    setCopiadoClt(true);
    setTimeout(() => setCopiadoClt(false), 2500);
  };

  const msgIdClt = 'tts-agente-clt-jornada-4h';
  const textoNarracaoClt = `Transparência Jurídica sobre as Leis Trabalhistas do Brasil, arquivo ${ANALISE_JORNADA_TRABALHO_E_CLT.arquivoReferencia}. ${ANALISE_JORNADA_TRABALHO_E_CLT.conceitoFundamentalCLT} ${ANALISE_JORNADA_TRABALHO_E_CLT.papelContrapesoJuridico} Análise de jornada de quatro horas diárias: 1. Para um casal, gera salário proporcional insuficiente para cobrir custos básicos de moradia, alimentação e transporte, resultando em alto risco de vulnerabilidade financeira. 2. Para uma família de seis pessoas, gera salário proporcional insuficiente para cobrir custos de vida e alimentação, resultando em alto risco de vulnerabilidade alimentar sob as condições inflacionárias atuais.`;

  return (
    <section
      id="atualizacao-legislativa"
      className="card-clean p-4 sm:p-8 space-y-6 overflow-hidden"
    >
      {/* Cabeçalho Responsivo da Atualização Legislativa */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>{dadosJson.Proposicao}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: {dadosJson.Status}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-subtle)] text-[var(--text-color)] font-mono border border-[var(--border-color)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <span>Última Movimentação: {dadosJson.Data_Ultima_Movimentacao}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-color)] leading-tight">
            Atualização Legislativa — {dadosJson.Proposicao} (Fim da Escala 6x1)
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-[80ch] leading-relaxed">
            A proposta que prevê o <strong>fim da escala de trabalho 6x1</strong> foi{' '}
            <strong>{dadosJson.Status}</strong> (Comissão de Constituição e Justiça do Senado) em{' '}
            <strong>{dadosJson.Data_Ultima_Movimentacao}</strong> e segue para votação no{' '}
            <strong>Plenário do Senado Federal</strong>.
          </p>
        </div>

        {/* Controles Rápidos: Voz TTS + Links Oficiais do JSON */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isPlaying || isPaused ? (
            <>
              <button
                type="button"
                onClick={() =>
                  isPlaying ? pauseTTSPlayback() : speakWithPotiguarTTS(msgId, textoNarracao)
                }
                className="botao px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{isPlaying ? '⏸️ Pausar' : '▶️ Continuar'}</span>
              </button>
              <button
                type="button"
                onClick={() => stopTTSPlayback()}
                className="botao px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>⏹️ Parar</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => speakWithPotiguarTTS(msgId, textoNarracao)}
              className="botao px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--accent-color)] hover:border-[var(--accent-color)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>🔊 Ouvir Atualização</span>
            </button>
          )}

          <a
            href={linkSenadoResolvido}
            target="_blank"
            rel="noopener noreferrer"
            className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 no-underline"
          >
            <Landmark className="w-4 h-4" />
            <span>Site do Senado</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={dadosJson.Video_Link}
            target="_blank"
            rel="noopener noreferrer"
            className="botao px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 no-underline"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Vídeo Informativo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Abas Internas Responsivas do Componente de Atualização Legislativa */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-subtle)] p-2 rounded-xl border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAbaInterna('resumo')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              abaInterna === 'resumo'
                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Status da PEC & Tramitação</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaInterna('clt')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              abaInterna === 'clt'
                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Transparência CLT, Jornada 4h & BPC</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaInterna('video')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              abaInterna === 'video'
                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Vídeo Informativo (YouTube)</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaInterna('json')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              abaInterna === 'json'
                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Estrutura de Dados (JSON)</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[var(--success-color)] px-2">
          ● Integração Validada: Sem Duplicidades
        </span>
      </div>

      {/* Aba 1: Status da PEC & Tramitação (Sem repetir player de vídeo, JSON bruto e cards CLT das outras abas) */}
      {abaInterna === 'resumo' && (
        <div className="space-y-6">
          {/* Cards dos Campos do JSON Consumido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="subcard-clean p-5 space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                Proposicao
              </div>
              <div className="text-lg font-bold text-[var(--text-color)]">
                {dadosJson.Proposicao}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Fim da escala de trabalho 6x1
              </div>
            </div>

            <div className="subcard-clean p-5 space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                Status
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {dadosJson.Status}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Segue para votação no Plenário
              </div>
            </div>

            <div className="subcard-clean p-5 space-y-1.5">
              <div className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                Data_Ultima_Movimentacao
              </div>
              <div className="text-lg font-bold font-mono text-[var(--text-color)]">
                {dadosJson.Data_Ultima_Movimentacao}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Comissão de Constituição e Justiça
              </div>
            </div>

            <div className="subcard-clean p-5 space-y-2 flex flex-col justify-between">
              <div className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                Link & Video_Link
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={linkSenadoResolvido}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[var(--accent-color)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Senado</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[var(--text-muted)]">·</span>
                <a
                  href={dadosJson.Video_Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-rose-500 hover:underline inline-flex items-center gap-1"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] truncate">
                {dadosJson.Video_Link}
              </div>
            </div>
          </div>

          {/* Linha de Tramitação no Senado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="subcard-clean p-5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  1. Apresentação & Relatoria ✓
                </span>
                <div className="text-sm font-bold text-[var(--text-color)]">
                  {dadosJson.Proposicao}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Proposta de redução da jornada máxima e fim da escala 6x1 sem redução salarial.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 hidden md:block mt-1" />
            </div>

            <div className="subcard-clean p-5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  2. {dadosJson.Status} ({dadosJson.Data_Ultima_Movimentacao}) ✓
                </span>
                <div className="text-sm font-bold text-[var(--text-color)]">
                  Comissão de Constituição e Justiça (CCJ)
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Admissibilidade e parecer aprovados na CCJ do Senado Federal.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 hidden md:block mt-1" />
            </div>

            <div className="subcard-clean p-5 space-y-1">
              <span className="text-[11px] font-bold text-[var(--accent-color)] uppercase">
                3. Próxima Etapa no Senado ⏳
              </span>
              <div className="text-sm font-bold text-[var(--text-color)]">
                Votação no Plenário do Senado
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {detalheComplementar.proximaEtapa}.
              </p>
            </div>
          </div>

          {/* Card de Impacto Regional no RN + Atalhos para as Abas Validadas */}
          <div className="subcard-clean p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-color)]">
                <Sparkles className="w-4 h-4" />
                <span>Impacto Regional no Rio Grande do Norte (PotiguarBot IA)</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-color)] leading-relaxed max-w-[75ch]">
                {detalheComplementar.impactoPotiguar}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAbaInterna('clt')}
                className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ver Análise CLT, Jornada 4h & BPC</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaInterna('video')}
                className="botao px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Assistir Vídeo</span>
              </button>

              {onAskPotiguarBot && (
                <button
                  type="button"
                  onClick={() =>
                    onAskPotiguarBot(
                      `Explique a atualização legislativa da ${dadosJson.Proposicao} (Status: ${dadosJson.Status} em ${dadosJson.Data_Ultima_Movimentacao}) sobre o fim da escala 6x1 e seus impactos para os trabalhadores do Rio Grande do Norte.`
                    )
                  }
                  className="botao px-3.5 py-2 rounded-lg border border-[var(--accent-color)] bg-[var(--card-bg)] text-xs font-semibold text-[var(--accent-color)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Perguntar à IA</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aba 2: Transparência Jurídica CLT (agente_clt.md), Jornada de 4h & Desvinculação BPC/Aposentadorias */}
      {abaInterna === 'clt' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{ANALISE_JORNADA_TRABALHO_E_CLT.statusDesduplicacao}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => speakWithPotiguarTTS(msgIdClt, textoNarracaoClt)}
                className="botao px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs font-semibold text-[var(--accent-color)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>🔊 Ouvir Análise CLT & BPC</span>
              </button>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                Arquivo: {ANALISE_JORNADA_TRABALHO_E_CLT.arquivoReferencia}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div className="subcard-clean p-6 space-y-3.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-color)]">
                    Fundamento Jurídico · {TRANSPARENCIA_CLT_JSON.nome_completo} ({TRANSPARENCIA_CLT_JSON.tema})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                    Acesso à Informação: {TRANSPARENCIA_CLT_JSON.acesso_informacao}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-color)] leading-relaxed font-medium">
                  {ANALISE_JORNADA_TRABALHO_E_CLT.conceitoFundamentalCLT}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {ANALISE_JORNADA_TRABALHO_E_CLT.papelContrapesoJuridico}
                </p>
                <div className="p-3.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs space-y-1">
                  <div className="font-bold text-[var(--text-color)]">
                    Prompt do Sistema Validado (Sem Duplicidade):
                  </div>
                  <p className="italic text-[var(--text-muted)]">
                    "{ANALISE_JORNADA_TRABALHO_E_CLT.promptSistemaCLT}"
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>1. Análise Socioeconômica: Jornada de 4 Horas Diárias (Salário Proporcional)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ANALISE_JORNADA_TRABALHO_E_CLT.analisesJornadaQuatroHoras.map((analise) => (
                    <div
                      key={analise.id}
                      className="subcard-clean p-5 space-y-2.5"
                    >
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                        {analise.perfilFamiliar}
                      </div>
                      <p className="text-xs text-[var(--text-color)] leading-relaxed">
                        {analise.sinteseAnalise}
                      </p>
                      <div className="pt-1.5 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                        <strong>Risco:</strong> {analise.riscoIdentificado}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5">
              {/* Análise Validada sobre Desvinculação do BPC, Pensões e Aposentadorias (Projeção 2027) */}
              <div className="subcard-clean p-6 space-y-3.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase inline-flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>2. {ANALISE_JORNADA_TRABALHO_E_CLT.analiseDesvinculacaoBpcAposentadorias.titulo}</span>
                  </span>
                </div>
                <p className="text-xs text-[var(--text-color)] leading-relaxed">
                  {ANALISE_JORNADA_TRABALHO_E_CLT.analiseDesvinculacaoBpcAposentadorias.sinteseEconomica}
                </p>
                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-xs text-[var(--text-color)] leading-relaxed">
                  <strong className="text-amber-600 dark:text-amber-400 block mb-0.5">
                    Projeção 2027 (Poder de Compra & Comércio Local):
                  </strong>
                  {ANALISE_JORNADA_TRABALHO_E_CLT.analiseDesvinculacaoBpcAposentadorias.projecao2027}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  <strong>Perspectiva do Aposentado:</strong>{' '}
                  {ANALISE_JORNADA_TRABALHO_E_CLT.analiseDesvinculacaoBpcAposentadorias.perspectivaAposentado}
                </div>

                {onAskPotiguarBot && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskPotiguarBot(
                        'Explique com transparência jurídica o papel da CLT, a análise da jornada de 4h diárias (casal e família de 6 pessoas) e os impactos da desvinculação do BPC, pensões e aposentadorias do salário mínimo para 28 milhões de beneficiários em 2027.'
                      )
                    }
                    className="botao w-full py-2.5 px-3 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Debater CLT, Jornada 4h e BPC na IA</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {abaInterna === 'video' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[var(--text-color)]">
              Vídeo Informativo: {dadosJson.Proposicao} — {dadosJson.Status} ({dadosJson.Data_Ultima_Movimentacao})
            </span>
            <a
              href={dadosJson.Video_Link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-color)] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Abrir {dadosJson.Video_Link}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden border border-[var(--border-color)] bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
              title={`Vídeo Informativo ${dadosJson.Proposicao}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {abaInterna === 'json' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-[var(--text-muted)]">
                1. Payload JSON de <strong>Atualização Legislativa ({dadosJson.Proposicao})</strong>:
              </div>
              <button
                type="button"
                onClick={copiarJson}
                className="botao px-3 py-1.5 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiado ? '✓ JSON PEC Copiado!' : 'Copiar JSON PEC'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed border border-slate-800">
              {JSON.stringify(jsonExibicao, null, 2)}
            </pre>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-[var(--text-muted)]">
                2. Payload JSON Unificado de <strong>Transparência Jurídica CLT (agente_clt.md)</strong>:
              </div>
              <button
                type="button"
                onClick={copiarJsonClt}
                className="botao px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiadoClt ? '✓ JSON CLT Copiado!' : 'Copiar JSON CLT'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed border border-slate-800">
              {JSON.stringify(TRANSPARENCIA_CLT_JSON, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};
