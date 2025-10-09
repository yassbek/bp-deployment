"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Droplet, Heart, Shield, Zap, Thermometer } from "lucide-react"

// Definieren der verfügbaren Schulungsmodule für die Lilavita Lernplattform
const trainingModules = [
  {
    title: "Magnesiumcitrat 130",
    description: "Beratung bei Muskelkrämpfen, Stress und erhöhtem Bedarf. Ideal für Sportler und bei Diuretika-Einnahme.",
    path: "/preparation",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    title: "D-Mannose + Cranberry",
    description: "Simulation zur Beratung bei Harnwegsinfekten. Unterscheidung zwischen Akutfall und Prophylaxe.",
    path: "/preparation_d-mannose",
    icon: Droplet,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    title: "Q10 Pro Statin",
    description: "Coaching zur Beratung von Patienten mit Statintherapie und möglichen Nebenwirkungen wie Muskelschmerzen.",
    path: "/preparation_q10",
    icon: Heart,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    title: "Lysin + Zink",
    description: "Training zur Empfehlung bei wiederkehrendem Lippenherpes und zur allgemeinen Stärkung des Immunsystems.",
    path: "/preparation_lysin",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    title: "Probiot aktiv",
    description: "Argumentationstraining zur Basisversorgung und zur Abgrenzung gegenüber Wettbewerbsprodukten.",
    path: "/preparation_probiot_aktiv",
    icon: ShieldCheck,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Immun aktiv",
    description: "Empfehlung bei Infektanfälligkeit und Positionierung als hochwertige Alternative zu bekannten Marken.",
    path: "/preparation_immun",
    icon: Thermometer,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
]

export default function StartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToTraining = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`${path}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
              <Image 
                src="/lilavita_logo.png" 
                alt="Lilavita Logo" 
                width={48} 
                height={48}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lilavita Lernplattform</h1>
              <p className="text-gray-600">Wähle ein Modul, um eine Beratung zu simulieren</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Willkommen beim Apotheken-Coaching!</CardTitle>
            <CardDescription>
              Starte deine Lernreise, indem du eine Beratungssimulation wählst. Jedes Modul trainiert praxisnah ein typisches Gespräch im HV.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {trainingModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.title} 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-white hover:border-brand transition-all duration-200 shadow-sm border-2 border-transparent"
              >
                <div className="flex items-center flex-grow">
                  <div className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${module.bgColor} mr-6`}>
                    <Icon className={`w-10 h-10 ${module.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">{module.title}</CardTitle>
                    <CardDescription className="pt-1 text-base">{module.description}</CardDescription>
                  </div>
                </div>
                <div className="mt-6 sm:mt-0 sm:ml-6 flex-shrink-0">
                  <Button 
                    onClick={() => navigateToTraining(module.path)} 
                    className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-black font-semibold py-3 px-5 text-base"
                  >
                    Simulation starten
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}