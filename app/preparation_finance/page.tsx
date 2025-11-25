"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Lightbulb, Target, Users, ArrowRight, Info, Pill } from "lucide-react"

export default function PreparationPage() {
    const router = useRouter()
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
    const [isReady, setIsReady] = useState(false)

    // Konfiguration für den Apotheken-Use-Case (Perenterol forte)
    // Daten basieren auf der Fachinformation (Stand 08/2024)
    const trainingAreas = [
        {
            icon: CheckCircle,
            title: "Indikationen & Dosierung",
            description: "Wann und wie oft Perenterol forte eingenommen wird.",
            topics: [
                "Akute Diarrhö: 1- bis 2-mal täglich 1 Kapsel (Kinder ab 2 J. & Erwachsene) [cite: 18, 19]",
                "Reisediarrhö-Prophylaxe: Beginn 5 Tage vor Abreise (1-2x tgl. 1 Kapsel) [cite: 20]",
                "Begleitend bei chronischer Akne: 3-mal täglich 1 Kapsel [cite: 22]",
            ],
        },
        {
            icon: Users,
            title: "Einnahme & Anwendungshinweise",
            description: "Beratung zur korrekten Einnahme für volle Wirksamkeit.",
            topics: [
                "Einnahme vor den Mahlzeiten, unzerkaut mit Flüssigkeit [cite: 28]",
                "Temperatur beachten: Nicht mit zu heißen (>50°C) oder eiskalten Speisen [cite: 34]",
                "Kapseln können geöffnet und in Speisen/Getränke eingerührt werden [cite: 32, 33]",
            ],
        },
        {
            icon: Target,
            title: "Sicherheit & Kontraindikationen",
            description: "Wichtige Warnhinweise für die Patientensicherheit.",
            topics: [
                "Kontraindikation: Patienten mit zentralem Venenkatheter (ZVK) [cite: 42]",
                "Wechselwirkung: Keine gleichzeitige Einnahme mit Antimykotika [cite: 56]",
                "Warnhinweis: Nicht zusammen mit Alkohol einnehmen [cite: 35]",
            ],
        },
    ]

    const preparationChecklist = [
        "Ich kenne die Dosierung bei akutem Durchfall (1-2 Kapseln täglich).",
        "Ich weiß, dass bei Akne eine höhere Dosierung (3x täglich) gilt.",
        "Ich weise darauf hin, dass Speisen nicht über 50°C heiß sein dürfen (Hefe stirbt).",
        "Ich frage aktiv nach immunsupprimierten Patienten oder ZVK-Trägern (Kontraindikation).",
        "Ich empfehle zusätzlich Elektrolyt- und Flüssigkeitsersatz.",
        "Ich weiß, dass Säuglinge unter 2 Jahren vom Arzt behandelt werden müssen.",
    ]

    const handleCheckboxChange = (index: number, checked: boolean) => {
        const newCheckedItems = { ...checkedItems, [index]: checked }
        setCheckedItems(newCheckedItems)
        const allChecked = preparationChecklist.every((_, i) => newCheckedItems[i])
        setIsReady(allChecked)
    }

    const handleStartSimulation = () => {
        router.push("/interview_finance")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
                                <Pill className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Beratungssimulation: Perenterol forte</h1>
                                <p className="text-gray-600">Saccharomyces boulardii - 250 mg Kapseln</p>
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
                            Trainiere das Beratungsgespräch zu Perenterol forte bei Diarrhö und Akne.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 mb-4">
                            In dieser Simulation üben wir die Beratung zu <strong>Perenterol forte</strong>. Der Fokus liegt auf der korrekten Dosierung bei verschiedenen Indikationen (Durchfall vs. Akne), den spezifischen Einnahmehinweisen für Hefepräparate (Temperatur!) und den kritischen Sicherheitsfragen (ZVK, Immunsuppression).
                        </p>
                        <div className="bg-brand/10 border border-brand/20 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Info className="w-5 h-5 text-brand mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-brand mb-2">Format der Simulation</h4>
                                    <ul className="text-sm text-gray-800 space-y-1">
                                        <li>• Dauer: 3-5 Minuten</li>
                                        <li>• Format: Gesprächssimulation mit einem KI-Kunden</li>
                                        <li>• Szenario: Kunde fragt nach Mittel gegen Durchfall oder Reiseapotheke</li>
                                        <li>• Ziel: Sicherer Umgang mit Kontraindikationen und Einnahmehinweisen.</li>
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
                        <CardDescription>Geh diese Punkte durch, bevor du das Kundengespräch startest.</CardDescription>
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
                                    Alle Punkte der Checkliste sind erledigt. Du kannst jetzt deine Beratungssimulation starten.
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
                    <Button variant="outline" onClick={() => router.push("/")} size="lg">
                        Zurück zur Übersicht
                    </Button>
                </div>
            </main>
        </div>
    )
}