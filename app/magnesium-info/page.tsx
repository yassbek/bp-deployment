"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Heart, Activity, Bone, Pill, Apple, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MagnesiumInfoPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => router.back()}>
                                <ArrowLeft className="w-5 h-5 mr-1" />
                                Zurück
                            </Button>
                            <h1 className="text-xl font-bold text-gray-900">Magnesium – Kompakte Übersicht</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* 1. Allgemeine Funktionen */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-6 h-6 text-brand" />
                            1. Allgemeine Funktionen von Magnesium
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>Energiestoffwechsel:</strong> ATP-Produktion in den Mitochondrien</li>
                            <li><strong>Nerven- & Muskelzellen:</strong> Erregbarkeit ↓, Kontraktion, Reizweiterleitung</li>
                            <li><strong>Herz-Kreislauf-System:</strong> Herzrhythmus, Gefäßtonus, Blutdruck</li>
                            <li><strong>Knochenstoffwechsel:</strong> Kalzium- & Vitamin-D-Regulation</li>
                            <li><strong>Hormonstoffwechsel:</strong> z. B. Insulin</li>
                            <li><strong>Säure-Basen-Haushalt</strong></li>
                            <li><strong>Psychische Gesundheit:</strong> Serotonin</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 2. Bedarf & Referenzwerte */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="w-6 h-6 text-brand" />
                            2. Bedarf & Referenzwerte (mg/Tag)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>Kinder (1-15 Jahre):</strong> 80–310 mg</li>
                            <li><strong>Erwachsene (ab 16 Jahre):</strong> 350–400 mg</li>
                            <li><strong>Schwangere/Stillende:</strong> 310/390 mg</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 3. Ursachen für Magnesiummangel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-brand" />
                            3. Ursachen für Magnesiummangel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>Verringerte Aufnahme:</strong> Darmerkrankungen, PPI, Alkohol, Antibabypille</li>
                            <li><strong>Erhöhte Verluste:</strong> Schweiß, Diabetes, Stress, bestimmte Diuretika</li>
                            <li><strong>Genetik:</strong> TRPM6/7-Störungen</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 4. Symptome eines Magnesiummangels */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-6 h-6 text-brand" />
                            4. Symptome eines Magnesiummangels
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>Herz/Kreislauf:</strong> Bluthochdruck, Arrhythmien</li>
                            <li><strong>Psyche:</strong> Stress, Migräne, depressive Verstimmung</li>
                            <li><strong>Muskulatur:</strong> Wadenkrämpfe, Zuckungen, Tetanie</li>
                            <li><strong>Stoffwechsel:</strong> Insulinresistenz</li>
                            <li><strong>Magen-Darm:</strong> Krämpfe, Verstopfung</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 6. Magnesiumaufnahme */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Apple className="w-6 h-6 text-brand" />
                            6. Magnesiumaufnahme
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Tagesdosis auf 3–4 Portionen verteilt</li>
                            <li><strong>Gut verfügbar:</strong> Citrat, Glycinat, Aspartat, Orotat</li>
                            <li>Nicht direkt vor oder während Sport</li>
                            <li>Phytate hemmen Aufnahme</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 7. Magnesiumreiche Lebensmittel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Apple className="w-6 h-6 text-brand" />
                            7. Magnesiumreiche Lebensmittel (mg/100 g)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Sonnenblumenkerne 420</li>
                            <li>Leinsamen 350</li>
                            <li>Weizenkeime 250</li>
                            <li>Haferflocken 140</li>
                            <li>Reis 60</li>
                            <li>Banane 45</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 10. Wichtigste Merksätze */}
                <Card className="border-brand/50 bg-brand/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-brand">
                            <Brain className="w-6 h-6" />
                            10. Wichtigste Merksätze
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-gray-800 font-medium">
                            <li>Wichtig für ATP und Herz/Nerven/Muskeln</li>
                            <li>Vitamin D braucht Magnesium um Vitamin D zu 1,25(OH)2D (aktives Vitamin D) umzuwandeln</li>
                            <li>Stress & Sport = hoher Bedarf</li>
                            <li>Serum Konzentration oft unzuverlässig</li>
                            <li>Citrat/Glycinat/Orotat bevorzugt -&gt; gut bioverfügbar da besser löslich</li>
                            <li>Dosierung Grundbedarf 4-6 mg pro kg pro Tag</li>
                        </ul>
                    </CardContent>
                </Card>

            </main>
        </div>
    );
}
