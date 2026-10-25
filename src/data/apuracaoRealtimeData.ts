/**
 * Dados e interfaces de Apuração de Votos em Tempo Real - Eleições 2026 (2º Turno)
 * Abrange a disputa Presidencial (Brasil) e a disputa para o Governo do RN / Zonas de Natal.
 */

export interface ApuracaoCandidatoItem {
  id: string;
  nome: string;
  nomeUrna: string;
  numero: string;
  partido: string;
  siglaPartido: string;
  fotoUrl: string;
  fotoFallbackUrl?: string;
  corTema: string;
  votosApurados: number;
  percentual: number;
  situacao: 'Liderando' | 'Em 2º Lugar' | 'Eleito Matematicamente' | 'Aguardando Totalização';
  vantagemVotos?: number;
}

export interface ApuracaoZonaEleitoralItem {
  id: string;
  zona: string;
  regiao: string;
  bairrosReferencia: string;
  secoesTotalizadas: number;
  totalSecoes: number;
  percentualApurado: number;
  votosAllyson: number;
  votosCadu: number;
  percentualAllyson: number;
  percentualCadu: number;
  lider: string;
}

export interface ApuracaoEleicaoData {
  id: 'presidencial-2026' | 'rn-governo-2026';
  titulo: string;
  subtitulo: string;
  ultimaAtualizacao: string;
  timestamp: number;
  urnasApuradasPct: number;
  secoesTotalizadas: number;
  totalSecoes: number;
  totalVotosApurados: number;
  votosValidos: number;
  votosValidosPct: number;
  votosBrancos: number;
  votosBrancosPct: number;
  votosNulos: number;
  votosNulosPct: number;
  abstencaoPct: number;
  statusApuracao: 'Em Apuração ao Vivo' | 'Definido Matematicamente' | 'Totalizado';
  candidatos: ApuracaoCandidatoItem[];
  votosPorRegiao?: {
    regiao: string;
    candidatoAVotosPct: number;
    candidatoBVotosPct: number;
    totalVotos: number;
  }[];
  zonasNatal?: ApuracaoZonaEleitoralItem[];
}

export const APURACAO_PRESIDENCIAL_INICIAL: ApuracaoEleicaoData = {
  id: 'presidencial-2026',
  titulo: 'Presidência da República · 2º Turno Brasil 2026',
  subtitulo: 'Totalização Oficial do Tribunal Superior Eleitoral (TSE) em Tempo Real',
  ultimaAtualizacao: '25/10/2026 às 19:14:22',
  timestamp: 1729894462000,
  urnasApuradasPct: 95.84,
  secoesTotalizadas: 476210,
  totalSecoes: 496892,
  totalVotosApurados: 114820450,
  votosValidos: 110480200,
  votosValidosPct: 96.22,
  votosBrancos: 1740150,
  votosBrancosPct: 1.52,
  votosNulos: 2600100,
  votosNulosPct: 2.26,
  abstencaoPct: 18.42,
  statusApuracao: 'Em Apuração ao Vivo',
  candidatos: [
    {
      id: 'lula-13',
      nome: 'Luiz Inácio Lula da Silva',
      nomeUrna: 'Lula',
      numero: '13',
      partido: 'Partido dos Trabalhadores',
      siglaPartido: 'PT',
      fotoUrl: '/candidates/presidente-lula.jpg',
      fotoFallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29.jpg',
      corTema: '#dc2626',
      votosApurados: 56234402,
      percentual: 50.90,
      situacao: 'Liderando',
      vantagemVotos: 1988604,
    },
    {
      id: 'flavio-22',
      nome: 'Flávio Nantes Bolsonaro',
      nomeUrna: 'Flávio Bolsonaro',
      numero: '22',
      partido: 'Partido Liberal',
      siglaPartido: 'PL',
      fotoUrl: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5894.jpg',
      fotoFallbackUrl: '/candidates/flavio-bolsonaro.svg',
      corTema: '#2563eb',
      votosApurados: 54245798,
      percentual: 49.10,
      situacao: 'Em 2º Lugar',
    },
  ],
  votosPorRegiao: [
    { regiao: 'Nordeste', candidatoAVotosPct: 67.2, candidatoBVotosPct: 32.8, totalVotos: 31200000 },
    { regiao: 'Sudeste', candidatoAVotosPct: 45.4, candidatoBVotosPct: 54.6, totalVotos: 48500000 },
    { regiao: 'Sul', candidatoAVotosPct: 38.6, candidatoBVotosPct: 61.4, totalVotos: 17800000 },
    { regiao: 'Norte', candidatoAVotosPct: 51.8, candidatoBVotosPct: 48.2, totalVotos: 9400000 },
    { regiao: 'Centro-Oeste', candidatoAVotosPct: 41.5, candidatoBVotosPct: 58.5, totalVotos: 7920450 },
    { regiao: 'Rio Grande do Norte (RN)', candidatoAVotosPct: 65.8, candidatoBVotosPct: 34.2, totalVotos: 1980400 },
  ],
};

export const APURACAO_RN_INICIAL: ApuracaoEleicaoData = {
  id: 'rn-governo-2026',
  titulo: 'Governo do Estado do Rio Grande do Norte & Natal · 2º Turno 2026',
  subtitulo: 'Totalização Oficial TRE-RN / TSE com detalhamento por Zonas Eleitorais de Natal',
  ultimaAtualizacao: '25/10/2026 às 19:15:05',
  timestamp: 1729894505000,
  urnasApuradasPct: 96.72,
  secoesTotalizadas: 7850,
  totalSecoes: 8116,
  totalVotosApurados: 1928400,
  votosValidos: 1845600,
  votosValidosPct: 95.71,
  votosBrancos: 32100,
  votosBrancosPct: 1.66,
  votosNulos: 50700,
  votosNulosPct: 2.63,
  abstencaoPct: 16.85,
  statusApuracao: 'Em Apuração ao Vivo',
  candidatos: [
    {
      id: 'allyson-44',
      nome: 'Allyson Leandro Bezerra Silva',
      nomeUrna: 'Allyson Bezerra',
      numero: '44',
      partido: 'União Brasil',
      siglaPartido: 'UNIÃO',
      fotoUrl: '/candidates/allyson-bezerra.jpg',
      fotoFallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Allyson_Bezerra.jpg',
      corTema: '#0d6efd',
      votosApurados: 963380,
      percentual: 52.20,
      situacao: 'Liderando',
      vantagemVotos: 81160,
    },
    {
      id: 'cadu-13',
      nome: 'Carlos Eduardo Xavier',
      nomeUrna: 'Cadu de Lula',
      numero: '13',
      partido: 'Partido dos Trabalhadores',
      siglaPartido: 'PT',
      fotoUrl: '/candidates/cadu-xavier.jpg',
      fotoFallbackUrl: '/candidates/presidente-lula.jpg',
      corTema: '#e11d48',
      votosApurados: 882220,
      percentual: 47.80,
      situacao: 'Em 2º Lugar',
    },
  ],
  zonasNatal: [
    {
      id: 'zona-1',
      zona: '1ª Zona Eleitoral de Natal',
      regiao: 'Centro & Leste Histórico',
      bairrosReferencia: 'Alecrim, Ribeira, Cidade Alta, Barro Vermelho',
      secoesTotalizadas: 178,
      totalSecoes: 182,
      percentualApurado: 97.8,
      votosAllyson: 24150,
      votosCadu: 23820,
      percentualAllyson: 50.3,
      percentualCadu: 49.7,
      lider: 'Allyson Bezerra',
    },
    {
      id: 'zona-2',
      zona: '2ª Zona Eleitoral de Natal',
      regiao: 'Zona Sul de Natal',
      bairrosReferencia: 'Ponta Negra, Candelária, Capim Macio, Neópolis, Lagoa Nova',
      secoesTotalizadas: 215,
      totalSecoes: 218,
      percentualApurado: 98.6,
      votosAllyson: 38400,
      votosCadu: 32100,
      percentualAllyson: 54.5,
      percentualCadu: 45.5,
      lider: 'Allyson Bezerra',
    },
    {
      id: 'zona-3',
      zona: '3ª Zona Eleitoral de Natal',
      regiao: 'Zona Leste & Litoral Urbano',
      bairrosReferencia: 'Mãe Luíza, Petrópolis, Areia Preta, Tirol, Santos Reis',
      secoesTotalizadas: 194,
      totalSecoes: 198,
      percentualApurado: 98.0,
      votosAllyson: 28900,
      votosCadu: 32600,
      percentualAllyson: 47.0,
      percentualCadu: 53.0,
      lider: 'Cadu de Lula (Forte em Mãe Luíza)',
    },
    {
      id: 'zona-4',
      zona: '4ª Zona Eleitoral de Natal',
      regiao: 'Zona Oeste de Natal',
      bairrosReferencia: 'Felipe Camarão, Quintas, Dix-Sept Rosado, Bom Pastor, Nazaré',
      secoesTotalizadas: 220,
      totalSecoes: 225,
      percentualApurado: 97.7,
      votosAllyson: 33200,
      votosCadu: 34100,
      percentualAllyson: 49.3,
      percentualCadu: 50.7,
      lider: 'Cadu de Lula',
    },
    {
      id: 'zona-69',
      zona: '69ª Zona Eleitoral de Natal',
      regiao: 'Zona Norte de Natal',
      bairrosReferencia: 'Potengi, Pajuçara, Lagoa Azul, Igapó, Redinha, N. S. da Apresentação',
      secoesTotalizadas: 310,
      totalSecoes: 318,
      percentualApurado: 97.5,
      votosAllyson: 54100,
      votosCadu: 49800,
      percentualAllyson: 52.1,
      percentualCadu: 47.9,
      lider: 'Allyson Bezerra (Proposta da 3ª Ponte)',
    },
  ],
};
