import { NextResponse } from 'next/server'
import type { User } from 'lucia'
import { validateRequest } from '@/lib/auth/validateRequest.ts'

type AuthResultat = { user: User } | { error: NextResponse }

const uautorisert = () => NextResponse.json({ error: 'Du må være innlogget' }, { status: 401 })
const forbudt = () => NextResponse.json({ error: 'Du har ikke tilgang til dette' }, { status: 403 })

/**
 * Krev en gyldig innlogget sesjon (inkludert gjestebrukere) for API-ruter.
 * Bruk: `const auth = await krevInnlogget(); if ('error' in auth) return auth.error`
 */
export const krevInnlogget = async (): Promise<AuthResultat> => {
    const { user } = await validateRequest()
    if (!user) return { error: uautorisert() }
    return { user }
}

/** Krev at innlogget bruker er admin (botsjef). */
export const krevAdmin = async (): Promise<AuthResultat> => {
    const resultat = await krevInnlogget()
    if ('error' in resultat) return resultat
    if (resultat.user.type !== 'admin') return { error: forbudt() }
    return resultat
}

/** Krev at innlogget bruker eier ressursen (samme bruker-id) eller er admin. */
export const krevEierEllerAdmin = async (eierBrukerId: string): Promise<AuthResultat> => {
    const resultat = await krevInnlogget()
    if ('error' in resultat) return resultat
    if (resultat.user.id !== eierBrukerId && resultat.user.type !== 'admin') return { error: forbudt() }
    return resultat
}
