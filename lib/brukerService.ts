import type {BrukerInfo} from "@/app/api/spillere/[brukernavn]/route.ts";

export const fetchBrukerInfo = async (brukernavn: string): Promise<BrukerInfo> => {
    const response = await fetch(`/api/spillere/${brukernavn}`);
    if (!response.ok) {
        throw new Error('Feil ved henting av forseelser');
    }
    return await response.json()
}