import type {SpillerInfo} from "@/app/api/spillere/[id]/route.ts";

export const fetchSpillerInfo = async (brukerId: string): Promise<SpillerInfo> => {
    const response = await fetch(`/api/spillere/${brukerId}`);
    if (!response.ok) {
        throw new Error('Feil ved henting av spillerinfo');
    }
    return await response.json()
}