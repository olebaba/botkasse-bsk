import {useEffect, useState} from "react";
import {fetchForseelser} from "@/app/lib/forseelseService.ts";
import type {Forseelse} from "@/app/b%C3%B8ter/page.tsx";

export function useForseelser() {
    const [forseelser, setForseelser] = useState<Forseelse[]>([]);
    const [forseelserMap, setForseelserMap] = useState<{ [id: string]: Forseelse }>({});

    useEffect(() => {
        const hentForseelser = async () => {
            const hentetForseelser = await fetchForseelser()
            const map: { [id: string]: Forseelse } = {};
            hentetForseelser.forEach(f => {
                map[f.id.toString()] = f;
            });
            setForseelserMap(map)
            setForseelser(hentetForseelser)
        }

        hentForseelser().then()
    }, []);

    return {forseelser, forseelserMap};
}