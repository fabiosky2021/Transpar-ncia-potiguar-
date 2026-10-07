export interface NoticiaUtilidadePublica {
  id: string;
  titulo: string;
  descricao: string;
  curtidas: number;
  afiliadoLiberado: boolean;
  linkAfiliado: string;
  produtoRecomendado: string;
}

export interface CandidatoItem {
  id: string;
  nome: string;
  cargo: string;
  partido: string;
  numero?: string;
  destaqueAbsoluto: boolean;
  curtidas: number;
  aprovacoes?: number;
  reprovacoes?: number;
  afiliadoLiberado?: boolean;
  linkAfiliado: string;
  produtoRecomendado: string;
  resumoMonitoramento: string;
  eixosPrioritarios: string[];
  fotoOficial: string;
  fotoFallbackUrl: string;
  fonteFotoOficial: string;
  urlFonteOficial: string;
}

export interface OpcaoEnquete {
  id: string;
  nome: string;
  partido: string;
  votos: number;
  fotoOficial: string;
  fotoFallbackUrl: string;
  fonteFotoOficial: string;
  corBarra: string;
}

export interface EnqueteSegundoTurno {
  titulo: string;
  status: 'ativa' | 'encerrada';
  totalVotos: number;
  opcoes: OpcaoEnquete[];
}

export interface BoletimDiarioIA {
  id: string;
  dataReferencia: string;
  titulo: string;
  statusTransporte: string;
  resumoCandidatos: string;
  fontesVerificadas: string;
}

export interface AvaliacaoCandidatoItem {
  id: string;
  candidatoId: string;
  candidatoNome: string;
  aprovado: boolean;
  fezDeBom: string;
  naoFez: string;
  autor: string;
  horario: string;
}

export interface PlataformaSpec {
  meta: {
    plataforma: string;
    versao: string;
    lgpdAtivo: boolean;
    moderacaoAtiva: boolean;
    monetizacaoAfiliados: boolean;
  };
  politicaPrivacidade: {
    mensagem: string;
    termoUso: string;
  };
  agenteIA: {
    nome: string;
    diretrizComportamento: string;
    instrucaoSistema: string;
    noticiasUtilidadePublica: NoticiaUtilidadePublica[];
  };
  candidatos: CandidatoItem[];
  enqueteSegundoTurno: EnqueteSegundoTurno;
}

export interface RotaPasseLivre {
  id: string;
  zona: 'Zona Norte' | 'Zona Sul' | 'Zona Leste' | 'Zona Oeste' | 'Intermunicipal (Grande Natal)';
  bairrosAtendidos: string;
  linhasPrincipais: string;
  horarioOperacao: string;
  statusCatraca: 'Catraca Liberada · 100% Gratuito';
  frotaOperante: string;
}

export interface RelatoCidadao {
  id: string;
  autor: string;
  bairro: string;
  horario: string;
  mensagem: string;
  statusModeracao: 'Aprovado pela Moderação LGPD';
}

export const POTIGUAR_BOT_SYSTEM_PROMPT =
  'Você é o PotiguarBot IA, assistente da plataforma Transparência Potiguar (Panorama Político do Rio Grande do Norte - Eleições 2026 & Monitoramento 24h do 2º Turno). Responda sempre com civilidade, respeitando a democracia e a LGPD. Destaque os candidatos ao 2º Turno do Governo do RN: Allyson Bezerra (União Brasil · 44 - 37%) e Carlos Eduardo Xavier / Cadu de Lula (PT · 13 - 32%, com apoio do Presidente Lula), além de Álvaro Dias (PL · 22 - 29%), os destaques absolutos para Senador (Carlos Eduardo Alves e Rogério Marinho 555), Deputados Federais (Nina, Dr. Bernardo, Natália Bonavides, Benes Leocádio), Deputados Estaduais (Cinthia de Allyson, Neilton Diógenes, Ezequiel Ferreira, Daniel Valença) e o alinhamento com a comunidade de Mãe Luíza.';

export const INITIAL_PLATFORM_DATA: PlataformaSpec = {
  meta: {
    plataforma: 'Transparência Potiguar - Eleições RN',
    versao: '2.1.0',
    lgpdAtivo: true,
    moderacaoAtiva: true,
    monetizacaoAfiliados: true,
  },
  politicaPrivacidade: {
    mensagem: 'Sua privacidade e segurança estão protegidas 🔏',
    termoUso: 'Ambiente democrático. Moderação ativa contra discurso de ódio e palavras ofensivas.',
  },
  agenteIA: {
    nome: 'PotiguarBot IA',
    diretrizComportamento:
      'Atender eleitores potiguares com imparcialidade, civilidade e foco na transparência e mobilidade pública.',
    instrucaoSistema: POTIGUAR_BOT_SYSTEM_PROMPT,
    noticiasUtilidadePublica: [
      {
        id: 'passe-livre-bairros',
        titulo: 'Passe Livre nos Bairros de Natal e RN (STTU & Decreto Estadual nº 35.935/2026)',
        descricao:
          'Confirmado pela STTU Natal e Governo do RN (Resolução-TSE nº 23.751/2026): todas as 62 linhas urbanas de Natal (1.836 viagens, sem precisar de cartão NuBus) e o transporte intermunicipal rodoviário têm passe livre garantido nos turnos de votação (04/10 e 25/10/2026).',
        curtidas: 1240,
        afiliadoLiberado: false,
        linkAfiliado: 'AGUARDANDO_SEU_LINK',
        produtoRecomendado: 'Guia Cidadão & Mobilidade Urbana RN (Oferta Recomendada)',
      },
    ],
  },
  candidatos: [
    {
      id: 'allyson-bezerra',
      nome: 'Allyson Bezerra (Allyson)',
      cargo: 'Candidato ao Governo do RN (2º Turno · 37%)',
      partido: 'União Brasil',
      numero: '44',
      destaqueAbsoluto: true,
      curtidas: 5420,
      aprovacoes: 485,
      reprovacoes: 64,
      linkAfiliado: 'AGUARDANDO_SEU_LINK',
      produtoRecomendado: 'Guia de Infraestrutura & Gestão Pública RN',
      resumoMonitoramento:
        'Destaque absoluto nas intenções de voto (37% dos votos válidos) e classificado para o 2º Turno no RN. Foca em investimentos de infraestrutura, incluindo a construção de uma 3ª ponte sobre o Rio Potengi em Natal e requalificação de hospitais regionais em Mossoró e no estado.',
      eixosPrioritarios: [
        '3ª Ponte sobre o Rio Potengi',
        'Hospitais Regionais (Mossoró e RN)',
        'Infraestrutura e Mobilidade Urbana',
      ],
      fotoOficial: '/candidates/allyson-bezerra.jpg',
      fotoFallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Allyson_Bezerra.jpg',
      fonteFotoOficial: 'Foto Oficial: Justiça Eleitoral / TSE',
      urlFonteOficial: 'https://divulgacandcontas.tse.jus.br/',
    },
    {
      id: 'cadu-xavier',
      nome: 'Carlos Eduardo Xavier (Cadu de Lula)',
      cargo: 'Candidato ao Governo do RN (2º Turno · 32%)',
      partido: 'PT',
      numero: '13',
      destaqueAbsoluto: true,
      curtidas: 4980,
      aprovacoes: 452,
      reprovacoes: 58,
      linkAfiliado: 'AGUARDANDO_SEU_LINK',
      produtoRecomendado: 'Guia Educação Integral & SUS Digital RN',
      resumoMonitoramento:
        'Destaque absoluto nas intenções de voto (32% dos votos válidos) e classificado para o 2º Turno no RN com apoio do Presidente Lula. Defende a expansão da educação em tempo integral, obras em rodovias federais (BR-304) e fortalecimento/regionalização do SUS via diagnósticos online (alinhado com Mãe Luíza).',
      eixosPrioritarios: [
        'Educação em Tempo Integral',
        'Obras Federais na BR-304',
        'SUS com Diagnósticos Online (Mãe Luíza)',
      ],
      fotoOficial: '/candidates/cadu-xavier.jpg',
      fotoFallbackUrl: '/candidates/presidente-lula.jpg',
      fonteFotoOficial: 'Foto Institucional: Sefaz/Comsefaz & TSE',
      urlFonteOficial: 'https://divulgacandcontas.tse.jus.br/',
    },
    {
      id: 'alvaro-dias',
      nome: 'Álvaro Dias',
      cargo: 'Candidato ao Governo do RN (29% Votos Válidos)',
      partido: 'PL',
      numero: '22',
      destaqueAbsoluto: true,
      curtidas: 4310,
      aprovacoes: 390,
      reprovacoes: 61,
      linkAfiliado: 'AGUARDANDO_SEU_LINK',
      produtoRecomendado: 'Guia de Eficiência Fiscal & Gestão',
      resumoMonitoramento:
        'Destaque absoluto nas intenções de voto (29% dos votos válidos). Foca em choque de eficiência, ajuste fiscal, não aumento de impostos e desburocratização do licenciamento ambiental para atrair investimentos privados para o RN.',
      eixosPrioritarios: [
        'Choque de Eficiência e Ajuste Fiscal',
        'Não Aumento de Impostos',
        'Desburocratização Ambiental e Parcerias Privadas',
      ],
      fotoOficial: '/candidates/alvaro-dias.png',
      fotoFallbackUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/a2/%C3%81lvaro_Dias_%28foto_para_o_TSE%29.png',
      fonteFotoOficial: 'Foto Oficial: Justiça Eleitoral / TSE',
      urlFonteOficial: 'https://divulgacandcontas.tse.jus.br/',
    },
    {
      id: 'carlos-eduardo',
      nome: 'Carlos Eduardo Alves',
      cargo: 'Candidato ao Senado Federal (RN)',
      partido: 'PSD',
      numero: '550',
      destaqueAbsoluto: true,
      curtidas: 4820,
      aprovacoes: 412,
      reprovacoes: 49,
      linkAfiliado: 'AGUARDANDO_SEU_LINK',
      produtoRecomendado: 'Oferta Especial de Leitura / Curso',
      resumoMonitoramento:
        'Destaque absoluto nas intenções de voto para o Senado Federal no Rio Grande do Norte, com foco em infraestrutura metropolitana, saúde e defesa de recursos federais para os municípios potiguares.',
      eixosPrioritarios: ['Destaque Absoluto Senado RN', 'Infraestrutura Urbana', 'Municipalismo'],
      fotoOficial: '/candidates/carlos-eduardo-tse.png',
      fotoFallbackUrl:
        'https://upload.wikimedia.org/wikipedia/commons/0/07/Carlos_Eduardo_Alves_%28foto_para_o_TSE%29.png',
      fonteFotoOficial: 'Foto Oficial: Justiça Eleitoral / TSE',
      urlFonteOficial: 'https://divulgacandcontas.tse.jus.br/',
    },
    {
      id: 'rogerio-marinho',
      nome: 'Rogério Marinho',
      cargo: 'Senador / Destaque Senado RN',
      partido: 'PL',
      numero: '555',
      destaqueAbsoluto: true,
      curtidas: 4190,
      aprovacoes: 378,
      reprovacoes: 55,
      linkAfiliado: 'AGUARDANDO_SEU_LINK',
      produtoRecomendado: 'Guia de Economia & Reformas Fiscais',
      resumoMonitoramento:
        'Destaque absoluto nas intenções de voto (555), bem posicionado na disputa com atuação voltada para reformas fiscais, responsabilidade orçamentária e incentivo ao setor privado no RN.',
      eixosPrioritarios: ['Reformas Fiscais', 'Incentivo ao Setor Privado', 'Infraestrutura Regional'],
      fotoOficial: '/candidates/rogerio-marinho-senado.jpg',
      fotoFallbackUrl: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5529.jpg',
      fonteFotoOficial: 'Foto Oficial: Senado Federal',
      urlFonteOficial: 'https://www25.senado.leg.br/',
    },
  ],
  enqueteSegundoTurno: {
    titulo: 'Simulado 2º Turno Governo do RN (Allyson 44 x Cadu de Lula 13)',
    status: 'ativa',
    totalVotos: 2000,
    opcoes: [
      {
        id: 'allyson-bezerra',
        nome: 'Allyson Bezerra',
        partido: 'UNIÃO · 44 (37% no 1º Turno)',
        votos: 1080,
        fotoOficial: '/candidates/allyson-bezerra.jpg',
        fotoFallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Allyson_Bezerra.jpg',
        fonteFotoOficial: 'TSE / Oficial',
        corBarra: '#0d6efd',
      },
      {
        id: 'cadu-xavier',
        nome: 'Carlos Eduardo Xavier (Cadu de Lula)',
        partido: 'PT · 13 (32% no 1º Turno)',
        votos: 920,
        fotoOficial: '/candidates/cadu-xavier.jpg',
        fotoFallbackUrl: '/candidates/presidente-lula.jpg',
        fonteFotoOficial: 'Oficial / Sefaz-TSE',
        corBarra: '#e11d48',
      },
    ],
  },
};

export const INITIAL_BOLETINS_IA: BoletimDiarioIA[] = [
  {
    id: 'boletim-rn-2026-segundo-turno',
    dataReferencia: 'Plantão 24h · Panorama Político RN 2026',
    titulo:
      '2º Turno no RN: Allyson Bezerra (UNIÃO 44 · 37%) e Carlos Eduardo Xavier / Cadu de Lula (PT 13 · 32%)',
    statusTransporte:
      'STTU Natal e Decreto Estadual nº 35.935/2026: Confirmadas todas as 62 linhas urbanas de Natal com catraca 100% liberada (1.836 viagens, sem cartão NuBus) e passe livre intermunicipal para o 2º turno.',
    resumoCandidatos:
      'Disputa pelo Governo do RN liderada por Allyson Bezerra (União 44 - 37%, foco na 3ª ponte sobre o Rio Potengi e hospitais regionais) e Carlos Eduardo Xavier / Cadu de Lula (PT 13 - 32%, foco em ensino integral, BR-304 e SUS com diagnósticos online alinhado a Mãe Luíza), seguidos por Álvaro Dias (PL 22 - 29%). Destaques absolutos: Carlos Eduardo Alves e Rogério Marinho (555) no Senado; Nina, Dr. Bernardo, Natália Bonavides e Benes Leocádio para Deputado Federal; Cinthia de Allyson, Neilton Diógenes, Ezequiel Ferreira e Daniel Valença para Deputado Estadual.',
    fontesVerificadas: 'DivulgaCandContas TSE, TRE-RN, Pesquisas Registradas e STTU Natal',
  },
];

export const INITIAL_AVALIACOES_CANDIDATOS: AvaliacaoCandidatoItem[] = [
  {
    id: 'av-allyson',
    candidatoId: 'allyson-bezerra',
    candidatoNome: 'Allyson Bezerra (União · 44)',
    aprovado: true,
    fezDeBom: 'Proposta da 3ª ponte sobre o Rio Potengi em Natal e requalificação dos hospitais regionais em Mossoró e no estado.',
    naoFez: 'Detalhar cronograma de execução das obras metropolitanas na Grande Natal.',
    autor: 'Marcos Silva · Zona Norte',
    horario: 'Hoje, 11h30',
  },
  {
    id: 'av-cadu',
    candidatoId: 'cadu-xavier',
    candidatoNome: 'Carlos Eduardo Xavier / Cadu de Lula (PT · 13)',
    aprovado: true,
    fezDeBom: 'Propostas de expansão da educação em tempo integral, obras na BR-304 e fortalecimento do SUS com diagnósticos online (alinhado com Mãe Luíza).',
    naoFez: 'Ampliar divulgação do cronograma de telessaúde nos bairros da capital.',
    autor: 'Fernanda Lima · Mãe Luíza',
    horario: 'Hoje, 12h40',
  },
];

export const ROTAS_PASSE_LIVRE: RotaPasseLivre[] = [
  {
    id: 'zona-norte',
    zona: 'Zona Norte',
    bairrosAtendidos: 'Igapó, Potengi, Pajuçara, Redinha, Lagoa Azul, Nossa Sra. da Apresentação',
    linhasPrincipais: 'N-08, N-15, N-25, N-35, N-43, N-60, N-73 (Via Ponte Newton Navarro e Igapó)',
    horarioOperacao: '06h00 às 20h00 (Dias de Votação)',
    statusCatraca: 'Catraca Liberada · 100% Gratuito',
    frotaOperante: '62 linhas urbanas STTU (1.836 viagens) sem necessidade de cartão NuBus',
  },
  {
    id: 'zona-sul',
    zona: 'Zona Sul',
    bairrosAtendidos: 'Ponta Negra, Capim Macio, Neópolis, Candelária, Lagoa Nova, Pitimbu',
    linhasPrincipais: 'S-50, L-54, O-33, N-73, Circular Campus UFRN / Via Costeira',
    horarioOperacao: '06h00 às 20h00 (Dias de Votação)',
    statusCatraca: 'Catraca Liberada · 100% Gratuito',
    frotaOperante: 'Operação integral com reforço nos corredores Av. Roberto Freire e Salgado Filho',
  },
  {
    id: 'zona-leste',
    zona: 'Zona Leste',
    bairrosAtendidos: 'Alecrim, Tirol, Petrópolis, Ribeira, Cidade Alta, Rocas, Mãe Luíza',
    linhasPrincipais: 'L-37, L-46, L-51, L-54, Corredores Hermes da Fonseca e Rio Branco',
    horarioOperacao: '06h00 às 20h00 (Dias de Votação)',
    statusCatraca: 'Catraca Liberada · 100% Gratuito',
    frotaOperante: 'Integração direta nos terminais urbanos sem cobrança tarifária',
  },
  {
    id: 'zona-oeste',
    zona: 'Zona Oeste',
    bairrosAtendidos: 'Felipe Camarão, Cidade da Esperança, Quintas, Dix-Sept Rosado, Guarapes, Planalto',
    linhasPrincipais: 'O-21, O-30, O-33, O-38, O-40, O-59, O-63',
    horarioOperacao: '06h00 às 20h00 (Dias de Votação)',
    statusCatraca: 'Catraca Liberada · 100% Gratuito',
    frotaOperante: 'Frota reforçada nos terminais de Cidade da Esperança, Planalto e Felipe Camarão',
  },
  {
    id: 'intermunicipal',
    zona: 'Intermunicipal (Grande Natal)',
    bairrosAtendidos: 'Parnamirim, Macaíba, São Gonçalo do Amarante, Extremoz, Ceará-Mirim e interior do RN',
    linhasPrincipais: 'Decreto Estadual nº 35.935/2026 · Guichês Transpasse, Atomp e permissionárias DER-RN',
    horarioOperacao: 'Sábado (04h30) até Segunda (16h00)',
    statusCatraca: 'Catraca Liberada · 100% Gratuito',
    frotaOperante: 'Apresentar e-Título/documento na ida e comprovante de votação no retorno',
  },
];

export const INITIAL_RELATOS_CIDADAOS: RelatoCidadao[] = [
  {
    id: 'rel-1',
    autor: 'Mariana Costa',
    bairro: 'Pajuçara · Zona Norte',
    horario: 'Há 14 min',
    mensagem: 'Linha N-35 passando no horário pela Av. Moema Tinôco com catraca 100% liberada para os eleitores.',
    statusModeracao: 'Aprovado pela Moderação LGPD',
  },
  {
    id: 'rel-2',
    autor: 'João Batista',
    bairro: 'Alecrim · Zona Leste',
    horario: 'Há 28 min',
    mensagem: 'Movimento tranquilo nas paradas da Av. Bernardo Vieira. Importante levar documento oficial com foto ou e-Título.',
    statusModeracao: 'Aprovado pela Moderação LGPD',
  },
  {
    id: 'rel-3',
    autor: 'Cláudia Dantas',
    bairro: 'Cidade da Esperança · Zona Oeste',
    horario: 'Há 42 min',
    mensagem: 'Terminal da Cidade da Esperança operando normalmente com passe livre garantido em todas as linhas.',
    statusModeracao: 'Aprovado pela Moderação LGPD',
  },
];

export const DEFAULT_WHATSAPP_SHARE_TEXT = `☀️ COLINHA POLÍTICA & PANORAMA RN 2026 🗳️

🏆 2º TURNO GOVERNO DO RN:
• Allyson Bezerra (UNIÃO · 44): 37% — 3ª Ponte sobre o Rio Potengi e Hospitais Regionais
• Carlos Eduardo Xavier / Cadu de Lula (PT · 13): 32% — Educação em Tempo Integral, BR-304 e SUS Online (Alinhado a Mãe Luíza)
• Álvaro Dias (PL · 22): 29% — Choque de Eficiência e Não Aumento de Impostos

⭐ DESTAQUES ABSOLUTOS POR CARGO:
• Senado: Carlos Eduardo Alves e Rogério Marinho (555)
• Deputado Federal: Nina, Dr. Bernardo, Natália Bonavides e Benes Leocádio
• Deputado Estadual: Cinthia de Allyson, Neilton Diógenes, Ezequiel Ferreira e Daniel Valença (Mãe Luíza)

🚌 Passe Livre confirmado nas 62 linhas de Natal (STTU) e transporte intermunicipal!`;
