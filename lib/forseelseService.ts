import type { Forseelse } from '@/app/api/boter/typer/route.ts'

export const fetchForseelser = async (): Promise<Forseelse[]> => {
    const response = await fetch('/api/boter/typer', {
        next: { revalidate: 60 },
    })
    if (!response.ok) {
        throw new Error('Feil ved henting av forseelser')
    }
    return await response.json()
}

export const lagBot = async (spillerId: string, beløp: number, dato: string, forseelsesId: string) => {
    const response = await fetch('/api/boter/' + spillerId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            beløp,
            dato,
            forseelsesId,
        }),
    })

    if (!response.ok) {
        throw new Error('Kunne ikke legge til bot.')
    }
}
