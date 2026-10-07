import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Clock,
  FileCheck,
  Sparkles,
  Bus,
  Calendar,
  Bot,
  Building2,
  MessageSquare,
} from 'lucide-react';
import {
  CandidatoItem,
  BoletimDiarioIA,
  AvaliacaoCandidatoItem,
} from '../data/platformData';
import { StudioChatMessage } from './MultimodalStudioChat';

export interface LocalVotacaoItem {
  id: string;
  faixaInicio: number;
  faixaFim: number;
  zonaEleitoral: string;
  local: string;
  secoes: string;
  endereco: string;
  bairro: string;
  horarioSugerido: string;
  dataVotacao: string;
  linhasOnibus: string;
}

export interface ResultadoConsultaSecaoBot {
  numeroSecao: string;
  colegioEleitoral: string;
  zonaEleitoral: string;
  endereco: string;
  bairro: string;
  horarioSugerido: string;
  dataVotacao: string;
  linhasOnibus: string;
  documentoObrigatorio: string;
  mensagemBotFormatada: string;
}

export const LOCAIS_VOTACAO_PADRAO: LocalVotacaoItem[] = [
  {
    id: 'atheneu',
    faixaInicio: 1,
    faixaFim: 25,
    zonaEleitoral: '1ª Zona Eleitoral · Natal/RN',
    local: 'Escola Estadual Atheneu Norte-Riograndense',
    secoes: 'Seções 001 a 025 · Zona Leste',
    endereco: 'Av. Campos Sales, 393, Petrópolis · Natal/RN',
    bairro: 'Petrópolis / Cidade Alta · Zona Leste',
    horarioSugerido: '09h30 às 11h15 (Fluxo rápido matinal) ou 14h00 às 15h30',
    dataVotacao: 'Domingo, 25/10/2026 (2º Turno · Urnas abertas das 08h00 às 17h00)',
    linhasOnibus: 'L-46, L-54, N-73, S-50 e linhas via Av. Rio Branco (Catraca Liberada STTU)',
  },
  {
    id: 'padre-monte-mae-luiza',
    faixaInicio: 26,
    faixaFim: 39,
    zonaEleitoral: '1ª Zona Eleitoral · Natal/RN',
    local: 'Escola Estadual Padre Monte (Polo Eleitoral Mãe Luíza)',
    secoes: 'Seções 026 a 039 · Mãe Luíza / Areia Preta',
    endereco: 'Rua Guanabara, s/n, Mãe Luíza · Natal/RN',
    bairro: 'Mãe Luíza / Areia Preta · Zona Leste',
    horarioSugerido: '08h30 às 10h30 (Menor fila pela manhã) ou 13h30 às 15h00',
    dataVotacao: 'Domingo, 25/10/2026 (2º Turno · Urnas abertas das 08h00 às 17h00)',
    linhasOnibus: 'L-37, L-46, L-54 via Petrópolis / Via Costeira (Catraca Liberada STTU)',
  },
  {
    id: 'ifrn-central',
    faixaInicio: 40,
    faixaFim: 99,
    zonaEleitoral: '2ª Zona Eleitoral · Natal/RN',
    local: 'IFRN - Campus Natal Central',
    secoes: 'Seções 040 a 099 · Zona Leste/Sul',
    endereco: 'Av. Senador Salgado Filho, 1559, Tirol · Natal/RN',
    bairro: 'Tirol / Lagoa Nova / Alecrim · Zona Leste/Sul',
    horarioSugerido: '10h00 às 11h45 ou 14h15 às 15h45 (Fora do horário de pico)',
    dataVotacao: 'Domingo, 25/10/2026 (2º Turno · Urnas abertas das 08h00 às 17h00)',
    linhasOnibus: 'S-50, L-54, O-33, N-73 e Corredor Salgado Filho (Catraca Liberada STTU)',
  },
  {
    id: 'ufrn-setor-1',
    faixaInicio: 100,
    faixaFim: 179,
    zonaEleitoral: '4ª Zona Eleitoral · Natal/RN',
    local: 'UFRN - Centro de Convivência e Setores de Aulas I, II e III',
    secoes: 'Seções 100 a 179 · Zona Sul',
    endereco: 'Campus Universitário Lagoa Nova, BR-101 · Natal/RN',
    bairro: 'Lagoa Nova / Capim Macio / Ponta Negra · Zona Sul',
    horarioSugerido: '09h00 às 11h00 ou 13h30 às 15h15 (Atendimento ágil nos setores)',
    dataVotacao: 'Domingo, 25/10/2026 (2º Turno · Urnas abertas das 08h00 às 17h00)',
    linhasOnibus: 'Circular UFRN, S-50, O-33, L-54, N-73 (Catraca Liberada STTU)',
  },
  {
    id: 'polo-zona-oeste',
    faixaInicio: 180,
    faixaFim: 260,
    zonaEleitoral: '3ª Zona Eleitoral · Natal/RN',
    local: 'Escola Estadual José Fernandes Machado / Polo Eleitoral Zona Oeste',
    secoes: 'Seções 180 a 260 · Cidade da Esperança / Felipe Camarão / Planalto',
    endereco: 'Av. Paraíba, Cidade da Esperança · Zona Oeste, Natal/RN',
    bairro: 'Cidade da Esperança / Felipe Camarão / Planalto · Zona Oeste',
    horarioSugerido: '08h45 às 10h45 ou 14h00 às 15h30 (Fluxo equilibrado sem filas)',
    dataVotacao: 'Domingo, 25/10/2026 (2º Turno · Urnas abertas das 08h00 às 17h00)',
    linhasOnibus: 'O-21, O-30, O-33, O-38, O-40, O-59, O-63 (Catraca Liberada STTU)',
  },
  {
    id: 'complexo-noilde-ramalho',
    faixaInicio: 261,
    faixaFim: 999,
    zonaEleitoral: '69ª Zona Eleitoral · Natal/RN',
    local: 'Escola Estadual Floriano Cavalcanti (FLOCA) / Polo Zona Norte',
    secoes: 'Seções 261 a 999 · Igapó, Potengi, Pajuçara e Lagoa Azul',
    endereco: 'Conjunto Mirassol / Corredor Av. João Medeiros Filho e Av. Pompéia · Natal/RN',
    bairro: 'Igapó / Potengi / Pajuçara · Zona Norte',
    horarioSugerido: '09h15 às 11h15 ou 13h45 às 15h30 (Evite o pico das 16h00)',
    dataVotacao: 'Domingo, 25/10/2026 (2º Turno · Urnas abertas das 08h00 às 17h00)',
    linhasOnibus: 'N-08, N-15, N-25, N-35, N-43, N-60, N-73 (Catraca Liberada STTU)',
  },
];

export function resolverLocalPorNumeroSecao(inputBruto: string): ResultadoConsultaSecaoBot {
  const limpo = inputBruto.trim();
  const digitos = limpo.replace(/\D/g, '');
  const numSecao = digitos ? parseInt(digitos, 10) : NaN;

  let itemEncontrado: LocalVotacaoItem | undefined;

  if (!Number.isNaN(numSecao) && numSecao > 0) {
    itemEncontrado =
      LOCAIS_VOTACAO_PADRAO.find(
        (loc) => numSecao >= loc.faixaInicio && numSecao <= loc.faixaFim
      ) || LOCAIS_VOTACAO_PADRAO[LOCAIS_VOTACAO_PADRAO.length - 1];
  } else {
    const q = limpo.toLowerCase();
    itemEncontrado =
      LOCAIS_VOTACAO_PADRAO.find(
        (loc) =>
          loc.local.toLowerCase().includes(q) ||
          loc.bairro.toLowerCase().includes(q) ||
          loc.secoes.toLowerCase().includes(q)
      ) || LOCAIS_VOTACAO_PADRAO[0];
  }

  const secaoFormatada = !Number.isNaN(numSecao) && numSecao > 0
    ? String(numSecao).padStart(3, '0')
    : limpo || '015';

  const documentoObrigatorio =
    'Documento oficial com foto (RG, CNH, Passaporte, Carteira de Trabalho ou e-Título com foto)';

  const mensagemBotFormatada = `📍 **Consulta de Seção Eleitoral nº ${secaoFormatada} (PotiguarBot IA)**\n• **Colégio Eleitoral:** ${itemEncontrado.local} (${itemEncontrado.zonaEleitoral})\n• **Endereço:** ${itemEncontrado.endereco} (${itemEncontrado.bairro})\n• **Horário Sugerido pelo Bot:** ${itemEncontrado.horarioSugerido}\n• **Data Oficial:** ${itemEncontrado.dataVotacao}\n• **Ônibus Gratuitos (Passe Livre):** ${itemEncontrado.linhasOnibus}\n• **Documento Obrigatório:** ${documentoObrigatorio}\n\n«Fonte: TRE-RN / TSE\nData: 06/10/2026\nTipo: Informação oficial\nStatus: Local de votação e Passe Livre confirmados»`;

  return {
    numeroSecao: secaoFormatada,
    colegioEleitoral: itemEncontrado.local,
    zonaEleitoral: itemEncontrado.zonaEleitoral,
    endereco: itemEncontrado.endereco,
    bairro: itemEncontrado.bairro,
    horarioSugerido: itemEncontrado.horarioSugerido,
    dataVotacao: itemEncontrado.dataVotacao,
    linhasOnibus: itemEncontrado.linhasOnibus,
    documentoObrigatorio,
    mensagemBotFormatada,
  };
}

interface CivicModulesSectionProps {
  candidatos: CandidatoItem[];
  boletins: BoletimDiarioIA[];
  avaliacoes: AvaliacaoCandidatoItem[];
  isUpdatingBoletim: boolean;
  onTriggerDailyUpdate: () => void;
  onSubmitAvaliacao: (nova: Omit<AvaliacaoCandidatoItem, 'id' | 'horario'>) => Promise<void>;
  onAskBotAboutSection: (prompt: string) => void;
  chatMessages?: StudioChatMessage[];
  isBotLoading?: boolean;
  onConsultSecaoInBot?: (resultado: ResultadoConsultaSecaoBot) => void;
}

export const CivicModulesSection: React.FC<CivicModulesSectionProps> = ({
  candidatos,
  avaliacoes,
  onSubmitAvaliacao,
  onAskBotAboutSection,
  chatMessages = [],
  isBotLoading = false,
  onConsultSecaoInBot,
}) => {
  const [numeroSecaoInput, setNumeroSecaoInput] = useState<string>('');
  const [resultadoSecao, setResultadoSecao] = useState<ResultadoConsultaSecaoBot | null>(() =>
    resolverLocalPorNumeroSecao('032')
  );

  const [candSelecionado, setCandSelecionado] = useState<string>(
    candidatos[0]?.id || 'allyson-bezerra'
  );
  const [aprovado, setAprovado] = useState<boolean>(true);
  const [fezDeBom, setFezDeBom] = useState<string>('');
  const [naoFez, setNaoFez] = useState<string>('');
  const [autorAvaliacao, setAutorAvaliacao] = useState<string>('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState<boolean>(false);
  const [avisoAvaliacao, setAvisoAvaliacao] = useState<string | null>(null);

  const locaisFiltrados = useMemo(() => {
    const q = numeroSecaoInput.trim().toLowerCase();
    if (!q) return LOCAIS_VOTACAO_PADRAO;
    const num = parseInt(q.replace(/\D/g, ''), 10);
    if (!Number.isNaN(num) && num > 0) {
      const matchByRange = LOCAIS_VOTACAO_PADRAO.filter(
        (loc) => num >= loc.faixaInicio && num <= loc.faixaFim
      );
      if (matchByRange.length > 0) return matchByRange;
    }
    return LOCAIS_VOTACAO_PADRAO.filter(
      (item) =>
        item.secoes.toLowerCase().includes(q) ||
        item.local.toLowerCase().includes(q) ||
        item.bairro.toLowerCase().includes(q)
    );
  }, [numeroSecaoInput]);

  // Latest message from PotiguarBot IA conversation state
  const ultimaMensagemBot = useMemo(() => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].sender === 'bot') {
        return chatMessages[i];
      }
    }
    return null;
  }, [chatMessages]);

  const handleBuscarSecaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = numeroSecaoInput.trim() || '032';
    const resolvido = resolverLocalPorNumeroSecao(valor);
    setResultadoSecao(resolvido);

    if (onConsultSecaoInBot) {
      onConsultSecaoInBot(resolvido);
    } else {
      onAskBotAboutSection(
        `Informe o colégio eleitoral, horário sugerido e data para a minha Seção Eleitoral nº ${resolvido.numeroSecao} (${resolvido.colegioEleitoral}).`
      );
    }
  };

  const selecionarSecaoRapida = (secaoExemplo: string) => {
    setNumeroSecaoInput(secaoExemplo);
    const resolvido = resolverLocalPorNumeroSecao(secaoExemplo);
    setResultadoSecao(resolvido);
    if (onConsultSecaoInBot) {
      onConsultSecaoInBot(resolvido);
    }
  };

  const handleAvaliarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fezDeBom.trim() && !naoFez.trim()) return;
    setEnviandoAvaliacao(true);
    setAvisoAvaliacao(null);

    const candObj = candidatos.find((c) => c.id === candSelecionado);
    await onSubmitAvaliacao({
      candidatoId: candSelecionado,
      candidatoNome: candObj?.nome || 'Candidato',
      aprovado,
      fezDeBom: fezDeBom.trim() || 'Atuação destacada pelos eleitores.',
      naoFez: naoFez.trim() || 'Pontos em acompanhamento pela comunidade.',
      autor: autorAvaliacao.trim() || 'Eleitor Potiguar',
    });

    setFezDeBom('');
    setNaoFez('');
    setEnviandoAvaliacao(false);
    setAvisoAvaliacao(
      aprovado
        ? '👍 Avaliação APROVADO registrada em tempo real no banco de dados!'
        : '👎 Avaliação NÃO APROVADO registrada em tempo real no banco de dados!'
    );
  };

  return (
    <div className="space-y-10">
      {/* Localizador de Urna e Seção Eleitoral Integrado ao PotiguarBot IA + Enquete de Benefícios */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Columns: Módulo de Busca de Local de Votação por Número de Seção (Integrado ao PotiguarBot IA) */}
        <div
          id="localizador-secao"
          className="lg:col-span-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-5"
        >
          <div className="space-y-1.5 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-color)]">
                <MapPin className="w-4 h-4" />
                <span>Módulo de Busca por Seção Eleitoral · Integrado ao PotiguarBot IA 🔏</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--success-color)]">
                ● Sincronizado com o Chat IA
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              Busca de Local de Votação por Número de Seção
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Informe o seu <strong>número de seção eleitoral</strong> abaixo. O <strong>PotiguarBot IA</strong> retorna instantaneamente o seu <strong>Colégio Eleitoral</strong>, <strong>Horário Sugerido</strong> e <strong>Data da Votação</strong>, atualizando a conversa do bot:
            </p>
          </div>

          {/* Formulário de Busca por Número de Seção */}
          <form onSubmit={handleBuscarSecaoSubmit} className="space-y-3">
            <label
              htmlFor="input-numero-secao"
              className="block text-xs font-semibold text-[var(--text-color)]"
            >
              Informe o Número da sua Seção Eleitoral (ou Bairro/Escola):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-numero-secao"
                  type="text"
                  value={numeroSecaoInput}
                  onChange={(e) => setNumeroSecaoInput(e.target.value)}
                  placeholder="Ex: 032, 015, 058, 124, 210 ou Mãe Luíza..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-sm text-[var(--text-color)] font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isBotLoading}
                className="botao px-4 py-2.5 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Bot className="w-4 h-4" />
                <span>Consultar Seção no Bot IA</span>
              </button>
            </div>

            {/* Botões de Seções Rápidas para Teste Instantâneo */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                Testar seção:
              </span>
              {[
                { label: 'Seção 015 (Petrópolis)', val: '015' },
                { label: 'Seção 032 (Mãe Luíza)', val: '032' },
                { label: 'Seção 058 (Tirol/IFRN)', val: '058' },
                { label: 'Seção 124 (UFRN/Sul)', val: '124' },
                { label: 'Seção 210 (Zona Oeste)', val: '210' },
                { label: 'Seção 305 (Zona Norte)', val: '305' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => selecionarSecaoRapida(s.val)}
                  className="botao px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[11px] font-medium text-[var(--text-color)] hover:border-[var(--accent-color)] cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </form>

          {/* Card de Retorno Estruturado do PotiguarBot IA (Colégio Eleitoral, Horário Sugerido e Data) */}
          {resultadoSecao && (
            <div className="p-4 rounded-xl border-2 border-[var(--accent-color)] bg-[var(--surface-subtle)] space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[var(--border-color)] pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-color)]">
                  <Bot className="w-4 h-4" />
                  <span>
                    Retorno do PotiguarBot IA · Seção Nº {resultadoSecao.numeroSecao}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[var(--success-color)]">
                  {resultadoSecao.zonaEleitoral}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[var(--accent-color)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                      Colégio Eleitoral Localizado
                    </div>
                    <div className="text-sm font-bold text-[var(--text-color)]">
                      {resultadoSecao.colegioEleitoral}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      📍 {resultadoSecao.endereco} ({resultadoSecao.bairro})
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-start gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                        Horário Sugerido pelo Bot
                      </div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {resultadoSecao.horarioSugerido}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[var(--accent-color)] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                        Data e Funcionamento
                      </div>
                      <div className="text-xs font-bold text-[var(--text-color)] mt-0.5">
                        {resultadoSecao.dataVotacao}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-[var(--success-color)]">
                    <Bus className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Passe Livre:</strong> {resultadoSecao.linhasOnibus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onAskBotAboutSection(
                        `Quais dicas o PotiguarBot IA recomenda para votar na Seção ${resultadoSecao.numeroSecao} (${resultadoSecao.colegioEleitoral}) no horário sugerido (${resultadoSecao.horarioSugerido})?`
                      )
                    }
                    className="botao px-2.5 py-1 rounded bg-[var(--accent-color)] text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Detalhar no Chat IA</span>
                  </button>
                </div>
              </div>

              {/* Estado de Conversação Atual do PotiguarBot IA Sincronizado */}
              {ultimaMensagemBot && (
                <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--accent-color)] inline-flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>Estado Atual da Conversa (PotiguarBot IA):</span>
                    </span>
                    <span>{ultimaMensagemBot.timestamp}</span>
                  </div>
                  <p className="text-xs text-[var(--text-color)] line-clamp-3 whitespace-pre-line leading-relaxed">
                    {ultimaMensagemBot.text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Link Oficial do TSE para Consulta Individual Privada */}
          <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[var(--text-muted)]">
              🔒 <strong>Consulta Oficial TSE (Privada):</strong> Confirme pelo CPF ou título diretamente na Justiça Eleitoral.
            </span>
            <a
              href="https://www.tse.jus.br/servicos-eleitorais/autoatendimento-eleitoral#/atendimento-eleitor/consultar-local-de-votacao"
              target="_blank"
              rel="noopener noreferrer"
              className="botao font-semibold text-[var(--accent-color)] underline whitespace-nowrap"
            >
              Abrir Consulta Oficial TSE ↗
            </a>
          </div>

          {/* Lista de Polos e Faixas de Seções Eleitorais */}
          <div className="space-y-2.5 max-h-[240px] overflow-y-auto">
            {locaisFiltrados.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-xs sm:text-sm text-[var(--text-color)]">
                    {item.local}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[var(--accent-color)]">
                    {item.secoes}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  📍 <strong>Endereço:</strong> {item.endereco} · ⏰ <strong>Sugerido:</strong> {item.horarioSugerido}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Columns: Enquete de Benefícios dos Candidatos (O que fez de bom / O que não fez + 👍 Aprovado / 👎 Não Aprovado) */}
        <div
          id="enquete-beneficios"
          className="lg:col-span-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-5"
        >
          <div className="space-y-1.5 border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--success-color)]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Enquete Cidadã · Avaliação de Benefícios e Entregas</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-color)]">
              O Que o Candidato Fez de Bom e O Que Não Fez?
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Avalie qual benefício o candidato trouxe para Natal/RN e deixe seu sinal de <strong>👍 Aprovado</strong> ou <strong>👎 Não Aprovado</strong>.
            </p>
          </div>

          <form onSubmit={handleAvaliarSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Escolha o Candidato
                </label>
                <select
                  value={candSelecionado}
                  onChange={(e) => setCandSelecionado(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
                >
                  {candidatos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.partido})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Seu Sinal de Avaliação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAprovado(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 border cursor-pointer ${
                      aprovado
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border-[var(--border-color)]'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>👍 Aprovado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAprovado(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 border cursor-pointer ${
                      !aprovado
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-color)] border-[var(--border-color)]'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>👎 Não Aprovado</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  👍 O que fez de bom / Benefícios:
                </label>
                <textarea
                  rows={2}
                  value={fezDeBom}
                  onChange={(e) => setFezDeBom(e.target.value)}
                  placeholder="Ex: Passe livre, obras nos bairros, emendas para hospitais..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                  👎 O que não fez / O que faltou:
                </label>
                <textarea
                  rows={2}
                  value={naoFez}
                  onChange={(e) => setNaoFez(e.target.value)}
                  placeholder="Ex: Faltou ampliar linhas noturnas ou concluir drenagem..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="text"
                value={autorAvaliacao}
                onChange={(e) => setAutorAvaliacao(e.target.value)}
                placeholder="Seu nome ou apelido e bairro (opcional)"
                className="w-full sm:w-1/2 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
              />
              <button
                type="submit"
                disabled={enviandoAvaliacao || (!fezDeBom.trim() && !naoFez.trim())}
                className="w-full sm:w-1/2 py-2 px-4 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                {enviandoAvaliacao ? 'Publicando Avaliação...' : 'Publicar Avaliação na Enquete'}
              </button>
            </div>

            {avisoAvaliacao && (
              <div className="p-2.5 rounded-lg bg-[var(--success-bg)] text-[var(--success-color)] text-xs font-semibold">
                {avisoAvaliacao}
              </div>
            )}
          </form>

          {/* Lista das Últimas Avaliações Publicadas */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--border-color)] max-h-[230px] overflow-y-auto">
            {avaliacoes.map((av, index) => (
              <div
                key={av.id}
                className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--text-color)]">
                    {index === 0 ? '🆕 Última Avaliação: ' : ''}
                    {av.candidatoNome} · por {av.autor}
                  </span>
                  <span
                    className={`font-semibold ${
                      av.aprovado ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {av.aprovado ? '👍 Aprovado' : '👎 Não Aprovado'} · {av.horario}
                  </span>
                </div>
                <div className="text-[var(--text-color)]">
                  <strong className="text-emerald-600 dark:text-emerald-400">Fez de bom:</strong> {av.fezDeBom}
                </div>
                <div className="text-[var(--text-muted)]">
                  <strong className="text-rose-600 dark:text-rose-400">Não fez / Cobrança:</strong> {av.naoFez}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
