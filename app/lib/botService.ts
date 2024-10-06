export async function markerBoterBetalt(botIder: string[]) {
    try {
        const res = await fetch('/api/boter/betal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({botIder}),
            next: {revalidate: 60}
        })
        if (!res.ok) {
            throw new Error('Feil ved markering av bøter som betalt')
        }
        return await res.json();
    } catch (error) {
        console.error(error)
        throw new Error('Kunne ikke markere bøter som betalt')
    }
}