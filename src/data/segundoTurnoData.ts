export type EixoPlanoGoverno = 'Saúde/SUS' | 'Educação' | 'Segurança' | 'Economia';

export type StatusViabilidadeOrcamentaria =
  | 'Previsão Orçamentária (LOA/PPA)'
  | 'Exige Reformas / Convênio Federal';

export interface PropostaTSEItem {
  id: string;
  candidatoId: 'allyson-bezerra' | 'cadu-xavier';
  candidatoNome: string;
  partido: string;
  coligacao: string;
  fotoOficial: string;
  eixo: EixoPlanoGoverno;
  titulo: string;
  descricao: string;
  viabilidadeOrcamentaria: StatusViabilidadeOrcamentaria;
  execucaoTransicao: string;
  likes: number;
  urlDivulgaCand: string;
}

export interface AtoTransicaoItem {
  id: string;
  codigoAto: string;
  titulo: string;
  eixo: 'Saúde (SUS)' | 'Educação' | 'Infraestrutura' | 'Nomeações Iniciais';
  statusConformidade: 'Em conformidade' | 'Em análise técnica';
  propostaRelacionada: string;
  coerenciaPopularPct: number;
  dataPublicacao: string;
  linkOficial: string;
}

export interface AlertaDesinformacaoItem {
  id: string;
  categoria: 'Análise de Áudio & Propostas' | 'Checagem TSE / TRE-RN' | 'Fato ou Boato TSE · Tempo Real';
  candidatoCitado?: string;
  falaAnalisada?: string;
  titulo: string;
  seloVerificacao: 'Sem Confirmação Oficial no Plano Formal' | 'Fato Esclarecido · TSE' | 'Confirmado Oficialmente';
  topicosAnalisados: string[];
  conclusaoAnalise: string;
  fonteVerificacao: string;
  urlFonteOficial?: string;
  horario: string;
}

export interface PropostaPresidenciaAnaliseItem {
  id: string;
  candidato: string;
  partidoNumero: string;
  fotoUrl: string;
  corTema: string;
  eixo: 'Infraestrutura & PAC' | 'Saúde & Educação' | 'Economia, Previdência & Estatais';
  propostaTitulo: string;
  resumoProposta: string;
  analiseTecnica: string;
  impactoNoRN: string;
  statusPlanoTSE: 'Registrado Oficialmente (TSE / PPA)' | 'Debate Público / Sem Formalização no TSE' | 'Em Execução Federal / Novo PAC';
}

export interface PerguntaQuizAfinidade {
  id: string;
  eixo: EixoPlanoGoverno;
  temaCurto: string;
  pergunta: string;
  opcoes: {
    id: string;
    texto: string;
    candidatoId: 'allyson-bezerra' | 'cadu-xavier';
    resumoPlanoTSE: string;
  }[];
}

export interface FeedbackComunidadeItem {
  id: string;
  autor: string;
  bairro: string;
  eixo: 'Saúde (SUS)' | 'Educação' | 'Infraestrutura' | 'Segurança' | 'Mobilidade';
  necessidade: string;
  apoios: number;
  horario: string;
  status: string;
}

export const FICHAS_CANDIDATOS_2_TURNO = [
  {
    id: 'allyson-bezerra' as const,
    nome: 'Allyson Bezerra (Allyson)',
    numero: '44',
    partido: 'União Brasil (37% Votos Válidos)',
    coligacao: 'Coligação União pelo Rio Grande do Norte (União Brasil, PP, PSD e aliados)',
    fotoOficial: '/candidates/allyson-bezerra.jpg',
    cor: '#0d6efd',
    urlTSE: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'cadu-xavier' as const,
    nome: 'Carlos Eduardo Xavier (Cadu de Lula)',
    numero: '13',
    partido: 'PT (32% Votos Válidos)',
    coligacao: 'Coligação Rio Grande do Norte da Esperança (Federação PT/PCdoB/PV, MDB, PSB · Apoio Presidente Lula)',
    fotoOficial: '/candidates/cadu-xavier.jpg',
    cor: '#e11d48',
    urlTSE: 'https://divulgacandcontas.tse.jus.br/',
  },
];

export const INITIAL_PROPOSTAS_TSE: PropostaTSEItem[] = [
  {
    id: 'prop-sus-allyson',
    candidatoId: 'allyson-bezerra',
    candidatoNome: 'Allyson Bezerra',
    partido: 'União · 44',
    coligacao: 'Coligação União pelo RN (37% dos votos válidos)',
    fotoOficial: '/candidates/allyson-bezerra.jpg',
    eixo: 'Saúde/SUS',
    titulo: 'Requalificação de Hospitais Regionais em Mossoró e no Interior do RN',
    descricao:
      'Modernização e ampliação de leitos de UTI e cirurgias eletivas nos hospitais regionais de Mossoró, Grande Natal, Seridó e Alto Oeste.',
    viabilidadeOrcamentaria: 'Previsão Orçamentária (LOA/PPA)',
    execucaoTransicao: 'Acompanhado nos Primeiros Decretos da Comissão de Transição em Saúde (SUS).',
    likes: 1120,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'prop-sus-cadu',
    candidatoId: 'cadu-xavier',
    candidatoNome: 'Cadu de Lula (Carlos Eduardo Xavier)',
    partido: 'PT · 13',
    coligacao: 'Federação Brasil da Esperança · Apoio Presidente Lula (32% dos votos válidos)',
    fotoOficial: '/candidates/cadu-xavier.jpg',
    eixo: 'Saúde/SUS',
    titulo: 'Fortalecimento e Regionalização do SUS com Diagnósticos Médicos Online',
    descricao:
      'Implantação de centrais de telessaúde e diagnósticos online integrados ao SUS Digital, reduzindo filas de especialistas em bairros como Mãe Luíza e no interior.',
    viabilidadeOrcamentaria: 'Previsão Orçamentária (LOA/PPA)',
    execucaoTransicao: 'Alinhado às prioridades da comunidade de Mãe Luíza e parceria com o Ministério da Saúde.',
    likes: 1085,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'prop-edu-allyson',
    candidatoId: 'allyson-bezerra',
    candidatoNome: 'Allyson Bezerra',
    partido: 'União · 44',
    coligacao: 'Coligação União pelo RN (37% dos votos válidos)',
    fotoOficial: '/candidates/allyson-bezerra.jpg',
    eixo: 'Educação',
    titulo: 'Modernização Tecnológica das Escolas Estaduais & Ensino Profissionalizante',
    descricao:
      'Climatização e reforma estrutural da rede estadual de ensino, conectividade de alta velocidade e cursos técnicos voltados ao mercado regional.',
    viabilidadeOrcamentaria: 'Previsão Orçamentária (LOA/PPA)',
    execucaoTransicao: 'Integrado ao plano de transição da Educação Estadual (FUNDEB).',
    likes: 940,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'prop-edu-cadu',
    candidatoId: 'cadu-xavier',
    candidatoNome: 'Cadu de Lula (Carlos Eduardo Xavier)',
    partido: 'PT · 13',
    coligacao: 'Federação Brasil da Esperança · Apoio Presidente Lula (32% dos votos válidos)',
    fotoOficial: '/candidates/cadu-xavier.jpg',
    eixo: 'Educação',
    titulo: 'Expansão da Educação em Tempo Integral nas Escolas do RN',
    descricao:
      'Ampliação das escolas estaduais em tempo integral com alimentação completa, esporte, cultura e bolsas de permanência estudantil (prioridade para comunidades como Mãe Luíza).',
    viabilidadeOrcamentaria: 'Previsão Orçamentária (LOA/PPA)',
    execucaoTransicao: 'Monitorado no eixo Educação (FUNDEB + FNDE Governo Federal).',
    likes: 1030,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'prop-seg-allyson',
    candidatoId: 'allyson-bezerra',
    candidatoNome: 'Allyson Bezerra',
    partido: 'União · 44',
    coligacao: 'Coligação União pelo RN (37% dos votos válidos)',
    fotoOficial: '/candidates/allyson-bezerra.jpg',
    eixo: 'Segurança',
    titulo: 'Centro Integrado de Videomonitoramento Estadual & Valorização das Forças Policiais',
    descricao:
      'Integração tecnológica entre PM, Polícia Civil e guardas municipais com cercamento eletrônico nas divisas e corredores metropolitanos.',
    viabilidadeOrcamentaria: 'Previsão Orçamentária (LOA/PPA)',
    execucaoTransicao: 'Vinculado ao Fundo Estadual de Segurança Pública.',
    likes: 890,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'prop-seg-cadu',
    candidatoId: 'cadu-xavier',
    candidatoNome: 'Cadu de Lula (Carlos Eduardo Xavier)',
    partido: 'PT · 13',
    coligacao: 'Federação Brasil da Esperança · Apoio Presidente Lula (32% dos votos válidos)',
    fotoOficial: '/candidates/cadu-xavier.jpg',
    eixo: 'Segurança',
    titulo: 'Policiamento Comunitário, Inteligência Policial & Prevenção Social da Violência',
    descricao:
      'Recomposição de efetivos por concurso público, delegacias especializadas de proteção à mulher e iluminação segura em áreas vulneráveis.',
    viabilidadeOrcamentaria: 'Previsão Orçamentária (LOA/PPA)',
    execucaoTransicao: 'Alinhado ao PRONASCI / Ministério da Justiça e Segurança Pública.',
    likes: 860,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'prop-eco-allyson',
    candidatoId: 'allyson-bezerra',
    candidatoNome: 'Allyson Bezerra',
    partido: 'União · 44',
    coligacao: 'Coligação União pelo RN (37% dos votos válidos)',
    fotoOficial: '/candidates/allyson-bezerra.jpg',
    eixo: 'Economia',
    titulo: 'Construção da 3ª Ponte sobre o Rio Potengi & Obras de Infraestrutura Viária',
    descricao:
      'Investimento estruturante na construção da terceira ponte sobre o Rio Potengi em Natal para destravar a mobilidade urbana, turismo e logística do estado.',
    viabilidadeOrcamentaria: 'Exige Reformas / Convênio Federal',
    execucaoTransicao: 'Prioridade máxima no eixo de Infraestrutura e Mobilidade Urbana.',
    likes: 1250,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
  {
    id: 'prop-eco-cadu',
    candidatoId: 'cadu-xavier',
    candidatoNome: 'Cadu de Lula (Carlos Eduardo Xavier)',
    partido: 'PT · 13',
    coligacao: 'Federação Brasil da Esperança · Apoio Presidente Lula (32% dos votos válidos)',
    fotoOficial: '/candidates/cadu-xavier.jpg',
    eixo: 'Economia',
    titulo: 'Duplicação e Obras em Rodovias Federais (BR-304) & Desenvolvimento Regional',
    descricao:
      'Articulação direta com o Governo Federal (Novo PAC) para duplicação da BR-304, fortalecimento da transição energética e geração de emprego e renda.',
    viabilidadeOrcamentaria: 'Exige Reformas / Convênio Federal',
    execucaoTransicao: 'Convênio Federal DNIT / Ministério dos Transportes em execução.',
    likes: 1140,
    urlDivulgaCand: 'https://divulgacandcontas.tse.jus.br/',
  },
];

export const ATOS_TRANSICAO_GOVERNO: AtoTransicaoItem[] = [
  {
    id: 'ato-1',
    codigoAto: 'DECRETO DE TRANSIÇÃO Nº 001/2026',
    titulo: 'Nomeações Iniciais da Equipe Mista de Transição Governamental e Auditoria Fiscal',
    eixo: 'Nomeações Iniciais',
    statusConformidade: 'Em conformidade',
    propostaRelacionada: 'Transparência Ativa e Responsabilidade Fiscal (LC nº 101/2000)',
    coerenciaPopularPct: 98,
    dataPublicacao: 'Outubro/2026 · Em Tempo Real',
    linkOficial: 'https://www.rn.gov.br/',
  },
  {
    id: 'ato-2',
    codigoAto: 'PORTARIA CONJUNTA SESAP/SUS Nº 014/2026',
    titulo: 'Regionalização do SUS, Diagnósticos Online e Requalificação de Hospitais Regionais',
    eixo: 'Saúde (SUS)',
    statusConformidade: 'Em conformidade',
    propostaRelacionada: 'Hospitais Regionais (Allyson 44) & SUS com Diagnósticos Online (Cadu de Lula 13)',
    coerenciaPopularPct: 96,
    dataPublicacao: 'Outubro/2026 · Em Tempo Real',
    linkOficial: 'https://www.rn.gov.br/',
  },
  {
    id: 'ato-3',
    codigoAto: 'ATO TÉCNICO SEEC/FUNDEB Nº 008/2026',
    titulo: 'Plano de Expansão do Ensino em Tempo Integral e Modernização da Rede Estadual',
    eixo: 'Educação',
    statusConformidade: 'Em conformidade',
    propostaRelacionada: 'Expansão da Educação em Tempo Integral (Alinhado a Mãe Luíza)',
    coerenciaPopularPct: 94,
    dataPublicacao: 'Outubro/2026 · Em Tempo Real',
    linkOficial: 'https://www.rn.gov.br/',
  },
  {
    id: 'ato-4',
    codigoAto: 'ORDEM DE SERVIÇO INFRA/DER Nº 022/2026',
    titulo: 'Estudos da 3ª Ponte sobre o Rio Potengi, Obras na BR-304 e Passe Livre Eleitoral',
    eixo: 'Infraestrutura',
    statusConformidade: 'Em conformidade',
    propostaRelacionada: '3ª Ponte Rio Potengi (Allyson 44) & Duplicação BR-304 (Cadu de Lula 13)',
    coerenciaPopularPct: 97,
    dataPublicacao: 'Outubro/2026 · Em Tempo Real',
    linkOficial: 'https://www.rn.gov.br/',
  },
];

export const PROPOSTAS_PRESIDENCIA_ANALISE: PropostaPresidenciaAnaliseItem[] = [
  {
    id: 'pres-lula-infra-rn',
    candidato: 'Luiz Inácio Lula da Silva (Presidente Lula)',
    partidoNumero: 'PT · 13',
    fotoUrl: '/candidates/presidente-lula.jpg',
    corTema: '#e11d48',
    eixo: 'Infraestrutura & PAC',
    propostaTitulo: 'Novo PAC no RN: Duplicação da BR-304, Transição Energética e Obras Hídricas',
    resumoProposta:
      'Execução federal direta de obras rodoviárias estruturantes (duplicação da BR-304 ligando Natal a Mossoró e divisa com o Ceará), conclusão do Ramal do Apodi e investimentos em energia limpa.',
    analiseTecnica:
      'Possui dotação no Plano Plurianual (PPA) e no orçamento do Novo PAC via DNIT e Ministério dos Transportes. Exige articulação contínua com o Governo do Estado para licenciamento e contrapartidas logísticas.',
    impactoNoRN:
      'Reduz o custo de frete e acidentes no principal corredor econômico potiguar (BR-304) e fortalece a parceria administrativa com a candidatura de Cadu de Lula (PT 13).',
    statusPlanoTSE: 'Em Execução Federal / Novo PAC',
  },
  {
    id: 'pres-lula-saude-edu',
    candidato: 'Luiz Inácio Lula da Silva (Presidente Lula)',
    partidoNumero: 'PT · 13',
    fotoUrl: '/candidates/presidente-lula.jpg',
    corTema: '#e11d48',
    eixo: 'Saúde & Educação',
    propostaTitulo: 'SUS Digital (Telessaúde), Mais Médicos e Escolas em Tempo Integral (Pé-de-Meia)',
    resumoProposta:
      'Expansão nacional de centrais de diagnósticos médicos online pelo SUS Digital, ampliação de matrículas em tempo integral com repasse do FNDE e incentivo financeiro-educacional Pé-de-Meia.',
    analiseTecnica:
      'Alta viabilidade orçamentária por utilizar fundos constitucionais (FUNDEB/FNDE e Piso da Atenção Especializada do SUS). Conecta-se diretamente às metas estaduais de regionalização hospitalar.',
    impactoNoRN:
      'Beneficia diretamente bairros populares de Natal (como Mãe Luíza) e municípios do interior do RN com redução de filas de exames e permanência escolar.',
    statusPlanoTSE: 'Registrado Oficialmente (TSE / PPA)',
  },
  {
    id: 'pres-flavio-economia-reformas',
    candidato: 'Flávio Bolsonaro (Debate Presidencial / Oposição)',
    partidoNumero: 'PL · 22',
    fotoUrl: '/candidates/rogerio-marinho.jpg',
    corTema: '#1e293b',
    eixo: 'Economia, Previdência & Estatais',
    propostaTitulo: 'Desestatização, Desburocratização Econômica e Debate sobre Reforma Previdenciária/Trabalhista',
    resumoProposta:
      'Pauta econômica liberal voltada à redução do Estado, atração de capital privado, revisão de estatais (como debate sobre a Petrobras) e flexibilização regulatória.',
    analiseTecnica:
      'Análise Documental TSE: Afirmações virais em áudios sobre aumento da idade mínima de aposentadoria para 70 anos (homens) / 65 anos (mulheres), desvinculação do salário mínimo e jornada de 12 horas diárias NÃO constam em plano de governo formalizado no TSE, circulando como projeções de debate político.',
    impactoNoRN:
      'Eventuais mudanças na Petrobras ou regras previdenciárias têm forte repercussão na Bacia Potiguar (Mossoró/Alto do Rodrigues) e nos municípios dependentes do FPM e transferências previdenciárias.',
    statusPlanoTSE: 'Debate Público / Sem Formalização no TSE',
  },
];

export const ALERTAS_ANTI_DESINFORMACAO: AlertaDesinformacaoItem[] = [
  {
    id: 'checagem-flavio-bolsonaro-audio',
    categoria: 'Análise de Áudio & Propostas',
    candidatoCitado: 'Flávio Bolsonaro (PL)',
    falaAnalisada:
      '"Áudio viral atribui propostas de aposentadoria aos 70 anos, desvinculação do salário mínimo, jornada de 12h e privatização da Petrobras."',
    titulo: 'Análise de Propostas Políticas: Áudio sobre Aposentadoria, Jornada de 12h e Petrobras (Flávio Bolsonaro)',
    seloVerificacao: 'Sem Confirmação Oficial no Plano Formal',
    topicosAnalisados: [
      'Aumento da idade mínima de aposentadoria para 70 anos (homens) e 65 anos (mulheres).',
      'Desvinculação do reajuste da aposentadoria e pensões do salário mínimo.',
      'Instituição de uma jornada de trabalho de 12 horas diárias.',
      'Privatização da Petrobras.',
    ],
    conclusaoAnalise:
      'Muitas dessas afirmações, especialmente a idade mínima de 70 anos e a escala de 12 horas, não constam em planos de governo formalizados pelo candidato no TSE. Elas circulam frequentemente no debate político como riscos potenciais associados a reformas, mas não há confirmação oficial ou oficialização dessas medidas no programa formal.',
    fonteVerificacao: 'Agente de Monitoramento 24h · Consulta DivulgaCandContas TSE',
    urlFonteOficial: 'https://divulgacandcontas.tse.jus.br/',
    horario: 'Atualizado em Tempo Real · Verificação Documental TSE',
  },
  {
    id: 'checagem-allyson-ponte-hospitais',
    categoria: 'Fato ou Boato TSE · Tempo Real',
    candidatoCitado: 'Allyson Bezerra (União · 44)',
    falaAnalisada:
      '"Vamos construir a 3ª ponte sobre o Rio Potengi e requalificar os hospitais regionais de Mossoró e do interior do RN."',
    titulo: 'Checagem de Fala de Campanha: 3ª Ponte sobre o Rio Potengi e Hospitais Regionais (Allyson 44)',
    seloVerificacao: 'Confirmado Oficialmente',
    topicosAnalisados: [
      'Proposta consta registrada nas diretrizes de campanha de Allyson Bezerra (União Brasil · 44).',
      'Requalificação dos hospitais regionais possui previsão em rubrica de Saúde/SUS (LOA/PPA).',
      'A obra da 3ª Ponte sobre o Rio Potengi exige convênio federal / operação de crédito estruturada.',
    ],
    conclusaoAnalise:
      'A fala corresponde integralmente às propostas oficiais apresentadas pelo candidato no 2º turno do RN. Do ponto de vista orçamentário, os hospitais regionais têm fonte ordinária no orçamento estadual, enquanto a 3ª ponte depende de engenharia financeira plurianual e parceria federal.',
    fonteVerificacao: 'DivulgaCandContas TSE & Painel Orçamentário RN',
    urlFonteOficial: 'https://divulgacandcontas.tse.jus.br/',
    horario: 'Atualizado em Tempo Real · Checagem de Proposta 2º Turno',
  },
  {
    id: 'checagem-cadu-sus-online-br304',
    categoria: 'Fato ou Boato TSE · Tempo Real',
    candidatoCitado: 'Cadu de Lula / Carlos Eduardo Xavier (PT · 13)',
    falaAnalisada:
      '"Vamos expandir a educação em tempo integral, duplicar a BR-304 com o Governo Federal e implantar diagnósticos médicos online no SUS."',
    titulo: 'Checagem de Fala de Campanha: SUS com Diagnósticos Online, Ensino Integral e BR-304 (Cadu 13)',
    seloVerificacao: 'Confirmado Oficialmente',
    topicosAnalisados: [
      'Fortalecimento do SUS via telessaúde e diagnósticos online consta no eixo Saúde/SUS do candidato.',
      'Expansão da educação em tempo integral está vinculada ao FUNDEB e programas do MEC/FNDE.',
      'Duplicação da BR-304 conta com previsão no Novo PAC Federal em parceria com o DNIT.',
    ],
    conclusaoAnalise:
      'As três propostas citadas na fala estão registradas no programa de governo de Carlos Eduardo Xavier (Cadu de Lula · PT 13) e apresentam alinhamento direto com demandas comunitárias de bairros como Mãe Luíza e corredores rodoviários do estado.',
    fonteVerificacao: 'DivulgaCandContas TSE & Novo PAC / Ministério da Saúde',
    urlFonteOficial: 'https://divulgacandcontas.tse.jus.br/',
    horario: 'Atualizado em Tempo Real · Checagem de Proposta 2º Turno',
  },
  {
    id: 'checagem-passe-livre-2-turno',
    categoria: 'Checagem TSE / TRE-RN',
    candidatoCitado: 'Justiça Eleitoral (TSE / TRE-RN)',
    falaAnalisada:
      '"Boatos em redes sociais alegavam cobrança de passagem ou exigência obrigatória de cartão nos ônibus urbanos de Natal no 2º turno."',
    titulo: 'Esclarecimento Oficial TSE/TRE-RN: Passe Livre Garantido nos Ônibus no 2º Turno (STTU & Decreto nº 35.935/2026)',
    seloVerificacao: 'Fato Esclarecido · TSE',
    topicosAnalisados: [
      'A STTU Natal e a Resolução-TSE nº 23.751/2026 garantem 62 linhas urbanas 100% gratuitas sem cartão NuBus.',
      'O Decreto Estadual nº 35.935/2026 mantém gratuidade intermunicipal mediante título/e-Título e comprovante.',
      'Frota opera com 1.836 viagens programadas das 06h00 às 20h00.',
    ],
    conclusaoAnalise:
      'É FALSO que o transporte gratuito tenha sido suspenso. O transporte coletivo urbano e intermunicipal está oficialmente garantido com catraca livre para todos os eleitores potiguares no segundo turno.',
    fonteVerificacao: 'Fato ou Boato TSE · TRE-RN & STTU Natal',
    urlFonteOficial: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
    horario: 'Monitoramento Oficial 24h · Fato ou Boato TSE',
  },
];

export const QUIZ_AFINIDADE_TSE: PerguntaQuizAfinidade[] = [
  {
    id: 'q-saude',
    eixo: 'Saúde/SUS',
    temaCurto: 'Saúde Pública (SUS)',
    pergunta: '1. Em Saúde Pública (SUS no RN), qual proposta você considera mais prioritária?',
    opcoes: [
      {
        id: 'q1-a',
        texto: 'Requalificação e ampliação de leitos nos hospitais regionais em Mossoró e no interior do estado.',
        candidatoId: 'allyson-bezerra',
        resumoPlanoTSE: 'Allyson Bezerra (União · 44): Requalificação de hospitais regionais e mutirões cirúrgicos.',
      },
      {
        id: 'q1-b',
        texto: 'Regionalização do SUS e fortalecimento do atendimento com diagnósticos médicos online (telessaúde).',
        candidatoId: 'cadu-xavier',
        resumoPlanoTSE: 'Cadu de Lula (PT · 13): SUS Digital com diagnósticos online e atendimento comunitário.',
      },
    ],
  },
  {
    id: 'q-educacao',
    eixo: 'Educação',
    temaCurto: 'Educação Estadual',
    pergunta: '2. Na Educação Estadual, qual diretriz deve liderar os investimentos no RN?',
    opcoes: [
      {
        id: 'q2-a',
        texto: 'Climatização, reforma estrutural das escolas e ensino técnico voltado ao mercado regional.',
        candidatoId: 'allyson-bezerra',
        resumoPlanoTSE: 'Allyson Bezerra (União · 44): Modernização tecnológica das escolas e cursos profissionalizantes.',
      },
      {
        id: 'q2-b',
        texto: 'Expansão acelerada das escolas em tempo integral com esporte, cultura e apoio federal.',
        candidatoId: 'cadu-xavier',
        resumoPlanoTSE: 'Cadu de Lula (PT · 13): Expansão da educação em tempo integral na rede estadual.',
      },
    ],
  },
  {
    id: 'q-infraestrutura',
    eixo: 'Economia',
    temaCurto: 'Obras & Mobilidade',
    pergunta: '3. Para Infraestrutura e Mobilidade no RN, qual grande obra deve ser a prioridade número 1?',
    opcoes: [
      {
        id: 'q3-a',
        texto: 'Construção da terceira ponte sobre o Rio Potengi em Natal e novos corredores viários urbanos.',
        candidatoId: 'allyson-bezerra',
        resumoPlanoTSE: 'Allyson Bezerra (União · 44): Construção da 3ª ponte sobre o Rio Potengi em Natal.',
      },
      {
        id: 'q3-b',
        texto: 'Duplicação e modernização de rodovias federais estratégicas como a BR-304 via Novo PAC.',
        candidatoId: 'cadu-xavier',
        resumoPlanoTSE: 'Cadu de Lula (PT · 13): Obras de duplicação na BR-304 em parceria com o Governo Federal.',
      },
    ],
  },
  {
    id: 'q-seguranca',
    eixo: 'Segurança',
    temaCurto: 'Segurança Pública',
    pergunta: '4. Na Segurança Pública do RN, qual estratégia você considera mais eficaz?',
    opcoes: [
      {
        id: 'q4-a',
        texto: 'Centro integrado de videomonitoramento eletrônico nas divisas e integração tecnológica das forças.',
        candidatoId: 'allyson-bezerra',
        resumoPlanoTSE: 'Allyson Bezerra (União · 44): Cercamento eletrônico estadual e valorização policial.',
      },
      {
        id: 'q4-b',
        texto: 'Policiamento comunitário nos bairros, recomposição de efetivos por concurso e prevenção social.',
        candidatoId: 'cadu-xavier',
        resumoPlanoTSE: 'Cadu de Lula (PT · 13): Policiamento de proximidade, inteligência e proteção social.',
      },
    ],
  },
  {
    id: 'q-gestao',
    eixo: 'Economia',
    temaCurto: 'Economia & Gestão',
    pergunta: '5. No Desenvolvimento Econômico e Gestão Estadual, qual caminho você prefere para o RN?',
    opcoes: [
      {
        id: 'q5-a',
        texto: 'Gestão focada em investimentos de infraestrutura logística e atração de indústrias para o estado.',
        candidatoId: 'allyson-bezerra',
        resumoPlanoTSE: 'Allyson Bezerra (União · 44): Investimentos estruturantes para destravar o turismo e a indústria.',
      },
      {
        id: 'q5-b',
        texto: 'Alinhamento com investimentos federais, transição energética e fortalecimento dos serviços públicos.',
        candidatoId: 'cadu-xavier',
        resumoPlanoTSE: 'Cadu de Lula (PT · 13): Articulação federal, geração de renda e inclusão social.',
      },
    ],
  },
];

export const INITIAL_FEEDBACKS_COMUNIDADE: FeedbackComunidadeItem[] = [
  {
    id: 'fb-mae-luiza',
    autor: 'Moradores de Mãe Luíza',
    bairro: 'Mãe Luíza · Zona Leste',
    eixo: 'Saúde (SUS)',
    necessidade: 'Prioridade para diagnósticos médicos online no SUS e expansão do ensino em tempo integral para a juventude de Mãe Luíza.',
    apoios: 84,
    horario: 'Plantão 24h · 2º Turno RN',
    status: 'Alinhado com Cadu de Lula (PT 13) e Daniel Valença (PT)',
  },
  {
    id: 'fb-ponte-potengi',
    autor: 'Associação de Moradores da Zona Norte',
    bairro: 'Igapó / Pajuçara · Zona Norte',
    eixo: 'Infraestrutura',
    necessidade: 'Construção da terceira ponte sobre o Rio Potengi e melhoria do fluxo nas avenidas de acesso.',
    apoios: 92,
    horario: 'Plantão 24h · 2º Turno RN',
    status: 'Alinhado com proposta de Allyson Bezerra (União 44)',
  },
  {
    id: 'fb-br304',
    autor: 'Comunidade e Trabalhadores do RN',
    bairro: 'Região Metropolitana e Mossoró',
    eixo: 'Infraestrutura',
    necessidade: 'Obras de duplicação na BR-304 e requalificação dos hospitais regionais de Mossoró e Grande Natal.',
    apoios: 76,
    horario: 'Plantão 24h · 2º Turno RN',
    status: 'Vinculado ao Eixo Prioritário: Infraestrutura & Saúde (SUS)',
  },
];
