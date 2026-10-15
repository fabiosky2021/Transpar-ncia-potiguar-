import React, { useState } from 'react';

// Dados das perguntas baseados no 2º Turno (2026)
export interface QuizOptionPesos {
  flavio_bolsonaro_22: number;
  lula_13: number;
}

export interface QuizOption {
  texto: string;
  pesos: QuizOptionPesos;
}

export interface QuizQuestion {
  id: string;
  categoria: string;
  pergunta: string;
  opcoes: QuizOption[];
}

export const quizData: QuizQuestion[] = [
  {
    id: "saude_1",
    categoria: "Saúde",
    pergunta: "Qual deve ser a prioridade na gestão da saúde pública no Brasil?",
    opcoes: [
      {
        texto: "Apostar na digitalização (telemedicina, prontuário eletrónico), incentivar parcerias privadas e criar centros para autismo e saúde mental.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Fortalecer o SUS 100% público, expandir a Farmácia Popular com exames gratuitos e realizar mutirões regionais contra filas.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      },
      {
        texto: "Combinar investimentos estatais diretos com parcerias privadas pontuais onde houver carência de atendimento.",
        pesos: { flavio_bolsonaro_22: 5, lula_13: 5 }
      }
    ]
  },
  {
    id: "educacao_1",
    categoria: "Educação",
    pergunta: "Como o Governo Federal deve direcionar os recursos para a educação básica e média?",
    opcoes: [
      {
        texto: "Expandir escolas cívico-militares, adotar o método fônico de alfabetização e conceder vouchers para a rede privada.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Fortalecer o programa Pé-de-Meia, expandir o ensino em tempo integral e investir em Institutos Federais e Universidades.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      },
      {
        texto: "Incentivar apenas o ensino técnico profissionalizante articulado com as necessidades do setor produtivo local.",
        pesos: { flavio_bolsonaro_22: 5, lula_13: 5 }
      }
    ]
  },
  {
    id: "seguranca_1",
    categoria: "Segurança Pública",
    pergunta: "Qual a melhor estratégia para o combate à criminalidade e segurança pública?",
    opcoes: [
      {
        texto: "Reduzir a maioridade penal para 16 anos, construir presídios federais de segurança máxima e ampliar o reconhecimento facial.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Criar um Ministério próprio, focar na asfixia financeira de facções, inteligência, regulação de câmeras corporais e controle de armas.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      },
      {
        texto: "Integrar as forças estaduais sob o SUSP, focando na prevenção primária e em projetos sociais nas periferias.",
        pesos: { flavio_bolsonaro_22: 3, lula_13: 7 }
      }
    ]
  },
  {
    id: "economia_1",
    categoria: "Economia",
    pergunta: "Qual diretriz econômica trará o melhor desenvolvimento para o país?",
    opcoes: [
      {
        texto: "Privatizações (desestatização), redução de impostos, reforma administrativa e limitação de benefícios em apostas.",
        pesos: { flavio_bolsonaro_22: 10, lula_13: 0 }
      },
      {
        texto: "Manutenção do arcabouço fiscal, valorização real do salário mínimo, fim da escala 6x1 e redução da jornada para 40h.",
        pesos: { flavio_bolsonaro_22: 0, lula_13: 10 }
      },
      {
        texto: "Foco exclusivo em reformas de simplificação tributária mantendo neutralidade em relação às privatizações e legislação trabalhista.",
        pesos: { flavio_bolsonaro_22: 5, lula_13: 5 }
      }
    ]
  }
];

interface AffinitiesCalculatorProps {
  onAskAgentAnalysis?: (prompt: string) => void;
  className?: string;
}

export default function AffinitiesCalculator({ onAskAgentAnalysis, className = '' }: AffinitiesCalculatorProps) {
  const [answers, setAnswers] = useState<Record<string, QuizOptionPesos>>({});
  const [result, setResult] = useState<{
    flavio_bolsonaro_22: number;
    lula_13: number;
  } | null>(null);

  // Armazena a opção selecionada para cada pergunta
  const handleSelectOption = (questionId: string, pesos: QuizOptionPesos) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: pesos,
    }));
  };

  // Processa os pontos e calcula as percentagens de afinidade
  const calculateAffinities = () => {
    const totals = {
      flavio_bolsonaro_22: 0,
      lula_13: 0,
    };

    const totalQuestions = quizData.length;
    const maxScorePerCand = totalQuestions * 10;

    Object.values(answers).forEach((pesos) => {
      totals.flavio_bolsonaro_22 += pesos.flavio_bolsonaro_22 || 0;
      totals.lula_13 += pesos.lula_13 || 0;
    });

    const percentFlavio = Math.round((totals.flavio_bolsonaro_22 / maxScorePerCand) * 100);
    const percentLula = Math.round((totals.lula_13 / maxScorePerCand) * 100);

    setResult({
      flavio_bolsonaro_22: percentFlavio,
      lula_13: percentLula,
    });
  };

  // Reinicia o questionário
  const handleReset = () => {
    setResult(null);
    setAnswers({});
  };

  return (
    <div className={`p-5 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 font-sans transition-all ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            Simulador Oficial 2026
          </span>
          <h2 className="text-lg sm:text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">
            Calculadora de Afinidade Eleitoral
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            2º Turno — Presidencial 2026 · Pesos & Eixos Programáticos
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {Object.keys(answers).length}/{quizData.length}
          </span>
          <p className="text-[10px] text-slate-400">respondidas</p>
        </div>
      </div>

      {!result ? (
        <div>
          {quizData.map((q, idx) => (
            <div key={q.id} className="mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded">
                {q.categoria}
              </span>
              <p className="font-semibold mt-2 mb-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
                {idx + 1}. {q.pergunta}
              </p>

              <div className="space-y-2">
                {q.opcoes.map((opt, oIdx) => {
                  const isSelected = answers[q.id] === opt.pesos;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.pesos)}
                      className={`w-full text-left p-2.5 sm:p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold shadow-xs ring-1 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                        <span className="leading-relaxed">{opt.texto}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={calculateAffinities}
            disabled={Object.keys(answers).length < quizData.length}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer active:scale-98"
          >
            {Object.keys(answers).length < quizData.length
              ? `Responda todas as perguntas (${Object.keys(answers).length}/${quizData.length})`
              : 'Calcular Minha Afinidade'}
          </button>
        </div>
      ) : (
        <div className="text-center py-2 space-y-5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              Resultado Processado com Sucesso!
            </h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              Percentuais calculados conforme as diretrizes do plano programático oficial.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>Flávio Bolsonaro (PL - 22)</span>
                </span>
                <span className="text-blue-600 text-sm font-extrabold">{result.flavio_bolsonaro_22}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-700 rounded-full"
                  style={{ width: `${result.flavio_bolsonaro_22}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20">
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                  <span>Lula (PT - 13)</span>
                </span>
                <span className="text-red-600 text-sm font-extrabold">{result.lula_13}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all duration-700 rounded-full"
                  style={{ width: `${result.lula_13}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              🔄 Refazer Teste
            </button>

            {onAskAgentAnalysis && (
              <button
                type="button"
                onClick={() =>
                  onAskAgentAnalysis(
                    `Fiz o teste da Calculadora de Afinidade Eleitoral 2026. Meu resultado deu ${result.flavio_bolsonaro_22}% com Flávio Bolsonaro e ${result.lula_13}% com Lula. Pode me apresentar uma análise aprofundada de como esses eixos (Saúde, Educação, Segurança e Economia) impactam o Rio Grande do Norte?`
                  )
                }
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <span>✨ Análise com IA PotiguarBot</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
