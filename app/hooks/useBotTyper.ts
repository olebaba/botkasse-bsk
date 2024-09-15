import { useEffect, useState } from 'react';
import {BotType} from "@/app/b%C3%B8ter/page";

// Custom hook for å hente og håndtere bot-typer
export function useBotTyper() {
    const [botTyper, setBotTyper] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Funksjon for å hente bot-typer fra API-et
        const fetchBotTyper = async () => {
            const response = await fetch('/api/boter/typer');
            if (!response.ok) {
                throw new Error('Feil ved henting av bot-typer');
            }
            const data = await response.json();
            console.log(data)
            setBotTyper(data.map((botType: BotType) => botType.navn));
        };

        fetchBotTyper()
            .catch((error) => {
                console.error(error);
                setError(error.message || 'En ukjent feil oppstod');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Funksjon for å legge til ny bot-type
    const leggTilNyBotType = (nyType: string) => {
        if (!botTyper.includes(nyType)) {
            setBotTyper((prev) => [...prev, nyType]);
        }
    };

    return { botTyper, leggTilNyBotType, loading, error };
}
