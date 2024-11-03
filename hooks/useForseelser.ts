import {useEffect, useState} from "react";
import {fetchForseelser} from "@/lib/forseelseService.ts";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";

export function useForseelser() {
    const [forseelser, setForseelser] = useState<Forseelse[]>([])

    useEffect(() => {
        const hentForseelser = async () => {
            const forseelser = await fetchForseelser()
            setForseelser(forseelser)
        }

        hentForseelser().then()
    }, []);

    return {forseelser}
}