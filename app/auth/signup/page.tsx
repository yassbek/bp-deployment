
import { signup } from '../actions'

export default function SignupPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign up to get started with the Voice Agent Platform
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-sm font-medium text-foreground"
                            >
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                required
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground"
                            >
                                Password
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
                            Sign up
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <a
                            href="/auth/login"
                            className="font-medium text-brand hover:text-brand-dark"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
