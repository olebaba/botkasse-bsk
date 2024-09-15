export type Spiller = {
    draktnummer: number;
    totalSum: number;
    betaltAlle: boolean;
    navn?: string
    betaltSesong?: string
    betaltMaaned?: string
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
 * Oppdaterer en spillers totalSum og betalingsstatus.
 */
export async function oppdaterSpiller(draktnummer: number, totalSum: number, erBetalt: boolean): Promise<Spiller> {
    try {
        const res = await fetch('/api/spillere', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({draktnummer, totalSum, erBetalt}),
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

interface SummerForSpiller {
    sumSisteMaaned: number,
    sumSesong: number,
    utestaaendeSum: number,
}

export async function hentSummerForSpiller(draktnummer: number): Promise<SummerForSpiller | null> {
    try {
        const res = await fetch('/api/boter/' + draktnummer);
        if (!res.ok) {
            throw new Error('Feil ved henting av spillere');
        }
        return await res.json();
    } catch (error) {
        console.error(error);
        throw new Error(`Kunne ikke hente sum for spller med draktnummer ${draktnummer}`);
    }
}