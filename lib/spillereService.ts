import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

export type Spiller = {
    id: string
    draktnummer?: number
    navn: string
    boter: Bot[]
}

export async function hentSpillere(medBoter: boolean): Promise<Spiller[]> {
    try {
        const res = await fetch(`/api/spillere${medBoter ? '?medBoter=true' : ''}`, {
            next: { revalidate: 60 },
        })
        if (!res.ok) {
            throw new Error('Feil ved henting av spillere')
        }
        const data = await res.json()
        return data.spillere
    } catch (error) {
        console.error(error)
        throw new Error('Kunne ikke hente spillere')
    }
}
interface BoterForSpiller {
    boter: Bot[]
    betaltMaaned: number
    betaltSesong: number
    totalSum: number
    betaltAlle: boolean
}

export async function hentBoterForSpiller(spiller_id: string): Promise<BoterForSpiller | null> {
    try {
        const res = await fetch('/api/boter/' + spiller_id, {
            next: { revalidate: 60 },
        })
        if (!res.ok) {
            throw new Error('Feil ved henting av spillere')
        }
        return await res.json()
    } catch (error) {
        console.error(error)
        throw new Error(`Kunne ikke hente sum for spiller med id ${spiller_id}`)
    }
}

export async function hentBoterForAlleSpillere(spillere: Spiller[]): Promise<Spiller[]> {
    return await Promise.all(
        spillere.map(async (spiller: Spiller) => {
            const boterForSpiller = await hentBoterForSpiller(spiller.id)
            return {
                ...spiller,
                ...boterForSpiller,
            }
        }),
    )
}
