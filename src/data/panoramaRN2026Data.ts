export interface CandidatoGovernoRN2026 {
  id: string;
  nome: string;
  nomeUrna: string;
  partido: string;
  siglaPartido: string;
  numero: number;
  porcentagem_votos_validos: number;
  segundoTurno: boolean;
  destaque: string;
  focoPrincipal: string;
  propostas: string[];
  alinhamentoComunidade?: string;
  fotoUrl: string;
  fotoFallbackUrl: string;
  corTema: string;
}

export interface CandidatoCargoRN2026 {
  id: string;
  nome: string;
  cargo: 'Presidente da República' | 'Governador' | 'Senador' | 'Deputado Federal' | 'Deputado Estadual';
  partido: string;
  numero: string;
  destaque: string;
  resumoAtuacao: string;
  propostasChave: string[];
  alinhamentoMaeLuiza?: boolean;
  fotoUrl: string;
  fotoFallbackUrl: string;
}

export const PRESIDENTE_REFERENCIA_2026: CandidatoCargoRN2026 = {
  id: 'presidente-lula-13',
  nome: 'Luiz Inácio Lula da Silva (Presidente Lula)',
  cargo: 'Presidente da República',
  partido: 'Partido dos Trabalhadores (PT)',
  numero: '13',
  destaque: 'Presidente da República · Apoio a Cadu de Lula (Carlos Eduardo Xavier 13) no RN',
  resumoAtuacao:
    'Parceria institucional com o Rio Grande do Norte para duplicação e obras na BR-304, expansão das escolas em tempo integral, programa Mais Médicos / SUS Digital (diagnósticos online) e investimentos do Novo PAC no estado.',
  propostasChave: [
    'Obras federais na BR-304 e infraestrutura viária do RN',
    'Expansão do ensino em tempo integral e Institutos Federais (IFRN)',
    'Fortalecimento do SUS Digital e telessaúde nos municípios potiguares',
  ],
  alinhamentoMaeLuiza: true,
  fotoUrl: '/candidates/presidente-lula.jpg',
  fotoFallbackUrl:
    'https://upload.wikimedia.org/wikipedia/commons/f/f9/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29.jpg',
};

export const DISPUTA_GOVERNO_RN_2026: CandidatoGovernoRN2026[] = [
  {
    id: 'allyson-bezerra-44',
    nome: 'Allyson Bezerra',
    nomeUrna: 'Allyson (União - 44)',
    partido: 'União Brasil',
    siglaPartido: 'UNIÃO',
    numero: 44,
    porcentagem_votos_validos: 37,
    segundoTurno: true,
    destaque: 'Candidato ao 2º Turno no RN · Destaque absoluto nas intenções de voto (37%)',
    focoPrincipal:
      'Foca em investimentos de infraestrutura, incluindo a construção de uma terceira ponte sobre o Rio Potengi em Natal e requalificação de hospitais regionais em Mossoró e no restante do estado.',
    propostas: [
      'Construção de uma terceira ponte sobre o Rio Potengi (mobilidade urbana em Natal)',
      'Requalificação de hospitais regionais em Mossoró e no restante do estado',
      'Investimentos estruturantes em infraestrutura e corredores viários',
    ],
    fotoUrl: '/candidates/allyson-bezerra.jpg',
    fotoFallbackUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/ce/Allyson_Bezerra.jpg',
    corTema: '#0d6efd',
  },
  {
    id: 'cadu-xavier-13',
    nome: 'Carlos Eduardo Xavier (Cadu de Lula)',
    nomeUrna: 'Cadu de Lula (PT - 13)',
    partido: 'Partido dos Trabalhadores',
    siglaPartido: 'PT',
    numero: 13,
    porcentagem_votos_validos: 32,
    segundoTurno: true,
    destaque: 'Candidato ao 2º Turno no RN · Destaque absoluto nas intenções de voto (32%)',
    focoPrincipal:
      'Defende a expansão da educação em tempo integral, obras em rodovias federais (BR-304) e fortalecimento do SUS via diagnósticos médicos online e regionalização da saúde.',
    propostas: [
      'Expansão da educação em tempo integral na rede estadual',
      'Obras em rodovias federais (duplicação e melhorias na BR-304)',
      'Fortalecimento e regionalização do SUS com diagnósticos médicos online',
    ],
    alinhamentoComunidade:
      'Candidato Alinhado a Mãe Luíza: apresentou propostas focadas na regionalização do SUS, diagnósticos online e expansão da educação em tempo integral.',
    fotoUrl: '/candidates/cadu-xavier.jpg',
    fotoFallbackUrl: '/candidates/presidente-lula.jpg',
    corTema: '#e11d48',
  },
  {
    id: 'alvaro-dias-22',
    nome: 'Álvaro Dias',
    nomeUrna: 'Álvaro Dias (PL - 22)',
    partido: 'Partido Liberal',
    siglaPartido: 'PL',
    numero: 22,
    porcentagem_votos_validos: 29,
    segundoTurno: false,
    destaque: 'Destaque absoluto nas intenções de voto (29%)',
    focoPrincipal:
      'Foca em choque de eficiência, ajuste fiscal, parcerias privadas e desburocratização de licenciamento ambiental para atrair investimentos privados, não aumentando impostos.',
    propostas: [
      'Gestão com choque de eficiência e ajuste fiscal',
      'Não aumento de impostos estaduais',
      'Desburocratização do licenciamento ambiental e parcerias privadas para atrair investimentos',
    ],
    fotoUrl: '/candidates/alvaro-dias.png',
    fotoFallbackUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a2/%C3%81lvaro_Dias_%28foto_para_o_TSE%29.png',
    corTema: '#1e293b',
  },
];

export const PANORAMA_CARGOS_RN_2026: CandidatoCargoRN2026[] = [
  // SENADORES MAIS CITADOS
  {
    id: 'carlos-eduardo-senado',
    nome: 'Carlos Eduardo Alves',
    cargo: 'Senador',
    partido: 'PSD',
    numero: '550 / A definir',
    destaque: 'Destaque absoluto nas intenções de voto',
    resumoAtuacao:
      'Lidera com destaque absoluto nas intenções de voto para o Senado Federal pelo Rio Grande do Norte, com histórico de gestão administrativa na capital e projetos de infraestrutura urbana.',
    propostasChave: [
      'Defesa de recursos federais para infraestrutura e mobilidade no RN',
      'Fortalecimento dos municípios potiguares no pacto federativo',
    ],
    fotoUrl: '/candidates/carlos-eduardo-tse.png',
    fotoFallbackUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/Carlos_Eduardo_Alves_%28foto_para_o_TSE%29.png',
  },
  {
    id: 'rogerio-marinho-senado',
    nome: 'Rogério Marinho',
    cargo: 'Senador',
    partido: 'PL',
    numero: '555',
    destaque: 'Destaque absoluto nas intenções de voto · Nº 555',
    resumoAtuacao:
      'Bem posicionado na disputa com foco em reformas fiscais, responsabilidade orçamentária, segurança jurídica e incentivo ao setor privado e produtivo no Rio Grande do Norte.',
    propostasChave: [
      'Reformas fiscais e equilíbrio das contas públicas',
      'Atração de investimentos no setor privado e geração de empregos',
    ],
    alinhamentoMaeLuiza: true,
    fotoUrl: '/candidates/rogerio-marinho-senado.jpg',
    fotoFallbackUrl: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5529.jpg',
  },

  // DEPUTADOS FEDERAIS MAIS CITADOS & COMPLEMENTARES
  {
    id: 'nina-federal',
    nome: 'Nina',
    cargo: 'Deputado Federal',
    partido: 'União Brasil / A definir',
    numero: 'A definir',
    destaque: 'Lidera as intenções de voto · Destaque absoluto nas intenções de voto',
    resumoAtuacao:
      'Lidera as intenções de voto para a Câmara dos Deputados no Rio Grande do Norte, com forte atuação em gestão pública, assistência social e infraestrutura urbana.',
    propostasChave: [
      'Captação de emendas estruturantes para Natal e municípios do RN',
      'Fortalecimento das políticas de assistência social e mobilidade',
    ],
    fotoUrl: '/candidates/nina-souza.jpg',
    fotoFallbackUrl: '/candidates/nina-souza.svg',
  },
  {
    id: 'dr-bernardo-federal',
    nome: 'Dr. Bernardo',
    cargo: 'Deputado Federal',
    partido: 'PSDB / A definir',
    numero: 'A definir',
    destaque: 'Bem posicionado na disputa · Destaque absoluto nas intenções de voto',
    resumoAtuacao:
      'Médico e parlamentar com forte presença no interior potiguar e região Oeste/Médio Oeste, bem posicionado na disputa por vaga na Câmara Federal.',
    propostasChave: [
      'Ampliação do atendimento médico especializado e hospitais regionais',
      'Apoio ao desenvolvimento hídrico e produtivo do interior do RN',
    ],
    fotoUrl: '/candidates/dr-bernardo.jpg',
    fotoFallbackUrl: '/candidates/dr-bernardo.svg',
  },
  {
    id: 'natalia-bonavides-federal',
    nome: 'Natália Bonavides',
    cargo: 'Deputado Federal',
    partido: 'PT',
    numero: '13 / A definir',
    destaque: 'Entre os principais nomes nas pesquisas · Destaque absoluto nas intenções de voto',
    resumoAtuacao:
      'Figura entre os principais nomes nas pesquisas para a Câmara Federal, com atuação destacada em direitos sociais, educação pública (UFRN/IFRN) e fortalecimento do SUS.',
    propostasChave: [
      'Destinação de emendas para o SUS, hospitais públicos e educação federal',
      'Defesa dos direitos trabalhistas, mobilidade e pautas sociais',
    ],
    fotoUrl: '/candidates/natalia-bonavides-tse.jpg',
    fotoFallbackUrl: 'https://www.camara.leg.br/internet/deputado/bandep/204453.jpg',
  },
  {
    id: 'benes-leocadio-federal',
    nome: 'Benes Leocádio',
    cargo: 'Deputado Federal',
    partido: 'União Brasil',
    numero: '4444',
    destaque: 'Deputado Federal Complementar · Destaque em Emendas para a Saúde',
    resumoAtuacao:
      'Destina grande parte de suas emendas parlamentares para a saúde pública do estado do Rio Grande do Norte e custeio do atendimento hospitalar nos municípios.',
    propostasChave: [
      'Emendas parlamentares prioritárias para custeio e investimentos no SUS do RN',
      'Apoio municipalista para prefeituras e santas casas potiguares',
    ],
    fotoUrl: '/candidates/benes-leocadio.jpg',
    fotoFallbackUrl: 'https://www.camara.leg.br/internet/deputado/bandep/109429.jpg',
  },

  // DEPUTADOS ESTADUAIS MAIS CITADOS & ALINHADOS
  {
    id: 'cinthia-de-allyson-estadual',
    nome: 'Cinthia de Allyson (Cinthia Raquel)',
    cargo: 'Deputado Estadual',
    partido: 'União Brasil (UNIÃO)',
    numero: '44444',
    destaque: 'Líder em intenções · Destaque absoluto nas intenções de voto (TSE 200002535730)',
    resumoAtuacao:
      'Pedagoga natural de Mossoró/RN, destaca-se na liderança das intenções de voto e entre as mais votadas para a Assembleia Legislativa do Rio Grande do Norte (ALRN · Nº 44444), com foco em educação, projetos sociais, saúde materno-infantil e inclusão.',
    propostasChave: [
      'Programas de proteção social, educação infantil e saúde da mulher no RN',
      'Expansão de projetos comunitários e qualificação profissional em Mossoró e todo o estado',
    ],
    fotoUrl: '/candidates/tse-200002535730-CINTHIA-DE-ALLYSON.jpg',
    fotoFallbackUrl: 'https://static.ndmais.com.br/eleicoes/2026/rn/FRN200002535730_div.jpg',
  },
  {
    id: 'neilton-diogenes-estadual',
    nome: 'Neilton Diógenes',
    cargo: 'Deputado Estadual',
    partido: 'PP / A definir',
    numero: 'A definir',
    destaque: 'Nome forte na disputa · Destaque absoluto nas intenções de voto',
    resumoAtuacao:
      'Aparece como um dos nomes mais fortes na disputa pela Assembleia Legislativa (ALRN), com atuação voltada para o desenvolvimento regional, infraestrutura e juventude.',
    propostasChave: [
      'Incentivo ao emprego, empreendedorismo e infraestrutura no interior e capital',
      'Fortalecimento da educação técnica e ações sociais',
    ],
    fotoUrl: '/candidates/neilton-diogenes.jpg',
    fotoFallbackUrl: '/candidates/neilton-diogenes.svg',
  },
  {
    id: 'ezequiel-ferreira-estadual',
    nome: 'Ezequiel Ferreira',
    cargo: 'Deputado Estadual',
    partido: 'PSDB / A definir',
    numero: 'A definir',
    destaque: 'Entre os principais colocados · Destaque absoluto nas intenções de voto',
    resumoAtuacao:
      'Presidente da ALRN, figura entre os principais colocados nas pesquisas com forte articulação institucional e projetos voltados para segurança hídrica, saúde e desenvolvimento do RN.',
    propostasChave: [
      'Interiorização do desenvolvimento econômico e apoio aos municípios',
      'Modernização do Legislativo e investimentos em saúde regional',
    ],
    fotoUrl: '/candidates/ezequiel-ferreira.jpg',
    fotoFallbackUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/c0/Ezequiel_Ferreira.jpg',
  },
  {
    id: 'daniel-valenca-estadual',
    nome: 'Daniel Valença',
    cargo: 'Deputado Estadual',
    partido: 'PT',
    numero: '13',
    destaque: 'Alinhado a Mãe Luíza · Pautas Sociais, Educação e Saúde',
    resumoAtuacao:
      'Atuação voltada para pautas sociais, educação pública, direito à cidade e saúde, alinhando-se diretamente às prioridades da comunidade de Mãe Luíza em Natal.',
    propostasChave: [
      'Defesa da educação em tempo integral e equipamentos sociais nas comunidades',
      'Fortalecimento da atenção básica do SUS e urbanização comunitária em Mãe Luíza',
    ],
    alinhamentoMaeLuiza: true,
    fotoUrl: '/candidates/daniel-valenca.jpg',
    fotoFallbackUrl: '/candidates/daniel-valenca.svg',
  },
];

export const JSON_DISPUTA_GOVERNO_RN = {
  titulo: 'Disputa pelo Governo do Rio Grande do Norte',
  segundo_turno_rn: 'Allyson Bezerra (UNIÃO - 44) e Carlos Eduardo Xavier / Cadu de Lula (PT - 13)',
  candidatos: [
    {
      nome: 'Allyson',
      nome_completo: 'Allyson Bezerra',
      partido: 'União Brasil',
      numero: 44,
      porcentagem_votos_validos: 37,
      status_segundo_turno: 'Classificado para o 2º Turno no RN',
      propostas: [
        'Construção de uma terceira ponte sobre o Rio Potengi',
        'Requalificação de hospitais regionais',
      ],
    },
    {
      nome: 'Cadu de Lula',
      nome_completo: 'Carlos Eduardo Xavier',
      partido: 'Partido dos Trabalhadores',
      numero: 13,
      porcentagem_votos_validos: 32,
      status_segundo_turno: 'Classificado para o 2º Turno no RN',
      propostas: [
        'Expansão da educação em tempo integral',
        'Obras em rodovias federais',
        'Fortalecimento do SUS com diagnósticos online',
      ],
    },
    {
      nome: 'Álvaro Dias',
      partido: 'Partido Liberal',
      numero: 22,
      porcentagem_votos_validos: 29,
      propostas: [
        'Gestão com choque de eficiência',
        'Não aumento de impostos',
        'Desburocratização do licenciamento ambiental para atrair investimentos',
      ],
    },
  ],
};

export const JSON_PANORAMA_POLITICO_RN_2026 = {
  titulo: 'Panorama Político do Rio Grande do Norte - Eleições 2026',
  segundo_turno_governo_rn: [
    { nome: 'Allyson Bezerra', partido: 'UNIÃO', numero: 44, porcentagem: '37%' },
    { nome: 'Carlos Eduardo Xavier (Cadu de Lula)', partido: 'PT', numero: 13, porcentagem: '32%' },
  ],
  presidente_referencia: {
    nome: 'Luiz Inácio Lula da Silva',
    partido: 'PT',
    numero: 13,
    destaque: 'Presidente da República · Apoio a Cadu de Lula (Carlos Eduardo Xavier)',
  },
  candidatos: {
    governadores: [
      {
        nome: 'Allyson',
        partido: 'União Brasil',
        numero: 44,
        porcentagem_votos_validos: 37,
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Cadu de Lula',
        partido: 'Partido dos Trabalhadores',
        numero: 13,
        porcentagem_votos_validos: 32,
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Álvaro Dias',
        partido: 'Partido Liberal',
        numero: 22,
        porcentagem_votos_validos: 29,
        destaque: 'Destaque absoluto nas intenções de voto',
      },
    ],
    deputados_estaduais: [
      {
        nome: 'Cinthia de Allyson',
        partido: 'União Brasil (UNIÃO)',
        numero: 44444,
        registro_tse: '200002535730',
        foto: '/candidates/tse-200002535730-CINTHIA-DE-ALLYSON.jpg',
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Neilton Diógenes',
        partido: 'A definir',
        numero: 'A definir',
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Ezequiel Ferreira',
        partido: 'A definir',
        numero: 'A definir',
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Daniel Valença',
        partido: 'PT',
        numero: 13,
        destaque: 'Alinhado a Mãe Luíza · Pautas sociais, saúde e educação',
      },
    ],
    deputados_federais: [
      {
        nome: 'Nina',
        partido: 'A definir',
        numero: 'A definir',
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Dr. Bernardo',
        partido: 'A definir',
        numero: 'A definir',
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Natália Bonavides',
        partido: 'A definir',
        numero: 'A definir',
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Benes Leocádio',
        partido: 'União Brasil',
        numero: 4444,
        destaque: 'Destina grande parte de suas emendas parlamentares para a saúde pública do estado',
      },
    ],
    senadores: [
      {
        nome: 'Carlos Eduardo Alves',
        partido: 'A definir',
        numero: 'A definir',
        destaque: 'Destaque absoluto nas intenções de voto',
      },
      {
        nome: 'Rogério Marinho',
        partido: 'PL',
        numero: 555,
        destaque: 'Destaque absoluto nas intenções de voto · Reformas fiscais e setor privado',
      },
    ],
  },
};
