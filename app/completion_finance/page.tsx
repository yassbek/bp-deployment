"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Send,
  Thermometer,
  AlertOctagon,
  Pill,
  Plane,
  ShieldCheck,
  AlertTriangle,
  Shield,
  Award
} from "lucide-react"

// ==================================================================
// 1. TYPE DEFINITIONS
// ==================================================================

interface QuizAnswer {
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  question: string;
  answers: QuizAnswer[];
}

interface LearningModule {
  icon: string;
  title: string;
  description: string;
  content: string[];
  quiz: Quiz;
}

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

// NEU: Detaillierte Quiz-Ergebnisse
interface QuizResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  moduleTopic: string;
}

// ==================================================================
// 2. ICON MAPPING (Perenterol-spezifisch + erweitert)
// ==================================================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Thermometer: Thermometer,
  AlertOctagon: AlertOctagon,
  Pill: Pill,
  Plane: Plane,
  ShieldCheck: ShieldCheck,
  AlertTriangle: AlertTriangle,
  Shield: Shield,
  Award: Award,
  Sparkles: Sparkles,
  Default: Sparkles
};

// ==================================================================
// 3. HELPER FUNCTION
// ==================================================================
const cleanText = (text: string) => {
  if (!text) return "";
  return text;
};

// ==================================================================
// 4. FALLBACK DATA (Perenterol forte)
// ==================================================================
const fallbackModules: LearningModule[] = [
  {
    icon: "Thermometer",
    title: "Einnahme & Temperatur",
    description: "Wichtige Hinweise zur Stabilität der Hefekulturen.",
    content: [
      "<b>Hitzeempfindlich:</b> <i>Saccharomyces boulardii</i> ist eine lebende Hefe.",
      "<b>Temperaturgrenze:</b> Speisen/Getränke dürfen nicht über 50°C heiß sein.",
      "<b>Einnahme:</b> Vor den Mahlzeiten unzerkaut mit Flüssigkeit.",
    ],
    quiz: {
      question: "Ein Kunde möchte die Kapsel öffnen und in heißen Tee einrühren. Was raten Sie?",
      answers: [
        { text: "Kein Problem, die Hefe ist hitzestabil.", isCorrect: false },
        { text: "Bitte nicht, da die Hefepilze bei über 50°C absterben.", isCorrect: true },
        { text: "Das geht nur mit Zitronensaft.", isCorrect: false },
      ],
    },
  },
  {
    icon: "AlertOctagon",
    title: "Sicherheit & Kontraindikationen",
    description: "Kritische Ausschlusskriterien (ZVK).",
    content: [
      "<b>ZVK:</b> Absolute Kontraindikation bei Patienten mit zentralem Venenkatheter.",
      "<b>Risiko:</b> Gefahr der Fungämie (Pilzinfektion im Blut) über Raumluft/Hände.",
      "<b>Immunsuppression:</b> Nicht bei schwer kranken Patienten anwenden.",
    ],
    quiz: {
      question: "Welcher Patient darf Perenterol forte auf keinen Fall erhalten?",
      answers: [
        { text: "Patienten, die Antibiotika nehmen.", isCorrect: false },
        { text: "Patienten mit liegendem zentralen Venenkatheter (ZVK).", isCorrect: true },
        { text: "Patienten mit Laktoseintoleranz.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Pill",
    title: "Dosierung & Akne",
    description: "Unterschiedliche Dosierung je nach Indikation.",
    content: [
      "<b>Akute Diarrhö:</b> 1- bis 2-mal täglich 1 Kapsel.",
      "<b>Akne (begleitend):</b> 3-mal täglich 1 Kapsel.",
      "<b>Antibiotika:</b> Zeitgleiche Einnahme ist möglich (da Hefe antibiotikaresistent ist).",
    ],
    quiz: {
      question: "Wie ist die Dosierungsempfehlung zur unterstützenden Behandlung bei Akne?",
      answers: [
        { text: "1 Kapsel täglich.", isCorrect: false },
        { text: "3-mal täglich 1 Kapsel.", isCorrect: true },
        { text: "Nur bei Entzündungsschüben.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Plane",
    title: "Reisemedizin",
    description: "Prophylaxe von Reisediarrhöen.",
    content: [
      "<b>Start:</b> Beginn 5 Tage vor der Abreise.",
      "<b>Dosis:</b> 1- bis 2-mal täglich 1 Kapsel.",
      "<b>Kinder:</b> Ab 2 Jahren geeignet (unter 2 nur nach Rücksprache).",
    ],
    quiz: {
      question: "Wann sollte mit der Einnahme zur Reiseprophylaxe begonnen werden?",
      answers: [
        { text: "Erst bei Ankunft im Urlaubsland.", isCorrect: false },
        { text: "5 Tage vor Abreise.", isCorrect: true },
        { text: "Am Tag des Abflugs als Einmalgabe.", isCorrect: false },
      ],
    },
  },
];

export default function CompletionPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Record<number, { selectedAnswer: number | null; isCorrect: boolean | null }>>({});
  const [completedModules, setCompletedModules] = useState<boolean[]>([]);

  // NEU: Detaillierte Quiz-Ergebnisse statt nur Antwort-Texte
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const analysisTriggered = useRef(false);

  // ==================================================================
  // INIT: Load Data & Animation
  // ==================================================================
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(true), 300);

    const loadData = () => {
      try {
        const storedData = sessionStorage.getItem('dynamicLearningData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLearningModules(parsed);
            setCompletedModules(Array(parsed.length).fill(false));
            setQuizResults([]);
            setIsLoadingModules(false);
            return;
          }
        }
      } catch (e) {
        console.error("Fehler beim Laden der dynamischen Daten:", e);
      }
      // Fallback
      setLearningModules(fallbackModules);
      setCompletedModules(Array(fallbackModules.length).fill(false));
      setQuizResults([]);
      setIsLoadingModules(false);
    };

    const loadTimer = setTimeout(loadData, 1500);
    return () => { clearTimeout(timer); clearTimeout(loadTimer); };
  }, []);

  // ==================================================================
  // VERBESSERTE GEMINI API MIT RETRY UND PERENTEROL-SPEZIFISCHEM PROMPT
  // ==================================================================
  const callGeminiAPI = useCallback(async (history: ChatMessage[], isInitialAnalysis: boolean = false) => {
    setIsGeminiLoading(true);

    // Perenterol-spezifischer System-Prompt
    const systemPrompt = `Du bist ein erfahrener Apotheken-Coach und Experte für Perenterol forte (Saccharomyces boulardii).

DEIN FACHWISSEN:
- Saccharomyces boulardii ist eine lebende Arznei-Hefe
- KRITISCH: Absolute Kontraindikation bei zentralem Venenkatheter (ZVK) → Fungämie-Risiko!
- Temperatur: Hefezellen sterben über 50°C ab - nie mit heißen Getränken!
- Reiseprophylaxe: 5 Tage VOR Abreise beginnen
- Dosierung Akne: 3x täglich (höher als bei Durchfall)
- Kann zusammen mit Antibiotika gegeben werden (Hefe ist resistent)
- Blister nicht durchdrücken (Kapsel bricht)

DEINE AUFGABE:
- Analysiere die Quiz-Ergebnisse KONKRET und SPEZIFISCH
- Bei Fehlern zur ZVK-Kontraindikation: Betone die Wichtigkeit besonders!
- Erkläre bei falschen Antworten, WARUM die richtige Antwort korrekt ist
- Gib PRAKTISCHE Tipps für den Apothekenalltag
- Sei motivierend aber ehrlich - Sicherheitsfehler klar benennen

STRUKTUR DEINER ANALYSE:
1. 📊 Kurze Zusammenfassung (X von Y richtig, Prozent)
2. ✅ Lob für richtige Antworten - besonders bei Sicherheitsfragen!
3. ❌ Erklärung der Fehler - warum ist die andere Antwort besser?
4. ⚠️ Sicherheitshinweise wenn relevant (ZVK, Temperatur)
5. 💡 2-3 praktische Tipps für den HV-Alltag
6. 🎯 Ermutigung

Halte dich prägnant (max 300 Wörter). Verwende "Du". Antworte auf Deutsch.`;

    const fetchWithRetry = async (retries = 3, delay = 1000): Promise<unknown> => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: history.map(msg => ({
              role: msg.role === 'model' ? 'model' : 'user',
              parts: [{ text: msg.text }]
            })),
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            }
          })
        });

        if (response.status === 503 && retries > 0) {
          console.warn(`API 503 Error. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Gemini API Error:", response.status, errorText);
          throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();

      } catch (error) {
        if (retries > 0) {
          console.warn(`Network error. Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    };

    try {
      const result = await fetchWithRetry() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Ich konnte leider keine Analyse erstellen. Bitte versuche es noch einmal.";
      setChatHistory(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Final API Failure:", error);
      setChatHistory(prev => [...prev, {
        role: 'model',
        text: "Entschuldigung, es gab ein technisches Problem. Bitte versuche es in einem Moment noch einmal oder stelle mir eine direkte Frage zu deinen Ergebnissen."
      }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);

  // Progress berechnen
  const progress = learningModules.length > 0 ? (completedModules.filter(Boolean).length / learningModules.length) * 100 : 0;
  const allModulesCompleted = progress === 100 && learningModules.length > 0;

  // ==================================================================
  // VERBESSERTE ANALYSE-TRIGGER MIT DETAILLIERTEN ERGEBNISSEN
  // ==================================================================
  useEffect(() => {
    // Trigger nur wenn: alle Module abgeschlossen UND genau so viele Ergebnisse wie Module
    if (allModulesCompleted &&
      !analysisTriggered.current &&
      quizResults.length === learningModules.length &&
      learningModules.length > 0) {
      analysisTriggered.current = true;

      // Zähle richtige Antworten
      const correctCount = quizResults.filter(r => r.isCorrect).length;
      const totalCount = quizResults.length;
      const percentage = Math.round((correctCount / totalCount) * 100);

      // Prüfe ob Sicherheitsfragen falsch beantwortet wurden
      const securityQuestionWrong = quizResults.some(r =>
        !r.isCorrect && (
          r.moduleTopic.includes("Sicherheit") ||
          r.moduleTopic.includes("Kontraindikation") ||
          r.question.includes("ZVK") ||
          r.question.includes("Venenkatheter")
        )
      );

      // Erstelle detaillierte Zusammenfassung
      const detailedResults = quizResults.map((result, index) => {
        const status = result.isCorrect ? '✅' : '❌';
        let resultText = `${index + 1}. Modul: "${result.moduleTopic}"
   Frage: "${result.question}"
   ${status} Meine Antwort: "${result.userAnswer}"`;

        if (!result.isCorrect) {
          resultText += `
   ➡️ Richtige Antwort wäre: "${result.correctAnswer}"`;
        }
        return resultText;
      }).join('\n\n');

      // Erstelle den Analyse-Prompt
      let analysisPrompt = `Ich habe das Perenterol forte Training abgeschlossen. Hier sind meine Ergebnisse:

═══════════════════════════════════════
📊 GESAMTERGEBNIS: ${correctCount} von ${totalCount} Fragen richtig (${percentage}%)
═══════════════════════════════════════

📝 DETAILLIERTE ANTWORTEN:

${detailedResults}

═══════════════════════════════════════`;

      if (securityQuestionWrong) {
        analysisPrompt += `

⚠️ WICHTIG: Ich habe mindestens eine Sicherheitsfrage falsch beantwortet. Bitte erkläre mir besonders, warum das im Apothekenalltag kritisch sein kann!`;
      }

      analysisPrompt += `

Bitte analysiere meine Leistung im Detail:
1. Was habe ich gut gemacht?
2. Bei welchen Fragen lag ich falsch - erkläre mir bitte, warum die richtige Antwort besser ist
3. Falls ich Sicherheitsfragen (ZVK, Temperatur) falsch hatte: Warum ist das besonders wichtig?
4. Welche konkreten Tipps hast du für meine nächste Kundenberatung zu Perenterol?`;

      const msg: ChatMessage = { role: 'user', text: analysisPrompt };
      setChatHistory([msg]);
      callGeminiAPI([msg], true);
    }
  }, [allModulesCompleted, callGeminiAPI, quizResults]);

  // ==================================================================
  // VERBESSERTE ANTWORT-AUSWAHL MIT DETAILLIERTER ERFASSUNG
  // ==================================================================
  const handleAnswerSelect = (modIdx: number, ansIdx: number) => {
    // Verhindere doppelte Einträge - prüfe ZUERST ob bereits beantwortet
    if (completedModules[modIdx]) return;
    if (activeQuiz[modIdx]?.selectedAnswer !== null && activeQuiz[modIdx]?.selectedAnswer !== undefined) return;

    const currentModule = learningModules[modIdx];
    const selectedAnswer = currentModule.quiz.answers[ansIdx];
    const isCorrect = selectedAnswer.isCorrect;
    const correctAnswer = currentModule.quiz.answers.find(a => a.isCorrect);

    // Quiz-State aktualisieren
    setActiveQuiz(prev => ({ ...prev, [modIdx]: { selectedAnswer: ansIdx, isCorrect } }));

    // Ergebnis speichern - nutze funktionale Updates um Race Conditions zu vermeiden
    setQuizResults(prev => {
      // Prüfe ob für diesen Modul-Index bereits ein Ergebnis existiert
      const existingIndex = prev.findIndex(r => r.moduleTopic === currentModule.title);
      if (existingIndex !== -1) {
        // Bereits vorhanden, nicht nochmal hinzufügen
        return prev;
      }

      return [...prev, {
        question: currentModule.quiz.question,
        userAnswer: selectedAnswer.text,
        correctAnswer: correctAnswer?.text || '',
        isCorrect: isCorrect,
        moduleTopic: currentModule.title
      }];
    });

    // Modul als abgeschlossen markieren
    setTimeout(() => {
      setCompletedModules(prev => {
        const n = [...prev];
        n[modIdx] = true;
        return n;
      });
    }, 1000);
  };

  // ==================================================================
  // CHAT MESSAGE HANDLER MIT KONTEXT
  // ==================================================================
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGeminiLoading) return;

    // Füge Kontext für Folgefragen hinzu
    const contextInfo = quizResults.length > 0
      ? `[Kontext: Nutzer hat ${quizResults.filter(r => r.isCorrect).length}/${quizResults.length} Fragen richtig beantwortet im Perenterol-Training]

Nutzer fragt: ${userInput}`
      : userInput;

    const displayMsg: ChatMessage = { role: 'user', text: userInput };
    const apiMsg: ChatMessage = { role: 'user', text: contextInfo };

    setChatHistory(prev => [...prev, displayMsg]);
    setUserInput('');
    callGeminiAPI([...chatHistory, apiMsg]);
  };

  // Auto-scroll Chat
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);

  // ==================================================================
  // RENDER
  // ==================================================================
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center shadow-sm">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Auswertung & Lernpfad</h1>
                <p className="text-gray-600">Dein persönliches Perenterol forte Training</p>
              </div>
            </div>
            {/* Ergebnis-Badge wenn fertig */}
            {allModulesCompleted && quizResults.length > 0 && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {quizResults.filter(r => r.isCorrect).length}/{quizResults.length} richtig
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Animation Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-700 ${showSuccess ? "bg-green-100 scale-100" : "bg-gray-100 scale-90"}`}>
            <CheckCircle className={`transition-all duration-700 ${showSuccess ? "w-10 h-10 text-green-600" : "w-8 h-8 text-gray-400"}`} />
          </div>
          <h2 className={`text-2xl font-bold mt-4 transition-opacity duration-700 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
            Simulation erfolgreich beendet!
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Super gemacht! Beantworte die Quiz-Fragen und erhalte eine personalisierte KI-Analyse - besonders zu den wichtigen Sicherheitsaspekten.
          </p>
        </div>

        {isLoadingModules ? (
          <Card className="text-center p-8">
            <CardHeader><CardTitle>Lade Lerninhalte...</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div>
              {/* Progress Section */}
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Wissens-Check</h3>
                  <p className="text-sm text-gray-500">Beantworte alle Fragen, um deine persönliche KI-Analyse zu starten.</p>
                </div>
                <div className="text-right w-1/3">
                  <p className="text-xs text-gray-500 mb-1">{Math.round(progress)}% abgeschlossen</p>
                  <Progress value={progress} className="w-full [&>*]:bg-brand" />
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {learningModules.map((mod, index) => {
                  const quizState = activeQuiz[index];
                  const isCompleted = completedModules[index];
                  const ModuleIcon = iconMap[mod.icon] || iconMap.Default;

                  // Markiere Sicherheitsmodule besonders
                  const isSafetyModule = mod.title.includes("Sicherheit") || mod.title.includes("Kontraindikation");

                  return (
                    <Card key={index} className={`transition-all duration-300 ${isCompleted ? 'border-green-500 ring-1 ring-green-100' : 'hover:shadow-md'} ${isSafetyModule && !isCompleted ? 'border-amber-300' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 ${isCompleted ? 'bg-green-100' : isSafetyModule ? 'bg-amber-100' : 'bg-brand/10'} rounded-lg flex items-center justify-center`}>
                            <ModuleIcon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : isSafetyModule ? 'text-amber-600' : 'text-brand'}`} />
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSafetyModule && !isCompleted && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                ⚠️ Sicherheit
                              </span>
                            )}
                            {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                          </div>
                        </div>
                        <CardTitle className="mt-4 text-lg">{mod.title}</CardTitle>
                        <CardDescription>{mod.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Lerninhalte */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Wichtiges Praxiswissen:</h4>
                          <ul className="space-y-2">
                            {mod.content.map((item, i) => (
                              <li key={i} className="flex items-start text-xs text-gray-700">
                                <div className="w-1 h-1 bg-brand rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <span dangerouslySetInnerHTML={{ __html: cleanText(item) }}></span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Quiz */}
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-3">{mod.quiz.question}</p>
                          <div className="space-y-2">
                            {mod.quiz.answers.map((answer, answerIndex) => {
                              const isSelected = quizState?.selectedAnswer === answerIndex;
                              const showCorrectAnswer = isCompleted && answer.isCorrect && !quizState?.isCorrect;

                              let buttonClass = 'bg-white hover:bg-gray-50 border-gray-200';
                              if (isSelected) {
                                buttonClass = quizState.isCorrect
                                  ? 'bg-green-100 border-green-500 text-green-900'
                                  : 'bg-red-100 border-red-500 text-red-900';
                              } else if (showCorrectAnswer) {
                                buttonClass = 'bg-green-50 border-green-400 text-green-800';
                              }

                              return (
                                <Button
                                  key={answerIndex}
                                  variant="outline"
                                  className={`w-full justify-start text-left h-auto py-2 px-3 whitespace-normal text-sm ${buttonClass}`}
                                  onClick={() => handleAnswerSelect(index, answerIndex)}
                                  disabled={isCompleted}
                                >
                                  {isSelected && (
                                    quizState.isCorrect
                                      ? <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                                      : <XCircle className="w-4 h-4 mr-2 flex-shrink-0 text-red-600" />
                                  )}
                                  {showCorrectAnswer && (
                                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                                  )}
                                  {answer.text}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* AI Analysis Section */}
            {allModulesCompleted && (
              <Card className="bg-white border-2 border-brand/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-brand">
                    <Sparkles className="w-5 h-5" />
                    <span>Deine persönliche KI-Analyse</span>
                  </CardTitle>
                  <CardDescription>
                    Basierend auf deinen Antworten ({quizResults.filter(r => r.isCorrect).length}/{quizResults.length} richtig) • Stelle Folgefragen für mehr Details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                    {chatHistory.length === 0 && isGeminiLoading && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="flex justify-center space-x-1 mb-3">
                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <p className="text-gray-500">Analysiere deine Antworten...</p>
                        </div>
                      </div>
                    )}
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-xl text-sm ${msg.role === 'user' ? 'bg-brand text-white' : 'bg-white border shadow-sm'}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isGeminiLoading && chatHistory.length > 0 && (
                      <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-white border">
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input
                      placeholder="Stelle eine Frage zu deinen Ergebnissen oder zu Perenterol..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isGeminiLoading}
                      className="flex-grow"
                    />
                    <Button
                      type="submit"
                      disabled={isGeminiLoading || !userInput.trim()}
                      className="bg-brand hover:opacity-90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>

                  {/* Beispiel-Fragen */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <p className="text-xs text-gray-400 w-full mb-1">Beispielfragen:</p>
                    {[
                      "Warum ist der ZVK so gefährlich?",
                      "Kann man Perenterol mit Antibiotika nehmen?",
                      "Wie erkläre ich die Reiseprophylaxe?"
                    ].map((question, i) => (
                      <button
                        key={i}
                        onClick={() => setUserInput(question)}
                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                        disabled={isGeminiLoading}
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  {/* Zurück Button */}
                  <div className="mt-6 flex justify-center pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/start'}
                      size="lg"
                      className="px-8"
                    >
                      Zurück zur Übersicht
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}