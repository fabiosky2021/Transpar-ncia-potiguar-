/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Heart,
  Share2,
  Sun,
  Moon,
  Contrast,
  Send,
  ShieldCheck,
  Bus,
  Check,
  Copy,
  ExternalLink,
  SlidersHorizontal,
  MessageSquare,
  BarChart3,
  FileJson,
  Sparkles,
  AlertCircle,
  X,
  RotateCcw,
  Download,
  Clock,
  Flame,
  BellRing,
} from 'lucide-react';
import {
  generateAutonomousPotiguarBotReply,
  generateAutonomousDailyBulletin,
  checkLocalModerationLGPD,
} from './services/potiguarBotAutonomousEngine';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, collection, onSnapshot, updateDoc, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { MultimodalStudioChat, StudioChatMessage } from './components/MultimodalStudioChat';
import { SoundNotificationCenter } from './components/SoundNotificationCenter';
import { soundNotificationManager } from './services/soundNotificationService';
import { BottomNavigationBar, BottomNavTab } from './components/BottomNavigationBar';
import { AffiliateStorefrontShowcase } from './components/AffiliateStorefrontShowcase';
import { ShopStorefrontPopup } from './components/ShopStorefrontPopup';
import { USAElectionsSection } from './components/USAElectionsSection';
import { FatoOuFakeSection } from './components/FatoOuFakeSection';
import { MonetizationStickyBanner } from './components/MonetizationStickyBanner';
import { OnlineVisitorsBadge } from './components/OnlineVisitorsBadge';
import {
  INITIAL_PROPOSTAS_TSE,
  INITIAL_FEEDBACKS_COMUNIDADE,
  PEC_221_2019_JSON,
  PropostaTSEItem,
  FeedbackComunidadeItem,
} from './data/segundoTurnoData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import {
  INITIAL_PLATFORM_DATA,
  ROTAS_PASSE_LIVRE,
  INITIAL_RELATOS_CIDADAOS,
  INITIAL_BOLETINS_IA,
  INITIAL_AVALIACOES_CANDIDATOS,
  DEFAULT_WHATSAPP_SHARE_TEXT,
  PlataformaSpec,
  RelatoCidadao,
  BoletimDiarioIA,
  AvaliacaoCandidatoItem,
  HistoricoVotoEnqueteItem,
  INITIAL_HISTORICO_ENQUETE,
} from './data/platformData';
import natalHeroImg from './assets/images/natal_rn_civic_hero_1791178735552.jpg';
import potiguarEmblemImg from './assets/images/potiguar_civic_emblem_1791178745626.jpg';

type ThemeMode = 'light' | 'dark-mode' | 'high-contrast';

const STORAGE_KEY = 'transparencia_potiguar_v2_2_state';
const LGPD_CONSENT_KEY = 'transparencia_potiguar_lgpd_accepted';

export default function App() {
  // Theme state: supports light, dark-mode, and high-contrast from user CSS
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Platform state initialized from Firestore + localStorage persistence
  const [platformData, setPlatformData] = useState<PlataformaSpec>(INITIAL_PLATFORM_DATA);
  const [boletinsIA, setBoletinsIA] = useState<BoletimDiarioIA[]>(INITIAL_BOLETINS_IA);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoCandidatoItem[]>(INITIAL_AVALIACOES_CANDIDATOS);
  const [propostasTSE, setPropostasTSE] = useState<PropostaTSEItem[]>(INITIAL_PROPOSTAS_TSE);
  const [feedbacksComunidade, setFeedbacksComunidade] = useState<FeedbackComunidadeItem[]>(
    INITIAL_FEEDBACKS_COMUNIDADE
  );
  const [historicoEnquete, setHistoricoEnquete] = useState<HistoricoVotoEnqueteItem[]>(
    INITIAL_HISTORICO_ENQUETE
  );
  const [isUpdatingBoletim, setIsUpdatingBoletim] = useState<boolean>(false);

  // Load initial data from Firestore on mount (Panorama RN 2026 & 2º Turno RN)
  useEffect(() => {
    const PANORAMA_IDS = new Set([
      'allyson-bezerra',
      'cadu-xavier',
      'alvaro-dias',
      'carlos-eduardo',
      'rogerio-marinho',
    ]);

    const unsubCandidatos = onSnapshot(collection(db, 'candidatos'), (snapshot) => {
      if (snapshot.empty) return;
      const dbDocsMap = new Map<string, any>();
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const id = data.id || d.id;
        if (PANORAMA_IDS.has(id)) {
          dbDocsMap.set(id, data);
        }
      });
      if (dbDocsMap.size === 0) return;
      setPlatformData((prev) => ({
        ...prev,
        candidatos: INITIAL_PLATFORM_DATA.candidatos.map((baseCand) => {
          const dbCand = dbDocsMap.get(baseCand.id);
          return dbCand
            ? {
                ...baseCand,
                curtidas: typeof dbCand.curtidas === 'number' ? dbCand.curtidas : baseCand.curtidas,
                aprovacoes: typeof dbCand.aprovacoes === 'number' ? dbCand.aprovacoes : baseCand.aprovacoes,
                reprovacoes: typeof dbCand.reprovacoes === 'number' ? dbCand.reprovacoes : baseCand.reprovacoes,
              }
            : baseCand;
        }),
      }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'candidatos'));

    const unsubEnquete = onSnapshot(doc(db, 'enquete', 'resultado'), (snapshot) => {
      const data = snapshot.data();
      if (!data) return;
      const vAllyson =
        typeof data.votosAllyson === 'number'
          ? data.votosAllyson
          : typeof data.votosPaulinho === 'number'
          ? data.votosPaulinho
          : 1080;
      const vCadu =
        typeof data.votosCadu === 'number'
          ? data.votosCadu
          : typeof data.votosNatalia === 'number'
          ? data.votosNatalia
          : 920;
      setPlatformData((prev) => ({
        ...prev,
        enqueteSegundoTurno: {
          ...prev.enqueteSegundoTurno,
          totalVotos: vAllyson + vCadu,
          opcoes: prev.enqueteSegundoTurno.opcoes.map((op) => ({
            ...op,
            votos: op.id === 'allyson-bezerra' ? vAllyson : vCadu,
          })),
        },
      }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'enquete/resultado'));

    const unsubRelatos = onSnapshot(collection(db, 'relatos'), (snapshot) => {
      if (snapshot.empty) return;
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as RelatoCidadao[];
      setRelatos(docs.reverse());
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'relatos'));

    const unsubAvaliacoes = onSnapshot(collection(db, 'avaliacoes'), (snapshot) => {
      if (snapshot.empty) return;
      const docs = snapshot.docs.map(
        (d) => ({ id: d.id, ...(d.data() as any) }) as AvaliacaoCandidatoItem
      );
      if (docs.length > 0) {
        setAvaliacoes(docs.reverse());
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'avaliacoes'));

    const unsubBoletins = onSnapshot(collection(db, 'boletinsIA'), (snapshot) => {
      if (snapshot.empty) return;
      const docs = snapshot.docs.map(
        (d) => ({ id: d.id, ...(d.data() as any) }) as BoletimDiarioIA
      );
      if (docs.length > 0) {
        setBoletinsIA(docs.reverse());
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'boletinsIA'));

    const unsubPropostas = onSnapshot(collection(db, 'propostasTSE'), (snapshot) => {
      if (snapshot.empty) return;
      const docsMap = new Map<string, any>();
      snapshot.docs.forEach((d) => docsMap.set(d.id, d.data()));
      setPropostasTSE((prev) =>
        prev.map((item) => (docsMap.has(item.id) ? { ...item, ...docsMap.get(item.id) } : item))
      );
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'propostasTSE'));

    const unsubFeedbacks = onSnapshot(collection(db, 'feedbacksComunidade'), (snapshot) => {
      if (snapshot.empty) return;
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as FeedbackComunidadeItem[];
      setFeedbacksComunidade(docs.reverse());
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'feedbacksComunidade'));

    const unsubHistorico = onSnapshot(collection(db, 'historicoEnquete'), async (snapshot) => {
      if (snapshot.empty) {
        // Inicializa registros de teste no Firestore para garantir persistência histórica
        try {
          for (const item of INITIAL_HISTORICO_ENQUETE) {
            await setDoc(doc(db, 'historicoEnquete', item.id), item);
          }
        } catch {
          // ignore offline
        }
        return;
      }
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as HistoricoVotoEnqueteItem[];
      docs.sort((a, b) => a.timestamp - b.timestamp);
      setHistoricoEnquete(docs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'historicoEnquete'));

    return () => {
      unsubCandidatos();
      unsubEnquete();
      unsubRelatos();
      unsubAvaliacoes();
      unsubBoletins();
      unsubPropostas();
      unsubFeedbacks();
      unsubHistorico();
    };
  }, []);

  // Track which affiliate boxes are unlocked (persisted in platformData + local state)
  const [unlockedAffiliates, setUnlockedAffiliates] = useState<Record<string, boolean>>(() => ({
    mobilidade: Boolean(platformData.agenteIA.noticiasUtilidadePublica[0]?.afiliadoLiberado),
    'allyson-bezerra': Boolean(
      platformData.candidatos.find((c) => c.id === 'allyson-bezerra')?.afiliadoLiberado
    ),
    'cadu-xavier': Boolean(
      platformData.candidatos.find((c) => c.id === 'cadu-xavier')?.afiliadoLiberado
    ),
    'alvaro-dias': Boolean(
      platformData.candidatos.find((c) => c.id === 'alvaro-dias')?.afiliadoLiberado
    ),
    'carlos-eduardo': Boolean(
      platformData.candidatos.find((c) => c.id === 'carlos-eduardo')?.afiliadoLiberado
    ),
    'rogerio-marinho': Boolean(
      platformData.candidatos.find((c) => c.id === 'rogerio-marinho')?.afiliadoLiberado
    ),
  }));

  // Track image fallback stages per candidate (0 = local official file, 1 = remote official URL, 2 = monogram fallback)
  const [candidateImgStage, setCandidateImgStage] = useState<Record<string, number>>({});

  // Active filters & UI states
  const [selectedZona, setSelectedZona] = useState<string>('Todas');
  const [candidateFilter, setCandidateFilter] = useState<'todos' | 'segundo-turno' | 'senado'>('todos');
  const [userPollVote, setUserPollVote] = useState<string | null>(null);

  // Smooth vote counting (tweening) state for the 2º Turno Poll card
  const [animatedTotalVotos, setAnimatedTotalVotos] = useState<number>(
    INITIAL_PLATFORM_DATA.enqueteSegundoTurno.totalVotos
  );
  const [isTweeningVotes, setIsTweeningVotes] = useState<boolean>(false);
  const prevTotalVotosRef = useRef<number>(INITIAL_PLATFORM_DATA.enqueteSegundoTurno.totalVotos);

  // Dynamic countdown timer state for the 2º Turno Poll ('Encerrando em breve')
  const [pollCountdown, setPollCountdown] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    urgencyLabel: string;
  }>({
    hours: '04',
    minutes: '59',
    seconds: '59',
    urgencyLabel: 'Encerrando em breve',
  });

  useEffect(() => {
    const targetTotal = platformData.enqueteSegundoTurno.totalVotos;
    const startTotal = prevTotalVotosRef.current;
    if (targetTotal === startTotal) {
      setAnimatedTotalVotos(targetTotal);
      return;
    }

    setIsTweeningVotes(true);
    const durationMs = 700;
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease-out cubic for smooth natural counting
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startTotal + (targetTotal - startTotal) * eased);
      setAnimatedTotalVotos(currentVal);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setAnimatedTotalVotos(targetTotal);
        prevTotalVotosRef.current = targetTotal;
        setIsTweeningVotes(false);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [platformData.enqueteSegundoTurno.totalVotos]);

  useEffect(() => {
    // Dynamic countdown to the daily poll closing cycle (creates urgency in real time)
    const updateCountdown = () => {
      const now = new Date();
      const endOfCycle = new Date(now);
      endOfCycle.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, endOfCycle.getTime() - now.getTime());

      const totalSeconds = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setPollCountdown({
        hours: String(hrs).padStart(2, '0'),
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0'),
        urgencyLabel: hrs < 6 ? 'Encerrando em breve · Últimas horas do lote diário' : 'Encerrando em breve · Lote diário ativo',
      });
    };

    updateCountdown();
    const timerId = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Modals & Banners
  const [lgpdAccepted, setLgpdAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LGPD_CONSENT_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareText, setShareText] = useState<string>(DEFAULT_WHATSAPP_SHARE_TEXT);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [jsonModalOpen, setJsonModalOpen] = useState<boolean>(false);
  const [editingAffiliateId, setEditingAffiliateId] = useState<string | null>(null);
  const [tempAffiliateUrl, setTempAffiliateUrl] = useState<string>('');
  const [tempAffiliateProduct, setTempAffiliateProduct] = useState<string>('');

  // Image fallback states (Zero-Broken-Image Policy)
  const [heroImgError, setHeroImgError] = useState<boolean>(false);
  const [emblemImgError, setEmblemImgError] = useState<boolean>(false);

  // PotiguarBot IA Multimodal Studio State
  const [chatMessages, setChatMessages] = useState<StudioChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Olá! Sou o PotiguarBot IA, seu ESTÚDIO DE CRIAÇÃO MULTIMODAL & RADAR FATO OU FAKE 24H (Eleições Presidenciais dos EUA, Checagem de Fatos e Transparência).\n\n🎨 **Capacidades Multimodais Ativas:**\n• **Entrada por Texto:** Pergunte sobre a Corrida à Casa Branca (Trump vs Harris, 270 Delegados), verifique boatos se são Fato ou Fake e crie roteiros.\n• **Entrada por Voz (Microfone Ativo):** Fale comigo no botão de microfone com transcrição em tempo real e resposta falada em voz natural.\n• **Upload de Imagem & Visão Avançada:** Envie prints de notícias, posts de redes sociais ou panfletos para checagem imediata de autenticidade e detecção de deepfakes.\n• **Sugestão de Ações em Botões:** Use os botões de ação rápida abaixo do campo de texto para navegação e checagens com um clique.\n\n«Fonte: Estúdio de Criação PotiguarBot IA · AP News, Reuters & Fato ou Fake\nData: 30/10/2026\nTipo: Informação verificada\nStatus: Estúdio Multimodal Ativo»',
      timestamp: 'Agora',
      suggestedActions: [
        '🇺🇸 Quem está na frente na eleição para Presidente dos EUA?',
        '🔍 Essa notícia sobre vistos e tarifas nos EUA é Fato ou Fake?',
        '🗳️ Como funciona o Colégio Eleitoral e os 270 delegados nos EUA?',
        '🛍️ Como acessar compras seguras na Loja Oficial de Fábio Kauã?',
        '⚖️ Transparência CLT: Análise da jornada e PEC 221/2019 (Escala 6x1)',
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isBotLoading, setIsBotLoading] = useState<boolean>(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomNavTab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSoundCenterOpen, setIsSoundCenterOpen] = useState<boolean>(false);
  const [isShopPopupOpen, setIsShopPopupOpen] = useState<boolean>(false);

  // Exibe o pop-up da Loja de Afiliado (CollabShop Fábio Kauã com contagem de 10s e botão fechar)
  useEffect(() => {
    const jaVistoShop = sessionStorage.getItem('popup_shop_fechado');
    if (!jaVistoShop) {
      const timer = setTimeout(() => {
        setIsShopPopupOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectBottomTab = (tab: BottomNavTab) => {
    setActiveBottomTab(tab);
    if (tab === 'home') {
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'busca') {
      setIsMobileMenuOpen(false);
      const searchEl = document.getElementById('portal-search-input');
      if (searchEl) {
        searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchEl.focus();
      }
    } else if (tab === 'alertas') {
      setIsMobileMenuOpen(false);
      setIsSoundCenterOpen(true);
      soundNotificationManager.playSound('chime');
    } else if (tab === 'favoritos') {
      setIsMobileMenuOpen(false);
      const shopEl = document.getElementById('loja-afiliado');
      if (shopEl) {
        shopEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        setIsShopPopupOpen(true);
      }
    } else if (tab === 'menu') {
      setIsMobileMenuOpen(false);
      setIsFloatingChatOpen((prev) => !prev);
    }
  };

  // Moderated Citizen Reports (Mural de Utilidade Pública)
  const [relatos, setRelatos] = useState<RelatoCidadao[]>(INITIAL_RELATOS_CIDADAOS);
  const [novoAutor, setNovoAutor] = useState<string>('');
  const [novoBairro, setNovoBairro] = useState<string>('Alecrim · Zona Leste');
  const [novaMensagem, setNovaMensagem] = useState<string>('');
  const [isModerating, setIsModerating] = useState<boolean>(false);
  const [moderationFeedback, setModerationFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sync theme classes on document.body to match user's CSS (`dark-mode` and `high-contrast`)
  useEffect(() => {
    document.body.classList.remove('dark-mode', 'high-contrast');
    if (theme === 'dark-mode') {
      document.body.classList.add('dark-mode');
    } else if (theme === 'high-contrast') {
      document.body.classList.add('high-contrast');
    }
  }, [theme]);

  // Persist platformData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(platformData));
    } catch {
      // ignore storage errors
    }
  }, [platformData]);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark-mode';
      if (prev === 'dark-mode') return 'high-contrast';
      return 'light';
    });
  };

  const aceitarTermos = () => {
    setLgpdAccepted(true);
    try {
      localStorage.setItem(LGPD_CONSENT_KEY, 'true');
    } catch {
      // ignore
    }
  };

  // Curte e Libera a área do Afiliado (curtirEUnlock)
  const curtirEUnlock = (targetId: string) => {
    setUnlockedAffiliates((prev) => ({ ...prev, [targetId]: true }));

    if (targetId === 'mobilidade') {
      setPlatformData((prev) => ({
        ...prev,
        agenteIA: {
          ...prev.agenteIA,
          noticiasUtilidadePublica: prev.agenteIA.noticiasUtilidadePublica.map((item, idx) =>
            idx === 0
              ? {
                  ...item,
                  curtidas: item.curtidas + 1,
                  afiliadoLiberado: true,
                }
              : item
          ),
        },
      }));
    } else {
      setPlatformData((prev) => ({
        ...prev,
        candidatos: prev.candidatos.map((cand) =>
          cand.id === targetId
            ? {
                ...cand,
                curtidas: cand.curtidas + 1,
                afiliadoLiberado: true,
              }
            : cand
        ),
      }));
    }
  };

  // Handle voting in the 2º Turno Poll (with optimistic local update so tweening animation triggers immediately)
  const votarSegundoTurno = async (opcaoId: string, bonusIncrement = 1) => {
    const ops = platformData.enqueteSegundoTurno.opcoes;
    const isSwitchingCandidate = userPollVote !== null && userPollVote !== opcaoId && bonusIncrement === 1;

    const novasOpcoes = ops.map((op) => {
      if (op.id === opcaoId) {
        return { ...op, votos: op.votos + bonusIncrement };
      }
      if (isSwitchingCandidate && op.id === userPollVote) {
        return { ...op, votos: Math.max(0, op.votos - 1) };
      }
      return op;
    });

    const novoTotal = novasOpcoes.reduce((acc, item) => acc + item.votos, 0);
    const novosVotosAllyson = novasOpcoes.find((o) => o.id === 'allyson-bezerra')?.votos ?? 0;
    const novosVotosCadu = novasOpcoes.find((o) => o.id === 'cadu-xavier')?.votos ?? 0;

    setPlatformData((prev) => ({
      ...prev,
      enqueteSegundoTurno: {
        ...prev.enqueteSegundoTurno,
        totalVotos: novoTotal,
        opcoes: novasOpcoes,
      },
    }));
    setUserPollVote(opcaoId);
    soundNotificationManager.playSound('success');

    try {
      await updateDoc(doc(db, 'enquete', 'resultado'), {
        totalVotos: novoTotal,
        votosAllyson: novosVotosAllyson,
        votosCadu: novosVotosCadu,
        votosPaulinho: novosVotosAllyson,
        votosNatalia: novosVotosCadu,
      });

      // Grava snapshot cronológico no Firestore na coleção /historicoEnquete
      const snapshotId = `hist-voto-${Date.now()}`;
      const pctAllyson = Number(((novosVotosAllyson / novoTotal) * 100).toFixed(1));
      const pctCadu = Number(((novosVotosCadu / novoTotal) * 100).toFixed(1));
      const agoraHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const novoSnapshotDoc = {
        timestamp: Date.now(),
        dataRotulo: `Hoje às ${agoraHora}`,
        horario: agoraHora,
        votosAllyson: novosVotosAllyson,
        votosCadu: novosVotosCadu,
        totalVotos: novoTotal,
        percentualAllyson: pctAllyson,
        percentualCadu: pctCadu,
        origem: `Voto registrado para ${opcaoId === 'allyson-bezerra' ? 'Allyson 44' : 'Cadu 13'} (+${bonusIncrement})`,
      };
      setHistoricoEnquete((prev) => [...prev, { id: snapshotId, ...novoSnapshotDoc }]);
      await setDoc(doc(db, 'historicoEnquete', snapshotId), novoSnapshotDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'enquete/resultado');
    }
  };

  // Save custom affiliate link for any item
  const salvarLinkAfiliado = (targetId: string) => {
    const cleanUrl = tempAffiliateUrl.trim() || 'https://collshp.com/fabiokaua692287?view=storefront';
    const cleanProd = tempAffiliateProduct.trim() || 'Vitrine Oficial Fábio Kauã (collshp.com)';

    if (targetId === 'mobilidade') {
      setPlatformData((prev) => ({
        ...prev,
        agenteIA: {
          ...prev.agenteIA,
          noticiasUtilidadePublica: prev.agenteIA.noticiasUtilidadePublica.map((n, i) =>
            i === 0 ? { ...n, linkAfiliado: cleanUrl, produtoRecomendado: cleanProd } : n
          ),
        },
      }));
    } else {
      setPlatformData((prev) => ({
        ...prev,
        candidatos: prev.candidatos.map((c) =>
          c.id === targetId ? { ...c, linkAfiliado: cleanUrl, produtoRecomendado: cleanProd } : c
        ),
      }));
    }
    setEditingAffiliateId(null);
  };

  const abrirEditorAfiliado = (targetId: string, currentLink: string, currentProduct: string) => {
    setEditingAffiliateId(targetId);
    setTempAffiliateUrl(
      !currentLink || currentLink === 'AGUARDANDO_SEU_LINK'
        ? 'https://collshp.com/fabiokaua692287?view=storefront'
        : currentLink
    );
    setTempAffiliateProduct(currentProduct || 'Vitrine Oficial Fábio Kauã (collshp.com)');
  };

  // Sync live stats into WhatsApp Share Text
  const atualizarTextoShareComDadosAoVivo = () => {
    const mobLikes = platformData.agenteIA.noticiasUtilidadePublica[0]?.curtidas ?? 1240;
    const allyson = platformData.candidatos.find((c) => c.id === 'allyson-bezerra');
    const cadu = platformData.candidatos.find((c) => c.id === 'cadu-xavier');
    const enquete = platformData.enqueteSegundoTurno;

    const updated = `☀️ APURAÇÃO AO VIVO & PANORAMA POLÍTICO RN 2026 (TSE LIVE) 🗳️

🔴 APURAÇÃO OFICIAL TSE EM TEMPO REAL:
• Presidente do Brasil: Lula (13) vs Flávio Bolsonaro (22)
• Governo do RN & Natal: Allyson Bezerra (44) vs Cadu de Lula (13)

🏆 VOTOS & TENDÊNCIA 2º TURNO:
• Allyson Bezerra (UNIÃO · 44): ${(allyson?.curtidas ?? 5420).toLocaleString('pt-BR')} apoios — 3ª Ponte sobre o Rio Potengi e Hospitais Regionais
• Carlos Eduardo Xavier / Cadu (PT · 13): ${(cadu?.curtidas ?? 4980).toLocaleString('pt-BR')} apoios — Educação Integral, BR-304 e SUS Online

📊 Acompanhe os votos das Zonas Eleitorais de Natal e do Brasil atualizados minuto a minuto!
🔏 Plataforma 100% segura e transparente dentro da LGPD.`;
    setShareText(updated);
  };

  const copiarTextoWhatsapp = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Quick candidate approval/disapproval handler + full evaluation submission
  const avaliarCandidato = async (
    candidatoId: string,
    aprovado: boolean,
    comentario: string
  ) => {
    const cand = platformData.candidatos.find((c) => c.id === candidatoId);
    const novaAval: Omit<AvaliacaoCandidatoItem, 'id'> = {
      candidatoId,
      candidatoNome: cand?.nome || candidatoId,
      aprovado,
      fezDeBom: aprovado
        ? comentario || 'Aprovação direta registrada no card do candidato.'
        : 'Registro de cobrança cidadã.',
      naoFez: !aprovado
        ? comentario || 'Sinalizado como não aprovado pelo eleitor.'
        : 'Em acompanhamento.',
      autor: 'Eleitor Potiguar',
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setAvaliacoes((prev) => [{ id: `av-${Date.now()}`, ...novaAval }, ...prev]);
    try {
      await addDoc(collection(db, 'avaliacoes'), novaAval);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'avaliacoes');
    }
  };

  const registrarAvaliacaoCompleta = async (
    nova: Omit<AvaliacaoCandidatoItem, 'id' | 'horario'>
  ) => {
    const itemCompleto: Omit<AvaliacaoCandidatoItem, 'id'> = {
      ...nova,
      horario: `Hoje, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setAvaliacoes((prev) => [{ id: `av-${Date.now()}`, ...itemCompleto }, ...prev]);
    try {
      await addDoc(collection(db, 'avaliacoes'), itemCompleto);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'avaliacoes');
    }
  };

  const acionarAtualizacaoDiariaIA = async () => {
    if (isUpdatingBoletim) return;
    setIsUpdatingBoletim(true);
    try {
      const response = await fetch('/api/daily-ai-update', { method: 'POST' });
      if (!response.ok) throw new Error('Endpoint indisponível');
      const data = await response.json();
      if (data.boletim) {
        setBoletinsIA((prev) => [data.boletim, ...prev]);
      } else {
        setBoletinsIA((prev) => [generateAutonomousDailyBulletin(), ...prev]);
      }
    } catch {
      // Fallback autônomo para funcionar perfeitamente na Netlify ou hospedagem estática
      const novoBoletimLocal = generateAutonomousDailyBulletin();
      setBoletinsIA((prev) => [novoBoletimLocal, ...prev]);
    } finally {
      setIsUpdatingBoletim(false);
    }
  };

  // Send message or image to PotiguarBot IA via server-side Gemini endpoint OR Autonomous Multi-Environment Engine (Netlify compatible)
  const enviarPerguntaBot = async (
    customPrompt?: string,
    imageBase64?: string,
    imageMimeType?: string
  ) => {
    const textToSend = (customPrompt ?? chatInput).trim();
    if ((!textToSend && !imageBase64) || isBotLoading) return;

    const userMsg: StudioChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend || '📷 Imagem enviada para Análise Visual Avançada',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      imagePreview: imageBase64,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsBotLoading(true);

    try {
      const response = await fetch('/api/potiguar-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          imageBase64,
          imageMimeType,
          platformJson: platformData,
          unlockedAffiliates,
          latestRelatos: relatos,
          latestAvaliacoes: avaliacoes,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.useAutonomousFallback || !data.reply) {
        throw new Error('Ativar motor autônomo');
      }

      const botMsg: StudioChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        moderated: Boolean(data.moderated),
        suggestedActions: data.suggestedActions,
      };
      setChatMessages((prev) => [...prev, botMsg]);
      soundNotificationManager.playSound('chime');
    } catch {
      // Motor Autônomo Multi-Ambiente (garante funcionamento 100% na Netlify, Vercel, GitHub Pages ou offline)
      const autonomousResult = generateAutonomousPotiguarBotReply({
        message: textToSend,
        imageBase64,
        imageMimeType,
        platformJson: platformData,
        unlockedAffiliates,
        latestRelatos: relatos,
        latestAvaliacoes: avaliacoes,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-auto-${Date.now()}`,
          sender: 'bot',
          text: autonomousResult.reply,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          moderated: autonomousResult.moderated,
          suggestedActions: autonomousResult.suggestedActions,
        },
      ]);
      soundNotificationManager.playSound('chime');
    } finally {
      setIsBotLoading(false);
    }
  };

  // Submit citizen report on Passe Livre / Elections with real-time LGPD AI moderation & Firestore persistence (Netlify compatible)
  const enviarRelatoCidadao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || isModerating) return;

    setIsModerating(true);
    setModerationFeedback(null);

    const publicarRelatoValidado = async (reasonMsg: string) => {
      const novoRelatoDoc = {
        autor: novoAutor.trim() || 'Eleitor Potiguar',
        bairro: novoBairro,
        horario: `Hoje, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        mensagem: novaMensagem.trim(),
        statusModeracao: 'Aprovado pela Moderação LGPD' as const,
      };
      const novoItem: RelatoCidadao = {
        id: `rel-${Date.now()}`,
        ...novoRelatoDoc,
      };
      setRelatos((prev) => [novoItem, ...prev]);
      try {
        await addDoc(collection(db, 'relatos'), novoRelatoDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'relatos');
      }
      setNovaMensagem('');
      soundNotificationManager.playSound('success');
      setModerationFeedback({
        type: 'success',
        text: `Publicação registrada no banco de dados! ${reasonMsg}`,
      });
    };

    try {
      const response = await fetch('/api/moderate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor: novoAutor.trim() || 'Eleitor Potiguar',
          bairro: novoBairro,
          mensagem: novaMensagem.trim(),
        }),
      });

      if (!response.ok) throw new Error('Fallback moderação local');
      const data = await response.json();
      if (data.approved) {
        await publicarRelatoValidado(data.reason || 'Verificado pela Moderação Ativa LGPD.');
      } else {
        setModerationFeedback({
          type: 'error',
          text:
            data.reason ||
            'Relato retido pela Moderação Democrática: conteúdo em desacordo com os termos contra discurso de ódio e LGPD.',
        });
      }
    } catch {
      const localCheck = checkLocalModerationLGPD(novaMensagem.trim());
      if (localCheck.approved) {
        await publicarRelatoValidado(localCheck.reason);
      } else {
        setModerationFeedback({
          type: 'error',
          text: localCheck.reason,
        });
      }
    } finally {
      setIsModerating(false);
    }
  };

  const restaurarDadosIniciais = () => {
    setPlatformData(INITIAL_PLATFORM_DATA);
    setUnlockedAffiliates({
      mobilidade: false,
      'allyson-bezerra': false,
      'cadu-xavier': false,
      'alvaro-dias': false,
      'carlos-eduardo': false,
      'rogerio-marinho': false,
    });
    setUserPollVote(null);
    setShareText(DEFAULT_WHATSAPP_SHARE_TEXT);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Helper to handle candidate image fallback progression
  const handleCandidateImgError = (id: string) => {
    setCandidateImgStage((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  };

  // Compute dynamic Recharts data and vote difference for the 2º Turno Poll
  const pollChartData = useMemo(() => {
    const total = Math.max(1, platformData.enqueteSegundoTurno.totalVotos);
    return platformData.enqueteSegundoTurno.opcoes.map((op) => {
      const pct = Number(((op.votos / total) * 100).toFixed(1));
      return {
        id: op.id,
        nomeCurto: op.nome.split(' ')[0] + ' ' + (op.nome.split(' ')[1] || ''),
        nome: op.nome,
        partido: op.partido,
        votos: op.votos,
        percentual: pct,
        labelFormatado: `${op.votos.toLocaleString('pt-BR')} (${pct.toFixed(1).replace('.', ',')}%)`,
        cor:
          theme === 'high-contrast'
            ? '#ffff00'
            : op.corBarra || (op.id === 'natalia-bonavides' ? '#e11d48' : '#0d6efd'),
      };
    });
  }, [platformData.enqueteSegundoTurno, theme]);

  const pollDiffMetrics = useMemo(() => {
    const ops = platformData.enqueteSegundoTurno.opcoes;
    if (ops.length < 2) return { diffVotos: 0, diffPct: '0,0', lider: '' };
    const total = Math.max(1, platformData.enqueteSegundoTurno.totalVotos);
    const sorted = [...ops].sort((a, b) => b.votos - a.votos);
    const diffVotos = sorted[0].votos - sorted[1].votos;
    const diffPct = (((sorted[0].votos - sorted[1].votos) / total) * 100)
      .toFixed(1)
      .replace('.', ',');
    return {
      diffVotos,
      diffPct,
      lider: diffVotos === 0 ? 'Empate técnico' : `${sorted[0].nome} (+${diffVotos.toLocaleString('pt-BR')} votos)`,
    };
  }, [platformData.enqueteSegundoTurno]);

  const noticiaMobilidade = platformData.agenteIA.noticiasUtilidadePublica[0];
  const rotasFiltradas =
    selectedZona === 'Todas'
      ? ROTAS_PASSE_LIVRE
      : ROTAS_PASSE_LIVRE.filter((r) => r.zona === selectedZona);

  const candidatosFiltrados = platformData.candidatos.filter((c) => {
    if (candidateFilter === 'segundo-turno') {
      return c.id === 'allyson-bezerra' || c.id === 'cadu-xavier';
    }
    if (candidateFilter === 'senado') {
      return c.id === 'carlos-eduardo' || c.id === 'rogerio-marinho';
    }
    return true;
  });

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] overflow-x-hidden w-full max-w-[100vw] pb-28 sm:pb-24 lg:pb-16">
      {/* Top Navigation Bar following strict Responsive Multi-Device Contract (Celular, App PWA, Notebook & PC) */}
      <header className="sticky top-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 w-full max-w-[100vw]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Zone 1: Wordmark with USA Flag & White House Branding */}
          <a
            href="#eleicoes-eua"
            className="flex items-center gap-2.5 text-base sm:text-xl font-semibold tracking-tight text-[var(--text-color)] no-underline truncate min-w-0"
          >
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-slate-800 to-blue-600 p-0.5 shadow-md shrink-0 flex items-center justify-center text-white text-base font-black">
              🇺🇸
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] sm:text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                White House Live
              </span>
              <span className="text-sm sm:text-base font-black text-[var(--text-color)] uppercase tracking-tight">
                USA Elections 24h
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation links on wide screens */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-[var(--text-muted)] shrink-0">
            <a
              href="#eleicoes-eua"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap font-black text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <span>🏛️</span> Colégio Eleitoral (270)
            </a>
            <a
              href="#eleicoes-eua"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap font-black text-blue-600 dark:text-blue-400 flex items-center gap-1"
            >
              <span>📍</span> 7 Swing States
            </a>
            <a
              href="#fato-ou-fake"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>🔍</span> Fato ou Fake 24h
            </a>
            <a
              href="#loja-afiliado"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap font-black text-amber-600 dark:text-amber-400 flex items-center gap-1"
            >
              <span>🛍️</span> Vitrine &amp; Shop Fábio Kauã
            </a>
            <a
              href="#potiguar-bot"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap font-semibold text-[var(--text-color)]"
            >
              <span>🎙️</span> Estúdio IA
            </a>
          </nav>

          {/* Zone 3: Responsive actions for Mobile, App, Notebook & Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Monitor de Pessoas Acessando Agora (Tempo Real) */}
            <OnlineVisitorsBadge variant="header" />

            {/* Botão de Destaque da Loja de Afiliado (CollabShop Fábio Kauã) */}
            <button
              type="button"
              onClick={() => setIsShopPopupOpen(true)}
              title="Conhecer Minha Loja & Vitrine de Afiliado Oficial (CollabShop Fábio Kauã)"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm active:scale-95 transition-all border border-emerald-400/50"
            >
              <span>🛍️</span>
              <span className="font-extrabold">Meu Shop</span>
              <span className="hidden md:inline font-medium text-emerald-100">Afiliado</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFloatingChatOpen((prev) => !prev)}
              title="Abrir ou fechar o Painel de Estúdio do Agente PotiguarBot IA"
              className={`botao px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                isFloatingChatOpen
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[var(--surface-subtle)] text-[var(--accent-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Estúdio IA</span>
              <span className="sm:hidden">IA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSoundCenterOpen(true);
                soundNotificationManager.playSound('chime');
              }}
              title="Notificações com Som (Alertas sonoros em tempo real)"
              className="relative px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] hover:border-amber-500 text-[11px] sm:text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
              <span className="hidden sm:inline">Alertas &amp; Som</span>
              <span className="sm:hidden">Som</span>
              <span className="w-2 h-2 rounded-full bg-[#e8622c] absolute -top-0.5 -right-0.5" />
            </button>

            <PWAInstallButton />

            <button
              type="button"
              onClick={cycleTheme}
              title="Alternar tema de visualização: Claro, Noturno ou Alto Contraste"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[11px] sm:text-xs font-semibold text-[var(--text-color)] hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {theme === 'light' && (
                <>
                  <Moon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Noturno</span>
                </>
              )}
              {theme === 'dark-mode' && (
                <>
                  <Contrast className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Contraste</span>
                </>
              )}
              {theme === 'high-contrast' && (
                <>
                  <Sun className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Claro</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-[11px] sm:text-xs font-semibold transition-transform active:scale-95 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Compartilhar no WhatsApp</span>
              <span className="md:hidden">WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação Deslizante para Celular, App e Notebook (< xl) — Sem estourar a largura */}
        <div className="xl:hidden max-w-[1200px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 mt-2 border-t border-[var(--border-color)] text-xs">
          <a
            href="#eleicoes-eua"
            className="px-2.5 py-1 rounded-md bg-red-600/15 text-red-600 dark:text-red-400 font-bold whitespace-nowrap no-underline shrink-0 flex items-center gap-1"
          >
            <span>🏛️</span> Colégio Eleitoral (270)
          </a>
          <a
            href="#eleicoes-eua"
            className="px-2.5 py-1 rounded-md bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap no-underline shrink-0 flex items-center gap-1"
          >
            <span>📍</span> 7 Swing States
          </a>
          <a
            href="#fato-ou-fake"
            className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap no-underline shrink-0 flex items-center gap-1"
          >
            <span>🔍</span> Fato ou Fake 24h
          </a>
          <a
            href="#loja-afiliado"
            className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap no-underline shrink-0 flex items-center gap-1"
          >
            <span>🛍️</span> Vitrine &amp; Shop
          </a>
          <a
            href="#potiguar-bot"
            className="px-2.5 py-1 rounded-md bg-[var(--surface-subtle)] text-[var(--accent-color)] font-semibold whitespace-nowrap no-underline shrink-0 flex items-center gap-1"
          >
            <span>🎙️</span> Estúdio IA
          </a>
        </div>
      </header>

      {/* Main Content Container (Responsive across Celular, App, Notebook & Desktop) */}
      <main id="topo" className="flex-1 max-w-[1200px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12 overflow-x-hidden min-w-0">
        {/* DESTAQUE 1: Eleições Presidenciais dos EUA · Corrida à Casa Branca (Trump vs Harris, 270 Delegados e 7 Swing States) */}
        <USAElectionsSection
          onAskAgent={(prompt) => {
            setIsFloatingChatOpen(true);
            enviarPerguntaBot(prompt);
          }}
          onOpenStorefront={() => setIsShopPopupOpen(true)}
        />

        {/* DESTAQUE 2: Radar FATO OU FAKE 24h · Checagem de Fatos, Boatos, Deepfakes & Alertas Anti-Golpe */}
        <FatoOuFakeSection
          onAskAgent={(prompt) => {
            setIsFloatingChatOpen(true);
            enviarPerguntaBot(prompt);
          }}
          onOpenStorefront={() => setIsShopPopupOpen(true)}
        />

        {/* DESTAQUE 3 & MONETIZAÇÃO: Vitrine & Loja de Afiliado Parceira Oficial (Fábio Kauã · CollabShop Storefront) */}
        <div id="loja-afiliado">
          <AffiliateStorefrontShowcase
            affiliateUrl={
              platformData.agenteIA.noticiasUtilidadePublica[0]?.linkAfiliado ||
              'https://collshp.com/fabiokaua692287?view=storefront'
            }
            onOpenEditor={() =>
              abrirEditorAfiliado(
                'mobilidade',
                noticiaMobilidade?.linkAfiliado || 'https://collshp.com/fabiokaua692287?view=storefront',
                noticiaMobilidade?.produtoRecomendado || 'Vitrine Oficial Fábio Kauã (collshp.com)'
              )
            }
            onOpenPopup={() => setIsShopPopupOpen(true)}
          />
        </div>







        {/* Section 4: Estúdio de Criação Multimodal PotiguarBot IA + Mural Cidadão com Leitura da Última Publicação */}
        <MultimodalStudioChat
          agentName={platformData.agenteIA.nome}
          agentDirective={platformData.agenteIA.diretrizComportamento}
          emblemImg={potiguarEmblemImg}
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isBotLoading={isBotLoading}
          onSendPrompt={enviarPerguntaBot}
          relatos={relatos}
          avaliacoes={avaliacoes}
          novoAutor={novoAutor}
          setNovoAutor={setNovoAutor}
          novoBairro={novoBairro}
          setNovoBairro={setNovoBairro}
          novaMensagem={novaMensagem}
          setNovaMensagem={setNovaMensagem}
          isModerating={isModerating}
          moderationFeedback={moderationFeedback}
          onSubmitRelato={enviarRelatoCidadao}
          isFloatingOpen={isFloatingChatOpen}
          setIsFloatingOpen={setIsFloatingChatOpen}
        />

        {/* Central de Monetização Oficial & Vitrine de Afiliado */}
        <section id="afiliados" className="card-clean p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Monetização &amp; Parceria Oficial
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)]">
                Vitrine Homologada de Afiliado (CollabShop de Fábio Kauã)
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Canal oficial de compras seguras, achadinhos verificados e cupons de desconto vinculados ao portal.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsShopPopupOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:border-emerald-500 cursor-pointer"
              >
                Testar Pop-up (10s)
              </button>
              <a
                href={platformData.agenteIA.noticiasUtilidadePublica[0]?.linkAfiliado || 'https://collshp.com/fabiokaua692287?view=storefront'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold no-underline inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Abrir Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="truncate">
              <span className="text-[var(--text-muted)] block sm:inline mr-2">Link da Vitrine:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {platformData.agenteIA.noticiasUtilidadePublica[0]?.linkAfiliado || 'https://collshp.com/fabiokaua692287?view=storefront'}
              </strong>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-[11px] self-start sm:self-auto shrink-0">
              ✓ Ativo e Integrado em Todo o Painel
            </span>
          </div>
        </section>
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--card-bg)] py-6 px-4 sm:px-8 mt-12">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div>
            <strong>White House Live Monitor · USA Elections 2024–2028</strong> · Radar Fato ou Fake 24h &amp; Parceria CollabShop
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setJsonModalOpen(true)}
              className="hover:text-[var(--text-color)] underline cursor-pointer"
            >
              Transparência &amp; Dados Abertos
            </button>
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="hover:text-[var(--text-color)] underline cursor-pointer"
            >
              Compartilhar Painel
            </button>
          </div>
        </div>
      </footer>

      {/* Non-Blocking LGPD / Privacy Bottom Banner (Respects <= 15% mobile viewport cap) */}
      {!lgpdAccepted && (
        <div
          id="cookie-banner"
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] text-white border-t-2 border-[#0d6efd] px-4 py-3 shadow-lg"
        >
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="m-0 text-xs sm:text-sm leading-snug">
              🔏 <strong>Sua Privacidade Protegida:</strong> Ambiente moderado com respeito à democracia e à LGPD. Proibido discurso de ódio e racismo.
            </p>
            <button
              type="button"
              onClick={aceitarTermos}
              className="px-4 py-1.5 rounded-md bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-semibold shrink-0 cursor-pointer whitespace-nowrap"
            >
              Concordar e Continuar
            </button>
          </div>
        </div>
      )}

      {/* Modal do WhatsApp / Compartilhamento (#modal-share) */}
      {shareModalOpen && (
        <div
          id="modal-share"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-semibold text-[var(--text-color)] m-0">
                📲 Compartilhar no WhatsApp
              </h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Resumo formatado para grupos e contatos do RN:</span>
              <button
                type="button"
                onClick={atualizarTextoShareComDadosAoVivo}
                className="text-[var(--accent-color)] underline cursor-pointer"
              >
                Incluir votos atuais da enquete
              </button>
            </div>

            <textarea
              id="share-text"
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] p-3 text-xs sm:text-sm text-[var(--text-color)] font-sans leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-color)] cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={copiarTextoWhatsapp}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedShare ? (
                  <Check className="w-4 h-4 text-[var(--success-color)]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedShare ? 'Texto Copiado!' : 'Copiar Texto'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold inline-flex items-center gap-1.5 no-underline"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editor de Link de Afiliado */}
      {editingAffiliateId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-semibold text-[var(--text-color)] m-0">
                Configurar Oferta de Afiliado
              </h3>
              <button
                type="button"
                onClick={() => setEditingAffiliateId(null)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Título do Produto / Curso Recomendado
                </label>
                <input
                  type="text"
                  value={tempAffiliateProduct}
                  onChange={(e) => setTempAffiliateProduct(e.target.value)}
                  placeholder="Ex: Oferta Especial de Leitura / Curso"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-sm text-[var(--text-color)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[var(--text-muted)]">
                    URL de Afiliado (https://...)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTempAffiliateUrl('https://collshp.com/fabiokaua692287?view=storefront');
                      setTempAffiliateProduct('Vitrine Oficial Fábio Kauã (collshp.com)');
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Usar CollabShop Fábio Kauã
                  </button>
                </div>
                <input
                  type="url"
                  value={tempAffiliateUrl}
                  onChange={(e) => setTempAffiliateUrl(e.target.value)}
                  placeholder="https://collshp.com/fabiokaua692287?view=storefront"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-sm text-[var(--text-color)] font-mono"
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Link padrão configurado: <code>collshp.com/fabiokaua692287</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAffiliateId(null)}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-color)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => salvarLinkAfiliado(editingAffiliateId)}
                className="px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold cursor-pointer"
              >
                Salvar Link de Afiliado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal JSON Spec & LGPD Inspector */}
      {jsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-semibold text-[var(--text-color)] m-0">
                Especificação em Tempo Real (JSON v2.1.0)
              </h3>
              <button
                type="button"
                onClick={() => setJsonModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-color)] overflow-auto max-h-[380px]">
              {JSON.stringify(platformData, null, 2)}
            </pre>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(platformData, null, 2));
                }}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setJsonModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Inferior Fixo Estilo App Nativo (Mobile-first, 5 abas reais) */}
      <BottomNavigationBar
        activeTab={activeBottomTab}
        onSelectTab={handleSelectBottomTab}
        unreadAlertsCount={boletinsIA.length}
        favoritesCount={2}
      />

      {/* Modal / Menu Lateral para a aba "Menu" da navegação inferior */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-[var(--card-bg)] border-t sm:border border-[var(--border-color)] rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#00875a] flex items-center justify-center font-black">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-color)] m-0">
                    Menu Transparência Potiguar
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Navegação Rápida &amp; Recursos Cívicos
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-[var(--text-color)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <a
                href="#portal-home"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-emerald-500/10 border border-[var(--border-color)] flex items-center justify-between text-[var(--text-color)] font-semibold no-underline"
              >
                <span>🏛️ Início do Portal &amp; Indicadores</span>
                <span className="text-[10px] text-gray-500">Acessar</span>
              </a>

              <a
                href="#colinha-politica-2026"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-emerald-500/10 border border-[var(--border-color)] flex items-center justify-between text-[var(--text-color)] font-semibold no-underline"
              >
                <span>🗳️ Colinha Política RN 2026 (Candidatos)</span>
                <span className="text-[10px] text-gray-500">Acessar</span>
              </a>

              <a
                href="#atualizacao-legislativa"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-emerald-500/10 border border-[var(--border-color)] flex items-center justify-between text-[var(--text-color)] font-semibold no-underline"
              >
                <span>⚖️ PEC 221/2019 (Fim da Escala 6x1)</span>
                <span className="text-[10px] text-emerald-600 font-bold">Novo</span>
              </a>

              <a
                href="#apuracao-ao-vivo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 flex items-center justify-between text-[var(--text-color)] font-bold no-underline animate-pulse"
              >
                <span className="flex items-center gap-2">
                  <span>🔴</span> Apuração ao Vivo (Presidente &amp; Natal RN)
                </span>
                <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                  TSE Live
                </span>
              </a>

              <a
                href="#enquete-2-turno"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-emerald-500/10 border border-[var(--border-color)] flex items-center justify-between text-[var(--text-color)] font-semibold no-underline"
              >
                <span>📊 Simulado 2º Turno Governo RN</span>
                <span className="text-[10px] text-gray-500">Votar</span>
              </a>

              <a
                href="https://collshp.com/fabiokaua692287?view=storefront"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-amber-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between text-[var(--text-color)] font-bold no-underline"
              >
                <span className="flex items-center gap-2">
                  <span>🛍️</span> Vitrine &amp; Loja Fábio Kauã
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  CollabShop ↗
                </span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsFloatingChatOpen(true);
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-between cursor-pointer border-none shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Estúdio Criativo PotiguarBot IA
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Abrir</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={cycleTheme}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[11px] font-semibold text-[var(--text-color)] flex items-center gap-1.5 cursor-pointer"
              >
                {theme === 'light' ? '🌙 Modo Noturno' : theme === 'dark-mode' ? '🔲 Alto Contraste' : '☀️ Modo Claro'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setJsonModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-[11px] font-semibold text-[var(--text-color)] cursor-pointer"
              >
                📄 Dados Abertos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Central de Notificações com Som e Toast Flutuante em Tempo Real */}
      <SoundNotificationCenter
        isOpen={isSoundCenterOpen}
        onClose={() => setIsSoundCenterOpen(false)}
        onNavigateToSection={(sectionId) => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      {/* Offline Connectivity Indicator for PWA */}
      <OfflineIndicator />

      {/* Marcador de Visita do Site Flutuante e Fixo (Sempre Visível e Funcional) */}
      <OnlineVisitorsBadge variant="floating-widget" />

      {/* Pop-up Especial da Loja de Afiliado (CollabShop Fábio Kauã) com contagem de 10 segundos e botão de fechar */}
      <ShopStorefrontPopup
        isOpen={isShopPopupOpen}
        onClose={() => setIsShopPopupOpen(false)}
        storefrontUrl={
          platformData.agenteIA.noticiasUtilidadePublica[0]?.linkAfiliado ||
          'https://collshp.com/fabiokaua692287?view=storefront'
        }
        initialDelaySeconds={2}
        lockCloseSeconds={10}
      />

      {/* Barra Fixa Flutuante de Monetização (Vitrine & Achadinhos Fábio Kauã) */}
      <MonetizationStickyBanner
        storefrontUrl={
          platformData.agenteIA.noticiasUtilidadePublica[0]?.linkAfiliado ||
          'https://collshp.com/fabiokaua692287?view=storefront'
        }
        onOpenStorefrontPopup={() => setIsShopPopupOpen(true)}
      />
    </div>
  );
}
