import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Volume2,
  X,
  Eye,
  BookOpen,
  Maximize2,
  Bot,
} from 'lucide-react';
import {
  RelatoCidadao,
  AvaliacaoCandidatoItem,
  POTIGUAR_BOT_SYSTEM_PROMPT,
} from '../data/platformData';

export interface StudioChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  moderated?: boolean;
  imagePreview?: string;
  suggestedActions?: string[];
}

interface MultimodalStudioChatProps {
  agentName: string;
  agentDirective: string;
  emblemImg: string;
  chatMessages: StudioChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  isBotLoading: boolean;
  onSendPrompt: (customPrompt?: string, imageBase64?: string, imageMimeType?: string) => void;
  relatos: RelatoCidadao[];
  avaliacoes: AvaliacaoCandidatoItem[];
  novoAutor: string;
  setNovoAutor: (v: string) => void;
  novoBairro: string;
  setNovoBairro: (v: string) => void;
  novaMensagem: string;
  setNovaMensagem: (v: string) => void;
  isModerating: boolean;
  moderationFeedback: { type: 'success' | 'error'; text: string } | null;
  onSubmitRelato: (e: React.FormEvent) => void;
  isFloatingOpen?: boolean;
  setIsFloatingOpen?: (open: boolean) => void;
}

export const MultimodalStudioChat: React.FC<MultimodalStudioChatProps> = ({
  agentName,
  agentDirective,
  emblemImg,
  chatMessages,
  chatInput,
  setChatInput,
  isBotLoading,
  onSendPrompt,
  relatos,
  avaliacoes,
  novoAutor,
  setNovoAutor,
  novoBairro,
  setNovoBairro,
  novaMensagem,
  setNovaMensagem,
  isModerating,
  moderationFeedback,
  onSubmitRelato,
  isFloatingOpen: externalFloatingOpen,
  setIsFloatingOpen: setExternalFloatingOpen,
}) => {
  const [internalFloatingOpen, setInternalFloatingOpen] = useState<boolean>(true);
  const isFloatingOpen =
    externalFloatingOpen !== undefined ? externalFloatingOpen : internalFloatingOpen;
  const setIsFloatingOpen = setExternalFloatingOpen || setInternalFloatingOpen;

  const [emblemError, setEmblemError] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const floatingFileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const floatingMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const ultimaPublicacaoMural = relatos[0];
  const ultimaAvaliacao = avaliacoes[0];

  useEffect(() => {
    if (isFloatingOpen) {
      floatingMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length, isBotLoading, isFloatingOpen]);

  // Voice Input (Microphone) via Web Speech API
  const toggleMicrophone = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus('Reconhecimento de voz nativo indisponível neste navegador. Digite ou envie imagem.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceStatus(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('🎙️ Microfone ativo: fale sua pergunta ou comando para o Estúdio IA...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setChatInput(chatInput ? `${chatInput} ${transcript}` : transcript);
          setVoiceStatus(`✓ Voz capturada: "${transcript}"`);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus('Não foi possível capturar o áudio. Verifique a permissão do microfone.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Read aloud using browser SpeechSynthesis
  const lerEmVozAlta = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.02;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Image Upload Handler for Advanced Visual Analysis
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageMime(file.type || 'image/jpeg');
    setSelectedImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedImageBase64) return;
    onSendPrompt(
      chatInput.trim() || 'Realize uma análise visual avançada desta imagem e sugira ações criativas.',
      selectedImageBase64 || undefined,
      selectedImageMime
    );
    setSelectedImageBase64(null);
    setSelectedImageName('');
    setVoiceStatus(null);
  };

  const lerUltimaPublicacaoNoBot = () => {
    setIsFloatingOpen(true);
    onSendPrompt('Pode ler a última publicação que eu fiz agora no mural e na enquete de benefícios?');
  };

  const quickSuggestions = [
    'Pode ler a última publicação que eu fiz agora?',
    'Comparar propostas do 2º turno RN (Allyson 44 x Cadu de Lula 13)',
    'Analisar propostas dos candidatos à Presidência e impacto no RN',
    'Quais candidatos estão alinhados com a comunidade de Mãe Luíza?',
  ];

  const renderChatMessagesList = (compact = false) => (
    <div className={`space-y-3.5 overflow-y-auto ${compact ? 'p-4 max-h-[300px]' : 'p-6 max-h-[400px]'}`}>
      {chatMessages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mb-1 px-1">
            <span>
              {msg.sender === 'user' ? 'Você' : `${agentName} (Estúdio IA)`} · {msg.timestamp}
            </span>
            {msg.sender === 'bot' && (
              <button
                type="button"
                onClick={() => lerEmVozAlta(msg.text)}
                title="Ouvir resposta em voz alta"
                className="inline-flex items-center gap-1 text-[var(--accent-color)] hover:underline cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>Ouvir</span>
              </button>
            )}
          </div>

          <div
            className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-2 ${
              msg.sender === 'user'
                ? 'bg-[var(--accent-color)] text-white'
                : msg.moderated
                ? 'bg-red-500/10 border border-red-500/40 text-[var(--text-color)]'
                : 'bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[var(--text-color)]'
            }`}
          >
            {msg.imagePreview && (
              <div className="rounded-lg overflow-hidden border border-white/20 max-w-[210px]">
                <img
                  src={msg.imagePreview}
                  alt="Imagem enviada para análise visual"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <div>{msg.text}</div>
          </div>

          {/* Sugestão de ações em botões abaixo da resposta do agente */}
          {msg.sender === 'bot' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 max-w-[94%]">
              {msg.suggestedActions.map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => onSendPrompt(act)}
                  disabled={isBotLoading}
                  className="botao px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[11px] font-medium text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors cursor-pointer"
                >
                  ⚡ {act}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {isBotLoading && (
        <div className="text-xs text-[var(--text-muted)] animate-pulse">
          {agentName} está processando instantaneamente no Estúdio Multimodal...
        </div>
      )}
      <div ref={floatingMessagesEndRef} />
    </div>
  );

  const renderMultimodalInputForm = (inputRefToUse: React.RefObject<HTMLInputElement | null>, compact = false) => (
    <form
      onSubmit={handleFormSubmit}
      className={`${compact ? 'p-3' : 'p-4'} border-t border-[var(--border-color)] bg-[var(--surface-subtle)] space-y-2.5`}
    >
      {(selectedImageBase64 || voiceStatus) && (
        <div className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
          {selectedImageBase64 && (
            <div className="flex items-center gap-2">
              <img
                src={selectedImageBase64}
                alt="Preview upload"
                className="w-9 h-9 rounded object-cover border border-[var(--border-color)]"
              />
              <div>
                <div className="font-semibold text-[var(--text-color)] flex items-center gap-1 text-[11px]">
                  <Eye className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                  <span>Análise Visual Avançada Pronta</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[160px]">
                  {selectedImageName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImageBase64(null);
                  setSelectedImageName('');
                }}
                className="p-1 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {voiceStatus && (
            <div className="text-[11px] font-medium text-[var(--accent-color)]">{voiceStatus}</div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input
          ref={inputRefToUse}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Botão de Upload de Imagem Ativo */}
        <button
          type="button"
          onClick={() => inputRefToUse.current?.click()}
          title="Upload de Imagem para Análise Visual Avançada"
          className={`p-2.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            selectedImageBase64
              ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
              : 'bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Botão de Microfone Ativo (Entrada por Voz) */}
        <button
          type="button"
          onClick={toggleMicrophone}
          title="Entrada por Voz (Microfone)"
          className={`p-2.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isListening
              ? 'bg-red-600 text-white border-red-600 animate-pulse'
              : 'bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Entrada por Texto */}
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Digite, fale no microfone ou envie imagem..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-xs sm:text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--accent-color)]"
        />

        <button
          type="submit"
          disabled={isBotLoading || (!chatInput.trim() && !selectedImageBase64)}
          className="botao px-3.5 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </div>

      {/* Sugestões rápidas abaixo do campo de texto (Obrigatório no Estúdio de Criação) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)]">
          Sugestões rápidas:
        </span>
        {quickSuggestions.map((promptText) => (
          <button
            key={promptText}
            type="button"
            onClick={() => onSendPrompt(promptText)}
            disabled={isBotLoading}
            className="botao px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[10px] text-[var(--text-color)] hover:border-[var(--accent-color)] transition-colors cursor-pointer truncate max-w-full"
          >
            {promptText}
          </button>
        ))}
      </div>
    </form>
  );

  return (
    <>
      <section id="potiguar-bot" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Estúdio de Criação Multimodal PotiguarBot IA */}
        <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-[var(--border-color)] shrink-0 bg-slate-900 flex items-center justify-center">
                  {!emblemError ? (
                    <img
                      src={emblemImg}
                      alt="Emblema PotiguarBot IA"
                      referrerPolicy="no-referrer"
                      onError={() => setEmblemError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-color)]">
                    {agentName} · Estúdio de Criação Multimodal
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Entrada por Texto, Voz (Microfone), Upload de Imagem e Chat Flutuante Instantâneo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFloatingOpen(true)}
                  className="botao px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--text-color)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                  <span>Abrir Chat Flutuante</span>
                </button>
                <button
                  type="button"
                  onClick={lerUltimaPublicacaoNoBot}
                  disabled={isBotLoading}
                  className="botao px-3 py-1.5 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ler Última Publicação</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] p-2.5 rounded-lg border border-[var(--border-color)]">
              <strong>Diretriz Cívica & Estúdio Criativo:</strong> "{POTIGUAR_BOT_SYSTEM_PROMPT}" · {agentDirective}
            </div>
          </div>

          {renderChatMessagesList(false)}
          {renderMultimodalInputForm(fileInputRef, false)}
        </div>

        {/* Right 5 Columns: Mural Cidadão com Destaque da Última Publicação em Tempo Real */}
        <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-5">
          <div className="space-y-1 border-b border-[var(--border-color)] pb-4">
            <h3 className="text-lg font-semibold text-[var(--text-color)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--accent-color)]" />
              <span>Mural Cidadão · Publicações em Tempo Real</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Publique relatos sobre as linhas de ônibus ou eleições. Todas as publicações ficam salvas e podem ser lidas pelo PotiguarBot IA.
            </p>
          </div>

          {/* Card em Destaque: Leitura Direta da Última Publicação */}
          {ultimaPublicacaoMural && (
            <div className="p-3.5 rounded-lg border-2 border-[var(--accent-color)] bg-[var(--surface-subtle)] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[var(--accent-color)] uppercase tracking-wide">
                  📌 Última Publicação Registrada Agora
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      lerEmVozAlta(
                        `Última publicação de ${ultimaPublicacaoMural.autor} em ${ultimaPublicacaoMural.bairro}: ${ultimaPublicacaoMural.mensagem}`
                      )
                    }
                    className="text-[11px] font-semibold text-[var(--accent-color)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ouvir</span>
                  </button>
                  <button
                    type="button"
                    onClick={lerUltimaPublicacaoNoBot}
                    className="text-[11px] font-semibold text-[var(--text-color)] underline cursor-pointer"
                  >
                    Analisar na IA
                  </button>
                </div>
              </div>
              <p className="text-xs font-medium text-[var(--text-color)] leading-relaxed">
                "{ultimaPublicacaoMural.mensagem}"
              </p>
              <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                <span>
                  Por <strong>{ultimaPublicacaoMural.autor}</strong> · {ultimaPublicacaoMural.bairro}
                </span>
                <span>{ultimaPublicacaoMural.horario}</span>
              </div>
              {ultimaAvaliacao && (
                <div className="pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                  <strong>Última Avaliação de Candidato:</strong> {ultimaAvaliacao.candidatoNome} (
                  {ultimaAvaliacao.aprovado ? '👍 Aprovado' : '👎 Não Aprovado'}) — "{ultimaAvaliacao.fezDeBom}"
                </div>
              )}
            </div>
          )}

          <form onSubmit={onSubmitRelato} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={novoAutor}
                onChange={(e) => setNovoAutor(e.target.value)}
                placeholder="Seu nome ou apelido (opcional · LGPD)"
                className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
              />
              <select
                value={novoBairro}
                onChange={(e) => setNovoBairro(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
              >
                <option value="Mãe Luíza · Zona Leste">Mãe Luíza · Zona Leste</option>
                <option value="Alecrim · Zona Leste">Alecrim · Zona Leste</option>
                <option value="Pajuçara · Zona Norte">Pajuçara · Zona Norte</option>
                <option value="Igapó · Zona Norte">Igapó · Zona Norte</option>
                <option value="Tirol · Zona Leste">Tirol · Zona Leste</option>
                <option value="Ponta Negra · Zona Sul">Ponta Negra · Zona Sul</option>
                <option value="Lagoa Nova · Zona Sul">Lagoa Nova · Zona Sul</option>
                <option value="Cidade da Esperança · Zona Oeste">Cidade da Esperança · Zona Oeste</option>
                <option value="Felipe Camarão · Zona Oeste">Felipe Camarão · Zona Oeste</option>
                <option value="Parnamirim · Grande Natal">Parnamirim · Grande Natal</option>
              </select>
            </div>

            <textarea
              rows={2}
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              placeholder="Escreva sua publicação sobre seu bairro, seção eleitoral ou linhas de ônibus..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] text-xs text-[var(--text-color)]"
            />

            {moderationFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  moderationFeedback.type === 'success'
                    ? 'bg-[var(--success-bg)] text-[var(--success-color)]'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{moderationFeedback.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isModerating || !novaMensagem.trim()}
              className="botao w-full py-2 px-4 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
            >
              {isModerating ? 'Verificando na Moderação LGPD...' : 'Publicar Agora no Mural (Salva no Banco)'}
            </button>
          </form>

          <div className="space-y-3 pt-2 border-t border-[var(--border-color)] max-h-[240px] overflow-y-auto">
            {relatos.map((rel, idx) => (
              <div
                key={rel.id}
                className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-color)] space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text-color)]">
                    {idx === 0 ? '🆕 ' : ''}
                    {rel.autor} · {rel.bairro}
                  </span>
                  <span>{rel.horario}</span>
                </div>
                <p className="text-xs text-[var(--text-color)] leading-relaxed">{rel.mensagem}</p>
                <div className="text-[10px] text-[var(--success-color)]">
                  ✓ {rel.statusModeracao}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAT BOT FLUTUANTE INSTANTÂNEO COM BOTÃO 'X' PARA FECHAR */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {isFloatingOpen ? (
          <div
            role="dialog"
            aria-label="Chat Bot Flutuante Instantâneo PotiguarBot IA"
            className="w-[94vw] sm:w-[430px] bg-[var(--card-bg)] border-2 border-[var(--accent-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all"
          >
            {/* Header do Chat Flutuante Instantâneo com X para Fechar */}
            <div className="px-4 py-3 bg-[#0f172a] text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                    <span>{agentName} · Chat Instantâneo</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">
                    Estúdio Multimodal · Texto, Voz e Imagem 24h
                  </div>
                </div>
              </div>

              {/* Botão X para fechar o Chat Flutuante Instantâneo */}
              <button
                type="button"
                onClick={() => setIsFloatingOpen(false)}
                title="Fechar Chat Instantâneo (X)"
                aria-label="Fechar Chat Instantâneo"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderChatMessagesList(true)}
            {renderMultimodalInputForm(floatingFileInputRef, true)}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsFloatingOpen(true)}
            title="Abrir Chat Bot Flutuante Instantâneo"
            className="botao px-4 py-3 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white shadow-xl flex items-center gap-2.5 cursor-pointer border-2 border-white/20 transition-transform hover:scale-105"
          >
            <Bot className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold">Chat IA Instantâneo</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
      </div>
    </>
  );
};
