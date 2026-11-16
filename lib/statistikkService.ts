import type { ForseelseStatistikk } from '@/app/api/statistikk/[forseelse_id]/route.ts'

export const hentForseelseStatistikk = async (forseelseId: string): Promise<ForseelseStatistikk> => {
    const response = await fetch(`/api/statistikk/${encodeURIComponent(forseelseId)}`)
    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? 'Kunne ikke hente statistikk')
    }
    return await response.json()
}
