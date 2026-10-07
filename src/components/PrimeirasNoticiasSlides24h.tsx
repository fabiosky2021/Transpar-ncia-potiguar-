import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Radio,
  Sparkles,
  Bus,
  Scale,
  ShieldAlert,
  MapPin,
  Pause,
  Play,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { BoletimDiarioIA, CandidatoItem } from '../data/platformData';
import { PropostaTSEItem } from '../data/segundoTurnoData';

interface PrimeirasNoticiasSlides24hProps {
  boletins: BoletimDiarioIA[];
  candidatos: CandidatoItem[];
  propostas: PropostaTSEItem[];
  isUpdatingBoletim: boolean;
  onTriggerDailyUpdate: () => void;
  onAskBot: (prompt: string) => void;
}

interface NoticiaSlideItem {
  id: string;
  categoria: string;
  tagTempoReal: string;
  titulo: string;
  resumo: string;
  destaqueSecundario: string;
  fonte: string;
  corDestaque: string;
  ctaPrimarioTexto: string;
  ctaPrimarioHref?: string;
  ctaBotPrompt: string;
  icone: 'radio' | 'scale' | 'bus' | 'shield' | 'map';
}

export const PrimeirasNoticiasSlides24h: React.FC<PrimeirasNoticiasSlides24hProps> = ({
  boletins,
  candidatos,
  propostas,
  isUpdatingBoletim,
  onTriggerDailyUpdate,
  onAskBot,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [horarioAoVivo, setHorarioAoVivo] = useState<string>(() =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setHorarioAoVivo(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    }, 30000);
    return () => clearInterval(clockTimer);
  }, []);

  const totalLikesPropostas = propostas.reduce((acc, p) => acc + p.likes, 0);
  const boletimMaisRecente = boletins[0];

  const slides: NoticiaSlideItem[] = [
    {
      id: 'slide-plantao-24h',
      categoria: 'PRIMEIRAS NOTÍCIAS · 2º TURNO NO RN & PANORAMA 2026',
      tagTempoReal: boletimMaisRecente?.dataReferencia || `Ao Vivo · Atualizado às ${horarioAoVivo}`,
      titulo:
        '2º Turno no RN: Allyson Bezerra (UNIÃO · 44 - 37%) e Carlos Eduardo Xavier / Cadu de Lula (PT · 13 - 32%)',
      resumo:
        'Allyson (União 44) foca na 3ª ponte sobre o Rio Potengi e hospitais regionais; Cadu de Lula (PT 13, com apoio do Presidente Lula) defende educação em tempo integral, obras na BR-304 e SUS com diagnósticos online; Álvaro Dias (PL 22 - 29%) destaca choque de eficiência e não aumento de impostos.',
      destaqueSecundario:
        'Confira abaixo a Colinha Política RN 2026 completa com fotos dos candidatos, Presidente Lula e todos os cargos!',
      fonte: 'Colinha Política RN 2026 · TSE · Pesquisas Registradas',
      corDestaque: '#0d6efd',
      ctaPrimarioTexto: 'Ver Colinha Política RN 2026',
      ctaPrimarioHref: '#colinha-politica-2026',
      ctaBotPrompt:
        'Compare as propostas de Allyson Bezerra (União 44 - 37%), Cadu de Lula / Carlos Eduardo Xavier (PT 13 - 32%) e Álvaro Dias (PL 22 - 29%) para o Governo do RN.',
      icone: 'radio',
    },
    {
      id: 'slide-destaques-cargos-2026',
      categoria: 'DESTAQUES ABSOLUTOS NAS INTENÇÕES DE VOTO · RN 2026',
      tagTempoReal: `${totalLikesPropostas.toLocaleString('pt-BR')} apoios em propostas monitoradas`,
      titulo:
        'Senadores, Deputados Federais e Estaduais Mais Citados + Alinhamento Mãe Luíza',
      resumo:
        'Senado: Carlos Eduardo Alves (Destaque absoluto) e Rogério Marinho (555). Câmara Federal: Nina (Líder), Dr. Bernardo, Natália Bonavides e Benes Leocádio. Assembleia Estadual: Cinthia de Allyson (Líder), Neilton Diógenes, Ezequiel Ferreira e Daniel Valença (PT).',
      destaqueSecundario:
        'Comunidade de Mãe Luíza: alinhamento prioritário com Cadu de Lula (SUS com diagnósticos online e ensino integral) e Daniel Valença (pautas sociais, saúde e educação).',
      fonte: 'Panorama Político do Rio Grande do Norte - Eleições 2026',
      corDestaque: '#e11d48',
      ctaPrimarioTexto: 'Ver Todos os Cargos e Fotos',
      ctaPrimarioHref: '#colinha-politica-2026',
      ctaBotPrompt:
        'Quais são os candidatos com Destaque Absoluto para Governador, Senador, Deputado Federal e Deputado Estadual no RN em 2026 e os alinhados a Mãe Luíza?',
      icone: 'scale',
    },
    {
      id: 'slide-passe-livre',
      categoria: 'UTILIDADE PÚBLICA 24H · TRANSPORTE E MOBILIDADE RN',
      tagTempoReal: 'Catraca 100% Liberada · 06h às 20h',
      titulo:
        'Passe Livre Confirmado no 2º Turno: 62 Linhas Urbanas da STTU e Ônibus Intermunicipais',
      resumo:
        'Todas as zonas de Natal (Norte, Sul, Leste e Oeste) contam com 1.836 viagens gratuitas sem exigir cartão NuBus. No transporte intermunicipal (Decreto nº 35.935/2026), basta apresentar e-Título ou documento com foto.',
      destaqueSecundario:
        'Consulte na tabela abaixo os horários e corredores atendidos no seu bairro ou pergunte ao PotiguarBot IA.',
      fonte: 'STTU Natal · Governo do RN · Resolução-TSE nº 23.751/2026',
      corDestaque: '#10b981',
      ctaPrimarioTexto: 'Consultar Linhas por Bairro',
      ctaPrimarioHref: '#utilidade-publica',
      ctaBotPrompt:
        'Quais linhas de ônibus estão com Passe Livre confirmado para votar no 2º turno em Natal e Grande Natal?',
      icone: 'bus',
    },
    {
      id: 'slide-transicao-checagem',
      categoria: 'TRANSPARÊNCIA, TRANSIÇÃO E ANTI-DESINFORMAÇÃO 24H',
      tagTempoReal: 'Transição Ativa · Checagem TSE em Conformidade',
      titulo:
        'Monitoramento de Atos Oficiais e Alerta Anti-Desinformação sobre Propostas Políticas',
      resumo:
        'Acompanhamento em tempo real dos primeiros decretos e nomeações iniciais em conformidade legal nos eixos Saúde (SUS), Educação e Infraestrutura, além da checagem técnica de áudios e boatos eleitorais.',
      destaqueSecundario:
        'Inclui verificação completa sobre o áudio atribuído a Flávio Bolsonaro (aposentadoria aos 70 anos e jornada de 12h sem registro oficial em plano de governo).',
      fonte: 'Diário Oficial · Portal da Transparência · Checagem TSE',
      corDestaque: '#d97706',
      ctaPrimarioTexto: 'Ver Transição e Checagem TSE',
      ctaPrimarioHref: '#monitoramento-24h',
      ctaBotPrompt:
        'Explique a análise de propostas políticas sobre o áudio atribuído a Flávio Bolsonaro e o status da Transição de Governo.',
      icone: 'shield',
    },
    {
      id: 'slide-secao-eleitos-ia',
      categoria: 'SERVIÇO AO ELEITOR · LOCAL DE VOTAÇÃO E CONSULTA À IA',
      tagTempoReal: 'Atendimento 24h por Texto, Voz e Imagem (Privacidade LGPD 🔏)',
      titulo:
        'Onde Está o Seu Local de Votação no 2º Turno ou Dúvidas sobre Candidatos já Eleitos?',
      resumo:
        'Consulte os polos eleitorais de todas as Zonas de Natal/RN com privacidade total (LGPD) ou acesse o Autoatendimento Oficial do TSE. Informações sobre candidatos já eleitos no 1º turno são respondidas sob demanda pelo Agente PotiguarBot IA.',
      destaqueSecundario:
        'Use o Localizador Público de Votação para conferir endereços por bairro/zona, linhas de ônibus gratuitas, documentos com foto aceitos e horário oficial (08h às 17h).',
      fonte: 'TRE-RN · TSE Autoatendimento · PotiguarBot IA (Estúdio 24h)',
      corDestaque: '#6366f1',
      ctaPrimarioTexto: 'Consultar Local de Votação',
      ctaPrimarioHref: '#localizador-secao',
      ctaBotPrompt:
        'Como consultar onde fica meu local de votação no 2º turno em Natal/RN, quais documentos levar e quais linhas de ônibus gratuitas atendem meu bairro?',
      icone: 'map',
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const renderSlideIcon = (icone: NoticiaSlideItem['icone']) => {
    switch (icone) {
      case 'radio':
        return <Radio className="w-4 h-4 text-red-500 animate-pulse" />;
      case 'scale':
        return <Scale className="w-4 h-4 text-rose-500" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-emerald-500" />;
      case 'shield':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'map':
        return <MapPin className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <section
      aria-label="Slides das Primeiras Notícias - Atualização em Tempo Real 24h"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-[var(--card-bg)] border-2 border-[var(--accent-color)] rounded-xl overflow-hidden shadow-sm"
    >
      {/* Top Breaking News Bar 24h */}
      <div className="bg-[#0f172a] text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>PLANTÃO 24H</span>
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-100">
            Slides das Primeiras Notícias · Foco Exclusivo 2º Turno RN
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Tempo Real 24h ({horarioAoVivo})</span>
          </span>

          <button
            type="button"
            onClick={onTriggerDailyUpdate}
            disabled={isUpdatingBoletim}
            className="botao px-3 py-1 rounded-md bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdatingBoletim ? 'animate-spin' : ''}`} />
            <span>
              {isUpdatingBoletim ? 'Atualizando Plantão 24h...' : 'Atualizar Notícias 24h'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Slide Body */}
      <div className="p-5 sm:p-7 space-y-5 relative">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[var(--accent-color)]">
            {renderSlideIcon(currentSlide.icone)}
            <span>{currentSlide.categoria}</span>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] px-2.5 py-1 rounded border border-[var(--border-color)]">
            Slide {currentIndex + 1} de {slides.length} · {currentSlide.tagTempoReal}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[var(--text-color)] leading-snug">
              {currentSlide.titulo}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              {currentSlide.resumo}
            </p>
            <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border-l-4 border-[var(--accent-color)] text-xs text-[var(--text-color)]">
              <strong>Destaque 24h:</strong> {currentSlide.destaqueSecundario}
            </div>
          </div>

          <div className="lg:col-span-4 bg-[var(--surface-subtle)] border border-[var(--border-color)] rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Ações Rápidas da Manchete
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Fonte verificada: <strong className="text-[var(--text-color)]">{currentSlide.fonte}</strong>
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {currentSlide.ctaPrimarioHref && (
                <a
                  href={currentSlide.ctaPrimarioHref}
                  className="botao w-full py-2.5 px-4 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 no-underline cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{currentSlide.ctaPrimarioTexto}</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => onAskBot(currentSlide.ctaBotPrompt)}
                className="botao w-full py-2.5 px-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)] text-[var(--text-color)] text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                <span>Perguntar sobre este tema na IA</span>
              </button>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
              💡 <strong>Dica:</strong> Candidatos já eleitos no 1º turno são informados apenas se você perguntar ao Agente IA.
            </div>
          </div>
        </div>

        {/* Slide Controls & Numbered Navigation Pills */}
        <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`botao px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                }`}
              >
                {idx + 1}. {s.categoria.split('·')[0].trim()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              title={isPaused ? 'Retomar rotação automática 24h' : 'Pausar slides'}
              className="botao px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1 cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Retomar' : 'Pausar'}</span>
            </button>

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Notícia anterior"
              className="botao p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[var(--text-color)] hover:border-[var(--accent-color)] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Próxima notícia"
              className="botao p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[var(--text-color)] hover:border-[var(--accent-color)] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
