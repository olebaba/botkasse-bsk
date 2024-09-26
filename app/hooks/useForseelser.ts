import {useEffect, useState} from 'react';
import type {Forseelse} from "@/app/b%C3%B8ter/page";

export function useForseelser() {
    const [forseelser, setForseelser] = useState<Forseelse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForseelser = async () => {
            const response = await fetch('/api/boter/typer', {
                next: {revalidate: 60}
            });
            if (!response.ok) {
                throw new Error('Feil ved henting av forseelser');
            }
            const data = await response.json();
            setForseelser(data);
        };

        fetchForseelser()
            .catch((error) => {
                console.error(error);
                setError(error.message || 'En ukjent feil oppstod');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return {forseelser, loading, error};
}
