"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Target, Users, ShieldCheck, CheckCircle, XCircle, Award, Sparkles, Send } from "lucide-react"

// --- TYPE DEFINITIONS ---
interface QuizAnswer {
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  question: string;
  answers: QuizAnswer[];
}

interface LearningModule {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  content: string[];
  quiz: Quiz;
}

// --- FALLBACK-DATEN ---
const staticLearningModulesData: LearningModule[] = [
  {
    icon: ShieldCheck,
    title: "Vertiefung: Produktvorteile (Fallback)",
    description: "Stärke deine Argumentation, um die hohe Qualität von Magnesiumcitrat 130 hervorzuheben.",
    content: [
      "**Citratform:** Hat eine hohe Bioverfügbarkeit.",
      "**Reinheit:** Apothekenqualität garantiert Reinheit.",
      "**Wirkung:** Ein Allrounder für Muskeln und Nerven.",
    ],
    quiz: {
      question: "Ein Kunde fragt nach dem Unterschied zu günstigen Produkten. Was ist dein stärkstes Argument?",
      answers: [
        { text: "Die Citratform ist für den Körper besonders gut verfügbar.", isCorrect: true },
        { text: "Unsere Packung sieht hochwertiger aus.", isCorrect: false },
      ],
    },
  },
  {
    icon: Users,
    title: "Training: Zielgruppen erkennen (Fallback)",
    description: "Lerne, proaktiv die Kunden zu identifizieren, die am meisten profitieren.",
    content: [
      "**Wadenkrämpfe:** Ein klassisches Anzeichen.",
      "**Diuretika-Einnahme:** Erhöhter Bedarf.",
      "**Stress & Sport:** Aktive Menschen verbrauchen mehr.",
    ],
    quiz: {
      question: "Eine ältere Dame, die Diuretika nimmt, ist eine Zielgruppe, weil...",
      answers: [
        { text: "...Diuretika den Magnesiumverlust erhöhen können.", isCorrect: true },
        { text: "...ältere Menschen immer Magnesium brauchen.", isCorrect: false },
      ],
    },
  },
];

// --- Icon-Mapping ---
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck: ShieldCheck,
  Users: Users,
  Target: Target,
  Default: Sparkles
};

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export default function CompletionPage() {
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]); 
  const [activeQuiz, setActiveQuiz] = useState<Record<number, { selectedAnswer: number | null; isCorrect: boolean | null }>>({});
  const [completedModules, setCompletedModules] = useState<boolean[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);

  // State for Gemini Chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const analysisTriggered = useRef(false);

  // --- KORRIGIERTER useEffect (ohne 'finally' und 'removeItem') ---
  useEffect(() => {
    const storedData = sessionStorage.getItem('dynamicLearningData');
    let modulesToLoad = staticLearningModulesData; 

    if (storedData) {
      console.log("Dynamische Daten gefunden!", storedData);
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          modulesToLoad = parsedData.map(module => ({
            ...module,
            icon: iconMap[module.icon as keyof typeof iconMap] || iconMap.Default
          }));
        } else {
          console.warn("Dynamische Daten waren leer oder kein Array, nutze Fallback.");
        }
      } catch (e) {
        console.error("Fehler beim Parsen der dynamischen Moduldaten, verwende Fallback.", e);
      }
    } else {
      console.log("Keine dynamischen Daten gefunden, nutze Fallback.");
    }

    setLearningModules(modulesToLoad);
    setCompletedModules(Array(modulesToLoad.length).fill(false));
    setQuizAnswers(Array(modulesToLoad.length).fill(null));

    const timer = setTimeout(() => setIsLoadingModules(false), 1500);
    return () => clearTimeout(timer);
  }, []); // Läuft nur einmal


  // --- Gemini API Call Logic (unverändert) ---
  const callGeminiAPI = useCallback(async (history: ChatMessage[]) => {
    setIsGeminiLoading(true);
    try {
      const systemPrompt = "Du bist ein erfahrener Apotheken-Coach und Experte für Magnesiumcitrat 130. Deine Aufgabe ist es, die Leistung des Nutzers zu analysieren und weiterführende Fragen zum Produkt, zur Wirkung und zur Kundenberatung klar und präzise zu beantworten. Bleibe stets in deiner Rolle als Coach.";
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      if (!apiKey) { console.log("API Key is missing, but proceeding in preview environment."); }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const payload = {
        contents: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) { throw new Error(`API call failed with status: ${response.status}`); }
      const result = await response.json();
      const modelResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Ich konnte leider keine Antwort generieren. Bitte versuche es noch einmal.";
      setChatHistory(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (error) {
      console.error("Gemini API error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es später erneut." }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);

  const progress = learningModules.length > 0 ? (completedModules.filter(Boolean).length / learningModules.length) * 100 : 0;
  const allModulesCompleted = progress === 100 && learningModules.length > 0;

  useEffect(() => {
    if (allModulesCompleted && !analysisTriggered.current && learningModules.length > 0) {
      analysisTriggered.current = true;
      const answerSummary = learningModules.map((module, i) => {
        const question = module.quiz.question;
        const answer = quizAnswers[i] || "Keine Antwort gegeben";
        const correctAnswerObj = module.quiz.answers.find((a: QuizAnswer) => a.isCorrect);
        const isCorrect = answer === correctAnswerObj?.text;
        return `Frage: "${question}"\nGegebene Antwort: "${answer}" (${isCorrect ? 'Korrekt' : 'Falsch'})`;
      }).join('\n\n');

      const initialUserMessage: ChatMessage = {
        role: 'user',
        text: `Ich habe soeben die Lernmodule abgeschlossen. Hier ist eine Zusammenfassung meiner Antworten:\n\n${answerSummary}\n\nBitte gib mir auf dieser Grundlage eine kurze, motivierende Analyse meiner Leistung und eröffne die Möglichkeit für ein weiterführendes Gespräch.`
      };
      callGeminiAPI([initialUserMessage]);
    }
  }, [allModulesCompleted, callGeminiAPI, quizAnswers, learningModules]);


  const handleAnswerSelect = (moduleIndex: number, answerIndex: number) => {
    if (completedModules[moduleIndex]) return;

    const isCorrect = learningModules[moduleIndex].quiz.answers[answerIndex].isCorrect;
    const answerText = learningModules[moduleIndex].quiz.answers[answerIndex].text;
    
    setActiveQuiz(prev => ({
      ...prev,
      [moduleIndex]: { selectedAnswer: answerIndex, isCorrect: isCorrect }
    }));

    setQuizAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[moduleIndex] = answerText;
      return newAnswers;
    });

    setTimeout(() => {
      setCompletedModules(prevCompletedModules => {
        const newCompletedModules = [...prevCompletedModules];
        newCompletedModules[moduleIndex] = true;
        return newCompletedModules;
      });
    }, 1000);
  };
  
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGeminiLoading) return;
    const newUserMessage: ChatMessage = { role: 'user', text: userInput };
    const newHistory = [...chatHistory, newUserMessage];
    setChatHistory(newHistory);
    setUserInput('');
    callGeminiAPI(newHistory);
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-[#7f539d] rounded-lg flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auswertung & Lernpfad</h1>
              <p className="text-gray-600">Dein persönliches Trainingsprogramm basierend auf der Simulation.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingModules ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>Lade deinen persönlichen Lernpfad...</CardTitle>
              <CardDescription>Die Ergebnisse des Interviews werden aufbereitet.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 bg-[#7f539d] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-[#7f539d] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-[#7f539d] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Dein Lernfortschritt</h2>
              <Progress value={progress} className="w-full [&>*]:bg-[#7f539d]" />
              <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% abgeschlossen</p>
            </div>

            <div className="space-y-6">
              {learningModules.map((module, index) => {
                const quizState = activeQuiz[index];
                const isCompleted = completedModules[index];
                const ModuleIcon = module.icon; 
                return (
                  <Card key={index} className={`${isCompleted ? 'border-green-500' : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${isCompleted ? 'bg-green-100' : 'bg-[#7f539d]/20'} rounded-lg flex items-center justify-center`}>
                          <ModuleIcon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-[#7f539d]'}`} />
                        </div>
                        <span>{module.title}</span>
                        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-gray-800 mb-2">Lerninhalte:</h4>
                      <ul className="space-y-2 mb-6">
                        {module.content.map((item: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-[#7f539d] rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item }}></p>
                          </li>
                        ))}
                      </ul>
                   
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Wissens-Check:</h4>
                        <p className="text-sm text-gray-700 mb-4">{module.quiz.question}</p>
                        <div className="space-y-2">
                          {module.quiz.answers.map((answer: QuizAnswer, answerIndex: number) => {
                            const isSelected = quizState?.selectedAnswer === answerIndex;
                            const buttonClass = isSelected
                              ? quizState.isCorrect ? 'bg-green-200 border-green-500 text-green-900' : 'bg-red-200 border-red-500 text-red-900'
                              : 'bg-white hover:bg-gray-100';
                            return (
                              <Button 
                                key={answerIndex} 
                                variant="outline" 
                                className={`w-full justify-start text-left h-auto whitespace-normal ${buttonClass}`} 
                                onClick={() => handleAnswerSelect(index, answerIndex)} 
                                disabled={isCompleted}
                              >
                                {isSelected && (quizState.isCorrect ? <CheckCircle className="w-4 h-4 mr-2"/> : <XCircle className="w-4 h-4 mr-2"/>)}
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
            
            {/* KI-Analyse & Chat-Sektion */}
            {allModulesCompleted && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-[#7f539d]"/>
                    <span>Deine persönliche KI-Analyse</span>
                  </CardTitle>
                  <CardDescription>Stelle hier weiterführende Fragen an deinen persönlichen Apotheken-Coach.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-[#7f539d] text-white' : 'bg-white border'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isGeminiLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-md p-3 rounded-xl bg-white border">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-[#7f539d]/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-[#7f539d]/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-[#7f539d]/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input 
                      type="text"
                      placeholder="Stelle eine Frage..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isGeminiLoading}
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={isGeminiLoading || !userInput.trim()} className="bg-[#7f539d] hover:bg-[#6c4785] text-white">
                      <Send className="w-4 h-4"/>
                    </Button>
                  </form>
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" onClick={() => window.location.href = '/start'}>
                      Zurück zur Startseite
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