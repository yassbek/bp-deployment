"use client"

import Image from "next/image" // Hinzugefügt
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, User, MessageSquare, Camera, Mic } from "lucide-react"

// Mapping-Objekt zur Übersetzung des Branchen-Schlüssels in einen Anzeigenamen
const SECTOR_MAP: { [key: string]: string } = {
  'kreislaufwirtschaft': 'Kreislaufwirtschaft',
  'gesundheit_pflege': 'Gesundheit & Pflege',
  'ernaehrung_landwirtschaft': 'Ernährung & Landwirtschaft',
  'klimaschutz_energien': 'Klimaschutz & Energien',
  'staedte_mobilitaet': 'Städte & Mobilität',
  'bildung_inklusion': 'Bildung & Inklusion'
};

export default function StartPage() {
  const router = useRouter()
  const searchParams = useSearchParams();

  const sectorKey = searchParams.get("branche");
  const sectorDisplayName = sectorKey ? SECTOR_MAP[sectorKey] || "Unbekannt" : "Unbekannt";

  const userInfo = {
    name: searchParams.get("name") || "Bewerber*in",
    company: searchParams.get("startup") || "Dein Startup",
    sector: sectorDisplayName,
  }

  const handleContinue = () => {
    const params = new URLSearchParams(searchParams);
    router.push(`/preparation?${params.toString()}`);
  }

  const steps = [
      { id: 1, title: "Typeform-Umfrage", description: "Grundlegende Informationen und Firmendetails", status: "completed", icon: CheckCircle },
      { id: 2, title: "Interview-Vorbereitung", description: "Richtlinien prüfen und auf Ihr Gespräch vorbereiten", status: "current", icon: User },
      { id: 3, title: "Voice-Agent-Interview", description: "KI-gestütztes Gespräch über Ihr Startup", status: "pending", icon: MessageSquare },
      { id: 4, title: "Einreichung abgeschlossen", description: "Überprüfung und Bestätigung", status: "pending", icon: CheckCircle },
  ]

  const getStepStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      // ANPASSUNG: Markenfarbe für den aktuellen Schritt
      case "current":
        return "bg-brand/20 text-amber-800 border-brand"
      case "pending":
        return "bg-gray-100 text-gray-600 border-gray-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        {/* ANPASSUNG: Breiteres Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* ANPASSUNG: Logo hinzugefügt und gruppiert */}
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
                <Image 
                  src="/impactfactory_logo.png" 
                  alt="Impact Factory Logo" 
                  width={48} 
                  height={48}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Impact Factory</h1>
                <p className="text-gray-600">Bewerbungsprozess für den Accelerator</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{userInfo.name}</p>
              <p className="text-sm text-gray-600">{userInfo.company}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
       {/* ANPASSUNG: Breiteres Layout für Konsistenz */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Willkommen beim Bewerbungsprozess der Impact Factory</CardTitle>
            <CardDescription>
              Vielen Dank für Ihr Interesse an unserem Accelerator-Programm. Sie bewerben sich für den{" "}
              {/* ANPASSUNG: Markenfarbe für den Badge */}
              <Badge variant="outline" className="border-brand text-amber-800">
                {userInfo.sector}
              </Badge>{" "}
              Track.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Unser Bewerbungsprozess ist darauf ausgelegt, die Reife Ihres Startups in drei Schlüsseldimensionen zu verstehen: Technologie, Team & Organisation und Impact. Der nächste Schritt ist ein KI-gestütztes Gespräch, das die Reife und das Potenzial Ihres Startups bewerten wird.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Was Sie erwartet:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 15-20-minütiges Gespräch mit unserem KI-Interviewer</li>
                <li>• Fragen zu Ihrem Team, Ihrer Technologie und Ihren Impact-Zielen</li>
                <li>• Ein natürliches Gespräch – Sie müssen keine spezifischen Antworten vorbereiten</li>
                <li>• Technische Voraussetzungen: funktionierende Kamera und Mikrofon</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ... (Rest der Seite bleibt logisch gleich, profitiert aber vom breiteren Layout) ... */}
        
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Progress Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Bewerbungsfortschritt</CardTitle>
                <CardDescription>Verfolgen Sie Ihren Fortschritt im Bewerbungsprozess</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step) => {
                    const Icon = step.icon
                    return (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStepStatus(step.status)}`}>
                          {step.status === "completed" ? ( <CheckCircle className="w-4 h-4" /> ) 
                          : step.status === "current" ? ( <Clock className="w-4 h-4" /> ) 
                          : ( <Icon className="w-4 h-4" /> )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${step.status === "current" ? "text-gray-900" : step.status === "completed" ? "text-green-800" : "text-gray-500"}`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm ${step.status === "current" ? "text-gray-600" : step.status === "completed" ? "text-green-600" : "text-gray-400"}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Technical Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Technische Voraussetzungen</span>
                </CardTitle>
                <CardDescription>Bitte stellen Sie sicher, dass Ihr Gerät diese Anforderungen erfüllt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Camera className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Kamerazugriff</p>
                      <p className="text-sm text-green-700">Erforderlich</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Mic className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Mikrofonzugriff</p>
                      <p className="text-sm text-green-700">Erforderlich</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Hinweis:</strong> Sie werden aufgefordert, den Zugriff zu erlauben, wenn Sie das Interview starten.
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          {/* ANPASSUNG: Markenfarbe für den Button */}
          <Button
            onClick={handleContinue}
            className="bg-brand hover:bg-brand/90 text-black font-bold px-8 py-3"
            size="lg"
          >
            Weiter zur Vorbereitung
          </Button>
          <Button variant="outline" onClick={() => window.open("mailto:support@impactfactory.de", "_blank")} size="lg">
            Benötigen Sie Hilfe?
          </Button>
        </div>
      </main>
    </div>
  )
}