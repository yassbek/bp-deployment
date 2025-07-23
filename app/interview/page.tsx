"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image";
import { useConversation } from "@elevenlabs/react" // <-- Use the correct package!
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MicOff, Phone, PhoneOff, Volume2, MessageSquare, User } from "lucide-react"

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
    type TranscriptRole = "user" | "ai" | "system" | "error";
    const [transcript, setTranscript] = useState<Array<{ role: TranscriptRole; text: string; timestamp: string }>>([])

    const getCurrentTime = () => {
        const now = new Date()
        return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    }

    const appendToTranscript = useCallback((role: TranscriptRole, text: string) => {
        setTranscript((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }])
    }, [])

    const conversation = useConversation({
        onConnect: () => {
            setIsConnected(true)
            setConnecting(false)
            setConnectionError(null)
            appendToTranscript("system", "Verbunden mit dem KI-Agenten.")
        },
        onDisconnect: () => {
            setIsConnected(false)
            setConnecting(false)
            appendToTranscript("system", "Verbindung zum KI-Agenten getrennt.")
        },
        onMessage: (msg) => {
            // Robust message parsing (matches working code)
            try {
                if (typeof msg === "string") {
                    const parsed = JSON.parse(msg)
                    if (parsed.source === "ai") {
                        appendToTranscript("ai", parsed.message)
                    } else if (parsed.source === "user") {
                        appendToTranscript("user", parsed.message)
                    } else {
                        appendToTranscript("ai", msg)
                    }
                } else if (typeof msg === "object" && msg !== null) {
                    if (msg.source === "ai") {
                        appendToTranscript("ai", msg.message)
                    } else if (msg.source === "user") {
                        appendToTranscript("user", msg.message)
                    } else {
                        appendToTranscript("ai", JSON.stringify(msg))
                    }
                }
            } catch {
                appendToTranscript("ai", typeof msg === "string" ? msg : JSON.stringify(msg))
            }
        },
        onError: (err) => {
            const errorMsg = typeof err === "object" && err !== null && "message" in err ? (err as any).message || JSON.stringify(err) : String(err);
            setConnectionError(errorMsg)
            appendToTranscript("error", "Verbindungsfehler: " + errorMsg)
            setConnecting(false)
        },
    })

    // Check for microphone permission before connecting
    const checkMicrophonePermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
            setHasPermissions(true)
            return true
        } catch (error) {
            setPermissionError("Mikrofonberechtigung erforderlich.")
            setHasPermissions(false)
            return false
        }
    }

    const startInterview = useCallback(async () => {
        setConnectionError(null)
        setPermissionError(null)
        setConnecting(true)
        const hasMic = await checkMicrophonePermission()
        if (!hasMic) {
            setConnecting(false)
            return
        }
        try {
            await conversation.startSession({
                agentId: "nIUEIdEBk48Ul9rgT1Fp" // <-- No connectionType!
            })
        } catch (error) {
            setConnectionError("Interview konnte nicht gestartet werden. Bitte überprüfen Sie Ihre Mikrofonberechtigungen.")
            setConnecting(false)
        }
    }, [conversation, checkMicrophonePermission])

    const sendTranscriptToDirectus = async () => {
        if (!applicationId || transcript.length === 0) return;
        const url = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/applications/${applicationId}`;
        const token = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
        if (!token) return;
        try {
            await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ transcript }),
            });
        } catch (err) {
            // handle error
        }
    }

    const endInterview = useCallback(async () => {
        await conversation.endSession()
        setTimeout(async () => {
            await sendTranscriptToDirectus()
            if (applicationId && transcript.length > 0) {
                try {
                    const res = await fetch('/api/analyze-transcript', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transcript, applicationId })
                    });
                    const data = await res.json();
                    // handle analysis result
                } catch (err) {
                    // handle error
                }
            }
            const params = new URLSearchParams(searchParams);
            router.push(`/completion?${params.toString()}`);
        }, 200);
    }, [conversation, applicationId, transcript, searchParams, router])

    useEffect(() => {
        if (!applicationId) {
            console.error("No applicationId found")
        }
    }, [applicationId]);

    useEffect(() => {
        let didCancel = false
        async function setupCamera() {
            setPermissionError(null)
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    setPermissionError("Kamera/Mikrofon wird nicht unterstützt.")
                    return
                }
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                if (didCancel) return
                streamRef.current = mediaStream
                setHasPermissions(true)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch {
                setPermissionError("Kamera-/Mikrofonberechtigungen erforderlich.")
                setHasPermissions(false)
            }
        }
        setupCamera()
        return () => {
            didCancel = true
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
            }
            if(isConnected){
                conversation.endSession();
            }
        }
    }, [conversation, isConnected])
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                {/* ANPASSUNG: Breiteres Layout für den Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        {/* ANPASSUNG: Logo und Titel wie auf den anderen Seiten */}
                        <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
                                <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" width={48} height={48} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">KI-gestütztes Interview</h1>
                                {/* ANPASSUNG: Live-Badge neben dem Text platziert */}
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-gray-600">Readiness Assessment</p>
                                    <Badge
                                        variant="outline"
                                        className={`px-2 py-0.5 text-xs ${isConnected ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-600 bg-gray-50"}`}
                                    >
                                        {isConnected ? "● Live" : "○ Offline"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-brand text-brand bg-brand/10 font-medium">
                            Schritt 3 von 4
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Hauptbereich */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {isConnected ? "Interview läuft" : "Bereit für dein Interview"}
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {isConnected
                                ? "Du bist jetzt mit unserem KI-Interviewer verbunden. Sprich natürlich und beantworte die Fragen."
                                : "Klicke auf 'Interview starten', wenn du bereit für das Gespräch mit unserem KI-Interviewer bist."}
                        </p>
                    </div>

                    {/* Videobereich */}
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Dein Video */}
                            <Card className="overflow-hidden border-2 border-gray-200 shadow-lg">
                                <CardContent className="p-0 relative">
                                    <div className="aspect-video bg-gray-100">
                                        {hasPermissions && !isCameraOff ? (
                                            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <div className="text-center text-gray-500">
                                                    <User className="w-10 h-10 mx-auto mb-2" />
                                                    <p className="font-medium">
                                                        {!hasPermissions ? "Kamerazugriff erforderlich" : "Kamera aus"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                                        <span className="text-white text-sm font-medium">Du</span>
                                    </div>
                                    {isMuted && (
                                        <div className="absolute top-4 right-4 bg-red-500 p-2 rounded-full shadow-lg">
                                            <MicOff className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* KI-Agent */}
                            {/* ANPASSUNG: Markenfarben für den KI-Agenten */}
                            <Card className="overflow-hidden border-2 border-brand shadow-lg">
                                <CardContent className="p-0 relative">
                                    <div className="aspect-video bg-gradient-to-br from-brand via-amber-400 to-yellow-400 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                                <MessageSquare className="w-12 h-12 text-white" />
                                            </div>
                                            <h3 className="text-white font-bold text-xl mb-1">KI Interviewer</h3>
                                            <p className="text-white text-sm opacity-90">Impact Factory</p>
                                            {conversation.isSpeaking && (
                                                <div className="mt-3 flex items-center justify-center space-x-1.5">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                                        <span className="text-white text-sm font-medium">KI Agent</span>
                                    </div>
                                    {conversation.isSpeaking && (
                                        <div className="absolute top-4 right-4 bg-white/30 p-2 rounded-full shadow-lg animate-pulse">
                                            <Volume2 className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Steuerung */}
                    <div className="flex items-center justify-center py-6">
                        {!isConnected ? (
                            <Button
                                onClick={startInterview}
                                disabled={!hasPermissions || connecting}
                                // ANPASSUNG: Markenfarbe für den Start-Button
                                className="bg-brand hover:bg-brand/90 text-black font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:scale-100"
                            >
                                <Phone className="w-5 h-5 mr-3" />
                                {connecting ? "Verbinde..." : "Interview starten"}
                            </Button>
                        ) : (
                            <Button
                                onClick={endInterview}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                <PhoneOff className="w-5 h-5 mr-3" />
                                Interview beenden
                            </Button>
                        )}
                    </div>

                    {/* Statusmeldungen */}
                    {(permissionError || connectionError) && (
                        <div className="text-center">
                            <div className="inline-flex items-center bg-red-50 px-5 py-2 rounded-full border border-red-200">
                                <span className="text-red-700 font-medium">{permissionError || connectionError}</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}