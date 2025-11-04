// Speicherort: src/app/api/analyze-transcript/route.ts

import { NextResponse } from 'next/server';

/**
 * Ruft die Gemini-API auf, um ein Transkript zu analysieren und
 * dynamische Lernmodule im JSON-Format zu generieren.
 */
async function callGeminiForAnalysis(transcriptText: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  if (!apiKey) {
      console.warn("Gemini API Key fehlt. Nutze Fallback-Daten.");
      // Fallback-Daten, falls die API nicht aufgerufen werden kann (z.B. im lokalen Test)
      return getFallbackModules();
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // Der System-Prompt ist entscheidend. Er zwingt die KI,
  // ein JSON-Array im exakten Format deiner statischen Daten zu erstellen.
  const systemPrompt = `Du bist ein erfahrener Apotheken-Coach. Analysiere das folgende Interview-Transkript eines Mitarbeiters. Identifiziere die 3 größten Schwachstellen oder Wissenslücken.
Erstelle basierend darauf 3 personalisierte Lernmodule mit Quizfragen.
Antworte AUSSCHLIESSLICH mit einem JSON-Array. Jedes Objekt muss folgendem Format entsprechen:
{
  "icon": "ShieldCheck" | "Users" | "Target",
  "title": "Titel des Lernmoduls",
  "description": "Beschreibung der Schwachstelle.",
  "content": [
    "**Lernpunkt 1:** ...",
    "**Lernpunkt 2:** ...",
    "**Lernpunkt 3:** ..."
  ],
  "quiz": {
    "question": "Eine relevante Quizfrage.",
    "answers": [
      { "text": "Antwort 1", "isCorrect": true | false },
      { "text": "Antwort 2", "isCorrect": true | false },
      { "text": "Antwort 3", "isCorrect": true | false }
    ]
  }
}
Achte darauf, dass immer eine Antwort "isCorrect: true" ist und die Icons (ShieldCheck, Users, Target) korrekt zugewiesen werden.`;

  const userMessage = `Hier ist das Transkript:\n\n${transcriptText}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      // Fordert die API auf, direkt JSON zu senden
      responseMimeType: "application/json",
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("API call failed:", await response.text());
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    const modelResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Die KI sollte direkt das JSON als Text zurückgeben
    // Wir parsen es, um sicherzustellen, dass es valides JSON ist
    return JSON.parse(modelResponseText); 

  } catch (error) {
    console.error("Fehler bei der Gemini-Analyse:", error);
    // Bei einem Fehler (z.B. API-Key ungültig) senden wir die statischen Daten
    return getFallbackModules();
  }
}

/**
 * Dies ist eine Fallback-Funktion, die deine statischen Module zurückgibt,
 * falls die KI-Analyse fehlschlägt.
 */
function getFallbackModules() {
    return [
      {
        icon: "ShieldCheck",
        title: "Vertiefung: Produktvorteile",
        description: "Stärke deine Argumentation, um die hohe Qualität von Magnesiumcitrat 130 hervorzuheben. (Fallback)",
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
        icon: "Users",
        title: "Training: Zielgruppen erkennen",
        description: "Lerne, proaktiv die Kunden zu identifizieren, die am meisten profitieren. (Fallback)",
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
}


// Der POST-Handler für deine API-Route
export async function POST(request: Request) {
  try {
    // 1. Body aus der Anfrage lesen
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || transcript.length === 0) {
      // Wenn kein Transkript gesendet wird, Fallback-Daten nutzen
      console.log("Kein Transkript empfangen, nutze Fallback-Module.");
      const fallbackModules = getFallbackModules();
      return NextResponse.json(fallbackModules);
    }

    // 2. Transkript-Objekt in einen lesbaren String umwandeln
    const transcriptText = transcript
      .map((msg: { role: string; text: string }) => `${msg.role}: ${msg.text}`)
      .join('\n');

    // 3. KI-Analyse aufrufen
    const dynamicModules = await callGeminiForAnalysis(transcriptText);

    // 4. Das Ergebnis (die neuen Module) an das Frontend zurücksenden
    if (dynamicModules) {
      return NextResponse.json(dynamicModules);
    } else {
      // Sollte durch den Catch-Block in callGeminiForAnalysis bereits abgedeckt sein
      return NextResponse.json(getFallbackModules(), { status: 500 });
    }

  } catch (error) {
    console.error("Fehler im API-Handler:", error);
    // Allgemeiner Fehler: Ebenfalls Fallback-Daten senden
    return NextResponse.json(getFallbackModules(), { status: 500 });
  }
}