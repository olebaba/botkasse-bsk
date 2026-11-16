export type Utgift = {
    utgift: string
    beløp: number
    dato: string
}

export const hentUtgifter = async (): Promise<Utgift[]> => {
    const response = await fetch('/api/utgifter', { next: { revalidate: 86400 } })
    if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? 'Kunne ikke hente utgifter')
    }
    return await response.json()
}

export const summerUtgifter = (utgifter: Utgift[]): number => utgifter.reduce((sum, u) => sum + u.beløp, 0)
