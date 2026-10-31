export type FactStatus = 'fato' | 'fake' | 'distorcido' | 'golpe';

export interface FactCheckItem {
  id: string;
  title: string;
  claim: string;
  status: FactStatus;
  statusLabel: string;
  summary: string;
  evidence: string[];
  originalDate: string;
  verifiedBy: string;
  sourceUrlName: string;
  category: 'politica_eua' | 'economia' | 'golpes_compras' | 'tecnologia_ia' | 'brasil_mundo';
  viralReach: string;
  communityVotes: {
    believedFake: number;
    believedFato: number;
  };
  monetizationTip?: {
    headline: string;
    description: string;
    ctaText: string;
    affiliateUrl: string;
  };
}

export const INITIAL_FACT_CHECKS: FactCheckItem[] = [
  {
    id: 'fc-1',
    title: 'É FAKE que governo dos EUA cancelou todos os vistos para brasileiros após eleição',
    claim: 'Vídeo viral no TikTok e WhatsApp afirma que nova ordem executiva revogou vistos de turismo e trabalho para cidadãos brasileiros.',
    status: 'fake',
    statusLabel: 'FAKE / FALSO',
    summary:
      'Não existe qualquer alteração nas regras gerais de concessão ou renovação de vistos B1/B2 para cidadãos do Brasil. O Departamento de Estado dos EUA e as embaixadas mantêm os agendamentos normais.',
    evidence: [
      'Comunicado oficial do Consulado-Geral dos EUA no Brasil desmente expressamente o vídeo viral.',
      'O processo de triagem consular segue a Lei de Imigração e Nacionalidade (INA) e não sofreu revogação unilateral.',
      'O vídeo utilizou trechos cortados fora de contexto de uma audiência do Congresso sobre fronteiras terrestres.',
    ],
    originalDate: 'Hoje, há 1 hora',
    verifiedBy: 'Agência Lupa / PolitiFact Brasil',
    sourceUrlName: 'U.S. Department of State & Embaixada EUA',
    category: 'politica_eua',
    viralReach: '+180 mil compartilhamentos',
    communityVotes: {
      believedFake: 1420,
      believedFato: 210,
    },
    monetizationTip: {
      headline: '🛡️ Atenção a sites fraudulentos de visto e passagens',
      description: 'Nunca pague taxas de agendamento em sites paralelos. Para compras de viagens e tecnologia, utilize lojas parceiras homologadas.',
      ctaText: 'Ver Loja Verificada Fábio Kauã',
      affiliateUrl: 'https://collshp.com/fabiokaua692287?view=storefront',
    },
  },
  {
    id: 'fc-2',
    title: 'É FATO que os 7 estados-pêndulo (swing states) concentram mais de 90% dos gastos de campanha nos EUA',
    claim: 'Postagem em redes sociais diz que candidatos presidenciais americanos gastam quase todo o orçamento em apenas sete estados.',
    status: 'fato',
    statusLabel: 'FATO / VERDADEIRO',
    summary:
      'Devido ao sistema de Colégio Eleitoral "Winner-Take-All" (o vencedor leva todos os delegados do estado), a disputa real se concentra em PA, GA, NC, MI, WI, AZ e NV.',
    evidence: [
      'Dados da FEC (Federal Election Commission) e do instituto AdImpact confirmam que mais de US$ 1 bilhão foi focado nesses 7 estados.',
      'Estados com forte tradição democrata (Califórnia, Nova York) ou republicana (Texas, Flórida) receberam menos de 5% de anúncios televisivos.',
    ],
    originalDate: 'Hoje, há 3 horas',
    verifiedBy: 'Reuters Fact Check & AP News',
    sourceUrlName: 'Federal Election Commission (FEC.gov)',
    category: 'politica_eua',
    viralReach: '+95 mil leituras',
    communityVotes: {
      believedFake: 180,
      believedFato: 1650,
    },
  },
  {
    id: 'fc-3',
    title: 'ALERTA DE GOLPE: Anúncios falsos usando IA de Trump e celebridades prometendo celular por R$ 99',
    claim: 'Página clonada com deepfake de áudio e imagem diz que fabricantes estão liquidando smartphones por valor simbólico devido a taxas americanas.',
    status: 'golpe',
    statusLabel: 'GOLPE VIRTUAL / FRAUDE',
    summary:
      'Trata-se de um golpe com tecnologia de voz clonada por IA. A vítima é direcionada a um site falso que coleta dados pessoais e cobra taxa via Pix que nunca entrega produto algum.',
    evidence: [
      'Análise espectral de áudio comprovou que a voz foi sintetizada artificialmente via ElevenLabs.',
      'A URL do site não pertence a nenhuma loja oficial de varejo registrada no Brasil ou nos EUA.',
      'O domínio foi registrado há menos de 48 horas em servidor anônimo.',
    ],
    originalDate: 'Hoje, há 4 horas',
    verifiedBy: 'Radar Transparência & Cert.br',
    sourceUrlName: 'Análise Forense Digital & Reclame Aqui',
    category: 'golpes_compras',
    viralReach: '+320 mil denúncias',
    communityVotes: {
      believedFake: 2840,
      believedFato: 95,
    },
    monetizationTip: {
      headline: '🛍️ Compre Apenas em Vitrines Seguras e Certificadas',
      description: 'Evite cair em golpes com sites clones. Acesse a vitrine oficial de Fábio Kauã no CollabShop com produtos originais e segurança garantida.',
      ctaText: 'Acessar Loja Segura Fábio Kauã',
      affiliateUrl: 'https://collshp.com/fabiokaua692287?view=storefront',
    },
  },
  {
    id: 'fc-4',
    title: 'É DISTORCIDO que tarifa de 20% proposta nos EUA vai paralisar imediatamente a exportação brasileira',
    claim: 'Mensagem de áudio no WhatsApp afirma que empresas brasileiras não poderão mais vender café, carne e soja para o mercado norte-americano.',
    status: 'distorcido',
    statusLabel: 'FORA DE CONTEXTO',
    summary:
      'Embora haja discussões sobre tarifas universais entre 10% e 20%, o Brasil possui superávit comercial estratégico e itens como petróleo cru e minérios dependem de acordos bilaterais prévios e aprovação do Congresso.',
    evidence: [
      'Especialistas em comércio exterior do Ipea e CNI explicam que commodities essenciais contam com cláusulas de isenção ou substituição.',
      'Qualquer tarifa adicional exige processo de regulamentação na OMC e no Departamento de Comércio dos EUA.',
      'A mensagem omitiu o fato de que o Brasil é fornecedor-chave de produtos complementares para a cadeia de suprimentos dos EUA.',
    ],
    originalDate: 'Ontem',
    verifiedBy: 'G1 Fato ou Fake & EBC',
    sourceUrlName: 'Ministério do Desenvolvimento, Indústria e Comércio (MDIC)',
    category: 'economia',
    viralReach: '+140 mil compartilhamentos',
    communityVotes: {
      believedFake: 980,
      believedFato: 420,
    },
  },
  {
    id: 'fc-5',
    title: 'É FAKE que Inteligência Artificial substituiu juízes na contagem de votos das eleições americanas',
    claim: 'Postagem com print adulterado diz que o software do Colégio Eleitoral foi automatizado por uma IA autônoma sem supervisão humana.',
    status: 'fake',
    statusLabel: 'FAKE / FALSO',
    summary:
      'A contagem nos EUA é descentralizada e auditada por mesários bipartidários (republicanos e democratas) e autoridades eleitorais estaduais (Secretários de Estado).',
    evidence: [
      'A Agência de Cibersegurança e Segurança de Infraestrutura dos EUA (CISA) reiterou que os sistemas de tabulação não usam IA para certificar votos.',
      'Todos os estados chave mantêm cédulas de papel auditáveis para recontagem manual obrigatória em caso de margem estreita.',
    ],
    originalDate: 'Ontem',
    verifiedBy: 'PolitiFact & FactCheck.org',
    sourceUrlName: 'CISA.gov (Cybersecurity and Infrastructure Security Agency)',
    category: 'tecnologia_ia',
    viralReach: '+85 mil visualizações',
    communityVotes: {
      believedFake: 1720,
      believedFato: 110,
    },
  },
];
