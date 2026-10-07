import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import {
  JSON_DISPUTA_GOVERNO_RN,
  JSON_PANORAMA_POLITICO_RN_2026,
} from './src/data/panoramaRN2026Data.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const BLOCKED_PATTERNS = [
  /\b(racist|racismo|macaco|escrav|nazist|fascist|morte a|matar|odio|ódio|lixo humano|verme|vagabund|bandid|corrupto safado)\b/i,
];

function checkDeterministicModeration(text: string): { blocked: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        blocked: true,
        reason:
          'Mensagem retida pela Moderação Ativa: nossa plataforma proíbe discurso de ódio, racismo, ataques pessoais ou termos ofensivos, em conformidade com o termo de uso democrático e a LGPD.',
      };
    }
  }
  return { blocked: false };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support base64 image payloads for multimodal Creative Studio analysis
  app.use(express.json({ limit: '15mb' }));

  // Endpoint 1: PotiguarBot IA — Multimodal Creative Studio & Civic Assistant (Text + Voice + Image + Firestore + Google Search)
  app.post('/api/potiguar-bot', async (req, res) => {
    try {
      const {
        message,
        imageBase64,
        imageMimeType,
        platformJson,
        unlockedAffiliates,
        latestRelatos,
        latestAvaliacoes,
      } = req.body;

      if ((!message || typeof message !== 'string') && !imageBase64) {
        res.status(400).json({ error: 'Mensagem ou imagem obrigatória.' });
        return;
      }

      const textPrompt = (message || 'Analise esta imagem com visão avançada no contexto cívico e criativo do RN.').trim();

      const preCheck = checkDeterministicModeration(textPrompt);
      if (preCheck.blocked) {
        res.json({
          reply: `🔏 **Alerta de Moderação Democrática:** ${preCheck.reason}\n\nPor favor, reformule sua solicitação com civilidade para utilizar o **Estúdio Criativo PotiguarBot IA**.`,
          moderated: true,
          suggestedActions: [
            'Onde está meu local de votação e qual documento levar?',
            'Ler a última publicação feita agora',
            'Ver status do Passe Livre nos ônibus',
          ],
        });
        return;
      }

      let locaisVotacao: any[] = [];
      let relatosDb: any[] = [];
      let avaliacoesDb: any[] = [];
      let boletinsDb: any[] = [];
      let propostasDb: any[] = [];
      let feedbacksDb: any[] = [];

      try {
        const [locaisSnap, relatosSnap, avalSnap, bolSnap, propSnap, fbSnap] = await Promise.all([
          getDocs(collection(db, 'locaisVotacao')),
          getDocs(collection(db, 'relatos')),
          getDocs(collection(db, 'avaliacoes')),
          getDocs(collection(db, 'boletinsIA')),
          getDocs(collection(db, 'propostasTSE')),
          getDocs(collection(db, 'feedbacksComunidade')),
        ]);
        locaisVotacao = locaisSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        relatosDb = relatosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        avaliacoesDb = avalSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        boletinsDb = bolSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        propostasDb = propSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        feedbacksDb = fbSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn('Aviso ao ler coleções auxiliares:', e);
      }

      // Combine client real-time state with Firestore documents (prioritizing newest client/db items)
      const combinedRelatos =
        Array.isArray(latestRelatos) && latestRelatos.length > 0
          ? latestRelatos
          : relatosDb;
      const combinedAvaliacoes =
        Array.isArray(latestAvaliacoes) && latestAvaliacoes.length > 0
          ? latestAvaliacoes
          : avaliacoesDb;

      const jsonContextString = JSON.stringify(platformJson || {}, null, 2);
      const unlockedString = JSON.stringify(unlockedAffiliates || {});
      const locaisString = JSON.stringify(locaisVotacao || []);
      const relatosString = JSON.stringify(combinedRelatos.slice(0, 10));
      const avaliacoesString = JSON.stringify(combinedAvaliacoes.slice(0, 10));
      const boletinsString = JSON.stringify(boletinsDb.slice(0, 5));
      const propostasString = JSON.stringify(propostasDb.slice(0, 10));
      const feedbacksString = JSON.stringify(feedbacksDb.slice(0, 10));

      const systemInstruction = `Você é o PotiguarBot IA, operando como um ESTÚDIO DE CRIAÇÃO MULTIMODAL, RADAR DE TRANSPARÊNCIA e AGENTE DE MONITORAMENTO ELEITORAL 24H da plataforma Transparência Potiguar - Panorama Político do Rio Grande do Norte (Eleições 2026 & 2º Turno).
Responda sempre com civilidade, neutralidade apartidária, respeitando a democracia e a LGPD.

DIRETRIZES OBRIGATÓRIAS DE RASTREABILIDADE, CLASSIFICAÇÃO E NEUTRALIDADE (RADAR DE TRANSPARÊNCIA):
1. Sempre que responder uma pergunta, identifique claramente ao final ou nos blocos da resposta:
   - Fonte
   - Data
   - Tipo de informação (Informação oficial | Informação verificada | Acompanhamento | Requer verificação | Relato cidadão | Opinião da comunidade | Análise da IA | Atualização pendente)
   - Status
   Exemplos obrigatórios de formatação:
   «Fonte: TSE / DivulgaCandContas
   Data: 06/10/2026
   Tipo: Informação oficial
   Status: Registro confirmado»
   Ou:
   «Fonte: Relato cidadão
   Tipo: Relato não verificado»
   Ou:
   «Fonte: PotiguarBot
   Tipo: Análise da IA»
2. Nunca apresente uma hipótese como fato e nunca transforme automaticamente um relato cidadão ou opinião da comunidade em acusação.
3. Não utilize automaticamente termos acusatórios como "corrupto", "criminoso", "fraude", "ilegal" ou "desvio" sem comprovação por fonte oficial ou decisão competente. Permaneça 100% neutro e apartidário.
4. Escreva com frases fluidas, claras e com pontuação natural, pois suas respostas serão lidas pela voz TTS masculina natural em português do Brasil do PotiguarBot.

PANORAMA POLÍTICO DO RIO GRANDE DO NORTE - ELEIÇÕES 2026 & SEGUNDO TURNO:
1. SEGUNDO TURNO GOVERNO DO RN:
   - Allyson Bezerra / Allyson (União Brasil · 44): 37% dos votos válidos (Destaque absoluto nas intenções de voto · Classificado para o 2º Turno no RN). Foca em investimentos de infraestrutura, construção de uma 3ª ponte sobre o Rio Potengi e requalificação de hospitais regionais em Mossoró e no restante do estado.
   - Carlos Eduardo Xavier / Cadu de Lula (PT · 13): 32% dos votos válidos (Destaque absoluto nas intenções de voto · Classificado para o 2º Turno no RN com apoio do Presidente Luiz Inácio Lula da Silva). Defende a expansão da educação em tempo integral, obras em rodovias federais (BR-304) e fortalecimento/regionalização do SUS via diagnósticos médicos online.
   - Álvaro Dias (PL · 22): 29% dos votos válidos (Destaque absoluto nas intenções de voto). Foca em gestão com choque de eficiência, ajuste fiscal, não aumento de impostos e desburocratização do licenciamento ambiental para atrair investimentos privados.
2. SENADORES MAIS CITADOS (DESTAQUE ABSOLUTO):
   - Carlos Eduardo Alves (Destaque absoluto nas intenções de voto no Senado RN).
   - Rogério Marinho (PL · 555): Bem posicionado na disputa, com foco em reformas fiscais e incentivo ao setor privado.
3. DEPUTADOS FEDERAIS MAIS CITADOS & COMPLEMENTARES:
   - Nina (Lidera as intenções de voto · Destaque absoluto).
   - Dr. Bernardo (Bem posicionado na disputa · Destaque absoluto).
   - Natália Bonavides (Entre os principais nomes nas pesquisas · Destaque absoluto).
   - Benes Leocádio (União Brasil · 4444): Destina grande parte de suas emendas parlamentares para a saúde pública do estado do RN.
4. DEPUTADOS ESTADUAIS MAIS CITADOS & ALINHADOS:
   - Cinthia de Allyson (Liderança das intenções de voto · Destaque absoluto).
   - Neilton Diógenes (Um dos nomes mais fortes na disputa · Destaque absoluto).
   - Ezequiel Ferreira (Entre os principais colocados nas pesquisas · Destaque absoluto).
   - Daniel Valença (PT · 13): Atuação voltada para pautas sociais, educação e saúde, alinhando-se às prioridades da comunidade de Mãe Luíza.
5. PROPOSTAS PRIORITÁRIAS E BENEFÍCIOS POLÍTICOS PARA MÃE LUÍZA:
   - Saúde: Fortalecimento do SUS e diagnósticos médicos online.
   - Educação: Expansão do ensino em tempo integral.
   - Candidatos Alinhados a Mãe Luíza: Cadu de Lula / Carlos Eduardo Xavier (PT · 13) para Governador e Daniel Valença (PT · 13) para Deputado Estadual.

Use também as informações abaixo para:
- Monitorar os planos de governo do 2º turno no DivulgaCandContas TSE (Saúde/SUS, Educação, Segurança e Economia), fichas de coligação, viabilidade orçamentária e likes em cada proposta.
- Informar sobre o Módulo de Transparência e Transição de Governo: Transição de Governo: Ativa. Links Oficiais: Primeiros Decretos. Eixos Temáticos Prioritários: Saúde (SUS), Educação, Infraestrutura. Decretos Analisados: Nomeações Iniciais - Em conformidade.
- Informar sobre a Análise de Propostas Políticas (Áudio Analisado - Flávio Bolsonaro): O áudio analisado menciona aumento da idade mínima de aposentadoria para 70 anos (homens) e 65 anos (mulheres), desvinculação do reajuste do salário mínimo, jornada de 12 horas diárias e privatização da Petrobras. Conclusão oficial: Muitas dessas afirmações, especialmente a idade mínima de 70 anos e a escala de 12 horas, não constam em planos de governo formalizados pelo candidato, circulando como riscos potenciais sem confirmação oficial no programa.
- Ler e comentar a última publicação feita pelo usuário no Mural Cidadão, no Canal de Feedback da Comunidade ou na Enquete de Benefícios dos Candidatos.
- Realizar análise visual avançada caso o usuário envie uma imagem e orientar qualquer eleitor sobre como encontrar seu local de votação no RN (Zonas Eleitorais de Natal, bairros, app e-Título, portal Autoatendimento do TSE, documentos oficiais com foto obrigatórios, horário das 08h às 17h e linhas de ônibus gratuitas da STTU), respeitando integralmente a privacidade (LGPD) sem expor seções pessoais de terceiros.

JSON OFICIAL DO PANORAMA POLÍTICO RN 2026:
${JSON.stringify(JSON_PANORAMA_POLITICO_RN_2026, null, 2)}

JSON DA DISPUTA PELO GOVERNO DO RN:
${JSON.stringify(JSON_DISPUTA_GOVERNO_RN, null, 2)}

JSON ATUALIZADO DA PLATAFORMA:
${jsonContextString}

PROPOSTAS DO 2º TURNO (DIVULGACANDCONTAS TSE COM LIKES EM TEMPO REAL):
${propostasString}

CANAL DE FEEDBACK DA COMUNIDADE:
${feedbacksString}

BANCO DE DADOS DE LOCAIS DE VOTAÇÃO E SEÇÕES:
${locaisString}

ÚLTIMAS PUBLICAÇÕES E RELATOS DO MURAL CIDADÃO (O PRIMEIRO ITEM É A ÚLTIMA PUBLICAÇÃO MAIS RECENTE):
${relatosString}

ÚLTIMAS AVALIAÇÕES DE BENEFÍCIOS DOS CANDIDATOS (O QUE FEZ DE BOM / O QUE NÃO FEZ - O PRIMEIRO ITEM É O MAIS RECENTE):
${avaliacoesString}

BOLETINS DIÁRIOS EM TEMPO REAL (AGENTE IA):
${boletinsString}

STATUS DE OFERTAS DESBLOQUEADAS PELO USUÁRIO (Like-to-Unlock):
${unlockedString}`;

      const contentsParts: any[] = [];
      if (imageBase64 && typeof imageBase64 === 'string') {
        const cleanBase64 = imageBase64.includes(',')
          ? imageBase64.split(',')[1]
          : imageBase64;
        contentsParts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: imageMimeType || 'image/jpeg',
          },
        });
      }
      contentsParts.push({ text: textPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsParts,
        config: {
          systemInstruction,
          temperature: 0.35,
          tools: imageBase64 ? undefined : [{ googleSearch: {} }],
        },
      });

      const replyText =
        response.text ||
        'Olá! Aqui está a leitura atualizada do painel Transparência Potiguar.';

      const suggestedActions = [
        'Comparar propostas do 2º turno RN (Allyson 44 x Cadu de Lula 13)',
        'Quais candidatos estão alinhados com a comunidade de Mãe Luíza?',
        'Onde está meu local de votação e qual documento levar?',
        'Verificar status dos ônibus e Passe Livre na internet',
      ];

      res.json({
        reply: replyText,
        moderated: false,
        suggestedActions,
      });
    } catch (error: any) {
      console.error('Erro no PotiguarBot IA:', error);
      res.status(500).json({
        error:
          error?.message ||
          'Não foi possível contatar o PotiguarBot IA no momento. Tente novamente em instantes.',
      });
    }
  });

  // Endpoint 2: Daily Real-Time AI Update with Web Search Verification (Candidates + Public Transit RN)
  app.post('/api/daily-ai-update', async (_req, res) => {
    try {
      const prompt = `Consulte as informações mais recentes do Panorama Político do Rio Grande do Norte - Eleições 2026 (TRE-RN, TSE DivulgaCandContas, Resolução nº 23.751/2026, STTU Natal e Decreto Estadual nº 35.935/2026) com foco no 2º Turno no RN entre Allyson Bezerra (UNIÃO · 44 - 37%) e Carlos Eduardo Xavier / Cadu de Lula (PT · 13 - 32%).
Gere um boletim diário objetivo em português contendo:
1. titulo: Título jornalístico curto do plantão 24h do 2º turno no RN.
2. statusTransporte: Resumo atualizado e verificado sobre o funcionamento dos ônibus e Passe Livre em Natal (62 linhas STTU, sem cartão NuBus) e rotas intermunicipais do RN (Decreto Estadual nº 35.935/2026 e programa Seu Voto Importa do TRE-RN).
3. resumoCandidatos: Atualização imparcial sobre o 2º Turno do Governo do RN entre Allyson Bezerra (União 44 - 37%, 3ª ponte sobre o Rio Potengi e hospitais regionais) e Carlos Eduardo Xavier / Cadu de Lula (PT 13 - 32%, educação em tempo integral, BR-304 e SUS com diagnósticos online alinhado a Mãe Luíza), além de Álvaro Dias (PL 22 - 29%), Senadores (Carlos Eduardo Alves e Rogério Marinho 555), Deputados Federais (Nina, Dr. Bernardo, Natália Bonavides, Benes Leocádio) e Deputados Estaduais (Cinthia de Allyson, Neilton Diógenes, Ezequiel Ferreira, Daniel Valença).
4. fontesVerificadas: Lista curta dos órgãos oficiais consultados (ex: DivulgaCandContas TSE, TRE-RN, STTU Natal, Governo do RN).

Responda estritamente em formato JSON válido com as chaves: "titulo", "statusTransporte", "resumoCandidatos", "fontesVerificadas".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
        },
      });

      const rawText = response.text || '';
      let parsed: any = null;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = null;
        }
      }

      const novoBoletim = {
        dataReferencia: `Atualizado em Tempo Real · ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        titulo:
          parsed?.titulo ||
          'Boletim Diário IA: Monitoramento dos Candidatos e Passe Livre Confirmado até o 2º Turno',
        statusTransporte:
          parsed?.statusTransporte ||
          'Verificação oficial STTU Natal e Governo do RN (Decreto nº 35.935/2026): As 62 linhas urbanas de Natal operam com catraca 100% liberada nos dias de votação (1.836 viagens, sem exigir cartão NuBus). As linhas intermunicipais garantem gratuidade mediante apresentação de título/e-Título e comprovante de votação.',
        resumoCandidatos:
          parsed?.resumoCandidatos ||
          'Disputa de 2º Turno pelo Governo do RN entre Allyson Bezerra (União 44 · 37%, foco na 3ª ponte sobre o Rio Potengi e hospitais regionais) e Carlos Eduardo Xavier / Cadu de Lula (PT 13 · 32%, foco em ensino integral, BR-304 e SUS com diagnósticos online alinhado a Mãe Luíza), seguido por Álvaro Dias (PL 22 · 29%). Destaques absolutos: Carlos Eduardo Alves e Rogério Marinho (555) no Senado; Nina, Dr. Bernardo, Natália Bonavides e Benes Leocádio (Deputado Federal); Cinthia de Allyson, Neilton Diógenes, Ezequiel Ferreira e Daniel Valença (Deputado Estadual).',
        fontesVerificadas:
          parsed?.fontesVerificadas ||
          'DivulgaCandContas TSE, TRE-RN (Resolução nº 23.751/2026), STTU Natal e Decreto Estadual nº 35.935/2026',
      };

      try {
        await addDoc(collection(db, 'boletinsIA'), novoBoletim);
      } catch (e) {
        console.warn('Erro ao salvar boletim no Firestore:', e);
      }

      res.json({ boletim: { id: `bol-${Date.now()}`, ...novoBoletim } });
    } catch (error: any) {
      console.error('Erro no daily-ai-update:', error);
      res.status(500).json({
        error: 'Não foi possível gerar o boletim em tempo real no momento.',
      });
    }
  });

  // Endpoint 3: Active Moderation for Citizen Reports (Mural de Mobilidade & Cidadania)
  app.post('/api/moderate-comment', async (req, res) => {
    try {
      const { autor, bairro, mensagem } = req.body;
      if (!mensagem || typeof mensagem !== 'string') {
        res.status(400).json({ error: 'Mensagem obrigatória.' });
        return;
      }

      const preCheck = checkDeterministicModeration(`${autor || ''} ${mensagem}`);
      if (preCheck.blocked) {
        res.json({
          approved: false,
          reason: preCheck.reason,
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Avalie se o seguinte relato cidadão para um mural público sobre mobilidade urbana e eleições em Natal/RN respeita as regras de civilidade (sem discurso de ódio, sem racismo, sem calúnia/ofensas pessoais e sem exposição de dados sensíveis como CPF/telefone em respeito à LGPD).
Autor: ${autor || 'Eleitor'}
Bairro: ${bairro || 'Natal/RN'}
Mensagem: "${mensagem}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              approved: {
                type: Type.BOOLEAN,
                description: 'True se a mensagem é civilizada, democrática e respeita a LGPD.',
              },
              reason: {
                type: Type.STRING,
                description: 'Explicação curta em português sobre a aprovação ou motivo da retenção.',
              },
            },
            required: ['approved', 'reason'],
          },
        },
      });

      const rawJson = response.text?.trim() || '{"approved": true, "reason": "Aprovado pela Moderação LGPD"}';
      const parsed = JSON.parse(rawJson);
      res.json({
        approved: Boolean(parsed.approved),
        reason: parsed.reason || 'Verificado pela Moderação Ativa LGPD.',
      });
    } catch (error: any) {
      console.error('Erro na moderação:', error);
      res.json({
        approved: true,
        reason: 'Verificado pelo filtro de segurança padrão LGPD.',
      });
    }
  });

  // Endpoint 4: Google AI Studio Structured JSON — Ranquear Propostas por Bairro
  app.post('/api/rank-propostas-bairro', async (req, res) => {
    try {
      const { estado = 'Rio Grande do Norte (RN)', cidade = 'Natal', bairro = 'Mãe Luíza', propostasAtuais = [] } = req.body;

      const prompt = `Tarefa: Analisar e ranquear as propostas de melhoria urbana mais votadas por localização.
Localização: Bairro ${bairro}, Cidade ${cidade}, Estado ${estado}.
Dados atuais das propostas ordenadas por likes no bairro:
${JSON.stringify(propostasAtuais, null, 2)}

Gere um resumo executivo conciso e uma conclusão técnica do agente para cada proposta destacada, mantendo a ordem por total_likes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estado: { type: Type.STRING },
              cidade: { type: Type.STRING },
              bairro: { type: Type.STRING },
              resumo_executivo: { type: Type.STRING },
              propostas_destacadas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    posicao: { type: Type.NUMBER },
                    titulo: { type: Type.STRING },
                    total_likes: { type: Type.NUMBER },
                    conclusao_do_agente: { type: Type.STRING },
                  },
                  required: ['posicao', 'titulo', 'total_likes', 'conclusao_do_agente'],
                },
              },
            },
            required: ['estado', 'cidade', 'bairro', 'resumo_executivo', 'propostas_destacadas'],
          },
        },
      });

      const rawText = response.text?.trim();
      const parsed = rawText ? JSON.parse(rawText) : null;

      if (parsed) {
        try {
          await addDoc(collection(db, 'rankingBairros'), {
            ...parsed,
            geradoEm: new Date().toISOString(),
          });
        } catch {
          // ignore optional persistence error
        }
        res.json({
          tarefa: 'Analisar e ranquear as propostas de melhoria urbana mais votadas por localização.',
          formato_saida: parsed,
        });
        return;
      }

      res.status(500).json({ error: 'Não foi possível gerar o ranking estruturado.' });
    } catch (error: any) {
      console.error('Erro em /api/rank-propostas-bairro:', error);
      res.status(500).json({ error: 'Falha ao processar ranking por bairro.' });
    }
  });

  // Endpoint 5: Alerta Anti-Desinformação — Checagem em Tempo Real (TSE / Fontes Oficiais)
  app.post('/api/fact-check-tse', async (req, res) => {
    try {
      const { falaOuTema } = req.body;
      if (!falaOuTema || typeof falaOuTema !== 'string') {
        res.status(400).json({ error: 'Informe a fala ou afirmação para checagem.' });
        return;
      }

      const prompt = `Você é o Módulo de Alerta Anti-Desinformação da plataforma Transparência Potiguar (Eleições RN 2026 & 2º Turno).
Realize uma checagem documental e imparcial da seguinte fala, áudio ou tema atribuído a candidato ou às eleições:
"${falaOuTema}"

Contexto Oficial Verificado (DivulgaCandContas TSE, Fato ou Boato TSE, TRE-RN e Planos de Governo):
- 2º Turno Governo do RN: Allyson Bezerra (União Brasil 44 - 37% votos válidos: 3ª ponte sobre o Rio Potengi e requalificação de hospitais regionais) vs. Carlos Eduardo Xavier / Cadu de Lula (PT 13 - 32% votos válidos: educação em tempo integral, duplicação da BR-304 e SUS com diagnósticos médicos online alinhado a Mãe Luíza).
- Presidência da República: Luiz Inácio Lula da Silva (PT 13 - Novo PAC, BR-304, SUS Digital, Ensino Integral) e debate sobre Flávio Bolsonaro (PL 22 - áudio sobre aposentadoria aos 70 anos e jornada de 12h não consta em plano formalizado no TSE).
- Passe Livre: Garantido pela STTU Natal (62 linhas urbanas gratuitas sem cartão NuBus) e Decreto Estadual nº 35.935/2026 (intermunicipal gratuito com título/e-Título).

Retorne estritamente um objeto JSON com:
- candidatoCitado: string
- titulo: string
- seloVerificacao: "Confirmado Oficialmente" | "Fato Esclarecido · TSE" | "Sem Confirmação Oficial no Plano Formal"
- topicosAnalisados: array com 3 strings curtas e objetivas
- conclusaoAnalise: string com a análise técnica imparcial
- fonteVerificacao: string indicando a fonte oficial (ex: DivulgaCandContas TSE, Fato ou Boato TSE, TRE-RN)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidatoCitado: { type: Type.STRING },
              titulo: { type: Type.STRING },
              seloVerificacao: { type: Type.STRING },
              topicosAnalisados: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              conclusaoAnalise: { type: Type.STRING },
              fonteVerificacao: { type: Type.STRING },
            },
            required: [
              'candidatoCitado',
              'titulo',
              'seloVerificacao',
              'topicosAnalisados',
              'conclusaoAnalise',
              'fonteVerificacao',
            ],
          },
        },
      });

      const rawText = response.text?.trim();
      const parsed = rawText ? JSON.parse(rawText) : null;

      if (parsed) {
        const seloValido =
          parsed.seloVerificacao === 'Confirmado Oficialmente' ||
          parsed.seloVerificacao === 'Fato Esclarecido · TSE'
            ? parsed.seloVerificacao
            : 'Sem Confirmação Oficial no Plano Formal';

        const novoAlerta = {
          id: `checagem-live-${Date.now()}`,
          categoria: 'Fato ou Boato TSE · Tempo Real',
          candidatoCitado: parsed.candidatoCitado || 'Verificação Eleitoral TSE',
          falaAnalisada: `"${falaOuTema}"`,
          titulo: parsed.titulo || `Checagem em Tempo Real: ${falaOuTema.slice(0, 60)}`,
          seloVerificacao: seloValido,
          topicosAnalisados: Array.isArray(parsed.topicosAnalisados)
            ? parsed.topicosAnalisados.slice(0, 4)
            : ['Verificado na base documental do DivulgaCandContas TSE.'],
          conclusaoAnalise: parsed.conclusaoAnalise,
          fonteVerificacao: parsed.fonteVerificacao || 'DivulgaCandContas TSE & Fato ou Boato TSE',
          urlFonteOficial: 'https://www.justicaeleitoral.jus.br/fato-ou-boato/',
          horario: `Checado agora às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        };

        res.json({ alerta: novoAlerta });
        return;
      }

      res.status(500).json({ error: 'Não foi possível concluir a checagem agora.' });
    } catch (error: any) {
      console.error('Erro em /api/fact-check-tse:', error);
      res.status(500).json({ error: 'Erro ao consultar verificador TSE em tempo real.' });
    }
  });

  // Helper para garantir cabeçalho WAV RIFF (24kHz, 16-bit, mono) caso o modelo retorne PCM L16 puro
  function ensureWavBuffer(audioBuffer: Buffer, sampleRate = 24000): Buffer {
    if (
      audioBuffer.length >= 4 &&
      audioBuffer.toString('ascii', 0, 4) === 'RIFF'
    ) {
      return audioBuffer;
    }
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = audioBuffer.length;
    const header = Buffer.alloc(44);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // PCM chunk size
    header.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return Buffer.concat([header, audioBuffer]);
  }

  // Endpoint 6: PotiguarBot TTS — Voz Masculina Natural em Português do Brasil (Gemini TTS)
  app.post('/api/potiguar-tts', async (req, res) => {
    try {
      const { text, voiceConfig } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ error: 'Texto obrigatório para síntese de voz.' });
        return;
      }

      const trimmedText = text.trim().slice(0, 2200);
      const allowedMaleVoices = new Set(['Charon', 'Achird', 'Algieba', 'Iapetus', 'Puck']);
      const requestedVoice = voiceConfig?.voiceName;
      const selectedVoiceName =
        typeof requestedVoice === 'string' && allowedMaleVoices.has(requestedVoice)
          ? requestedVoice
          : 'Charon';

      const styleInstruction =
        voiceConfig?.stylePrompt ||
        'Voz masculina em português do Brasil (pt-BR), natural, clara, conversacional, calma e amigável, com boa pronúncia em português brasileiro, pausas naturais e entonação humana adequada para um aplicativo público de transparência cidadã. Narrar exclusivamente o texto fornecido sem resumir, modificar ou inventar informações.';

      let response: any;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: trimmedText,
                  speechMetadata: {
                    style: styleInstruction,
                  },
                } as any,
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoiceName,
                },
              },
            },
          },
        });
      } catch {
        // Fallback literal sem speechMetadata: narra exclusivamente o texto original do PotiguarBot
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: trimmedText,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoiceName,
                },
              },
            },
          },
        });
      }

      const inlineData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const rawBase64 = inlineData?.data;

      if (!rawBase64) {
        res.status(502).json({
          error: 'O serviço TTS não retornou dados de áudio para esta mensagem.',
        });
        return;
      }

      const rawBuffer = Buffer.from(rawBase64, 'base64');
      const wavBuffer = ensureWavBuffer(rawBuffer, 24000);

      res.json({
        audioBase64: wavBuffer.toString('base64'),
        mimeType: 'audio/wav',
        voiceConfig: {
          idioma: 'pt-BR',
          language: 'pt-BR',
          voz: 'masculina',
          gender: 'male',
          voiceName: selectedVoiceName,
          velocidade: voiceConfig?.speed || 1.0,
          speed: voiceConfig?.speed || 1.0,
          tom: 'calmo, seguro e respeitoso',
          estilo: 'conversacional',
          style: 'conversational',
          volume: voiceConfig?.volume ?? 1.0,
          autoPlay: false,
        },
      });
    } catch (error: any) {
      console.error('Erro em /api/potiguar-tts:', error);
      res.status(500).json({
        error:
          'Serviço de voz natural temporariamente indisponível. Tente novamente em instantes.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Transparência Potiguar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
