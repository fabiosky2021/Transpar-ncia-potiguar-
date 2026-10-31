export interface USACandidate {
  id: string;
  name: string;
  party: string;
  partyAbbr: 'GOP' | 'DEM' | 'IND';
  partyColor: string;
  runningMate: string;
  electoralVotes: number;
  popularVotes: number;
  popularVotePct: number;
  avatarUrl: string;
  status: 'elected' | 'leading' | 'trailing';
  slogan: string;
  keyProposals: {
    area: string;
    proposal: string;
    impactBrasil: string;
  }[];
}

export interface SwingState {
  id: string;
  code: string;
  name: string;
  electoralVotes: number;
  reportedPct: number;
  leaderId: string;
  leaderMarginPct: number;
  votesTrump: number;
  votesHarris: number;
  status: 'closed' | 'counting' | 'projected';
  winnerId?: string;
  keyCounties: string;
  lastUpdate: string;
}

export interface USAPresidentialNewsItem {
  id: string;
  time: string;
  title: string;
  source: string;
  urgency: 'breaking' | 'analysis' | 'markets';
  summary: string;
}

export interface PolicyBattleground {
  id: string;
  pillar: string;
  icon: string;
  trumpStance: string;
  harrisStance: string;
  impactOnBrazil: string;
}

export interface USAElectionsData {
  title: string;
  subtitle: string;
  totalElectoralVotes: number;
  neededToWin: number;
  lastUpdated: string;
  totalReportedPct: number;
  candidates: USACandidate[];
  swingStates: SwingState[];
  newsTicker: USAPresidentialNewsItem[];
  policyBattlegrounds: PolicyBattleground[];
  analysisBulletin: string;
}

export const INITIAL_USA_ELECTIONS_DATA: USAElectionsData = {
  title: 'Eleição Presidencial dos EUA · Corrida à Casa Branca',
  subtitle: 'Apuração do Colégio Eleitoral (Meta: 270 delegados) · Os 7 Estados-Pêndulo e Voto Popular',
  totalElectoralVotes: 538,
  neededToWin: 270,
  lastUpdated: 'Atualizado em tempo real · Projeções Oficiais das Redes (AP, Reuters, Decision Desk HQ)',
  totalReportedPct: 98.4,
  candidates: [
    {
      id: 'donald-trump',
      name: 'Donald Trump',
      party: 'Partido Republicano',
      partyAbbr: 'GOP',
      partyColor: '#dc2626',
      runningMate: 'JD Vance',
      electoralVotes: 312,
      popularVotes: 76824150,
      popularVotePct: 50.1,
      slogan: 'Make America Great Again (MAGA 2024)',
      avatarUrl: 'https://images.unsplash.com/photo-1580128660010-fd027e1e587a?auto=format&fit=crop&w=300&q=80',
      status: 'elected',
      keyProposals: [
        {
          area: 'Economia & Tarifas',
          proposal: 'Tarifa universal de 10% a 20% sobre importações e corte do imposto de renda corporativo para 15%.',
          impactBrasil: 'Pode pressionar exportações de manufaturados brasileiros, mas favorecer commodities como soja e carne.',
        },
        {
          area: 'Energia & Petróleo',
          proposal: 'Política "Drill, baby, drill": expansão máxima de licenças de petróleo, gás natural e redução de subsídios verdes.',
          impactBrasil: 'Aumento da oferta global de óleo que pode influenciar a cotação internacional do barril de petróleo e Petrobras.',
        },
        {
          area: 'Imigração & Fronteiras',
          proposal: 'Reforço massivo da fronteira sul, retomada da construção do muro e fiscalização rigorosa de vistos.',
          impactBrasil: 'Maior rigor no controle consular de vistos de turismo e negócios para latino-americanos.',
        },
        {
          area: 'Tecnologia & IA',
          proposal: 'Desregulamentação de modelos de inteligência artificial e proteção a semicondutores nacionais.',
          impactBrasil: 'Competição de supercomputadores nos EUA com atração de capitais e investimentos.',
        },
      ],
    },
    {
      id: 'kamala-harris',
      name: 'Kamala Harris',
      party: 'Partido Democrata',
      partyAbbr: 'DEM',
      partyColor: '#2563eb',
      runningMate: 'Tim Walz',
      electoralVotes: 226,
      popularVotes: 74218320,
      popularVotePct: 48.4,
      slogan: 'A New Way Forward',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      status: 'trailing',
      keyProposals: [
        {
          area: 'Economia & Classe Média',
          proposal: 'Crédito tributário infantil de US$ 6.000 para recém-nascidos e incentivo de US$ 25.000 para compra da primeira casa.',
          impactBrasil: 'Estabilidade nos fluxos cambiais tradicionais com incentivo a cadeias de suprimentos amigáveis.',
        },
        {
          area: 'Transição Ecológica & Clima',
          proposal: 'Manutenção do Inflation Reduction Act (IRA), subsídios para carros elétricos e energia solar/eólica.',
          impactBrasil: 'Alinhamento com a agenda verde brasileira (biocombustíveis, Amazônia e créditos de carbono).',
        },
        {
          area: 'Política Externa & Alianças',
          proposal: 'Defesa contínua da OTAN, suporte à Ucrânia e cooperação multilateral em fóruns do G7 e G20.',
          impactBrasil: 'Foco na diplomacia multilateral e cooperação em sustentabilidade ambiental com o Brasil.',
        },
        {
          area: 'Direitos & Saúde',
          proposal: 'Proteção legal federal aos direitos reprodutivos e teto para preços de medicamentos pelo Medicare.',
          impactBrasil: 'Debate de políticas de saúde pública e acesso a genéricos no cenário internacional.',
        },
      ],
    },
  ],
  swingStates: [
    {
      id: 'pa',
      code: 'PA',
      name: 'Pensilvânia',
      electoralVotes: 19,
      reportedPct: 99.2,
      leaderId: 'donald-trump',
      leaderMarginPct: 1.8,
      votesTrump: 3512400,
      votesHarris: 3388100,
      status: 'projected',
      winnerId: 'donald-trump',
      keyCounties: 'Filadélfia, Allegheny (Pittsburgh), Bucks, Erie e Luzerne',
      lastUpdate: 'Projeção confirmada pela AP e Decision Desk HQ',
    },
    {
      id: 'ga',
      code: 'GA',
      name: 'Geórgia',
      electoralVotes: 16,
      reportedPct: 99.5,
      leaderId: 'donald-trump',
      leaderMarginPct: 2.1,
      votesTrump: 2664000,
      votesHarris: 2548000,
      status: 'projected',
      winnerId: 'donald-trump',
      keyCounties: 'Fulton (Atlanta), Gwinnett, Cobb, Cherokee e Chatham',
      lastUpdate: 'Projeção de 16 delegados para os republicanos',
    },
    {
      id: 'nc',
      code: 'NC',
      name: 'Carolina do Norte',
      electoralVotes: 16,
      reportedPct: 99.8,
      leaderId: 'donald-trump',
      leaderMarginPct: 3.2,
      votesTrump: 2879000,
      votesHarris: 2695000,
      status: 'projected',
      winnerId: 'donald-trump',
      keyCounties: 'Mecklenburg (Charlotte), Wake (Raleigh) e Guilford',
      lastUpdate: 'Totalização de 16 delegados concluída',
    },
    {
      id: 'mi',
      code: 'MI',
      name: 'Michigan',
      electoralVotes: 15,
      reportedPct: 99.1,
      leaderId: 'donald-trump',
      leaderMarginPct: 1.4,
      votesTrump: 2804000,
      votesHarris: 2724000,
      status: 'projected',
      winnerId: 'donald-trump',
      keyCounties: 'Wayne (Detroit), Oakland, Macomb e Kent (Grand Rapids)',
      lastUpdate: 'Polo automotivo decisivo nos 15 delegados',
    },
    {
      id: 'az',
      code: 'AZ',
      name: 'Arizona',
      electoralVotes: 11,
      reportedPct: 98.9,
      leaderId: 'donald-trump',
      leaderMarginPct: 5.5,
      votesTrump: 1761000,
      votesHarris: 1575000,
      status: 'projected',
      winnerId: 'donald-trump',
      keyCounties: 'Maricopa (Phoenix) e Pima (Tucson)',
      lastUpdate: 'Fronteira sul consolidada na apuração',
    },
    {
      id: 'wi',
      code: 'WI',
      name: 'Wisconsin',
      electoralVotes: 10,
      reportedPct: 99.4,
      leaderId: 'donald-trump',
      leaderMarginPct: 0.9,
      votesTrump: 1697000,
      votesHarris: 1668000,
      status: 'projected',
      winnerId: 'donald-trump',
      keyCounties: 'Milwaukee, Dane (Madison), Waukesha e Brown (Green Bay)',
      lastUpdate: 'Margem de menos de 1 ponto garantiu os 10 delegados',
    },
    {
      id: 'nv',
      code: 'NV',
      name: 'Nevada',
      electoralVotes: 6,
      reportedPct: 98.0,
      leaderId: 'donald-trump',
      leaderMarginPct: 3.1,
      votesTrump: 751000,
      votesHarris: 705000,
      status: 'projected',
      winnerId: 'donald-trump',
      keyCounties: 'Clark (Las Vegas) e Washoe (Reno)',
      lastUpdate: 'Voto latino e trabalhadores de hotelaria definiram a votação',
    },
  ],
  newsTicker: [
    {
      id: 'news-1',
      time: 'Agora',
      title: 'Donald Trump atinge 312 delegados no Colégio Eleitoral e consolida vitória',
      source: 'Associated Press / Reuters',
      urgency: 'breaking',
      summary: 'A conquista dos sete swing states assegurou a marca superior aos 270 delegados constitucionais necessários para o retorno à Casa Branca.',
    },
    {
      id: 'news-2',
      time: 'Há 15 min',
      title: 'Mercados reagem com alta do dólar e valorização de índices de ações em Nova York',
      source: 'Bloomberg / Financial Times',
      urgency: 'markets',
      summary: 'Investidores precificam perspectiva de cortes de impostos corporativos e reestruturação tarifária internacional.',
    },
    {
      id: 'news-3',
      time: 'Há 40 min',
      title: 'Kamala Harris discursa na Howard University agradecendo apoiadores e reforça transição pacífica',
      source: 'CNN / The Washington Post',
      urgency: 'analysis',
      summary: 'A vice-presidente destacou o compromisso com a constituição americana e a cooperação institucional no processo de transição.',
    },
    {
      id: 'news-4',
      time: 'Há 1 hora',
      title: 'Itamaraty e líderes mundiais iniciam preparativos diplomáticos para as novas diretrizes comerciais',
      source: 'Agência Brasil / EFE',
      urgency: 'analysis',
      summary: 'Governos ao redor do mundo analisam os impactos de eventuais tarifas universais e renegociações multilaterais.',
    },
  ],
  policyBattlegrounds: [
    {
      id: 'pol-1',
      pillar: 'Tarifas & Comércio Exterior',
      icon: 'Scale',
      trumpStance: 'Tarifa universal de 10% a 20% para produtos estrangeiros e até 60% para produtos fabricados na China.',
      harrisStance: 'Tarifas pontuais direcionadas a setores estratégicos (tecnologia/veículos) e proteção de acordos multilaterais.',
      impactOnBrazil: 'Pode redirecionar compras de grãos da China para o agronegócio do Brasil, mas elevar o custo de manufaturados importados.',
    },
    {
      id: 'pol-2',
      pillar: 'Câmbio, Dólar & Inflação',
      icon: 'TrendingUp',
      trumpStance: 'Políticas fiscais expansionistas com corte de tributos que podem sustentar taxas de juros mais elevadas pelo Fed.',
      harrisStance: 'Controle de déficit via aumento de tributos sobre super-ricos e corporações, buscando estabilidade de juros.',
      impactOnBrazil: 'Dólar mais valorizado atrai capital para títulos do Tesouro dos EUA, influenciando o câmbio do Real e a taxa Selic.',
    },
    {
      id: 'pol-3',
      pillar: 'Energia & Petróleo',
      icon: 'Flame',
      trumpStance: 'Máxima extração de combustíveis fósseis, revogação de restrições a oleodutos e saída de pactos climáticos rígidos.',
      harrisStance: 'Investimentos em energias renováveis (eólica, solar, hidrogênio verde) e conservação ambiental global.',
      impactOnBrazil: 'Variação no preço internacional do barril de petróleo afeta diretamente a balança comercial e a Petrobras.',
    },
    {
      id: 'pol-4',
      pillar: 'Imigração & Vistos',
      icon: 'ShieldCheck',
      trumpStance: 'Aperto nos controles fronteiriços, maior exigência em vistos de trabalho e deportações de imigrantes indocumentados.',
      harrisStance: 'Caminho legal para regularização de indocumentados sem antecedentes e modernização do sistema de asilo.',
      impactOnBrazil: 'Brasileiros que viajam a turismo ou negócios devem acompanhar procedimentos consulares e agendamentos oficiais.',
    },
  ],
  analysisBulletin:
    'A apuração presidencial dos EUA consolidou o resultado do Colégio Eleitoral ultrapassando com folga os 270 delegados necessários. O controle dos 7 estados-pêndulo (swing states) definiu a balança de poder em Washington, impactando diretamente o câmbio do dólar, taxas de juros globais, cadeias de suprimentos e relações bilaterais com o Brasil.',
};
