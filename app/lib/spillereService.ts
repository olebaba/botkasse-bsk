// lib/spillereService.ts

export type Spiller = {
    draktnummer: number;
    total_sum: number;
    betalt_alle: boolean;
    navn?: string
};

/**
 * Henter alle spillere fra API-et.
 */
export async function hentSpillere(): Promise<Spiller[]> {
    try {
        const res = await fetch('/api/spillere');
        if (!res.ok) {
            throw new Error('Feil ved henting av spillere');
        }
        const data = await res.json();
        return data.spillere;
    } catch (error) {
        console.error(error);
        throw new Error('Kunne ikke hente spillere');
    }
}

/**
 * Oppdaterer en spillers total_sum og betalingsstatus.
 */
export async function oppdaterSpiller(draktnummer: number, total_sum: number, er_betalt: boolean): Promise<Spiller> {
    try {
        const res = await fetch('/api/spillere', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ draktnummer, total_sum, er_betalt }),
        });

        if (!res.ok) {
            throw new Error('Feil ved oppdatering av spiller');
        }
        const data = await res.json();
        return data.spiller;
    } catch (error) {
        console.error(error);
        throw new Error('Kunne ikke oppdatere spiller');
    }
}
