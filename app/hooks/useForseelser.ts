import {useEffect, useState} from "react";
import {fetchForseelser} from "@/app/lib/forseelseService.ts";
import type {Forseelse} from "@/app/b%C3%B8ter/page.tsx";

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