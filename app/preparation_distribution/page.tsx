"use client"

import { useState } from "react"
// HINWEIS: 'next/navigation' wurde entfernt, da es in dieser Umgebung zu einem Kompilierungsfehler führt.
// Die Navigation wird stattdessen mit Standard-Browserfunktionen gehandhabt.
// import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Lightbulb, Target, Users, ArrowRight, Info, Pill, Zap, Brain } from "lucide-react"

export default function PreparationPage() {
  // const router = useRouter()
  // const searchParams = useSearchParams();
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [isReady, setIsReady] = useState(false)

  // Angepasste Inhalte basierend auf der "B-Vitamine.pdf"
  const trainingAreas = [
    {
      icon: Zap, // Icon für Energie
      title: "Produktwissen & B-Komplex",
      description: "Die Funktion der B-Vitamine als 'Familie' im Stoffwechsel.",
      topics: [
        "Die 'Familie': Wasserlöslichkeit und Synergie-Effekte",
        "B2 (Riboflavin) & Migräne-Prophylaxe (400mg Hochdosis)",
        "Haut, Haare, Nägel: Biotin (B7) und Pantothensäure (B5)",
        "Ausscheidung über die Niere (Hinweis: Gelbfärbung des Urins)",
      ],
    },
    {
      icon: Users,
      title: "Zielgruppen & Risikofaktoren",
      description: "Wer hat einen erhöhten Bedarf?",
      topics: [
        "Vegetarier & Veganer (kritisch: Vitamin B12)",
        "Schwangere & Kinderwunsch (Folat/Folsäure)",
        "Arzneimitteleinnahme: PPI (Säureblocker), Pille, Metformin",
        "Chronischer Stress & Erschöpfung ('Burnout-Prävention')",
      ],
    },
    {
      icon: Brain, // Icon für Nerven/Psyche
      title: "Beratungskompetenz",
      description: "Wichtige Hinweise für das Kundengespräch.",
      topics: [
        "Aufklärung über harmlose Urin-Gelbfärbung (durch B2)",
        "Einnahmehinweis: Zu oder nach der Mahlzeit (bessere Verträglichkeit)",
        "Unterschied: Folsäure vs. aktives Folat (bei Enzymdefekten)",
        "Kombinationsempfehlungen (z.B. mit Magnesium & Q10)",
      ],
    },
  ]

  const preparationChecklist = [
    "Ich kann erklären, warum B-Vitamine oft im Komplex (als 'Familie') sinnvoll sind.",
    "Ich kenne den Hinweis zur Gelbfärbung des Urins (durch Riboflavin) und kann Kunden beruhigen.",
    "Ich weiß, dass PPI (Magenschutz) die B12-Aufnahme blockieren können.",
    "Ich kenne die Dosierung von Vitamin B2 zur Migräne-Prophylaxe (400 mg).",
    "Ich kann erklären, warum Veganer zwingend B12 supplementieren müssen.",
    "Ich habe eine Empfehlung für Kunden mit Müdigkeit (B-Komplex + Magnesium + Q10) parat.",
  ]

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [index]: checked }
    setCheckedItems(newCheckedItems)
    const allChecked = preparationChecklist.every((_, i) => newCheckedItems[i])
    setIsReady(allChecked)
  }

  const handleStartSimulation = () => {
    // Weiterleitung zur Simulation
    window.location.href = "/interview_distribution";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              {/* Farbe Orange/Gelb passend zum Thema Energie/B-Vitamine */}
              <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Beratungssimulation: B-Vitamine & Komplex</h1>
                <p className="text-gray-600">Bereite dich auf das Kundengespräch vor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Einleitung */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-brand" />
              <span>Über diese Simulation</span>
            </CardTitle>
            <CardDescription>
              Diese Simulation trainiert deine Beratungskompetenz zu B-Vitaminen, von Energielosigkeit bis zu spezifischen Indikationen wie Migräne oder Schwangerschaft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              In dieser Simulation üben wir, den richtigen Bedarf für B-Vitamine zu erkennen (z.B. durch Medikamenten-Checks bei PPI-Einnahme) und die Vorteile eines B-Komplexes zu erklären. Du wirst lernen, Kunden proaktiv auf Aspekte wie die Urinverfärbung hinzuweisen und Zusatzverkäufe (Co-Enzym Q10, Magnesium) logisch herzuleiten.
            </p>

            <div className="bg-brand/10 border border-brand/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <h4 className="font-medium text-brand mb-2">Format der Simulation</h4>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>• Dauer: 3-5 Minuten</li>
                    <li>• Format: Gesprächssimulation mit einem KI-Kunden</li>
                    <li>• Szenarien: Stress/Müdigkeit, Veganismus oder Migräne</li>
                    <li>• Ziel: Sicherheit in der Empfehlung und Aufklärung über Wechselwirkungen.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Themenbereiche */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Schwerpunkte der Beratung</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {trainingAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand" />
                      </div>
                      <span>{area.title}</span>
                    </CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {area.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{topic}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Vorbereitungs-Checkliste */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vorbereitungs-Checkliste</CardTitle>
            <CardDescription>Geh diese Punkte durch, um sicherzustellen, dass du bereit für das Kundengespräch bist.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preparationChecklist.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Checkbox
                    id={`checklist-${index}`}
                    checked={checkedItems[index] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(index, checked as boolean)}
                    className="mt-1 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                  />
                  <label
                    htmlFor={`checklist-${index}`}
                    className={`text-sm cursor-pointer ${checkedItems[index]
                        ? "text-gray-900 line-through decoration-brand"
                        : "text-gray-700"
                      }`}
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>

            {isReady && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-900">Du bist startklar!</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Alle Punkte der Checkliste sind erledigt. Du kannst jetzt deine Beratungssimulation zu B-Vitaminen starten.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={handleStartSimulation}
            disabled={!isReady}
            className="bg-brand hover:bg-brand/90 text-white font-medium px-8 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
            size="lg"
          >
            Simulation starten
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} size="lg">
            Zurück zur Übersicht
          </Button>
        </div>
      </main>
    </div>
  )
}