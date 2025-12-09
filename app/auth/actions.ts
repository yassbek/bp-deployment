
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

const ALLOWED_EMAIL_DOMAIN = '@baeren-apotheke.de'

function isEmailAllowed(email: string): boolean {
    return email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)
}

export async function login(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!isEmailAllowed(email)) {
        redirect('/auth/login?error=Nur E-Mail-Adressen mit @baeren-apotheke.de sind erlaubt')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/auth/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!isEmailAllowed(email)) {
        redirect('/auth/signup?error=Nur E-Mail-Adressen mit @baeren-apotheke.de sind erlaubt')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        redirect('/auth/signup?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/auth/login')
}
