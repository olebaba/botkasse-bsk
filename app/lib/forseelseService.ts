import type {Forseelse} from "@/app/b%C3%B8ter/page.tsx";
import {baseUrl} from "@/app/utils.ts";

const url = baseUrl()

export const fetchForseelser = async (): Promise<Forseelse[]> => {
    const response = await fetch(url + '/api/boter/typer');
    if (!response.ok) {
        throw new Error('Feil ved henting av forseelser');
    }
    return await response.json();
};

export const lagBot = async (draktnummer: string, beløp: number, dato: string, forseelsesId: string) => {
    const response = await fetch(url + '/api/boter/' + draktnummer, {
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