import type {Forseelse} from "@/app/b%C3%B8ter/page.tsx";

export const fetchForseelser = async (): Promise<Forseelse[]> => {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/boter/typer');
    if (!response.ok) {
        throw new Error('Feil ved henting av forseelser');
    }
    return await response.json();
};

export const lagBot = async (draktnummer: string, beløp: number, dato: string, forseelsesId: string) => {
    const response = await fetch('/api/boter/' + draktnummer, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            beløp,
            dato,
            forseelsesId,
        }),
    });

    if (!response.ok) {
        throw new Error('Kunne ikke legge til bot.');
    }
}