'use client'
import { BotListe } from '@/komponenter/boter/botListe.tsx'
import { useEffect, useState } from 'react'
import { Kontakter } from '@/komponenter/spillere/Kontakter.tsx'
import Header from '@/komponenter/ui/Header.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import { fetchForseelser } from '@/lib/forseelseService.ts'
import { hentSesongTekst } from '@/lib/botBeregning.ts'

export default function Page() {
    const [forseelser, setForseelser] = useState<Forseelse[]>([])

    useEffect(() => {
        const hentForseelser = async () => {
            const forseelser = await fetchForseelser()
            setForseelser(forseelser)
        }

        hentForseelser().then()
    }, [])

    const gjeldendeSesong = hentSesongTekst()

    return (
        <div className="container mx-auto p-4 mt-28">
            <Header size="large" text="Oversikt bøter" className="mb-6" />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-blue-900 mb-3">Bøtesatser for sesongen {gjeldendeSesong}:</p>
                <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">✍️</span>
                        <span>Gjelder alle spillere med kontrakt</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🏑</span>
                        <span>Beløpene dobles på kampdager</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🧑‍⚖️</span>
                        <span>Ved uenigheter avgjøres saken i en rettssak der botsjefen har det siste ordet</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🗓️</span>
                        <span>Bøtene betales via Vipps til botsjefen innen utgangen av neste måned</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">🍻</span>
                        <span>Bøtene går til lagfester, så alle bidrag går kun tilbake til laget</span>
                    </li>
                </ul>
            </div>

            <BotListe forseelser={forseelser} />
            <Kontakter />
        </div>
    )
}
