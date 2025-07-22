"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image";
import { useConversation } from "@elevenlabs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  MessageSquare,
  User,
  Sparkles,
} from "lucide-react"

export default function InterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [isConnected, setIsConnected] = useState(false)
  const [isMuted] = useState(false)
  const [isCameraOff] = useState(false)
  const [hasPermissions, setHasPermissions] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [transcript, setTranscript] = useState<Array<{ role: "user" | "ai"; text: string; timestamp: string }>>([])

  useEffect(() => {
    console.log("Interview Page loaded. Application ID from URL:", applicationId);
    if (!applicationId) {
      console.error("FEHLER: Es wurde keine applicationId in der URL gefunden! Das Transkript kann nicht gespeichert werden.");
    }
  }, [applicationId]);


  const appendToTranscript = useCallback((role: "user" | "ai", text: string) => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }])
  }, [])

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true)
      setConnecting(false)
      setConnectionError(null)
    },
    onDisconnect: () => {
      setIsConnected(false)
      setConnecting(false)
    },
    onMessage: (message) => {
        const text = message?.text ?? JSON.stringify(message);
        appendToTranscript("ai", text);
    },
    onError: (error) => {
      setConnectionError(error?.message || "Unknown error")
      setConnecting(false)
    },
  })

  useEffect(() => {
    let didCancel = false
    async function setupCamera() {
      setPermissionError(null)
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermissionError("Kamera/Mikrofon wird in diesem Browser nicht unterstützt.")
          setHasPermissions(false)
          return
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (didCancel) return
        streamRef.current = mediaStream
        setHasPermissions(true)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error: any) {
        setPermissionError("Kamera-/Mikrofonberechtigungen konnten nicht abgerufen werden.")
        setHasPermissions(false)
      }
    }
    setupCamera()
    return () => {
      didCancel = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startInterview = async () => {
    setConnectionError(null)
    if (!hasPermissions) {
      setPermissionError("Kamera-/Mikrofonberechtigungen sind erforderlich.")
      return
    }
    setConnecting(true)
    try {
      await conversation.startSession({
        agentId: "nIUEIdEBk48Ul9rgT1Fp", // Deine ElevenLabs Agent ID
      })
    } catch (error: any) {
      setConnectionError(error?.message || "Interview konnte nicht gestartet werden.")
      setConnecting(false)
    }
  }

  // sendTranscriptToDirectus sendet jetzt NUR noch das Transkript.
  const sendTranscriptToDirectus = async () => {
    console.log("sendTranscriptToDirectus aufgerufen...");

    if (!applicationId) {
      console.error("Directus Fehler: Keine Application ID vorhanden. Abbruch.");
      alert("Fehler: Die Bewerbungs-ID fehlt. Das Transkript kann nicht gespeichert werden.");
      return;
    }

    if (transcript.length === 0) {
      console.warn("Directus Info: Transkript ist leer, es wird nichts gesendet.");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/applications/${applicationId}`;
    const token = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

    if (!token) {
        console.error("Directus Fehler: NEXT_PUBLIC_DIRECTUS_TOKEN ist nicht gesetzt!");
        alert("Fehler: Der Directus-Token ist nicht konfiguriert.");
        return;
    }

    // Das ist jetzt der Payload - nur noch das Transkript.
    const payload = {
      transcript: transcript,
    };

    console.log("Sende an Directus-URL:", url);
    console.log("Mit vereinfachtem Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Directus API Fehler! Status:", response.status);
        console.error("Antwort von Directus:", responseData);
        alert(`Fehler beim Speichern des Transkripts: ${responseData.errors?.[0]?.message || 'Unbekannter Fehler'}`);
      } else {
        console.log("Erfolgreich an Directus gesendet! Antwort:", responseData);
      }
    } catch (err) {
      console.error("Netzwerkfehler beim Senden an Directus:", err);
      alert("Ein Netzwerkfehler ist aufgetreten. Bitte überprüfe deine Verbindung und die Konsole.");
    }
  }

  // endInterview ruft sendTranscriptToDirectus ohne Parameter auf.
  const endInterview = async () => {
    console.log("endInterview aufgerufen.");
    await conversation.endSession();
    
    // Wir warten kurz, damit der State sicher aktuell ist.
    setTimeout(async () => {
        await sendTranscriptToDirectus();
        router.push("/completion");
    }, 100);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" height={40} width={160} className="h-10 w-auto" />
                <div>
                  <p className="text-sm text-gray-600">AI-Powered Readiness Assessment</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${
                  isConnected
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-gray-300 text-gray-600 bg-gray-50"
                }`}
              >
                {isConnected ? "● Live" : "○ Disconnected"}
              </Badge>
            </div>
            <Badge variant="outline" className="border-brand-gold text-brand-gold bg-yellow-50 font-medium">
              Step 3 of 4
            </Badge>
          </div>
        </div>
      </header>

      {/* Hauptbereich */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-2">
              {isConnected ? "Interview läuft" : "Bereit für dein Interview"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isConnected
                ? "Du bist jetzt mit unserem KI-Interviewer verbunden. Sprich natürlich und beantworte die Fragen zur Bereitschaft deines Startups."
                : "Klicke auf 'Interview starten', wenn du bereit bist, das Gespräch mit unserem KI-Interviewer zu beginnen."}
            </p>
          </div>

          {/* Videobereich */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Dein Video */}
              <Card className="overflow-hidden border-2 border-gray-200 shadow-lg">
                <CardContent className="p-0 relative">
                  <div className="aspect-video bg-gray-50">
                    {hasPermissions && !isCameraOff ? (
                      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                            <User className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">
                            {!hasPermissions ? "Kamerazugriff erforderlich" : "Kamera aus"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {!hasPermissions ? "Bitte erlaube den Kamerazugriff" : "Aktiviere die Kamera"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black bg-opacity-75 px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">Du</span>
                    </div>
                  </div>
                  {isMuted && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-red-500 p-2 rounded-full shadow-lg">
                        <MicOff className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* KI-Agent */}
              <Card className="overflow-hidden border-2 border-brand-gold shadow-lg">
                <CardContent className="p-0 relative">
                  <div className="aspect-video bg-gradient-to-br from-brand-gold via-yellow-400 to-yellow-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <MessageSquare className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-xl mb-1">KI Interviewer</h3>
                      <p className="text-white text-sm opacity-90">Impact Factory Assessment</p>
                      {conversation.isSpeaking && (
                        <div className="mt-3 flex items-center justify-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black bg-opacity-75 px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">KI Agent</span>
                    </div>
                  </div>
                  {conversation.isSpeaking && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 p-2 rounded-full shadow-lg animate-pulse">
                        <Volume2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Steuerung */}
          <div className="flex items-center justify-center py-8">
            {!isConnected ? (
              <Button
                onClick={startInterview}
                disabled={!hasPermissions || connecting}
                className="bg-brand-gold hover:bg-yellow-500 text-black font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Phone className="w-5 h-5 mr-3" />
                Interview starten
              </Button>
            ) : (
              <Button
                onClick={endInterview}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <PhoneOff className="w-5 h-5 mr-3" />
                Interview beenden
              </Button>
            )}
          </div>

          {/* Statusmeldungen */}
          {permissionError && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-3 rounded-full border border-red-200">
                <span className="text-red-700 font-medium">{permissionError}</span>
              </div>
            </div>
          )}
          {connectionError && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-3 rounded-full border border-red-200">
                <span className="text-red-700 font-medium">{connectionError}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}