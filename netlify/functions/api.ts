import { GoogleGenAI } from '@google/genai';

function createWavBufferFromPcm(pcmBuffer: Buffer, sampleRate = 24000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'GEMINI_API_KEY ausente na Netlify; ativando Motor Autônomo do PotiguarBot IA.',
        useAutonomousFallback: true,
      }),
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const pathName = (event.path || '').replace('/.netlify/functions/api', '');
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    if (pathName.includes('potiguar-tts')) {
      const { text, voiceConfig } = body;
      const selectedVoice = voiceConfig?.voiceName || 'Charon';
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            parts: [
              {
                text: `Narre em português do Brasil (pt-BR) com voz masculina natural, clara e serena: ${text}`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: selectedVoice,
              },
            },
          },
        },
      });

      const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inlineData?.data) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Áudio não gerado pelo Gemini TTS.' }),
        };
      }

      const rawBuffer = Buffer.from(inlineData.data, 'base64');
      const isAlreadyWav =
        rawBuffer.length > 12 &&
        rawBuffer.toString('ascii', 0, 4) === 'RIFF' &&
        rawBuffer.toString('ascii', 8, 12) === 'WAVE';
      const finalWav = isAlreadyWav ? rawBuffer : createWavBufferFromPcm(rawBuffer, 24000);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          audioBase64: finalWav.toString('base64'),
          mimeType: 'audio/wav',
          voiceName: selectedVoice,
        }),
      };
    }

    if (pathName.includes('potiguar-bot') || pathName === '' || pathName === '/') {
      const { message, imageBase64, imageMimeType } = body;
      const parts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: imageMimeType || 'image/jpeg',
          },
        });
      }
      parts.push({
        text:
          message ||
          'Apresente um resumo atualizado das eleições no RN (Allyson 44 x Cadu de Lula 13), candidatos a Presidente do Brasil, PEC 221/2019 (6x1) e Passe Livre.',
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: parts,
        config: {
          systemInstruction:
            'Você é o PotiguarBot IA da plataforma Transparência Potiguar (Eleições RN & Brasil 2026). Responda em português do Brasil com neutralidade apartidária, citando Fonte, Data, Tipo de informação e Status.',
          temperature: 0.35,
        },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: response.text || 'Consulta processada pelo PotiguarBot IA.',
          moderated: false,
          suggestedActions: [
            'Comparar propostas do 2º turno RN (Allyson 44 x Cadu de Lula 13)',
            'Ver atualização da PEC 221/2019 (Fim da Escala 6x1) e CLT',
            'Onde está meu local de votação e qual documento levar?',
          ],
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Rota não encontrada na Netlify Function.' }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err?.message || 'Erro interno na função serverless.' }),
    };
  }
};
