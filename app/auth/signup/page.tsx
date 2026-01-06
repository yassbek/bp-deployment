
'use client'

import { signup } from '../actions'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignupForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Konto erstellen
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Registriere Dich für die Voice Agent Platform
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm text-amber-800">
                        <strong>Hinweis:</strong> Nur E-Mail-Adressen mit <span className="font-mono font-semibold">@baeren-apotheken.de</span> sind erlaubt.
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-sm font-medium text-foreground"
                            >
                                Vollständiger Name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                required
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
                                placeholder="Max Mustermann"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground"
                            >
                                E-Mail-Adresse
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                pattern=".*@baeren-apotheken\.de$"
                                title="Bitte verwende Deine @baeren-apotheken.de E-Mail-Adresse"
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
                                placeholder="vorname.nachname@baeren-apotheken.de"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground"
                            >
                                Passwort
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            formAction={signup}
                            className="group relative flex w-full justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                        >
                            Registrieren
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Bereits ein Konto?{' '}
                        <a
                            href="/auth/login"
                            className="font-medium text-brand hover:text-brand-dark"
                        >
                            Anmelden
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Laden...</div>}>
            <SignupForm />
        </Suspense>
    )
}
