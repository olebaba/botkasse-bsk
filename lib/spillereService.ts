import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

export type Spiller = {
    id: string
    draktnummer?: number
    navn: string
    boter: Bot[]
    /**
     * Om raden for spilleren skal vises eller ikke
     */
    visNavn?: boolean
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

const hentFeilmelding = async (res: Response, standard: string): Promise<string> => {
    try {
        const data = await res.json()
        return typeof data?.error === 'string' ? data.error : standard
    } catch {
        return standard
    }
}

export async function lagSpiller(draktnummer: number, navn: string): Promise<Spiller> {
    const res = await fetch('/api/spillere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draktnummer, navn }),
    })
    if (!res.ok) {
        throw new Error(await hentFeilmelding(res, 'Kunne ikke legge til spiller.'))
    }
    return (await res.json()).spiller
}

export type SpillerEndringer = { navn: string; visNavn: boolean; nyttDraktnummer?: number }

export async function oppdaterSpiller(spillerId: number, endringer: SpillerEndringer): Promise<Spiller> {
    const res = await fetch('/api/spillere', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spiller_id: spillerId, ...endringer }),
    })
    if (!res.ok) {
        throw new Error(await hentFeilmelding(res, 'Kunne ikke oppdatere spiller.'))
    }
    return (await res.json()).spiller
}

export async function slettSpiller(spillerId: number): Promise<void> {
    const res = await fetch(`/api/spillere?spiller_id=${spillerId}`, { method: 'DELETE' })
    if (!res.ok) {
        throw new Error(await hentFeilmelding(res, 'Kunne ikke slette spiller.'))
    }
}
