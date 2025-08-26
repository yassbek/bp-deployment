"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation" 
import Script from "next/script"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Mail, Calendar, Target, Briefcase, Megaphone, DollarSign, ClipboardCheck } from "lucide-react"
import { createDirectus, rest, staticToken, updateItem } from '@directus/sdk'; // updateItem importiert

// ==================================================================
// Directus Client Initialisierung (vereinfacht)
// ==================================================================
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

if (!directusUrl || !directusToken) {
  console.error('Directus URL oder Token sind in den Umgebungsvariablen nicht gesetzt.');
}

// HIER: Das Schema wurde komplett entfernt, um es flexibler zu machen.
const directus = directusUrl && directusToken 
    ? createDirectus(directusUrl).with(staticToken(directusToken)).with(rest())
    : null;
// ==================================================================


export default function CompletionPage() {
    const [showSuccess, setShowSuccess] = useState(false)
    const [npsScore, setNpsScore] = useState<number | null>(null)
    const [npsComment, setNpsComment] = useState("")
    const [npsSubmitted, setNpsSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const searchParams = useSearchParams()
    // HIER: Holt sich die ID jetzt aus dem URL-Parameter "applicationId"
    const applicationId = searchParams.get('applicationId')

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSuccess(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [])
    
    // ... (deine applicationSteps und finalReviewSteps Arrays bleiben unverändert)
    const applicationSteps = [
        { title: "Readiness Assessment", icon: ClipboardCheck, status: "completed" },
        { title: "Impact-Reife", icon: Target, status: "completed" },
        { title: "Marketing & Positionierung", icon: Megaphone, status: "completed" },
        { title: "Finanzierungs-Reife", icon: DollarSign, status: "completed" },
        { title: "Wachstum & Vertrieb", icon: Briefcase, status: "completed" }
    ]

    const finalReviewSteps = [
        { title: "Prüfung der Bewerbung", description: "Unser Team prüft alle deine Interviews und Unterlagen.", timeframe: "3-5 Werktage", icon: Clock },
        { title: "Erstes Feedback", description: "Du erhältst eine erste Rückmeldung zu deinem gesamten Readiness Assessment.", timeframe: "ca. 1 Woche", icon: Mail },
        { title: "Entscheidung", description: "Finale Entscheidung über die Aufnahme in den Accelerator.", timeframe: "ca. 2 Wochen", icon: CheckCircle },
        { title: "Programmstart", description: "Bei einer Zusage beginnt deine Reise im Accelerator.", timeframe: "Nächster Jahrgang", icon: Calendar },
    ]

    const handleNpsSubmit = async () => {
        if (npsScore === null || !applicationId || !directus) {
            console.error("Voraussetzungen für den API-Call nicht erfüllt: NPS Score, Application ID oder Directus-Client fehlt.");
            return;
        }

        setIsSubmitting(true);

        try {
            // HIER: Die Methode .items('collection').updateOne(...) ist eine saubere Art, den Request zu machen
            await directus.request(updateItem('applications', applicationId, {
                nps: npsScore,
                nps_comment: npsComment,
            }));
            
            setNpsSubmitted(true);
            console.log("🚀 NPS-Daten erfolgreich in Directus gespeichert!");

        } catch (error) {
            console.error("Fehler beim Speichern der NPS-Daten:", error);
        } finally {
            setIsSubmitting(false);
        }
    }
    
    // Der Rest der Komponente (return Statement mit JSX) bleibt exakt gleich.
    // ...
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
                                <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" width={48} height={48} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Bewerbung abgeschlossen!</h1>
                                <p className="text-gray-600">Vielen Dank für deine Zeit und Mühe.</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50 font-medium">
                            Schritt 5 von 5 - Fertig
                        </Badge>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="text-center mb-12">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-700 ${showSuccess ? "bg-green-100 scale-100" : "bg-gray-100 scale-90"}`}>
                        <CheckCircle className={`transition-all duration-700 ${showSuccess ? "w-12 h-12 text-green-600" : "w-10 h-10 text-gray-400"}`} />
                    </div>
                    <h2 className={`text-3xl font-bold mt-4 transition-opacity duration-700 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
                        Glückwunsch, du hast es geschafft!
                    </h2>
                    <p className={`text-gray-600 mt-2 max-w-2xl mx-auto transition-opacity duration-700 delay-200 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
                        Du hast alle Interviews für den Impact Factory Accelerator erfolgreich absolviert. Deine gesamte Bewerbung wird nun von unserem Team geprüft.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    <Card className="lg:col-span-2 border-brand/50 bg-brand/5">
                        <CardHeader>
                            <CardTitle className="text-amber-900">Wie geht es jetzt weiter?</CardTitle>
                            <CardDescription className="text-amber-800">Das kannst du in den nächsten Wochen von uns erwarten.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {finalReviewSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-brand" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-amber-900">{step.title}</h4>
                                                <p className="text-sm text-amber-800 mt-0.5">{step.description}</p>
                                                <Badge variant="outline" className="mt-2 border-brand/40 text-amber-800 text-xs">
                                                    {step.timeframe}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Abgeschlossene Interviews</CardTitle>
                                <CardDescription>Alle fünf Bereiche wurden erfolgreich erfasst.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {applicationSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={index} className="text-left p-3 bg-gray-50 border rounded-lg flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-sm text-gray-900">{step.title}</h4>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                
                <div className="max-w-2xl mx-auto mb-12">
                    <Card>
                        {!npsSubmitted ? (
                            <>
                                <CardHeader>
                                    <CardTitle>Dein Feedback ist uns wichtig</CardTitle>
                                    <CardDescription>
                                        Wie hat dir dieser Bewerbungsprozess gefallen?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!applicationId && (
                                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
                                            Feedback kann nicht übermittelt werden, da die Bewerbungs-ID fehlt.
                                        </p>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                                        {Array.from({ length: 11 }, (_, i) => (
                                            <Button
                                                key={i}
                                                variant={npsScore === i ? "default" : "outline"}
                                                onClick={() => setNpsScore(i)}
                                                className="w-10 h-10 rounded-full"
                                                disabled={!applicationId || isSubmitting}
                                            >
                                                {i}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 px-2">
                                        <span>Gar nicht gut</span>
                                        <span className="text-right">Sehr gut</span>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        <Label htmlFor="nps-comment">Was ist der Hauptgrund für deine Bewertung? (Optional)</Label>
                                        <Textarea
                                            id="nps-comment"
                                            placeholder="Dein Feedback hilft uns, besser zu werden..."
                                            value={npsComment}
                                            onChange={(e) => setNpsComment(e.target.value)}
                                            disabled={!applicationId || isSubmitting}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end">
                                    <Button onClick={handleNpsSubmit} disabled={npsScore === null || !applicationId || isSubmitting}>
                                        {isSubmitting ? "Wird gesendet..." : "Feedback senden"}
                                    </Button>
                                </CardFooter>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold">Vielen Dank!</h3>
                                <p className="text-gray-600">Dein Feedback wurde erfolgreich übermittelt.</p>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button variant="outline" onClick={() => window.open("mailto:applications@impactfactory.de", "_blank")} size="lg">
                        <Mail className="w-4 h-4 mr-2" />
                        Kontakt aufnehmen
                    </Button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        Bewerbung abgeschlossen am {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                
                <elevenlabs-convai agent-id="agent_3801k25662s9fkbs58c3ytmq8s8c"></elevenlabs-convai>
                <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="afterInteractive" async />
            </main>
        </div>
    )
}