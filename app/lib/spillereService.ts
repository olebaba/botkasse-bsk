import type {Bot} from "@/app/api/boter/[draktnummer]/route.ts";

export type Spiller = {
    draktnummer: number;
    totalSum: number;
    betaltAlle?: boolean;
    navn?: string
    betaltSesong?: number
    betaltMaaned?: number
    boter?: Bot[]
};

export async function hentSpillere(): Promise<Spiller[]> {
    try {
        const res = await fetch('/api/spillere', {
            next: {revalidate: 60}
        });
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
interface BoterForSpiller {
    boter: Bot[],
    betaltMaaned: number,
    betaltSesong: number,
    totalSum: number,
    betaltAlle: boolean
}

export async function hentBoterForSpiller(draktnummer: number): Promise<BoterForSpiller | null> {
    try {
        const res = await fetch('/api/boter/' + draktnummer, {
            next: {revalidate: 60}
        });
        if (!res.ok) {
            throw new Error('Feil ved henting av spillere');
        }
        return await res.json();
    } catch (error) {
        console.error(error);
        throw new Error(`Kunne ikke hente sum for spiller med draktnummer ${draktnummer}`);
    }
}

export async function hentBoterForAlleSpillere(spillere: Spiller[]): Promise<Spiller[]> {
    return await Promise.all(
        spillere.map(async (spiller: Spiller) => {
            const boterForSpiller = await hentBoterForSpiller(spiller.draktnummer);
            return {
                ...spiller,
                ...boterForSpiller
            };
        })
    );
}
