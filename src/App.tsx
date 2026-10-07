/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, collection, onSnapshot, updateDoc, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { CivicModulesSection } from './components/CivicModulesSection';
import { MultimodalStudioChat, StudioChatMessage } from './components/MultimodalStudioChat';
import { SegundoTurnoMonitor24h } from './components/SegundoTurnoMonitor24h';
import { PrimeirasNoticiasSlides24h } from './components/PrimeirasNoticiasSlides24h';
import { PanoramaPoliticoRN2026Section } from './components/PanoramaPoliticoRN2026Section';
import { RankingPropostasBairroSection } from './components/RankingPropostasBairroSection';
import { RadarTransparenciaSection } from './components/RadarTransparenciaSection';
import {
  INITIAL_PROPOSTAS_TSE,
  INITIAL_FEEDBACKS_COMUNIDADE,
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

    return () => {
      unsubCandidatos();
      unsubEnquete();
      unsubRelatos();
      unsubAvaliacoes();
      unsubBoletins();
      unsubPropostas();
      unsubFeedbacks();
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
      text: 'Olá, eleitor potiguar! Sou o PotiguarBot IA com voz masculina natural em português do Brasil, conectado ao Radar de Transparência e ao Plantão 24h (Eleições RN 2026).\n\n📌 Disputa pelo Governo do RN (2º Turno):\n• Allyson Bezerra (UNIÃO · 44): 37% — 3ª Ponte sobre o Rio Potengi e Hospitais Regionais\n• Carlos Eduardo Xavier / Cadu de Lula (PT · 13): 32% — Educação em Tempo Integral, BR-304 e SUS com Diagnósticos Online (Alinhado a Mãe Luíza)\n• Álvaro Dias (PL · 22): 29% — Choque de eficiência e não aumento de impostos\n\n«Fonte: TSE / DivulgaCandContas\nData: 06/10/2026\nTipo: Informação oficial\nStatus: Candidaturas e planos registrados»',
      timestamp: 'Agora',
      suggestedActions: [
        'Resumo do Radar de Transparência (Fontes Oficiais TSE x Relatos)',
        'Comparar propostas do 2º turno RN (Allyson 44 x Cadu de Lula 13)',
        'Onde está meu local de votação e qual documento levar?',
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isBotLoading, setIsBotLoading] = useState<boolean>(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState<boolean>(true);

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

  // Handle voting in the 2º Turno Poll
  const votarSegundoTurno = async (opcaoId: string) => {
    if (userPollVote === opcaoId) return;

    try {
      const ops = platformData.enqueteSegundoTurno.opcoes;
      const jaVotou = userPollVote !== null;
      
      const novasOpcoes = ops.map((op) => {
        if (op.id === opcaoId) {
          return { ...op, votos: op.votos + 1 };
        }
        if (jaVotou && op.id === userPollVote) {
          return { ...op, votos: Math.max(0, op.votos - 1) };
        }
        return op;
      });

      const novoTotal = novasOpcoes.reduce((acc, item) => acc + item.votos, 0);
      const novosVotosAllyson = novasOpcoes.find((o) => o.id === 'allyson-bezerra')?.votos ?? 0;
      const novosVotosCadu = novasOpcoes.find((o) => o.id === 'cadu-xavier')?.votos ?? 0;

      await updateDoc(doc(db, 'enquete', 'resultado'), {
        totalVotos: novoTotal,
        votosAllyson: novosVotosAllyson,
        votosCadu: novosVotosCadu,
        votosPaulinho: novosVotosAllyson,
        votosNatalia: novosVotosCadu,
      });

      setUserPollVote(opcaoId);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'enquete/resultado');
    }
  };

  // Save custom affiliate link for any item
  const salvarLinkAfiliado = (targetId: string) => {
    const cleanUrl = tempAffiliateUrl.trim() || 'AGUARDANDO_SEU_LINK';
    const cleanProd = tempAffiliateProduct.trim() || 'Oferta Especial de Leitura / Curso';

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
    setTempAffiliateUrl(currentLink === 'AGUARDANDO_SEU_LINK' ? '' : currentLink);
    setTempAffiliateProduct(currentProduct);
  };

  // Sync live stats into WhatsApp Share Text
  const atualizarTextoShareComDadosAoVivo = () => {
    const mobLikes = platformData.agenteIA.noticiasUtilidadePublica[0]?.curtidas ?? 1240;
    const allyson = platformData.candidatos.find((c) => c.id === 'allyson-bezerra');
    const cadu = platformData.candidatos.find((c) => c.id === 'cadu-xavier');
    const enquete = platformData.enqueteSegundoTurno;

    const updated = `☀️ COLINHA POLÍTICA & PANORAMA RN 2026 (PLANTÃO 24H) 🗳️

🏆 2º TURNO GOVERNO DO RN:
• Allyson Bezerra (UNIÃO · 44 - 37%): ${(allyson?.curtidas ?? 5420).toLocaleString('pt-BR')} likes — 3ª Ponte sobre o Rio Potengi e Hospitais Regionais
• Carlos Eduardo Xavier / Cadu de Lula (PT · 13 - 32%): ${(cadu?.curtidas ?? 4980).toLocaleString('pt-BR')} likes — Educação Integral, BR-304 e SUS Online (Mãe Luíza)

🗳️ Simulado 2º Turno RN (${enquete.totalVotos.toLocaleString('pt-BR')} votos):
• ${enquete.opcoes[0].nome}: ${enquete.opcoes[0].votos} votos
• ${enquete.opcoes[1].nome}: ${enquete.opcoes[1].votos} votos

🚌 Passe Livre nos Bairros de Natal e RN (${mobLikes.toLocaleString('pt-BR')} agradecimentos)!
🔏 Plataforma 100% segura dentro da LGPD.`;
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
      const data = await response.json();
      if (data.boletim) {
        setBoletinsIA((prev) => [data.boletim, ...prev]);
      }
    } catch {
      // fallback already handled
    } finally {
      setIsUpdatingBoletim(false);
    }
  };

  // Send message or image to PotiguarBot IA via server-side Gemini endpoint
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

      const data = await response.json();
      const botMsg: StudioChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text:
          data.reply ||
          data.error ||
          'O Passe Livre está confirmado em todas as zonas de Natal e rotas intermunicipais das 06h às 20h.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        moderated: Boolean(data.moderated),
        suggestedActions: data.suggestedActions,
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Serviço em consulta local: O Passe Livre nos bairros de Natal garante catracas liberadas das 06h às 20h no dia de votação.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsBotLoading(false);
    }
  };

  // Submit citizen report on Passe Livre / Elections with real-time LGPD AI moderation & Firestore persistence
  const enviarRelatoCidadao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || isModerating) return;

    setIsModerating(true);
    setModerationFeedback(null);

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

      const data = await response.json();
      if (data.approved) {
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
        setModerationFeedback({
          type: 'success',
          text: `Publicação registrada no banco de dados! ${data.reason || 'Verificado pela Moderação Ativa LGPD.'}`,
        });
      } else {
        setModerationFeedback({
          type: 'error',
          text:
            data.reason ||
            'Relato retido pela Moderação Democrática: conteúdo em desacordo com os termos contra discurso de ódio e LGPD.',
        });
      }
    } catch {
      setModerationFeedback({
        type: 'error',
        text: 'Não foi possível validar o relato no momento. Verifique sua conexão.',
      });
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
      {/* Top Navigation Bar following strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[var(--card-bg)] border-b border-[var(--border-color)] px-4 sm:px-8 py-3.5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#topo"
            className="text-lg sm:text-xl font-semibold tracking-tight text-[var(--text-color)] font-editorial whitespace-nowrap shrink-0"
          >
            Transparência Potiguar
          </a>

          {/* Zone 2: 5 single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
            <a
              href="#colinha-politica-2026"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap font-semibold text-[var(--accent-color)]"
            >
              Colinha RN 2026
            </a>
            <a
              href="#utilidade-publica"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Utilidade Pública
            </a>
            <a
              href="#monitoramento"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Ranking por Bairro
            </a>
            <a
              href="#radar-transparencia"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap font-semibold text-[var(--accent-color)]"
            >
              Radar de Transparência
            </a>
            <a
              href="#potiguar-bot"
              className="hover:text-[var(--text-color)] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              PotiguarBot IA
            </a>
          </nav>

          {/* Zone 3: 2 primary actions (Accessibility Mode Switcher + WhatsApp Share) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={cycleTheme}
              title="Alternar tema de visualização: Claro, Noturno ou Alto Contraste"
              className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {theme === 'light' && (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Noturno</span>
                </>
              )}
              {theme === 'dark-mode' && (
                <>
                  <Contrast className="w-3.5 h-3.5" />
                  <span>Alto Contraste</span>
                </>
              )}
              {theme === 'high-contrast' && (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>Modo Claro</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-semibold transition-transform active:scale-95 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Compartilhar no WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (1200px max-width for 1440px desktop baseline) */}
      <main id="topo" className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* Section 0: Slides das Primeiras Notícias · Atualização em Tempo Real 24h */}
        <PrimeirasNoticiasSlides24h
          boletins={boletinsIA}
          candidatos={platformData.candidatos}
          propostas={propostasTSE}
          isUpdatingBoletim={isUpdatingBoletim}
          onTriggerDailyUpdate={acionarAtualizacaoDiariaIA}
          onAskBot={(prompt) => {
            setIsFloatingChatOpen(true);
            enviarPerguntaBot(prompt);
          }}
        />

        {/* Section 0.5: Colinha Política RN 2026 · Panorama Político do Rio Grande do Norte (Governadores, Deputados, Senadores, Presidente e Mãe Luíza) */}
        <PanoramaPoliticoRN2026Section
          candidatos={platformData.candidatos}
          unlockedAffiliates={unlockedAffiliates}
          onLikeCandidate={curtirEUnlock}
          onOpenAffiliateEditor={abrirEditorAfiliado}
          onAskAgent={(prompt) => {
            setIsFloatingChatOpen(true);
            enviarPerguntaBot(prompt);
          }}
        />

        {/* Section 1: Hero & Alerta de Utilidade Pública (Passe Livre nos Bairros de Natal) */}
        <section id="utilidade-publica" className="space-y-6">
          {/* Editorial Context Kicker (Unboxed metadata with separator) */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-color)] pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--text-color)]">Eleições Rio Grande do Norte</span>
              <span aria-hidden="true">·</span>
              <span>Painel de Utilidade Pública e Monitoramento Cívico</span>
              <span aria-hidden="true">·</span>
              <span className="font-tabular">Versão {platformData.meta.versao}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{platformData.politicaPrivacidade.mensagem}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setJsonModalOpen(true)}
                className="underline hover:text-[var(--text-color)] cursor-pointer whitespace-nowrap"
              >
                Ver Especificação JSON & LGPD
              </button>
            </div>
          </div>

          {/* Focal Anchor: Passe Livre Alert Card + Visual Hero */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] border-l-4 border-l-[var(--accent-color)] rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left 7 columns: Core Public Utility Alert & Like-to-Unlock */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[var(--accent-color)] flex items-center gap-2">
                    <span>Utilidade Pública · Mobilidade Urbana em Natal e Grande Natal</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-color)] leading-tight">
                    Passe Livre nos Bairros de Natal!
                  </h1>

                  <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-[65ch]">
                    {noticiaMobilidade.descricao} Todas as zonas de Natal (Norte, Sul, Leste e Oeste) e linhas
                    metropolitanas operam com isenção tarifária integral para garantir o direito constitucional ao voto.
                  </p>
                </div>

                {/* Primary Interactive Action: Curtir e Desbloquear Oferta de Afiliado */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => curtirEUnlock('mobilidade')}
                      className="px-5 py-2.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold text-sm inline-flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span>
                        Agradecer Mobilidade (
                        <span id="like-mobilidade" className="font-tabular">
                          {noticiaMobilidade.curtidas.toLocaleString('pt-BR')}
                        </span>
                        )
                      </span>
                    </button>

                    <span className="text-xs text-[var(--text-muted)]">
                      Clique para registrar seu apoio ao Passe Livre e liberar a recomendação parceira.
                    </span>
                  </div>

                  {/* Ofertador de Afiliado Bloqueado / Liberado */}
                  {unlockedAffiliates['mobilidade'] && (
                    <div
                      id="affiliate-mobilidade"
                      className="pt-4 border-t border-dashed border-[var(--success-color)] bg-[var(--success-bg)] p-4 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[var(--success-color)] m-0">
                          Like registrado! Oferta Especial de Afiliado Liberada:
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            abrirEditorAfiliado(
                              'mobilidade',
                              noticiaMobilidade.linkAfiliado,
                              noticiaMobilidade.produtoRecomendado
                            )
                          }
                          className="text-xs underline text-[var(--text-muted)] hover:text-[var(--text-color)] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Configurar Link</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {noticiaMobilidade.linkAfiliado !== 'AGUARDANDO_SEU_LINK' ? (
                          <a
                            id="link-afiliado-mobilidade"
                            href={noticiaMobilidade.linkAfiliado}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 no-underline whitespace-nowrap"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Ver Produto Recomendado: {noticiaMobilidade.produtoRecomendado}</span>
                          </a>
                        ) : (
                          <button
                            id="link-afiliado-mobilidade"
                            type="button"
                            onClick={() =>
                              abrirEditorAfiliado(
                                'mobilidade',
                                noticiaMobilidade.linkAfiliado,
                                noticiaMobilidade.produtoRecomendado
                              )
                            }
                            className="px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Ver Produto Recomendado (Aguardando seu link · Clique para definir)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right 5 columns: Natal/RN Editorial Photography with Measured Scrim & Fallback */}
              <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-slate-900 overflow-hidden flex items-end">
                {!heroImgError ? (
                  <img
                    src={natalHeroImg}
                    alt="Vista urbana de Natal, Rio Grande do Norte, com transporte público e Ponte Newton Navarro"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
                    <Bus className="w-16 h-16 text-blue-400/40" />
                  </div>
                )}
                <div className="relative z-10 w-full p-6 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white space-y-1.5">
                  <div className="text-xs font-mono text-amber-300">
                    Operação Eleições RN · 06h00 às 20h00
                  </div>
                  <p className="text-sm font-semibold leading-snug">
                    Catracas Liberadas em Natal e Região Metropolitana
                  </p>
                  <p className="text-xs text-slate-200">
                    Zonas Norte, Sul, Leste, Oeste e linhas intermunicipais com frota reforçada.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Neighborhood & Bus Lines Table inside the Public Utility Section */}
            <div className="border-t border-[var(--border-color)] p-6 sm:p-8 space-y-4 bg-[var(--surface-subtle)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-color)]">
                    Consulta de Linhas e Bairros com Catraca Liberada
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Selecione sua região de Natal ou Grande Natal para verificar as principais linhas gratuitas
                  </p>
                </div>

                {/* Interactive Segmented Filter Controls */}
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
                  {['Todas', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Intermunicipal (Grande Natal)'].map(
                    (zona) => (
                      <button
                        key={zona}
                        type="button"
                        onClick={() => setSelectedZona(zona)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          selectedZona === zona
                            ? 'bg-[var(--accent-color)] text-white'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                        }`}
                      >
                        {zona === 'Intermunicipal (Grande Natal)' ? 'Intermunicipal' : zona}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                      <th className="py-3 px-4 font-semibold">Região / Zona</th>
                      <th className="py-3 px-4 font-semibold">Bairros e Corredores Atendidos</th>
                      <th className="py-3 px-4 font-semibold">Linhas Principais</th>
                      <th className="py-3 px-4 font-semibold text-right">Horário & Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {rotasFiltradas.map((rota) => (
                      <tr key={rota.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[var(--text-color)] whitespace-nowrap">
                          {rota.zona}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">{rota.bairrosAtendidos}</td>
                        <td className="py-3 px-4 font-tabular text-xs text-[var(--text-color)]">
                          {rota.linhasPrincipais}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-tabular text-xs font-semibold text-[var(--success-color)]">
                            {rota.horarioOperacao} · Gratuito
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Ranking de Propostas por Bairro (Google AI Studio JSON) + Simulado 2º Turno (Zero Duplicação de Candidatos) */}
        <section id="monitoramento" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Ranquear Propostas por Bairro (Estrutura JSON para Google AI Studio) */}
          <div className="lg:col-span-7">
            <RankingPropostasBairroSection
              propostas={propostasTSE}
              feedbacks={feedbacksComunidade}
              onLikeProposta={async (propostaId: string) => {
                const propAtual = propostasTSE.find((p) => p.id === propostaId);
                if (!propAtual) return;
                const novoLikes = propAtual.likes + 1;
                setPropostasTSE((prev) =>
                  prev.map((p) => (p.id === propostaId ? { ...p, likes: novoLikes } : p))
                );
                try {
                  await setDoc(doc(db, 'propostasTSE', propostaId), {
                    ...propAtual,
                    likes: novoLikes,
                  });
                } catch (error) {
                  handleFirestoreError(error, OperationType.WRITE, `propostasTSE/${propostaId}`);
                }
              }}
              onAskAgent={(prompt) => {
                setIsFloatingChatOpen(true);
                enviarPerguntaBot(prompt);
              }}
            />
          </div>

          {/* Right 5 Columns: Simulado de Preferência - 2º Turno (Natal/RN) com Gráfico Dinâmico Recharts */}
          <div id="segundo-turno" className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
              <div className="space-y-2 border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--success-color)]">
                    Enquete Interativa · Status: {platformData.enqueteSegundoTurno.status.toUpperCase()}
                  </span>
                  <span className="font-tabular">
                    Total: {platformData.enqueteSegundoTurno.totalVotos.toLocaleString('pt-BR')} votos
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-[var(--text-color)]">
                  {platformData.enqueteSegundoTurno.titulo}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Visualização comparativa dinâmica da diferença de votos entre os candidatos em Natal.
                </p>
              </div>

              {/* Dynamic Bar Chart using Recharts */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text-color)]">
                    Gráfico Comparativo de Votos (Tempo Real)
                  </span>
                  <span className="font-tabular">
                    Diferença: <strong className="text-[var(--text-color)]">{pollDiffMetrics.diffVotos.toLocaleString('pt-BR')} votos</strong> ({pollDiffMetrics.diffPct} p.p.)
                  </span>
                </div>

                <div className="w-full h-56 pt-2 pb-1 px-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pollChartData}
                      layout="vertical"
                      margin={{ top: 12, right: 85, left: 10, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="var(--border-color)"
                      />
                      <XAxis
                        type="number"
                        domain={[0, 'dataMax + 150']}
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        stroke="var(--border-color)"
                      />
                      <YAxis
                        type="category"
                        dataKey="nomeCurto"
                        width={118}
                        tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-color)' }}
                        stroke="var(--border-color)"
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                        contentStyle={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-color)',
                          fontSize: '12px',
                        }}
                        formatter={(value: any, _name: any, props: any) => [
                          `${Number(value).toLocaleString('pt-BR')} votos (${props.payload.percentual
                            .toFixed(1)
                            .replace('.', ',')}%)`,
                          props.payload.partido,
                        ]}
                      />
                      <Bar dataKey="votos" radius={[0, 6, 6, 0]} barSize={32}>
                        {pollChartData.map((entry) => (
                          <Cell key={entry.id} fill={entry.cor} />
                        ))}
                        <LabelList
                          dataKey="labelFormatado"
                          position="right"
                          style={{
                            fill: 'var(--text-color)',
                            fontSize: 11,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
                  <span>Liderança no simulado:</span>
                  <span className="font-semibold text-[var(--text-color)] font-tabular">
                    {pollDiffMetrics.lider}
                  </span>
                </div>
              </div>

              {/* Interactive Poll Candidate Cards with Official Photos */}
              <div className="space-y-3.5">
                {platformData.enqueteSegundoTurno.opcoes.map((opcao) => {
                  const total = Math.max(1, platformData.enqueteSegundoTurno.totalVotos);
                  const pct = ((opcao.votos / total) * 100).toFixed(1);
                  const isSelected = userPollVote === opcao.id;
                  const stage = candidateImgStage[`poll-${opcao.id}`] ?? 0;
                  const pollImgSrc =
                    stage === 0 ? opcao.fotoOficial : stage === 1 ? opcao.fotoFallbackUrl : null;

                  return (
                    <div
                      key={opcao.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-[var(--accent-color)] bg-[var(--surface-subtle)]'
                          : 'border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--surface-subtle)] shrink-0">
                            {pollImgSrc ? (
                              <img
                                src={pollImgSrc}
                                alt={`Foto oficial de ${opcao.nome}`}
                                referrerPolicy="no-referrer"
                                onError={() => handleCandidateImgError(`poll-${opcao.id}`)}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-xs font-semibold">
                                {opcao.nome.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-base text-[var(--text-color)]">
                              {opcao.nome}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {opcao.partido} · Foto: {opcao.fonteFotoOficial}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-tabular shrink-0">
                          <div className="text-lg font-semibold text-[var(--text-color)]">
                            {pct.replace('.', ',')}%
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {opcao.votos.toLocaleString('pt-BR')} votos
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => votarSegundoTurno(opcao.id)}
                        className={`w-full py-2 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-[var(--success-color)] text-white'
                            : 'bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Voto Registrado no Simulado</span>
                          </>
                        ) : (
                          <>
                            <BarChart3 className="w-4 h-4" />
                            <span>Simular Voto em {opcao.nome}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {userPollVote && (
                <div className="p-3.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center justify-between gap-2">
                  <span>
                    Gráfico atualizado com o seu voto! Deseja compartilhar a parcial no WhatsApp?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      atualizarTextoShareComDadosAoVivo();
                      setShareModalOpen(true);
                    }}
                    className="font-semibold text-[var(--accent-color)] underline cursor-pointer whitespace-nowrap"
                  >
                    Compartilhar Parcial
                  </button>
                </div>
              )}
            </div>

            {/* Governance & LGPD Moderation Status Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-color)]">
                <ShieldCheck className="w-4 h-4 text-[var(--success-color)] shrink-0" />
                <span>Conformidade Democrática & LGPD</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {platformData.politicaPrivacidade.termoUso} Nenhum dado pessoal sensível é rastreado ou comercializado.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] border-t border-[var(--border-color)]">
                <span>LGPD: Ativo</span>
                <span aria-hidden="true">·</span>
                <span>Moderação IA: Ativa</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={restaurarDadosIniciais}
                  className="underline hover:text-[var(--text-color)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Contadores Originais</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2.5: Agente de Monitoramento Eleitoral 24h (Planos TSE 2º Turno, Transição de Governo, Afinidade, Anti-Desinformação e Feedback da Comunidade) */}
        <SegundoTurnoMonitor24h
          propostas={propostasTSE}
          onLikeProposta={ async (propostaId: string) => {
            const propAtual = propostasTSE.find((p) => p.id === propostaId);
            if (!propAtual) return;
            const novoLikes = propAtual.likes + 1;
            setPropostasTSE((prev) =>
              prev.map((p) => (p.id === propostaId ? { ...p, likes: novoLikes } : p))
            );
            try {
              await setDoc(doc(db, 'propostasTSE', propostaId), {
                ...propAtual,
                likes: novoLikes,
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `propostasTSE/${propostaId}`);
            }
          }}
          feedbacks={feedbacksComunidade}
          onSubmitFeedback={async (novo) => {
            const docData = {
              ...novo,
              apoios: 1,
              horario: `Terça-feira, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
              status: `Vinculado ao Eixo Prioritário: ${novo.eixo}`,
            };
            setFeedbacksComunidade((prev) => [{ id: `fb-${Date.now()}`, ...docData }, ...prev]);
            try {
              await addDoc(collection(db, 'feedbacksComunidade'), docData);
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, 'feedbacksComunidade');
            }
          }}
          onApoiarFeedback={async (feedbackId: string) => {
            const item = feedbacksComunidade.find((f) => f.id === feedbackId);
            if (!item) return;
            const novosApoios = item.apoios + 1;
            setFeedbacksComunidade((prev) =>
              prev.map((f) => (f.id === feedbackId ? { ...f, apoios: novosApoios } : f))
            );
            try {
              await setDoc(doc(db, 'feedbacksComunidade', feedbackId), {
                autor: item.autor,
                bairro: item.bairro,
                eixo: item.eixo,
                necessidade: item.necessidade,
                apoios: novosApoios,
                horario: item.horario,
                status: item.status,
              });
            } catch {
              // local update already applied
            }
          }}
          onAskAgentAnalysis={(prompt) => {
            setIsFloatingChatOpen(true);
            enviarPerguntaBot(prompt);
          }}
        />

        {/* Section 2.8: Radar de Transparência Cívica e Eleitoral (Consolidação TSE, Propostas, Relatos Cidadãos, Avaliações e Análises IA) */}
        <RadarTransparenciaSection
          candidatos={platformData.candidatos}
          avaliacoes={avaliacoes}
          relatos={relatos}
          feedbacks={feedbacksComunidade}
          propostas={propostasTSE}
          boletins={boletinsIA}
          onAskPotiguarBot={(prompt) => {
            setIsFloatingChatOpen(true);
            enviarPerguntaBot(prompt);
          }}
        />

        {/* Section 3: Busca de Local de Votação por Seção Integrada ao PotiguarBot IA + Enquete de Benefícios */}
        <CivicModulesSection
          candidatos={platformData.candidatos}
          boletins={boletinsIA}
          avaliacoes={avaliacoes}
          isUpdatingBoletim={isUpdatingBoletim}
          onTriggerDailyUpdate={acionarAtualizacaoDiariaIA}
          onSubmitAvaliacao={registrarAvaliacaoCompleta}
          chatMessages={chatMessages}
          isBotLoading={isBotLoading}
          onConsultSecaoInBot={(resultado) => {
            const horarioAtual = new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const userSecaoMsg: StudioChatMessage = {
              id: `user-secao-${Date.now()}`,
              sender: 'user',
              text: `Qual é o meu colégio eleitoral, horário sugerido e data para votar na Seção nº ${resultado.numeroSecao}?`,
              timestamp: horarioAtual,
            };
            const botSecaoMsg: StudioChatMessage = {
              id: `bot-secao-${Date.now() + 1}`,
              sender: 'bot',
              text: resultado.mensagemBotFormatada,
              timestamp: horarioAtual,
              suggestedActions: [
                `Quais linhas de ônibus gratuitas atendem o ${resultado.colegioEleitoral}?`,
                'Comparar propostas do 2º turno RN (Allyson 44 x Cadu de Lula 13)',
              ],
            };
            setChatMessages((prev) => [...prev, userSecaoMsg, botSecaoMsg]);
            setIsFloatingChatOpen(true);
          }}
          onAskBotAboutSection={(prompt) => {
            setIsFloatingChatOpen(true);
            enviarPerguntaBot(prompt);
          }}
        />

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

        {/* Section 4: Central de Monetização & Configuração de Links de Afiliado */}
        <section id="afiliados" className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-color)]">
                Gestão de Links de Afiliado (Like-to-Unlock)
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Substitua o marcador <code className="font-mono">AGUARDANDO_SEU_LINK</code> pelos seus links reais de afiliado para cada card da plataforma.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setJsonModalOpen(true)}
              className="px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start"
            >
              <FileJson className="w-4 h-4" />
              <span>Exportar JSON Atualizado</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                  <th className="py-3 px-4 font-semibold">Card / Posição</th>
                  <th className="py-3 px-4 font-semibold">Produto Recomendado</th>
                  <th className="py-3 px-4 font-semibold">Link de Afiliado Configurado</th>
                  <th className="py-3 px-4 font-semibold text-right">Curtidas</th>
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {/* Row 1: Passe Livre Mobilidade */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-[var(--text-color)]">
                    Passe Livre nos Bairros de Natal
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                    {noticiaMobilidade.produtoRecomendado}
                  </td>
                  <td className="py-3 px-4 font-tabular text-xs text-[var(--text-muted)] truncate max-w-[240px]">
                    {noticiaMobilidade.linkAfiliado}
                  </td>
                  <td className="py-3 px-4 font-tabular text-right font-semibold">
                    {noticiaMobilidade.curtidas.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        abrirEditorAfiliado(
                          'mobilidade',
                          noticiaMobilidade.linkAfiliado,
                          noticiaMobilidade.produtoRecomendado
                        )
                      }
                      className="text-xs font-semibold text-[var(--accent-color)] underline cursor-pointer"
                    >
                      Configurar
                    </button>
                  </td>
                </tr>

                {/* Rows for Candidates */}
                {platformData.candidatos.map((cand) => (
                  <tr key={cand.id}>
                    <td className="py-3 px-4 font-semibold text-[var(--text-color)]">
                      {cand.nome}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                      {cand.produtoRecomendado}
                    </td>
                    <td className="py-3 px-4 font-tabular text-xs text-[var(--text-muted)] truncate max-w-[240px]">
                      {cand.linkAfiliado}
                    </td>
                    <td className="py-3 px-4 font-tabular text-right font-semibold">
                      {cand.curtidas.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          abrirEditorAfiliado(cand.id, cand.linkAfiliado, cand.produtoRecomendado)
                        }
                        className="text-xs font-semibold text-[var(--accent-color)] underline cursor-pointer"
                      >
                        Configurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--card-bg)] py-6 px-4 sm:px-8 mt-12">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div>
            <strong>{platformData.meta.plataforma}</strong> · Versão {platformData.meta.versao} · Natal, Rio Grande do Norte
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setJsonModalOpen(true)}
              className="hover:text-[var(--text-color)] underline cursor-pointer"
            >
              Política LGPD & JSON v2.1.0
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
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  URL de Afiliado (https://...)
                </label>
                <input
                  type="url"
                  value={tempAffiliateUrl}
                  onChange={(e) => setTempAffiliateUrl(e.target.value)}
                  placeholder="https://seu-link-de-afiliado.com.br"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-sm text-[var(--text-color)] font-mono"
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Deixe em branco para manter o status padrão <code>AGUARDANDO_SEU_LINK</code>.
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
      {/* Offline Connectivity Indicator for PWA */}
      <OfflineIndicator />
    </div>
  );
}
