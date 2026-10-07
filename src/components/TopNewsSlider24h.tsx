import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Radio,
  Bus,
  Vote,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { BoletimDiarioIA } from '../data/platformData';

export interface SlideNoticia24h {
  id: string;
  categoria: string;
  horario: string;
  titulo: string;
  resumo: string;
  destaqueTag: string;
  ancoraLink: string;
  textoBotao: string;
  icone: 'vote' | 'bus' | 'shield' | 'map';
}

const SLIDES_BASE_24H: SlideNoticia24h[] = [
  {
    id: 'slide-2-turno-foco',
    categoria: 'PLANTÃO 24H · SEGUNDO TURNO NATAL/RN',
    horario: 'Ao Vivo · Atualização Contínua',
    titulo: '2º Turno em Natal: Compare Propostas de Natália Bonavides (13) e Paulinho Freire (44)',
    resumo:
      'Painel atualizado exclusivamente com os candidatos que disputam o 2º turno. Consulte planos do DivulgaCandContas TSE em Saúde/SUS, Educação, Segurança e Economia. (Para saber sobre cargos já eleitos no 1º turno, pergunte ao PotiguarBot IA).',
    destaqueTag: 'Foco Exclusivo 2º Turno',
    ancoraLink: '#monitoramento',
    textoBotao: 'Ver Candidatos do 2º Turno',
    icone: 'vote',
  },
  {
    id: 'slide-passe-livre-24h',
    categoria: 'UTILIDADE PÚBLICA · MOBILIDADE STTU & RN',
    horario: 'Confirmado Oficialmente · 24h',
    titulo: 'Passe Livre Garantido no 2º Turno: 62 Linhas Urbanas e Intermunicipais Gratuitas',
    resumo:
      'Catracas 100% liberadas em todas as zonas de Natal (Norte, Sul, Leste e Oeste) sem exigir cartão NuBus, além de transporte intermunicipal gratuito pelo Decreto Estadual nº 35.935/2026.',
    destaqueTag: 'Catraca Liberada 06h às 20h',
    ancoraLink: '#utilidade-publica',
    textoBotao: 'Consultar Linhas por Bairro',
    icone: 'bus',
  },
  {
    id: 'slide-transicao-checagem',
    categoria: 'TRANSPARÊNCIA & CHECAGEM TSE 24H',
    horario: 'Monitoramento Documental Ativo',
    titulo: 'Transição de Governo Ativa e Alertas Anti-Desinformação em Tempo Real',
    resumo:
      'Acompanhe a análise de conformidade dos primeiros decretos nos eixos Saúde (SUS), Educação e Infraestrutura, além da verificação oficial de áudios e propostas políticas.',
    destaqueTag: 'Verificado no DivulgaCandContas',
    ancoraLink: '#monitoramento-24h',
    textoBotao: 'Abrir Monitoramento 24h',
    icone: 'shield',
  },
  {
    id: 'slide-secao-eleitoral',
    categoria: 'SERVIÇO AO ELEITOR · ONDE VOTAR',
    horario: 'Guia Rápido TRE-RN',
    titulo: 'Localizador de Urna e Seção Eleitoral (Ex: Seção 84 no Alfredo Pegado)',
    resumo:
      'Perdeu o número da sua seção ou quer confirmar qual documento com foto levar? Consulte instantaneamente seu colégio eleitoral, endereço, linhas de ônibus e horário (08h às 17h).',
    destaqueTag: 'Consulta Instantânea',
    ancoraLink: '#localizador-secao',
    textoBotao: 'Localizar Minha Seção',
    icone: 'map',
  },
];

interface TopNewsSlider24hProps {
  boletinsIA: BoletimDiarioIA[];
  isUpdating: boolean;
  onRefresh24h: () => void;
  onAskAgent: (prompt: string) => void;
}

export const TopNewsSlider24h: React.FC<TopNewsSlider24hProps> = ({
  boletinsIA,
  isUpdating,
  onRefresh24h,
  onAskAgent,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Merge dynamic AI bulletins at the front of the 24h slides
  const slides: SlideNoticia24h[] = React.useMemo(() => {
    const dynamicSlides: SlideNoticia24h[] = boletinsIA.slice(0, 2).map((bol, idx) => ({
      id: `bol-slide-${bol.id || idx}`,
      categoria: 'BOLETIM IA EM TEMPO REAL · 24H',
      horario: bol.dataReferencia,
      titulo: bol.titulo,
      resumo: `${bol.resumoCandidatos} · Transporte: ${bol.statusTransporte}`,
      destaqueTag: bol.fontesVerificadas || 'Fontes Oficiais TRE-RN / TSE',
      ancoraLink: '#boletim-diario-ia',
      textoBotao: 'Ver Boletim Completo',
      icone: 'vote',
    }));
    return [...SLIDES_BASE_24H, ...dynamicSlides];
  }, [boletinsIA]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[currentIndex] || slides[0];

  const renderIcon = (icone: SlideNoticia24h['icone']) => {
    switch (icone) {
      case 'bus':
        return <Bus className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'map':
        return <MapPin className="w-5 h-5 text-sky-400 shrink-0" />;
      default:
        return <Vote className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <section
      aria-label="Slides das Primeiras Notícias em Tempo Real 24h"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-slate-900 text-white rounded-xl border border-slate-700 overflow-hidden shadow-md"
    >
      {/* Top Bar of the 24h News Slider */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>PRIMEIRAS NOTÍCIAS · ATUALIZAÇÃO EM TEMPO REAL 24H</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">
            Slide {currentIndex + 1} de {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onAskAgent(
                'Quais candidatos já foram eleitos no 1º turno no RN e como está a disputa agora no 2º turno?'
              )
            }
            className="botao px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Perguntar à IA sobre Já Eleitos</span>
          </button>

          <button
            type="button"
            onClick={onRefresh24h}
            disabled={isUpdating}
            className="botao px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Atualizando 24h...' : 'Atualizar 24h'}</span>
          </button>
        </div>
      </div>

      {/* Main Slide Body */}
      <div className="p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {renderIcon(activeSlide.icone)}
            <span className="font-mono font-semibold text-blue-400 uppercase tracking-wide">
              {activeSlide.categoria}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 font-tabular">{activeSlide.horario}</span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-300 font-semibold">{activeSlide.destaqueTag}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug">
            {activeSlide.titulo}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-[80ch]">
            {activeSlide.resumo}
          </p>
        </div>

        {/* Slide Controls & Action CTA */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 shrink-0">
          <a
            href={activeSlide.ancoraLink}
            className="botao px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold no-underline whitespace-nowrap"
          >
            {activeSlide.textoBotao}
          </a>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Notícia anterior"
              className="botao p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Próxima notícia"
              className="botao p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Progress Dots */}
      <div className="px-6 pb-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir para slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 bg-blue-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-slate-400">
          Foco no 2º Turno · Cargos já eleitos disponíveis sob consulta no PotiguarBot IA
        </span>
      </div>
    </section>
  );
};
